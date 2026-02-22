// Shared UI helpers for ball-based rack scoring with corrected one-away rule logic

import { POINTS_PER_RACK } from '../../lib/apa/apaScoring';

type BallState = 'unscored' | 'playerA' | 'playerB' | 'dead';

interface BallData {
  state: BallState;
  isLocked: boolean;
}

/**
 * Calculate the point value of a ball in APA 9-Ball scoring.
 * Each ball (1-8) is worth 1 point. The 9-ball is worth 2 points normally,
 * or 1 point when the one-away rule applies.
 * 
 * ONE-AWAY RULE (rack-level context):
 * The 9-ball is worth 1 point instead of 2 when there's only 1 point remaining
 * in the rack after accounting for all other non-9 balls scored by that player.
 * 
 * @param ballNumber - The ball number (1-9)
 * @param playerNon9Count - Number of non-9 balls already scored by this player in the rack
 * @returns The point value of the ball (1 or 2)
 */
export function getBallValue(
  ballNumber: number,
  cumulativePoints: number,
  currentRackPoints: number,
  target: number
): number {
  // All balls 1-8 are worth 1 point each
  if (ballNumber !== 9) {
    return 1;
  }
  
  // 9-ball value is determined by one-away rule within the rack
  // This is calculated in the component based on how many non-9 balls are scored
  return 2; // Default value, actual calculation happens in component
}

/**
 * Calculate rack totals for both players.
 * Each ball (1-8) counts as 1 point. The 9-ball counts as 1 or 2 points based on one-away rule.
 * 
 * RACK ACCOUNTING (10-point total):
 * Each rack must total exactly 10 points when all balls are accounted for.
 * This includes selected balls (playerA/playerB) and dead balls.
 * 
 * @param balls - Current ball states
 * @param player1CumulativePoints - Player 1's cumulative points from completed racks
 * @param player2CumulativePoints - Player 2's cumulative points from completed racks
 * @param player1Target - Player 1's skill-level-based target
 * @param player2Target - Player 2's skill-level-based target
 * @returns Object with player points and dead ball count
 */
export function calculateRackTotals(
  balls: Record<number, BallData>,
  player1CumulativePoints: number,
  player2CumulativePoints: number,
  player1Target: number,
  player2Target: number
): {
  player1Points: number;
  player2Points: number;
  deadBalls: number;
  totalRackPoints: number;
} {
  let player1Points = 0;
  let player2Points = 0;
  let deadBalls = 0;

  // Count non-9 balls for each player to determine 9-ball value
  let player1Non9Count = 0;
  let player2Non9Count = 0;

  for (let i = 1; i <= 8; i++) {
    const ball = balls[i];
    if (!ball) continue;

    if (ball.state === 'playerA') {
      player1Points += 1;
      player1Non9Count += 1;
    } else if (ball.state === 'playerB') {
      player2Points += 1;
      player2Non9Count += 1;
    } else if (ball.state === 'dead') {
      deadBalls += 1;
    }
  }

  // Handle 9-ball with one-away rule
  const nineBall = balls[9];
  if (nineBall && nineBall.state !== 'unscored') {
    if (nineBall.state === 'playerA') {
      const pointsRemaining = POINTS_PER_RACK - player1Non9Count;
      const nineValue = pointsRemaining === 1 ? 1 : 2;
      player1Points += nineValue;
    } else if (nineBall.state === 'playerB') {
      const pointsRemaining = POINTS_PER_RACK - player2Non9Count;
      const nineValue = pointsRemaining === 1 ? 1 : 2;
      player2Points += nineValue;
    } else if (nineBall.state === 'dead') {
      deadBalls += 1; // Dead 9-ball counts as 1 point
    }
  }

  const totalRackPoints = player1Points + player2Points + deadBalls;

  return {
    player1Points,
    player2Points,
    deadBalls,
    totalRackPoints,
  };
}

/**
 * Compute the total rack points including dead balls for validation purposes.
 * This is used to check if the rack totals exactly 10 points.
 * Each ball (1-8) counts as 1 point. The 9-ball counts as 2 points.
 * 
 * @param balls - Current ball states
 * @returns Total points in the rack (should equal 10 when complete)
 */
export function computeRackTotalForValidation(balls: Record<number, BallData>): number {
  let total = 0;

  for (let i = 1; i <= 9; i++) {
    const ball = balls[i];
    if (!ball) continue;

    if (ball.state !== 'unscored') {
      // Balls 1-8 count as 1 point each, 9-ball counts as 2 points
      total += i === 9 ? 2 : 1;
    }
  }

  return total;
}

export function getBallStateColor(state: BallState): string {
  switch (state) {
    case 'playerA':
      return 'bg-emerald-500 hover:bg-emerald-600';
    case 'playerB':
      return 'bg-blue-500 hover:bg-blue-600';
    case 'dead':
      return 'bg-red-500 hover:bg-red-600';
    default:
      return 'bg-gray-200 hover:bg-gray-300';
  }
}
