/**
 * Normalize player name for consistent matching
 */
export function normalizePlayerName(name: string): string {
  return name.trim().toLowerCase();
}

/**
 * Compare two player names case-insensitively
 */
export function isSamePlayer(name1: string, name2: string): boolean {
  return normalizePlayerName(name1) === normalizePlayerName(name2);
}

/**
 * Check if a player name matches any of the provided names
 */
export function matchesAnyPlayer(playerName: string, names: string[]): boolean {
  const normalized = normalizePlayerName(playerName);
  return names.some(name => normalizePlayerName(name) === normalized);
}
