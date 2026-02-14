import type { ApiMatch } from '../../backend';
import { MatchMode } from '../../backend';
import { isSamePlayer } from '../../utils/playerName';
import { getOfficialApaOutcome } from './officialApaOutcome';
import { computeOfficialApaPpi } from './officialApaPpi';

export interface ApaMatchDataPoint {
  matchId: string;
  dateTime: bigint;
  playerName: string;
  skillLevel: number;
  pointsEarned: number;
  defensiveShots: number;
  innings: number;
  ppi: number;
  isWinner: boolean;
}

/**
 * Extract APA match data points for a specific player from match history
 * Now includes both APA Practice matches and Official APA Match Logs with valid PPI
 */
export function extractPlayerApaMatches(
  matches: ApiMatch[],
  playerName: string
): ApaMatchDataPoint[] {
  const dataPoints: ApaMatchDataPoint[] = [];

  for (const match of matches) {
    // Handle APA Practice matches
    if (match.mode === MatchMode.apaPractice && match.apaMatchInfo) {
      const playerIndex = match.players.findIndex(p => isSamePlayer(p.name, playerName));
      if (playerIndex === -1) continue;

      const playerStats = match.apaMatchInfo.players[playerIndex];
      if (!playerStats) continue;

      dataPoints.push({
        matchId: match.matchId,
        dateTime: match.dateTime,
        playerName: match.players[playerIndex].name,
        skillLevel: Number(playerStats.skillLevel),
        pointsEarned: Number(playerStats.pointsEarnedRunningTotal),
        defensiveShots: Number(playerStats.defensiveShots),
        innings: Number(playerStats.innings),
        ppi: playerStats.ppi,
        isWinner: playerStats.isPlayerOfMatch,
      });
    }

    // Handle Official APA Match Logs (player1 = "you")
    if (match.officialApaMatchLogData) {
      const data = match.officialApaMatchLogData;
      
      // Compute PPI using the new formula
      const ppiResult = computeOfficialApaPpi(data.myScore, data.innings, data.defensiveShots);
      
      // Only include if PPI is valid
      if (ppiResult.isValid && ppiResult.ppi !== null) {
        const outcome = getOfficialApaOutcome(
          data.didWin,
          data.playerOneSkillLevel,
          data.playerTwoSkillLevel,
          data.myScore,
          data.theirScore
        );

        // Parse myScore for pointsEarned
        const myScoreNum = parseInt(data.myScore) || 0;
        const inningsNum = parseInt(data.innings) || 0;
        const defensiveShotsNum = parseInt(data.defensiveShots) || 0;

        dataPoints.push({
          matchId: match.matchId,
          dateTime: match.dateTime,
          playerName: 'You', // Official logs are always for the current user
          skillLevel: data.playerOneSkillLevel ? Number(data.playerOneSkillLevel) : 0,
          pointsEarned: myScoreNum,
          defensiveShots: defensiveShotsNum,
          innings: inningsNum,
          ppi: ppiResult.ppi,
          isWinner: outcome === 'win',
        });
      }
    }
  }

  // Sort by date ascending
  return dataPoints.sort((a, b) => Number(a.dateTime - b.dateTime));
}

/**
 * Extract Official APA match outcomes for the caller (player1 = "you")
 * Returns counts of known official matches and wins
 */
export function extractOfficialApaWinRate(matches: ApiMatch[]): { totalKnown: number; wins: number } {
  let totalKnown = 0;
  let wins = 0;

  for (const match of matches) {
    if (!match.officialApaMatchLogData) continue;

    const data = match.officialApaMatchLogData;
    const outcome = getOfficialApaOutcome(
      data.didWin,
      data.playerOneSkillLevel,
      data.playerTwoSkillLevel,
      data.myScore,
      data.theirScore
    );

    // Only count matches with known outcome
    if (outcome === 'win') {
      totalKnown++;
      wins++;
    } else if (outcome === 'loss') {
      totalKnown++;
    }
    // 'unknown' outcomes are excluded from both counts
  }

  return { totalKnown, wins };
}

/**
 * Compute PPI series for charting
 */
export function computePpiSeries(dataPoints: ApaMatchDataPoint[]): number[] {
  return dataPoints.map(dp => dp.ppi);
}

/**
 * Compute match result series (points earned per match)
 */
export function computeMatchResultSeries(dataPoints: ApaMatchDataPoint[]): number[] {
  return dataPoints.map(dp => dp.pointsEarned);
}

/**
 * Compute rolling "best 10 of last 20" average
 * For each index i:
 * - Take up to 20 matches ending at i
 * - If count >= 10, average the best (highest) 10 values
 * - If count < 10, average all available values
 */
export function computeRollingBest10Of20(values: number[]): number[] {
  const result: number[] = [];

  for (let i = 0; i < values.length; i++) {
    const start = Math.max(0, i - 19);
    const window = values.slice(start, i + 1);

    if (window.length >= 10) {
      // Take best 10
      const sorted = [...window].sort((a, b) => b - a);
      const best10 = sorted.slice(0, 10);
      const avg = best10.reduce((sum, v) => sum + v, 0) / 10;
      result.push(avg);
    } else {
      // Average all
      const avg = window.reduce((sum, v) => sum + v, 0) / window.length;
      result.push(avg);
    }
  }

  return result;
}

/**
 * Format date labels for charts
 */
export function formatChartDate(timestamp: bigint): string {
  const date = new Date(Number(timestamp) / 1_000_000);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
