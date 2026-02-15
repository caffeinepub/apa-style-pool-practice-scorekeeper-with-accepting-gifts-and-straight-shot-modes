/**
 * Official APA PPI and aPPI calculation helpers
 * PPI Formula: myScore / (innings - defensiveShots)
 * aPPI: For Build 1, aPPI = PPI (no lookup table exists in codebase)
 */

export interface OfficialPpiResult {
  ppi: number | null;
  isValid: boolean;
}

export interface OfficialAppiResult {
  appi: number | null;
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
 * Compute Official APA aPPI from text fields
 * Build 1 implementation: aPPI = PPI (no lookup table exists in codebase)
 * Returns null aPPI if PPI cannot be computed
 */
export function computeOfficialApaAppi(
  myScore: string,
  innings: string,
  defensiveShots: string
): OfficialAppiResult {
  const ppiResult = computeOfficialApaPpi(myScore, innings, defensiveShots);
  
  // aPPI = PPI for Build 1 (no lookup table)
  return {
    appi: ppiResult.ppi,
    isValid: ppiResult.isValid,
  };
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

/**
 * Format aPPI for display
 * Returns "—" for invalid/unavailable aPPI
 */
export function formatOfficialAppi(result: OfficialAppiResult): string {
  if (!result.isValid || result.appi === null) {
    return '—';
  }
  return result.appi.toFixed(2);
}
