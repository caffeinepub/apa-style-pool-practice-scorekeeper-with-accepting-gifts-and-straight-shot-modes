// Shared UI helpers for ball-based rack scoring

export type BallState = 'unscored' | 'playerA' | 'playerB' | 'dead';

export function getBallValue(ballNumber: number): number {
  return ballNumber === 9 ? 2 : 1;
}

export function getBallStateLabel(state: BallState): string {
  const labels: Record<BallState, string> = {
    unscored: 'Unscored',
    playerA: 'Player A',
    playerB: 'Player B',
    dead: 'Dead Ball',
  };
  return labels[state];
}

export function calculateRackTotals(ballStates: Record<number, BallState>): {
  playerAPoints: number;
  playerBPoints: number;
  deadBallPoints: number;
  totalAccounted: number;
} {
  let playerAPoints = 0;
  let playerBPoints = 0;
  let deadBallPoints = 0;

  for (let i = 1; i <= 9; i++) {
    const state = ballStates[i] || 'unscored';
    const value = getBallValue(i);
    
    if (state === 'playerA') {
      playerAPoints += value;
    } else if (state === 'playerB') {
      playerBPoints += value;
    } else if (state === 'dead') {
      deadBallPoints += value;
    }
  }

  return {
    playerAPoints,
    playerBPoints,
    deadBallPoints,
    totalAccounted: playerAPoints + playerBPoints + deadBallPoints,
  };
}
