import type { ApiMatch } from '../../backend';
import { MatchMode } from '../../backend';

/**
 * Win/loss record for a given mode.
 */
export interface WinLossRecord {
  wins: number;
  losses: number;
}

/**
 * Derive APA Practice win/loss outcome from saved practice match fields.
 * 
 * Win: playerOneScore == playerOnePointsNeeded AND playerTwoScore < playerTwoPointsNeeded
 * Loss: playerTwoScore == playerTwoPointsNeeded AND playerOneScore < playerOnePointsNeeded
 * Unknown: any other case (neither reached target, both reached target, or missing fields)
 * 
 * Returns 'win', 'loss', or 'unknown'
 */
function deriveApaPracticeOutcome(match: ApiMatch): 'win' | 'loss' | 'unknown' {
  if (!match.apaMatchInfo) {
    return 'unknown';
  }

  const players = match.apaMatchInfo.players;
  if (!players || players.length < 2) {
    return 'unknown';
  }

  const p1Stats = players[0];
  const p2Stats = players[1];

  if (!p1Stats || !p2Stats) {
    return 'unknown';
  }

  const playerOneScore = Number(p1Stats.totalScore);
  const playerOnePointsNeeded = Number(p1Stats.pointsNeeded);
  const playerTwoScore = Number(p2Stats.totalScore);
  const playerTwoPointsNeeded = Number(p2Stats.pointsNeeded);

  // Check for missing or invalid fields
  if (
    isNaN(playerOneScore) ||
    isNaN(playerOnePointsNeeded) ||
    isNaN(playerTwoScore) ||
    isNaN(playerTwoPointsNeeded)
  ) {
    return 'unknown';
  }

  const playerOneReachedTarget = playerOneScore >= playerOnePointsNeeded;
  const playerTwoReachedTarget = playerTwoScore >= playerTwoPointsNeeded;

  // Win: player one reached target AND player two did not
  if (playerOneReachedTarget && !playerTwoReachedTarget) {
    return 'win';
  }

  // Loss: player two reached target AND player one did not
  if (playerTwoReachedTarget && !playerOneReachedTarget) {
    return 'loss';
  }

  // Unknown: neither reached target, both reached target, or any other case
  return 'unknown';
}

/**
 * Derive Accepting Gifts win/loss outcome from saved match fields.
 * 
 * Win: finalSetScorePlayer === 7 AND finalSetScoreGhost < 7
 * Loss: finalSetScoreGhost === 7 AND finalSetScorePlayer < 7
 * Unknown: any other case
 */
function deriveAcceptingGiftsOutcome(match: ApiMatch): 'win' | 'loss' | 'unknown' {
  const playerScore = match.finalSetScorePlayer;
  const ghostScore = match.finalSetScoreGhost;

  if (playerScore === undefined || playerScore === null || ghostScore === undefined || ghostScore === null) {
    return 'unknown';
  }

  const player = Number(playerScore);
  const ghost = Number(ghostScore);

  if (player === 7 && ghost < 7) {
    return 'win';
  }

  if (ghost === 7 && player < 7) {
    return 'loss';
  }

  return 'unknown';
}

/**
 * Derive Straight Shot win/loss outcome from saved match fields.
 * 
 * Win: totalShots <= 20 AND > 0
 * Loss: totalShots > 20
 * Unknown: totalShots <= 0 or missing
 */
function deriveStraightShotOutcome(match: ApiMatch): 'win' | 'loss' | 'unknown' {
  const totalShots = match.strokes?.[0] ?? match.totalScore ?? 0;
  const shots = Number(totalShots);

  if (shots > 0 && shots <= 20) {
    return 'win';
  }

  if (shots > 20) {
    return 'loss';
  }

  return 'unknown';
}

/**
 * Derive Official APA win/loss outcome from saved match fields.
 * 
 * Win: didWin === true
 * Loss: didWin === false
 * Unknown: didWin is undefined/null
 */
function deriveOfficialApaOutcome(match: ApiMatch): 'win' | 'loss' | 'unknown' {
  if (!match.officialApaMatchLogData) {
    return 'unknown';
  }

  const didWin = match.officialApaMatchLogData.didWin;

  if (didWin === true) {
    return 'win';
  }

  if (didWin === false) {
    return 'loss';
  }

  return 'unknown';
}

/**
 * Classify a match into one of four buckets:
 * - 'officialApa': match has officialApaMatchLogData
 * - 'apaPractice': match has apaMatchInfo
 * - 'acceptingGifts': match.mode is acceptingGifts
 * - 'straightShot': match.mode is straightShot
 * - null: does not belong to any bucket
 */
export type BucketType = 'officialApa' | 'apaPractice' | 'acceptingGifts' | 'straightShot';

export function classifyMatchBucket(match: ApiMatch): BucketType | null {
  if (match.officialApaMatchLogData) {
    return 'officialApa';
  }
  if (match.apaMatchInfo) {
    return 'apaPractice';
  }
  if (match.mode === MatchMode.acceptingGifts) {
    return 'acceptingGifts';
  }
  if (match.mode === MatchMode.straightShot) {
    return 'straightShot';
  }
  return null;
}

/**
 * Derive win/loss outcome for a match based on its bucket.
 */
export function deriveMatchOutcome(match: ApiMatch): 'win' | 'loss' | 'unknown' {
  const bucket = classifyMatchBucket(match);

  if (bucket === 'officialApa') {
    return deriveOfficialApaOutcome(match);
  }
  if (bucket === 'apaPractice') {
    return deriveApaPracticeOutcome(match);
  }
  if (bucket === 'acceptingGifts') {
    return deriveAcceptingGiftsOutcome(match);
  }
  if (bucket === 'straightShot') {
    return deriveStraightShotOutcome(match);
  }

  return 'unknown';
}

/**
 * Compute win/loss counts from a dataset of matches for a specific mode.
 * 
 * Rules:
 * - Accepting Gifts: win = finalSetScorePlayer === 7 AND finalSetScoreGhost < 7, loss = finalSetScoreGhost === 7 AND finalSetScorePlayer < 7
 * - Straight Shot: win = totalShots <= 20 AND > 0, loss = totalShots > 20
 * - Official APA: win = didWin === true, loss = didWin === false
 * - APA Practice: win/loss derived from playerOneScore/playerTwoScore vs pointsNeeded
 */
export function computeWinLoss(matches: ApiMatch[], mode: MatchMode): WinLossRecord {
  let wins = 0;
  let losses = 0;

  for (const match of matches) {
    if (match.mode !== mode && !match.officialApaMatchLogData) {
      continue;
    }

    // Handle Official APA separately (it doesn't have a mode field matching apaPractice)
    if (match.officialApaMatchLogData) {
      const outcome = deriveOfficialApaOutcome(match);
      if (outcome === 'win') {
        wins++;
      } else if (outcome === 'loss') {
        losses++;
      }
      continue;
    }

    if (mode === MatchMode.acceptingGifts) {
      const outcome = deriveAcceptingGiftsOutcome(match);
      if (outcome === 'win') {
        wins++;
      } else if (outcome === 'loss') {
        losses++;
      }
    } else if (mode === MatchMode.straightShot) {
      const outcome = deriveStraightShotOutcome(match);
      if (outcome === 'win') {
        wins++;
      } else if (outcome === 'loss') {
        losses++;
      }
    } else if (mode === MatchMode.apaPractice) {
      const outcome = deriveApaPracticeOutcome(match);
      if (outcome === 'win') {
        wins++;
      } else if (outcome === 'loss') {
        losses++;
      }
    }
  }

  return { wins, losses };
}

/**
 * Compute win percentage from wins and losses.
 * Returns a formatted percentage string or a placeholder when total is 0.
 */
export function computeWinPercentage(wins: number, losses: number): string {
  const total = wins + losses;
  if (total === 0) {
    return '—';
  }
  const percentage = (wins / total) * 100;
  return `${percentage.toFixed(1)}%`;
}

/**
 * Format win-loss record as "W - L" string.
 */
export function formatWinLoss(record: WinLossRecord): string {
  return `${record.wins} - ${record.losses}`;
}
