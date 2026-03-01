/**
 * Accepting Gifts 12-level progression system.
 * Defines the fixed ordered sequence of levels and helpers for level management.
 */

export interface AcceptingGiftsLevel {
  index: number;
  label: string;
  objectBallCount: number;
  gameType: '8-ball' | '9-ball';
}

/**
 * The authoritative 12-level ordered progression list for Accepting Gifts.
 * Index 0–11 maps to the fixed sequence: 2+8 → 3+8 → 2+9 → 3+9 → 4+8 → 4+9 → 5+8 → 5+9 → 6+8 → 6+9 → 7+8 → 7+9
 */
export const ACCEPTING_GIFTS_LEVELS: AcceptingGiftsLevel[] = [
  { index: 0, label: '2+8', objectBallCount: 2, gameType: '8-ball' },
  { index: 1, label: '3+8', objectBallCount: 3, gameType: '8-ball' },
  { index: 2, label: '2+9', objectBallCount: 2, gameType: '9-ball' },
  { index: 3, label: '3+9', objectBallCount: 3, gameType: '9-ball' },
  { index: 4, label: '4+8', objectBallCount: 4, gameType: '8-ball' },
  { index: 5, label: '4+9', objectBallCount: 4, gameType: '9-ball' },
  { index: 6, label: '5+8', objectBallCount: 5, gameType: '8-ball' },
  { index: 7, label: '5+9', objectBallCount: 5, gameType: '9-ball' },
  { index: 8, label: '6+8', objectBallCount: 6, gameType: '8-ball' },
  { index: 9, label: '6+9', objectBallCount: 6, gameType: '9-ball' },
  { index: 10, label: '7+8', objectBallCount: 7, gameType: '8-ball' },
  { index: 11, label: '7+9', objectBallCount: 7, gameType: '9-ball' },
];

/**
 * Clamp a level index to the valid range 0–11.
 */
export function clampLevelIndex(index: number): number {
  return Math.max(0, Math.min(11, index));
}

/**
 * Get the level object for a given index (clamped to 0–11).
 */
export function getLevelByIndex(index: number): AcceptingGiftsLevel {
  const clamped = clampLevelIndex(index);
  return ACCEPTING_GIFTS_LEVELS[clamped];
}

/**
 * Get the maximum attempt value for a given level (objectBallCount + 1).
 * This is the value that awards the point to the player (runout).
 */
export function getMaxAttemptForLevel(levelIndex: number): number {
  const level = getLevelByIndex(levelIndex);
  return level.objectBallCount + 1;
}

/**
 * Compute the next persisted baseline level index after a match ends.
 * 
 * Rules:
 * - WIN: baseline moves up one level (next in sequence)
 * - LOSS:
 *   - If levelPlayed > baseline: baseline stays the same
 *   - If levelPlayed === baseline: baseline moves down one level
 * - Always clamped to 0–11
 */
export function computeNextBaselineLevel(
  baselineAtStartIndex: number,
  levelPlayedIndex: number,
  didWin: boolean
): number {
  if (didWin) {
    // Win: advance to next level
    return clampLevelIndex(levelPlayedIndex + 1);
  } else {
    // Loss: check if user skipped ahead
    if (levelPlayedIndex > baselineAtStartIndex) {
      // User skipped ahead and lost: stay at baseline
      return baselineAtStartIndex;
    } else {
      // User played at baseline and lost: move down one level
      return clampLevelIndex(baselineAtStartIndex - 1);
    }
  }
}
