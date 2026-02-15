import type { ApiMatch } from '../../backend';
import { MatchMode } from '../../backend';

export interface AcceptingGiftsPerformanceRow {
  ballCount: number;
  wins: number;
  losses: number;
}

export interface AcceptingGiftsPerformanceByBallCount {
  rows: AcceptingGiftsPerformanceRow[];
}

/**
 * Compute Accepting Gifts performance by starting ball count level (2-7)
 * Wins and losses are derived from completed sets (race-to-7)
 */
export function computeAcceptingGiftsPerformanceByBallCount(
  matches: ApiMatch[]
): AcceptingGiftsPerformanceByBallCount {
  const agMatches = matches.filter(m => m.mode === MatchMode.acceptingGifts);

  if (agMatches.length === 0) {
    return { rows: [] };
  }

  // Initialize counters for ball counts 2-7
  const performanceMap = new Map<number, { wins: number; losses: number }>();
  for (let i = 2; i <= 7; i++) {
    performanceMap.set(i, { wins: 0, losses: 0 });
  }

  // Process each match
  for (const match of agMatches) {
    const startingBallCount = match.startingObjectBallCount ? Number(match.startingObjectBallCount) : null;
    const finalScorePlayer = match.finalSetScorePlayer ? Number(match.finalSetScorePlayer) : 0;
    const finalScoreGhost = match.finalSetScoreGhost ? Number(match.finalSetScoreGhost) : 0;

    if (startingBallCount === null || startingBallCount < 2 || startingBallCount > 7) {
      continue;
    }

    const stats = performanceMap.get(startingBallCount);
    if (!stats) continue;

    // Determine win/loss from final set score (race-to-7)
    if (finalScorePlayer === 7 && finalScoreGhost < 7) {
      stats.wins += 1;
    } else if (finalScoreGhost === 7 && finalScorePlayer < 7) {
      stats.losses += 1;
    }
  }

  // Build rows for levels 2-7
  const rows: AcceptingGiftsPerformanceRow[] = [];
  for (let ballCount = 2; ballCount <= 7; ballCount++) {
    const stats = performanceMap.get(ballCount);
    if (stats) {
      rows.push({
        ballCount,
        wins: stats.wins,
        losses: stats.losses,
      });
    }
  }

  return { rows };
}
