import type { ApiMatch } from '../../backend';
import { MatchMode } from '../../backend';

export interface AcceptingGiftsStats {
  totalSessions: number;
  rollingAverage: number | null;
  hasData: boolean;
}

/**
 * Compute Accepting Gifts summary statistics from match history
 * Computes rolling average of ending object ball counts
 */
export function computeAcceptingGiftsStats(
  matches: ApiMatch[],
  lastN: number = 20
): AcceptingGiftsStats {
  // Filter to Accepting Gifts matches only
  const agMatches = matches.filter(m => m.mode === MatchMode.acceptingGifts);
  
  if (agMatches.length === 0) {
    return {
      totalSessions: 0,
      rollingAverage: null,
      hasData: false,
    };
  }
  
  // Extract ending object ball counts
  const endingCounts = agMatches
    .map(m => m.endingObjectBallCount ? Number(m.endingObjectBallCount) : null)
    .filter((count): count is number => count !== null);
  
  // Compute rolling average from last N sessions
  const recentCounts = endingCounts.slice(-lastN);
  const rollingAverage = recentCounts.length > 0
    ? recentCounts.reduce((sum, count) => sum + count, 0) / recentCounts.length
    : null;
  
  return {
    totalSessions: agMatches.length,
    rollingAverage,
    hasData: true,
  };
}
