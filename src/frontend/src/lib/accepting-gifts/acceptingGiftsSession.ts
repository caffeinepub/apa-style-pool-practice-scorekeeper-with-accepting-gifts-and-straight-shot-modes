import { getLevelByIndex, getMaxAttemptForLevel } from './acceptingGiftsLevels';

/**
 * Accepting Gifts session state using the 12-level progression system.
 */
export interface GameState {
  playerName: string;
  notes?: string;
  baselineLevelIndex: number; // Level index at match start (0–11)
  levelPlayedIndex: number; // Level index selected for this match (0–11)
  playerSetScore: number;
  ghostSetScore: number;
  totalAttempts: number;
  setsCompleted: number;
  completed: boolean;
}

/**
 * Apply an attempt result to the game state.
 * Player scores a point if attemptInput equals the max value for the current level.
 * Otherwise, ghost scores a point.
 */
export function applyAttemptResult(state: GameState, attemptInput: number): GameState {
  const maxForLevel = getMaxAttemptForLevel(state.levelPlayedIndex);
  const playerScored = attemptInput === maxForLevel;

  return {
    ...state,
    totalAttempts: state.totalAttempts + 1,
    playerSetScore: playerScored ? state.playerSetScore + 1 : state.playerSetScore,
    ghostSetScore: playerScored ? state.ghostSetScore : state.ghostSetScore + 1,
  };
}

/**
 * Prepare the next set after a set completes (race-to-7).
 * This does NOT update the baseline level (that happens only on match save).
 * It only resets the set scores and increments setsCompleted.
 */
export function prepareNextSet(state: GameState): GameState {
  return {
    ...state,
    playerSetScore: 0,
    ghostSetScore: 0,
    setsCompleted: state.setsCompleted + 1,
  };
}
