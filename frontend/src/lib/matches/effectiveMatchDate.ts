import type { ApiMatch } from '../../backend';

/**
 * Parse a date string (YYYY-MM-DD from HTML date input or other formats) into a timestamp (ms since epoch).
 * For YYYY-MM-DD format, treats it as a local calendar date to avoid timezone off-by-one issues.
 * Returns null if the date string is empty, invalid, or unparseable.
 */
function parseOfficialDateString(dateStr: string): number | null {
  if (!dateStr || dateStr.trim() === '') {
    return null;
  }

  const trimmed = dateStr.trim();
  
  // Check if it's in YYYY-MM-DD format (from HTML date input)
  const dateOnlyPattern = /^(\d{4})-(\d{2})-(\d{2})$/;
  const match = trimmed.match(dateOnlyPattern);
  
  if (match) {
    // Parse as local date to avoid timezone offset issues
    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1; // Month is 0-indexed
    const day = parseInt(match[3], 10);
    
    const localDate = new Date(year, month, day);
    
    // Validate that the date is valid
    if (
      localDate.getFullYear() === year &&
      localDate.getMonth() === month &&
      localDate.getDate() === day
    ) {
      return localDate.getTime();
    }
    
    return null;
  }
  
  // Try parsing other formats (fallback)
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
