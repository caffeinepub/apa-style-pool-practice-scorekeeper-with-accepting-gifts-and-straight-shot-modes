/**
 * Official APA Expected PPI lookup table
 * Transcribed from the reference table (image-21.png)
 * Win% buckets: 10-20, 20-30, 30-40, 40-50, 50-60, 60-70, 70-80, 80-90, 90-100
 * Skill Levels: SL2-SL7
 */

export interface ExpectedPpiTableRow {
  winPercentMin: number;
  winPercentMax: number;
  sl2: number;
  sl3: number;
  sl4: number;
  sl5: number;
  sl6: number;
  sl7: number;
}

/**
 * Official APA Expected PPI table
 * Each row represents a win% bucket with expected PPI values for each skill level
 */
export const EXPECTED_PPI_TABLE: ExpectedPpiTableRow[] = [
  { winPercentMin: 90, winPercentMax: 100, sl2: 1.2, sl3: 1.5, sl4: 1.85, sl5: 2.25, sl6: 2.7, sl7: 3.2 },
  { winPercentMin: 80, winPercentMax: 90, sl2: 1.15, sl3: 1.45, sl4: 1.8, sl5: 2.2, sl6: 2.65, sl7: 3.15 },
  { winPercentMin: 70, winPercentMax: 80, sl2: 1.1, sl3: 1.4, sl4: 1.75, sl5: 2.15, sl6: 2.6, sl7: 3.1 },
  { winPercentMin: 60, winPercentMax: 70, sl2: 1.05, sl3: 1.35, sl4: 1.7, sl5: 2.1, sl6: 2.55, sl7: 3.05 },
  { winPercentMin: 50, winPercentMax: 60, sl2: 1.0, sl3: 1.3, sl4: 1.65, sl5: 2.05, sl6: 2.5, sl7: 3.0 },
  { winPercentMin: 40, winPercentMax: 50, sl2: 0.95, sl3: 1.25, sl4: 1.6, sl5: 2.0, sl6: 2.45, sl7: 2.95 },
  { winPercentMin: 30, winPercentMax: 40, sl2: 0.9, sl3: 1.2, sl4: 1.55, sl5: 1.95, sl6: 2.4, sl7: 2.9 },
  { winPercentMin: 20, winPercentMax: 30, sl2: 0.85, sl3: 1.15, sl4: 1.5, sl5: 1.9, sl6: 2.35, sl7: 2.85 },
  { winPercentMin: 10, winPercentMax: 20, sl2: 0.8, sl3: 1.1, sl4: 1.45, sl5: 1.85, sl6: 2.3, sl7: 2.8 },
];

/**
 * Bucket a win percentage into the appropriate table row
 * Win% of 55% maps to the 50-60% bucket
 * Clamps out-of-range values to nearest available bucket
 */
export function bucketWinPercentage(winPercent: number): ExpectedPpiTableRow {
  // Clamp to valid range
  const clamped = Math.max(10, Math.min(100, winPercent));

  // Find the matching bucket
  for (const row of EXPECTED_PPI_TABLE) {
    if (clamped >= row.winPercentMin && clamped <= row.winPercentMax) {
      return row;
    }
  }

  // Fallback: return the closest bucket (should not happen with proper clamping)
  if (clamped < 10) return EXPECTED_PPI_TABLE[EXPECTED_PPI_TABLE.length - 1];
  return EXPECTED_PPI_TABLE[0];
}

/**
 * Lookup expected PPI from the table given skill level and win%
 * Returns null if skill level is out of range (not SL2-SL7)
 */
export function lookupExpectedPpi(skillLevel: number, winPercent: number): number | null {
  if (skillLevel < 2 || skillLevel > 7) {
    return null;
  }

  const row = bucketWinPercentage(winPercent);

  switch (skillLevel) {
    case 2:
      return row.sl2;
    case 3:
      return row.sl3;
    case 4:
      return row.sl4;
    case 5:
      return row.sl5;
    case 6:
      return row.sl6;
    case 7:
      return row.sl7;
    default:
      return null;
  }
}
