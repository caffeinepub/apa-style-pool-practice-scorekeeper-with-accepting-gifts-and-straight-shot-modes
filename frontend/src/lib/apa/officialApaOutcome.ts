import { getPointsToWin } from './apaEqualizer';

export type OfficialApaOutcome = 'win' | 'loss' | 'unknown';

/**
 * Derive Official APA match outcome from skill levels and scores.
 * Returns:
 * - 'win' if exactly the caller met/exceeded their target and opponent did not
 * - 'loss' if exactly the opponent met/exceeded their target and caller did not
 * - 'unknown' if inputs are missing, ambiguous (both reached or neither reached), or invalid
 */
export function deriveOfficialApaOutcome(
  player1SkillLevel: bigint | undefined,
  player2SkillLevel: bigint | undefined,
  myScore: string,
  theirScore: string
): OfficialApaOutcome {
  // Parse scores as non-negative integers
  const parseScore = (s: string): number | null => {
    if (s === '') return null;
    const num = Number(s);
    if (isNaN(num) || num < 0) return null;
    return num;
  };

  const myScoreNum = parseScore(myScore);
  const theirScoreNum = parseScore(theirScore);

  // If any required input is missing, outcome is unknown
  if (
    player1SkillLevel === undefined ||
    player2SkillLevel === undefined ||
    myScoreNum === null ||
    theirScoreNum === null
  ) {
    return 'unknown';
  }

  // Get points-to-win targets from skill levels
  const myTarget = getPointsToWin(Number(player1SkillLevel));
  const theirTarget = getPointsToWin(Number(player2SkillLevel));

  // Check if each player met/exceeded their target
  const iMetTarget = myScoreNum >= myTarget;
  const theyMetTarget = theirScoreNum >= theirTarget;

  // Deterministic outcome: exactly one player met target
  if (iMetTarget && !theyMetTarget) {
    return 'win';
  }
  if (theyMetTarget && !iMetTarget) {
    return 'loss';
  }

  // Ambiguous: both reached or neither reached
  return 'unknown';
}

/**
 * Helper to get outcome from saved didWin field or derive it
 */
export function getOfficialApaOutcome(
  didWin: boolean | undefined,
  player1SkillLevel: bigint | undefined,
  player2SkillLevel: bigint | undefined,
  myScore: string,
  theirScore: string
): OfficialApaOutcome {
  // If didWin is present, use it
  if (didWin === true) return 'win';
  if (didWin === false) return 'loss';

  // Otherwise derive from inputs
  return deriveOfficialApaOutcome(player1SkillLevel, player2SkillLevel, myScore, theirScore);
}
