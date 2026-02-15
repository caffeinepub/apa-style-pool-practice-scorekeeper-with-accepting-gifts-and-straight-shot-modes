import type { ApiMatch } from '../../backend';
import { MatchMode } from '../../backend';
import { getPointsToWin } from './apaEqualizer';
import { computeOfficialApaPpi, computeOfficialApaAppi } from './officialApaPpi';
import { getOfficialApaOutcome } from './officialApaOutcome';
import { normalizePlayerName } from '../../utils/playerName';
import { getEffectiveMatchTimestamp } from '../matches/effectiveMatchDate';

export interface ApaMatchDataPoint {
  dateTime: bigint;
  ppi: number;
  appi: number;
  yourPoints: number;
  opponentPoints: number;
  defensiveShots: number;
  didWin?: boolean;
  officialApaMatchLogData?: {
    date: string;
  };
}

export function extractPlayerApaMatches(matches: ApiMatch[], playerName: string): ApaMatchDataPoint[] {
  const normalizedPlayerName = normalizePlayerName(playerName);
  const dataPoints: ApaMatchDataPoint[] = [];

  for (const match of matches) {
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

      const ppi = playerStats.ppi;
      const innings = Number(playerStats.innings);
      const defensiveShots = Number(playerStats.defensiveShots);
      const yourPoints = Number(playerStats.totalScore);
      const opponentPoints = Number(opponentStats.totalScore);

      const adjustedInnings = Math.max(1, innings - defensiveShots);
      const appi = yourPoints / adjustedInnings;

      dataPoints.push({
        dateTime: match.dateTime,
        ppi,
        appi,
        yourPoints,
        opponentPoints,
        defensiveShots,
      });
    }

    if (match.officialApaMatchLogData) {
      const data = match.officialApaMatchLogData;
      const ppiResult = computeOfficialApaPpi(data.myScore, data.innings, data.defensiveShots);
      const appiResult = computeOfficialApaAppi(data.myScore, data.innings, data.defensiveShots);
      
      if (ppiResult.isValid && ppiResult.ppi !== null && appiResult.isValid && appiResult.appi !== null) {
        const myScore = parseInt(data.myScore, 10) || 0;
        const theirScore = parseInt(data.theirScore, 10) || 0;
        const defensiveShots = parseInt(data.defensiveShots, 10) || 0;

        dataPoints.push({
          dateTime: match.dateTime,
          ppi: ppiResult.ppi,
          appi: appiResult.appi,
          yourPoints: myScore,
          opponentPoints: theirScore,
          defensiveShots,
          didWin: data.didWin,
          officialApaMatchLogData: {
            date: data.date,
          },
        });
      }
    }
  }

  return dataPoints;
}

export function computeBest10Of20Average(values: number[]): number | null {
  if (values.length === 0) return null;
  
  const last20 = values.slice(-20);
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
