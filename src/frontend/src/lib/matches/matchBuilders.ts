import { MatchLogRecord } from '../../backend';
import type { Identity } from '@dfinity/agent';
import { deriveOfficialApaOutcome } from '../apa/officialApaOutcome';

export function buildOfficialApaMatchLog({
  date,
  opponentName,
  myScore,
  theirScore,
  innings,
  defensiveShots,
  notes,
  identity,
  player1SkillLevel,
  player2SkillLevel,
  existingMatchId,
}: {
  date: string;
  opponentName: string;
  myScore: string;
  theirScore: string;
  innings: string;
  defensiveShots: string;
  notes: string;
  identity: Identity;
  player1SkillLevel?: number;
  player2SkillLevel?: number;
  existingMatchId?: string;
}): { matchId: string; matchRecord: MatchLogRecord } {
  const matchId = existingMatchId || `official-apa-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  const dateTime = BigInt(Date.now() * 1_000_000);

  // Derive didWin from skill levels and scores
  let didWin: boolean | undefined = undefined;
  if (player1SkillLevel !== undefined && player2SkillLevel !== undefined) {
    const outcome = deriveOfficialApaOutcome(
      BigInt(player1SkillLevel),
      BigInt(player2SkillLevel),
      myScore,
      theirScore
    );
    
    if (outcome === 'win') {
      didWin = true;
    } else if (outcome === 'loss') {
      didWin = false;
    }
    // If outcome is 'unknown', leave didWin as undefined
  }

  const matchRecord: MatchLogRecord = {
    __kind__: 'officialApaMatchLog',
    officialApaMatchLog: {
      matchId,
      dateTime,
      owner: identity.getPrincipal(),
      playerOneSkillLevel: player1SkillLevel !== undefined ? BigInt(player1SkillLevel) : undefined,
      playerTwoSkillLevel: player2SkillLevel !== undefined ? BigInt(player2SkillLevel) : undefined,
      date,
      opponentName,
      myScore,
      theirScore,
      innings,
      defensiveShots,
      notes,
      didWin,
    },
  };

  return { matchId, matchRecord };
}

// Re-export other builders from the original file
export {
  buildApaNineBallMatch,
  buildAcceptingGiftsMatch,
  buildStraightShotMatch,
} from './matchBuildersOriginal';
