import type { ApiMatch } from '../../backend';
import { MatchMode } from '../../backend';
import { getPointsToWin } from './apaEqualizer';
import { computeOfficialApaPpi, computeOfficialApaAppiWithContext } from './officialApaPpi';
import { getOfficialApaOutcome } from './officialApaOutcome';
import { normalizePlayerName } from '../../utils/playerName';
import { getEffectiveMatchTimestamp } from '../matches/effectiveMatchDate';

export interface ApaAggregateDataPoint {
  timestamp: number;
  ppi: number | null;
  appi: number | null;
  yourPoints: number | null;
  opponentPoints: number | null;
  defensiveShots: number | null;
  didWin?: boolean;
  officialApaMatchLogData?: {
    date: string;
  };
}

export interface ApaMatchDataPoint {
  dateTime: bigint;
  ppi: number | null;
  appi: number | null;
  yourPoints: number | null;
  opponentPoints: number | null;
  defensiveShots: number | null;
  didWin?: boolean;
  officialApaMatchLogData?: {
    date: string;
  };
}

/**
 * Extracts per-player APA match datapoints from both APA Practice and Official APA matches.
 * Each field (ppi, appi, yourPoints, opponentPoints, defensiveShots) is independently cleaned:
 * - Valid numeric values are preserved as numbers
 * - Invalid/unparseable values become null
 * - No field's invalidity affects any other field
 * - Returns one datapoint per eligible match
 */
export function extractPlayerApaMatches(matches: ApiMatch[], playerName: string): ApaAggregateDataPoint[] {
  const normalizedPlayerName = normalizePlayerName(playerName);
  const dataPoints: ApaAggregateDataPoint[] = [];

  for (const match of matches) {
    // APA Practice matches
    if (match.mode === MatchMode.apaPractice && match.apaMatchInfo) {
      const player1 = match.players[0];
      const player2 = match.players[1];

      if (!player1 || !player2) continue;

      const normalizedP1 = normalizePlayerName(player1.name);
      const normalizedP2 = normalizePlayerName(player2.name);

      if (normalizedP1 !== normalizedPlayerName && normalizedP2 !== normalizedPlayerName) {
        continue;
      }

      const isPlayer1 = normalizedP1 === normalizedPlayerName;
      const playerStats = match.apaMatchInfo.players[isPlayer1 ? 0 : 1];
      const opponentStats = match.apaMatchInfo.players[isPlayer1 ? 1 : 0];

      if (!playerStats || !opponentStats) continue;

      // Clean each field independently - coerce to number or null, never NaN
      const ppiValue = playerStats.ppi;
      const ppi = typeof ppiValue === 'number' && isFinite(ppiValue) ? ppiValue : null;

      const inningsValue = Number(playerStats.innings);
      const innings = isFinite(inningsValue) && inningsValue > 0 ? inningsValue : null;

      const defensiveShotsValue = Number(playerStats.defensiveShots);
      const defensiveShots = isFinite(defensiveShotsValue) && defensiveShotsValue >= 0 ? defensiveShotsValue : null;

      const yourPointsValue = Number(playerStats.totalScore);
      const yourPoints = isFinite(yourPointsValue) && yourPointsValue >= 0 ? yourPointsValue : null;

      const opponentPointsValue = Number(opponentStats.totalScore);
      const opponentPoints = isFinite(opponentPointsValue) && opponentPointsValue >= 0 ? opponentPointsValue : null;

      // Compute aPPI only if we have valid innings and defensive shots
      let appi: number | null = null;
      if (innings !== null && defensiveShots !== null && yourPoints !== null) {
        const adjustedInnings = Math.max(1, innings - defensiveShots);
        const computedAppi = yourPoints / adjustedInnings;
        appi = isFinite(computedAppi) ? computedAppi : null;
      }

      dataPoints.push({
        timestamp: getEffectiveMatchTimestamp(match),
        ppi,
        appi,
        yourPoints,
        opponentPoints,
        defensiveShots,
      });
    }

    // Official APA Match Logs
    if (match.officialApaMatchLogData) {
      const data = match.officialApaMatchLogData;
      const ppiResult = computeOfficialApaPpi(data.myScore, data.innings, data.defensiveShots);
      const appiResult = computeOfficialApaAppiWithContext(match, matches);

      // Clean each numeric field independently - parse and validate, never allow NaN or strings
      const myScoreParsed = parseInt(data.myScore, 10);
      const yourPoints = isFinite(myScoreParsed) && myScoreParsed >= 0 ? myScoreParsed : null;

      const theirScoreParsed = parseInt(data.theirScore, 10);
      const opponentPoints = isFinite(theirScoreParsed) && theirScoreParsed >= 0 ? theirScoreParsed : null;

      const defensiveShotsParsed = parseInt(data.defensiveShots, 10);
      const defensiveShots = isFinite(defensiveShotsParsed) && defensiveShotsParsed >= 0 ? defensiveShotsParsed : null;

      // Accept computed PPI/aPPI whenever they are finite numbers
      const ppi = typeof ppiResult.ppi === 'number' && isFinite(ppiResult.ppi) ? ppiResult.ppi : null;
      const appi = typeof appiResult.appi === 'number' && isFinite(appiResult.appi) ? appiResult.appi : null;

      dataPoints.push({
        timestamp: getEffectiveMatchTimestamp(match),
        ppi,
        appi,
        yourPoints,
        opponentPoints,
        defensiveShots,
        didWin: data.didWin,
        officialApaMatchLogData: {
          date: data.date,
        },
      });
    }
  }

  return dataPoints;
}

export function computeBest10Of20Average(values: (number | null)[]): number | null {
  // Filter out null values
  const validValues = values.filter((v): v is number => v !== null);
  
  if (validValues.length === 0) return null;

  const last20 = validValues.slice(-20);
  const sorted = [...last20].sort((a, b) => b - a);
  const best10 = sorted.slice(0, Math.min(10, sorted.length));

  if (best10.length === 0) return null;

  return best10.reduce((sum, val) => sum + val, 0) / best10.length;
}

/**
 * Extract Official APA win rate using last 20 matches by effective match date
 * Excludes matches with unknown outcome from the denominator
 */
export function extractOfficialApaWinRate(matches: ApiMatch[]): { wins: number; total: number; winRate: number | null } {
  const officialMatches = matches.filter(m => m.officialApaMatchLogData);

  // Sort by effective match date (newest first)
  const sortedMatches = [...officialMatches].sort((a, b) => {
    const timeA = getEffectiveMatchTimestamp(a);
    const timeB = getEffectiveMatchTimestamp(b);
    return timeB - timeA;
  });

  // Take last 20 (or fewer if less than 20 exist)
  const last20Matches = sortedMatches.slice(0, 20);

  let wins = 0;
  let total = 0;

  for (const match of last20Matches) {
    const data = match.officialApaMatchLogData;
    if (!data) continue;

    const outcome = getOfficialApaOutcome(
      data.didWin,
      data.playerOneSkillLevel,
      data.playerTwoSkillLevel,
      data.myScore,
      data.theirScore
    );

    if (outcome === 'win' || outcome === 'loss') {
      total++;
      if (outcome === 'win') {
        wins++;
      }
    }
  }

  const winRate = total > 0 ? (wins / total) * 100 : null;

  return { wins, total, winRate };
}
