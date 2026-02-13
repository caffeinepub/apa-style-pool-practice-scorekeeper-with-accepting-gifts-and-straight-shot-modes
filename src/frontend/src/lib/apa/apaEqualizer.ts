// APA 9-Ball Equalizer System - Skill Level to Points-to-Win mapping

export const APA_SKILL_LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;
export type ApaSkillLevel = typeof APA_SKILL_LEVELS[number];

// APA 9-Ball Equalizer: Points needed to win by skill level
export const POINTS_TO_WIN: Record<ApaSkillLevel, number> = {
  1: 14,
  2: 19,
  3: 25,
  4: 31,
  5: 38,
  6: 46,
  7: 55,
  8: 65,
  9: 75,
};

export function getPointsToWin(skillLevel: number): number {
  if (skillLevel < 1 || skillLevel > 9) {
    return POINTS_TO_WIN[1]; // Default to SL1
  }
  return POINTS_TO_WIN[skillLevel as ApaSkillLevel];
}

export function isValidSkillLevel(sl: number): sl is ApaSkillLevel {
  return sl >= 1 && sl <= 9;
}

export function formatSkillLevel(sl: number): string {
  return `SL ${sl}`;
}

export function formatPointsTarget(sl: number): string {
  const points = getPointsToWin(sl);
  return `${points} points`;
}
