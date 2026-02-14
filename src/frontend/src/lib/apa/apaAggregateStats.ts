import type { ApiMatch } from '../../backend';
import { MatchMode } from '../../backend';
import { isSamePlayer } from '../../utils/playerName';

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
 */
export function extractPlayerApaMatches(
  matches: ApiMatch[],
  playerName: string
): ApaMatchDataPoint[] {
  const dataPoints: ApaMatchDataPoint[] = [];

  for (const match of matches) {
    if (match.mode !== MatchMode.apaPractice || !match.apaMatchInfo) {
      continue;
    }

    // Find the player in this match
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

  // Sort by date ascending
  return dataPoints.sort((a, b) => Number(a.dateTime - b.dateTime));
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
