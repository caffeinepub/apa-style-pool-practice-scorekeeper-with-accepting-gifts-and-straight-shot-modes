/**
 * Skill level prediction based on PPI and aPPI averages
 * Uses the APA skill level ranges to estimate a player's skill level
 */

/**
 * APA Skill Level ranges based on PPI (for Official APA Tab)
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
 * APA Skill Level ranges based on aPPI (Expected PPI table header ranges for Official APA Tab)
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
 * APA Skill Level ranges based on PPI (for Detailed Player Stats page)
 * SL1: <0.4, SL2: 0.5-0.93, SL3: 0.94-1.21, SL4: 1.22-1.5, SL5: 1.51-1.84, SL6: 1.85-2.35, SL7: 2.36+
 */
const PPI_SKILL_LEVEL_RANGES_DETAILED: Array<{ minPpi: number; maxPpi: number; skillLevel: number }> = [
  { minPpi: 0.0, maxPpi: 0.4, skillLevel: 1 },
  { minPpi: 0.5, maxPpi: 0.93, skillLevel: 2 },
  { minPpi: 0.94, maxPpi: 1.21, skillLevel: 3 },
  { minPpi: 1.22, maxPpi: 1.5, skillLevel: 4 },
  { minPpi: 1.51, maxPpi: 1.84, skillLevel: 5 },
  { minPpi: 1.85, maxPpi: 2.35, skillLevel: 6 },
  { minPpi: 2.36, maxPpi: 999, skillLevel: 7 },
];

/**
 * APA Skill Level ranges based on aPPI (for Detailed Player Stats page)
 * SL1: <0.8, SL2: 0.8-1.0, SL3: 1.1-1.44, SL4: 1.45-1.79, SL5: 1.80-2.19, SL6: 2.20-2.64, SL7: 2.65+
 */
const APPI_SKILL_LEVEL_RANGES_DETAILED: Array<{ minAppi: number; maxAppi: number; skillLevel: number }> = [
  { minAppi: 0.0, maxAppi: 0.8, skillLevel: 1 },
  { minAppi: 0.8, maxAppi: 1.0, skillLevel: 2 },
  { minAppi: 1.1, maxAppi: 1.44, skillLevel: 3 },
  { minAppi: 1.45, maxAppi: 1.79, skillLevel: 4 },
  { minAppi: 1.8, maxAppi: 2.19, skillLevel: 5 },
  { minAppi: 2.2, maxAppi: 2.64, skillLevel: 6 },
  { minAppi: 2.65, maxAppi: 999, skillLevel: 7 },
];

/**
 * Predict skill level based on PPI average (for Official APA Tab)
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
 * Predict skill level based on aPPI average (for Official APA Tab)
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

/**
 * Predict skill level based on PPI average (for Detailed Player Stats page)
 * Uses the new PPI ranges: SL1: <0.4, SL2: 0.5-0.93, SL3: 0.94-1.21, SL4: 1.22-1.5, SL5: 1.51-1.84, SL6: 1.85-2.35, SL7: 2.36+
 */
export function getApaPpiSkillLevelDetailed(ppi: number): number | null {
  if (ppi < 0) return null;

  for (const range of PPI_SKILL_LEVEL_RANGES_DETAILED) {
    if (ppi >= range.minPpi && ppi <= range.maxPpi) {
      return range.skillLevel;
    }
  }

  return null;
}

/**
 * Predict skill level based on aPPI average (for Detailed Player Stats page)
 * Uses the new aPPI ranges: SL1: <0.8, SL2: 0.8-1.0, SL3: 1.1-1.44, SL4: 1.45-1.79, SL5: 1.80-2.19, SL6: 2.20-2.64, SL7: 2.65+
 */
export function getApaAppiSkillLevelDetailed(appi: number): number | null {
  if (appi < 0) return null;

  for (const range of APPI_SKILL_LEVEL_RANGES_DETAILED) {
    if (appi >= range.minAppi && appi <= range.maxAppi) {
      return range.skillLevel;
    }
  }

  return null;
}
