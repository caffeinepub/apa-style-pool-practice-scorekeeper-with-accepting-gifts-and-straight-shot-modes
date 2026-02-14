/**
 * Official APA PPI calculation helper
 * Formula: myScore / (innings - defensiveShots)
 */

export interface OfficialPpiResult {
  ppi: number | null;
  isValid: boolean;
}

/**
 * Parse and validate a text field as a non-negative integer
 */
function parseNonNegativeInt(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === '') return null;
  
  const num = Number(trimmed);
  if (isNaN(num) || num < 0 || !Number.isInteger(num)) {
    return null;
  }
  
  return num;
}

/**
 * Compute Official APA PPI from text fields
 * Returns null PPI if any field is invalid or denominator <= 0
 */
export function computeOfficialApaPpi(
  myScore: string,
  innings: string,
  defensiveShots: string
): OfficialPpiResult {
  const score = parseNonNegativeInt(myScore);
  const inn = parseNonNegativeInt(innings);
  const defShots = parseNonNegativeInt(defensiveShots);

  // If any field is invalid, return invalid result
  if (score === null || inn === null || defShots === null) {
    return { ppi: null, isValid: false };
  }

  const denominator = inn - defShots;

  // If denominator is zero or negative, return invalid result
  if (denominator <= 0) {
    return { ppi: null, isValid: false };
  }

  const ppi = score / denominator;
  return { ppi, isValid: true };
}

/**
 * Format PPI for display
 * Returns "—" for invalid/unavailable PPI
 */
export function formatOfficialPpi(result: OfficialPpiResult): string {
  if (!result.isValid || result.ppi === null) {
    return '—';
  }
  return result.ppi.toFixed(2);
}
