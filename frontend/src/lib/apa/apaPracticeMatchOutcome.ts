// Shared helper for computing APA Practice match outcome
// Uses loser's skill level and loser's points pocketed to determine the 20-point match score

import { calculateMatchPoints, parseMatchPointOutcome, type MatchPointOutcome } from './apaMatchPoints';
import { getPointsToWin } from './apaEqualizer';

export interface MatchOutcomeInput {
  player1Points: number;
  player2Points: number;
  player1SL: number;
  player2SL: number;
  player1Target: number;
  player2Target: number;
}

export interface MatchOutcomeResult {
  outcome: MatchPointOutcome;
  player1Won: boolean;
  player1MatchPoints: number;
  player2MatchPoints: number;
}

/**
 * Compute the APA Practice match outcome based on loser's SL and points pocketed.
 * Returns the match-point outcome string and parsed winner/loser match points.
 */
export function computeApaPracticeMatchOutcome(input: MatchOutcomeInput): MatchOutcomeResult {
  const { player1Points, player2Points, player1SL, player2SL, player1Target, player2Target } = input;

  // Determine winner based on who reached their target
  const player1Won = player1Points >= player1Target && player2Points < player2Target;

  // Identify loser's SL and points
  const loserSL = player1Won ? player2SL : player1SL;
  const loserPoints = player1Won ? player2Points : player1Points;

  // Calculate match-point outcome using the chart
  const outcome = calculateMatchPoints(loserSL, loserPoints);

  // Parse outcome into winner/loser match points
  const { winner: winnerMatchPoints, loser: loserMatchPoints } = parseMatchPointOutcome(outcome);

  return {
    outcome,
    player1Won,
    player1MatchPoints: player1Won ? winnerMatchPoints : loserMatchPoints,
    player2MatchPoints: player1Won ? loserMatchPoints : winnerMatchPoints,
  };
}
