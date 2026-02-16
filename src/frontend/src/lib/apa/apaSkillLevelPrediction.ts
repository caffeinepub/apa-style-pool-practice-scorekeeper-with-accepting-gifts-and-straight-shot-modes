/**
 * Skill level prediction based on PPI and aPPI averages
 * Uses the APA skill level ranges to estimate a player's skill level
 */

/**
 * APA Skill Level ranges based on PPI
 * These are approximate ranges used for prediction
 */
const PPI_SKILL_LEVEL_RANGES: Array<{ minPpi: number; maxPpi: number; skillLevel: number }> = [
  { minPpi: 0.0, maxPpi: 0.5, skillLevel: 1 },
  { minPpi: 0.51, maxPpi: 1.0, skillLevel: 2 },
  { minPpi: 1.01, maxPpi: 1.5, skillLevel: 3 },
  { minPpi: 1.51, maxPpi: 2.0, skillLevel: 4 },
  { minPpi: 2.01, maxPpi: 2.5, skillLevel: 5 },
  { minPpi: 2.51, maxPpi: 3.0, skillLevel: 6 },
  { minPpi: 3.01, maxPpi: 3.5, skillLevel: 7 },
  { minPpi: 3.51, maxPpi: 4.0, skillLevel: 8 },
  { minPpi: 4.01, maxPpi: 999, skillLevel: 9 },
];

/**
 * APA Skill Level ranges based on aPPI (Expected PPI table header ranges)
 * SL2: 0.95-1.24, SL3: 1.25-1.54, SL4: 1.55-1.89, SL5: 1.90-2.29, SL6: 2.30-2.74, SL7: 2.75-3.24
 */
const APPI_SKILL_LEVEL_RANGES: Array<{ minAppi: number; maxAppi: number; skillLevel: number }> = [
  { minAppi: 0.95, maxAppi: 1.24, skillLevel: 2 },
  { minAppi: 1.25, maxAppi: 1.54, skillLevel: 3 },
  { minAppi: 1.55, maxAppi: 1.89, skillLevel: 4 },
  { minAppi: 1.9, maxAppi: 2.29, skillLevel: 5 },
  { minAppi: 2.3, maxAppi: 2.74, skillLevel: 6 },
  { minAppi: 2.75, maxAppi: 3.24, skillLevel: 7 },
];

/**
 * Predict skill level based on PPI average
 */
export function getApaPpiSkillLevel(ppi: number): number | null {
  if (ppi < 0) return null;

  for (const range of PPI_SKILL_LEVEL_RANGES) {
    if (ppi >= range.minPpi && ppi <= range.maxPpi) {
      return range.skillLevel;
    }
  }

  return null;
}

/**
 * Predict skill level based on aPPI average
 * Uses the Expected PPI table header ranges for SL2-SL7
 * Returns null if aPPI is outside the defined ranges
 */
export function getApaAppiSkillLevel(appi: number): number | null {
  if (appi < 0) return null;

  for (const range of APPI_SKILL_LEVEL_RANGES) {
    if (appi >= range.minAppi && appi <= range.maxAppi) {
      return range.skillLevel;
    }
  }

  return null;
}
