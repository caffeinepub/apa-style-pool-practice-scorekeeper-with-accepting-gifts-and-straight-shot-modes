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

/**
 * Calculate rack totals with optional context for one-away 9-ball rule.
 * When a player has exactly 1 point remaining and pockets the 9-ball,
 * it only counts as 1 point instead of 2, and the remaining 1 point
 * is added to dead balls to maintain the 10-point rack total.
 */
export function calculateRackTotals(
  ballStates: Record<number, BallState>,
  context?: {
    player1CurrentPoints: number;
    player2CurrentPoints: number;
    player1Target: number;
    player2Target: number;
  }
): {
  playerAPoints: number;
  playerBPoints: number;
  deadBallPoints: number;
  totalAccounted: number;
} {
  let playerAPoints = 0;
  let playerBPoints = 0;
  let deadBallPoints = 0;
  let nineBallOneAwayAdjustment = 0;

  for (let i = 1; i <= 9; i++) {
    const state = ballStates[i] || 'unscored';
    let value = getBallValue(i);
    
    // Apply one-away 9-ball rule if context is provided
    if (i === 9 && context) {
      if (state === 'playerA') {
        const pointsRemaining = context.player1Target - context.player1CurrentPoints;
        if (pointsRemaining === 1) {
          value = 1; // 9-ball only worth 1 point when player is 1 away
          nineBallOneAwayAdjustment = 1; // Track the 1 point reduction
        }
      } else if (state === 'playerB') {
        const pointsRemaining = context.player2Target - context.player2CurrentPoints;
        if (pointsRemaining === 1) {
          value = 1; // 9-ball only worth 1 point when player is 1 away
          nineBallOneAwayAdjustment = 1; // Track the 1 point reduction
        }
      }
    }
    
    if (state === 'playerA') {
      playerAPoints += value;
    } else if (state === 'playerB') {
      playerBPoints += value;
    } else if (state === 'dead') {
      deadBallPoints += value;
    }
  }

  // Add the 9-ball adjustment to dead balls to maintain 10-point rack accounting
  deadBallPoints += nineBallOneAwayAdjustment;

  return {
    playerAPoints,
    playerBPoints,
    deadBallPoints,
    totalAccounted: playerAPoints + playerBPoints + deadBallPoints,
  };
}
