import type { ApiMatch } from '../../backend';

/**
 * Parse a date string (MM/DD/YYYY or similar) into a timestamp (ms since epoch).
 * Returns null if the date string is empty, invalid, or unparseable.
 */
function parseOfficialDateString(dateStr: string): number | null {
  if (!dateStr || dateStr.trim() === '') {
    return null;
  }

  const trimmed = dateStr.trim();
  
  // Try parsing as MM/DD/YYYY or similar formats
  const parsed = new Date(trimmed);
  
  if (isNaN(parsed.getTime())) {
    return null;
  }
  
  return parsed.getTime();
}

/**
 * Get the effective match date timestamp (ms since epoch) for sorting and comparison.
 * For Official APA match logs, prefer the user-entered date when valid; otherwise fall back to dateTime.
 * For all other match types, use dateTime.
 */
export function getEffectiveMatchTimestamp(match: ApiMatch): number {
  // Official APA match logs: prefer officialApaMatchLogData.date when valid
  if (match.officialApaMatchLogData?.date) {
    const parsedDate = parseOfficialDateString(match.officialApaMatchLogData.date);
    if (parsedDate !== null) {
      return parsedDate;
    }
  }
  
  // Fallback: convert dateTime (nanoseconds) to milliseconds
  return Number(match.dateTime) / 1_000_000;
}

/**
 * Format the effective match date as a human-readable English string.
 * Uses the same logic as getEffectiveMatchTimestamp to determine which date to display.
 */
export function formatEffectiveMatchDate(match: ApiMatch): string {
  const timestamp = getEffectiveMatchTimestamp(match);
  const date = new Date(timestamp);
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
