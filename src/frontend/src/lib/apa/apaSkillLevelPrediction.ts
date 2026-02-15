/**
 * Skill level prediction based on PPI and aPPI averages
 * Uses the APA skill level ranges to estimate a player's skill level
 */

/**
 * APA Skill Level ranges based on PPI
 * These are approximate ranges used for prediction
 */
const PPI_SKILL_LEVEL_RANGES: Array<{ minPpi: number; maxPpi: number; skillLevel: number }> = [
  { minPpi: 0.00, maxPpi: 0.50, skillLevel: 1 },
  { minPpi: 0.51, maxPpi: 1.00, skillLevel: 2 },
  { minPpi: 1.01, maxPpi: 1.50, skillLevel: 3 },
  { minPpi: 1.51, maxPpi: 2.00, skillLevel: 4 },
  { minPpi: 2.01, maxPpi: 2.50, skillLevel: 5 },
  { minPpi: 2.51, maxPpi: 3.00, skillLevel: 6 },
  { minPpi: 3.01, maxPpi: 3.50, skillLevel: 7 },
  { minPpi: 3.51, maxPpi: 4.00, skillLevel: 8 },
  { minPpi: 4.01, maxPpi: 999, skillLevel: 9 },
];

/**
 * APA Skill Level ranges based on aPPI
 * These are approximate ranges used for prediction
 * (For now, using same ranges as PPI; can be adjusted based on actual aPPI data)
 */
const APPI_SKILL_LEVEL_RANGES: Array<{ minAppi: number; maxAppi: number; skillLevel: number }> = [
  { minAppi: 0.00, maxAppi: 0.50, skillLevel: 1 },
  { minAppi: 0.51, maxAppi: 1.00, skillLevel: 2 },
  { minAppi: 1.01, maxAppi: 1.50, skillLevel: 3 },
  { minAppi: 1.51, maxAppi: 2.00, skillLevel: 4 },
  { minAppi: 2.01, maxAppi: 2.50, skillLevel: 5 },
  { minAppi: 2.51, maxAppi: 3.00, skillLevel: 6 },
  { minAppi: 3.01, maxAppi: 3.50, skillLevel: 7 },
  { minAppi: 3.51, maxAppi: 4.00, skillLevel: 8 },
  { minAppi: 4.01, maxAppi: 999, skillLevel: 9 },
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
