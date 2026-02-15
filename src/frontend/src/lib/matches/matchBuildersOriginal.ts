import { MatchLogRecord, MatchMode } from '../../backend';
import type { Identity } from '@dfinity/agent';
import type { RackData } from '../apa/apaScoring';
import type { MatchOutcomeResult } from '../apa/apaPracticeMatchOutcome';

export function buildApaNineBallMatch({
  player1,
  player2,
  player1SL,
  player2SL,
  player1Target,
  player2Target,
  player1Points,
  player2Points,
  player1Innings,
  player2Innings,
  player1DefensiveShots,
  player2DefensiveShots,
  racks,
  notes,
  identity,
  matchOutcome,
}: {
  player1: string;
  player2: string;
  player1SL: number;
  player2SL: number;
  player1Target: number;
  player2Target: number;
  player1Points: number;
  player2Points: number;
  player1Innings: number;
  player2Innings: number;
  player1DefensiveShots: number;
  player2DefensiveShots: number;
  racks: RackData[];
  notes?: string;
  identity: Identity;
  matchOutcome: MatchOutcomeResult;
}): { matchId: string; matchRecord: MatchLogRecord } {
  const matchId = `apa-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  const dateTime = BigInt(Date.now() * 1_000_000);

  const player1Won = matchOutcome.player1Won;
  const player1PPI = player1Innings > 0 ? player1Points / player1Innings : 0;
  const player2PPI = player2Innings > 0 ? player2Points / player2Innings : 0;

  const player1Stats = {
    playerId: identity.getPrincipal(),
    skillLevel: BigInt(player1SL),
    pointsNeeded: BigInt(player1Target),
    defensiveShots: BigInt(player1DefensiveShots),
    innings: BigInt(player1Innings),
    ppi: player1PPI,
    matchBehaviorPhase: 'completed',
    racks: [],
    totalScore: BigInt(player1Points),
    winPercentage: player1Won ? 1.0 : 0.0,
    isPlayerOfMatch: player1Won,
    pointsWonConverted: BigInt(matchOutcome.player1MatchPoints),
    pointsEarnedRunningTotal: BigInt(player1Points),
  };

  const player2Stats = {
    playerId: identity.getPrincipal(),
    skillLevel: BigInt(player2SL),
    pointsNeeded: BigInt(player2Target),
    defensiveShots: BigInt(player2DefensiveShots),
    innings: BigInt(player2Innings),
    ppi: player2PPI,
    matchBehaviorPhase: 'completed',
    racks: [],
    totalScore: BigInt(player2Points),
    winPercentage: player1Won ? 0.0 : 1.0,
    isPlayerOfMatch: !player1Won,
    pointsWonConverted: BigInt(matchOutcome.player2MatchPoints),
    pointsEarnedRunningTotal: BigInt(player2Points),
  };

  const matchRecord: MatchLogRecord = {
    __kind__: 'apaNineBall',
    apaNineBall: {
      base: {
        matchId,
        mode: MatchMode.apaPractice,
        dateTime,
        players: [
          {
            id: identity.getPrincipal(),
            name: player1,
            skillLevel: BigInt(player1SL),
          },
          {
            id: identity.getPrincipal(),
            name: player2,
            skillLevel: BigInt(player2SL),
          },
        ],
        notes: notes || undefined,
        owner: identity.getPrincipal(),
      },
      seasonType: 'practice',
      matchType: 'singles',
      playerStats: [player1Stats, player2Stats],
      winner: identity.getPrincipal(),
      umpire: undefined,
      teamStats: [],
    },
  };

  return { matchId, matchRecord };
}

export function buildAcceptingGiftsMatch({
  playerName,
  notes,
  startingObjectBallCount,
  endingObjectBallCount,
  totalAttempts,
  setsCompleted,
  finalSetScorePlayer,
  finalSetScoreGhost,
  completionStatus,
  score,
  identity,
}: {
  playerName: string;
  notes?: string;
  startingObjectBallCount: number;
  endingObjectBallCount: number;
  totalAttempts: number;
  setsCompleted: number;
  finalSetScorePlayer: number;
  finalSetScoreGhost: number;
  completionStatus: boolean;
  score: number;
  identity: Identity;
}): { matchId: string; matchRecord: MatchLogRecord } {
  const matchId = `ag-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  const dateTime = BigInt(Date.now() * 1_000_000);

  const matchRecord: MatchLogRecord = {
    __kind__: 'acceptingGifts',
    acceptingGifts: {
      base: {
        matchId,
        mode: MatchMode.acceptingGifts,
        dateTime,
        players: [
          {
            id: identity.getPrincipal(),
            name: playerName,
            skillLevel: undefined,
          },
        ],
        notes: notes || undefined,
        owner: identity.getPrincipal(),
      },
      rulesReference: 'Accepting Gifts Drill',
      completionStatus,
      score: BigInt(score),
      startingObjectBallCount: BigInt(startingObjectBallCount),
      endingObjectBallCount: BigInt(endingObjectBallCount),
      totalAttempts: BigInt(totalAttempts),
      setsCompleted: BigInt(setsCompleted),
      finalSetScorePlayer: BigInt(finalSetScorePlayer),
      finalSetScoreGhost: BigInt(finalSetScoreGhost),
    },
  };

  return { matchId, matchRecord };
}

export function buildStraightShotMatch({
  playerName,
  notes,
  strokes,
  scratchStrokes,
  shots,
  ballsMade,
  firstShotScore,
  secondShotScore,
  thirdShotScore,
  fourthShotScore,
  totalScore,
  identity,
}: {
  playerName: string;
  notes?: string;
  strokes: number[];
  scratchStrokes: number[];
  shots: number;
  ballsMade: number;
  firstShotScore: number;
  secondShotScore: number;
  thirdShotScore: number;
  fourthShotScore: number;
  totalScore: number;
  identity: Identity;
}): { matchId: string; matchRecord: MatchLogRecord } {
  const matchId = `ss-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  const dateTime = BigInt(Date.now() * 1_000_000);

  const matchRecord: MatchLogRecord = {
    __kind__: 'straightShot',
    straightShot: {
      base: {
        matchId,
        mode: MatchMode.straightShot,
        dateTime,
        players: [
          {
            id: identity.getPrincipal(),
            name: playerName,
            skillLevel: undefined,
          },
        ],
        notes: notes || undefined,
        owner: identity.getPrincipal(),
      },
      strokes: strokes.map((s) => BigInt(s)),
      scratchStrokes: scratchStrokes.map((s) => BigInt(s)),
      time: undefined,
      shots: BigInt(shots),
      ballsMade: BigInt(ballsMade),
      score: {
        firstShot: BigInt(firstShotScore),
        secondShot: BigInt(secondShotScore),
        thirdShot: BigInt(thirdShotScore),
        fourthShot: BigInt(fourthShotScore),
        total: BigInt(totalScore),
      },
    },
  };

  return { matchId, matchRecord };
}
