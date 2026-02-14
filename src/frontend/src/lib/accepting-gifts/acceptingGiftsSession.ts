interface GameState {
  playerName: string;
  notes?: string;
  startingObjectBallCount: number;
  currentObjectBallCount: number;
  playerSetScore: number;
  ghostSetScore: number;
  totalAttempts: number;
  setsCompleted: number;
  completed: boolean;
}

export function clampObjectBallCount(count: number): number {
  return Math.max(2, Math.min(7, count));
}

export function applyAttemptResult(state: GameState, playerScored: boolean): GameState {
  return {
    ...state,
    totalAttempts: state.totalAttempts + 1,
    playerSetScore: playerScored ? state.playerSetScore + 1 : state.playerSetScore,
    ghostSetScore: playerScored ? state.ghostSetScore : state.ghostSetScore + 1,
  };
}

export function prepareNextSet(state: GameState, playerWonSet: boolean): GameState {
  const adjustment = playerWonSet ? 1 : -1;
  const nextObjectBallCount = clampObjectBallCount(state.currentObjectBallCount + adjustment);

  return {
    ...state,
    currentObjectBallCount: nextObjectBallCount,
    playerSetScore: 0,
    ghostSetScore: 0,
    setsCompleted: state.setsCompleted + 1,
  };
}
