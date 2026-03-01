/**
 * Build the aggregate stats route path for a given player name
 */
export function getPlayerStatsRoute(playerName: string): string {
  return `/players/${encodeURIComponent(playerName)}`;
}
