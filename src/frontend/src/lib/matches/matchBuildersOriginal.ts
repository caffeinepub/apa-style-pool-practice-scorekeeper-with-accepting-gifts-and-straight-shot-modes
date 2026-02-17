import type { Identity } from '@dfinity/agent';
import type { MatchLogRecord, Player } from '../../backend';
import { MatchMode } from '../../backend';
import { computeApaPracticeMatchOutcome } from '../apa/apaPracticeMatchOutcome';

function generateUuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function buildApaNineBallMatch(params: {
  playerOneName: string;
  playerOneSkillLevel: number;
  playerTwoName: string;
  playerTwoSkillLevel: number;
  playerOneScore: number;
  playerTwoScore: number;
  playerOneDefensiveShots: number;
  playerTwoDefensiveShots: number;
  playerOneInnings: number;
  playerTwoInnings: number;
  playerOnePpi: number;
  playerTwoPpi: number;
  notes?: string;
  identity: Identity;
  existingMatchId?: string;
}): { matchId: string; matchRecord: MatchLogRecord } {
  const matchId = params.existingMatchId || generateUuid();
  const principal = params.identity.getPrincipal();

  const playerOne: Player = {
    id: principal,
    name: params.playerOneName,
    skillLevel: BigInt(params.playerOneSkillLevel),
  };

  const playerTwo: Player = {
    id: principal,
    name: params.playerTwoName,
    skillLevel: BigInt(params.playerTwoSkillLevel),
  };

  const playerOnePointsNeeded = getPointsToWin(params.playerOneSkillLevel);
  const playerTwoPointsNeeded = getPointsToWin(params.playerTwoSkillLevel);

  const outcome = computeApaPracticeMatchOutcome({
    player1Points: params.playerOneScore,
    player2Points: params.playerTwoScore,
    player1SL: params.playerOneSkillLevel,
    player2SL: params.playerTwoSkillLevel,
    player1Target: playerOnePointsNeeded,
    player2Target: playerTwoPointsNeeded,
  });

  const matchRecord: MatchLogRecord = {
    __kind__: 'apaNineBall',
    apaNineBall: {
      base: {
        matchId,
        mode: MatchMode.apaPractice,
        dateTime: BigInt(Date.now() * 1_000_000),
        players: [playerOne, playerTwo],
        notes: params.notes ? params.notes : undefined,
        owner: principal,
      },
      seasonType: 'Practice',
      matchType: '9-Ball',
      playerStats: [
        {
          playerId: playerOne.id,
          skillLevel: BigInt(params.playerOneSkillLevel),
          pointsNeeded: BigInt(playerOnePointsNeeded),
          defensiveShots: BigInt(params.playerOneDefensiveShots),
          innings: BigInt(params.playerOneInnings),
          ppi: params.playerOnePpi,
          matchBehaviorPhase: 'completed',
          racks: [],
          totalScore: BigInt(params.playerOneScore),
          winPercentage: 0,
          isPlayerOfMatch: outcome.player1Won,
          pointsWonConverted: BigInt(outcome.player1MatchPoints),
          pointsEarnedRunningTotal: BigInt(params.playerOneScore),
        },
        {
          playerId: playerTwo.id,
          skillLevel: BigInt(params.playerTwoSkillLevel),
          pointsNeeded: BigInt(playerTwoPointsNeeded),
          defensiveShots: BigInt(params.playerTwoDefensiveShots),
          innings: BigInt(params.playerTwoInnings),
          ppi: params.playerTwoPpi,
          matchBehaviorPhase: 'completed',
          racks: [],
          totalScore: BigInt(params.playerTwoScore),
          winPercentage: 0,
          isPlayerOfMatch: !outcome.player1Won,
          pointsWonConverted: BigInt(outcome.player2MatchPoints),
          pointsEarnedRunningTotal: BigInt(params.playerTwoScore),
        },
      ],
      winner: outcome.player1Won ? playerOne.id : playerTwo.id,
      umpire: undefined,
      teamStats: [],
    },
  };

  return { matchId, matchRecord };
}

function getPointsToWin(skillLevel: number): number {
  switch (skillLevel) {
    case 1:
      return 14;
    case 2:
      return 19;
    case 3:
      return 25;
    case 4:
      return 31;
    case 5:
      return 38;
    case 6:
      return 46;
    case 7:
      return 55;
    default:
      return 1;
  }
}

export function buildAcceptingGiftsMatch(params: {
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
  const matchId = generateUuid();
  const principal = params.identity.getPrincipal();

  const player: Player = {
    id: principal,
    name: params.playerName,
    skillLevel: undefined,
  };

  const matchRecord: MatchLogRecord = {
    __kind__: 'acceptingGifts',
    acceptingGifts: {
      base: {
        matchId,
        mode: MatchMode.acceptingGifts,
        dateTime: BigInt(Date.now() * 1_000_000),
        players: [player],
        notes: params.notes ? params.notes : undefined,
        owner: principal,
      },
      rulesReference: 'Accepting Gifts Drill',
      completionStatus: params.completionStatus,
      score: BigInt(params.score),
      startingObjectBallCount: BigInt(params.startingObjectBallCount),
      endingObjectBallCount: BigInt(params.endingObjectBallCount),
      totalAttempts: BigInt(params.totalAttempts),
      setsCompleted: BigInt(params.setsCompleted),
      finalSetScorePlayer: BigInt(params.finalSetScorePlayer),
      finalSetScoreGhost: BigInt(params.finalSetScoreGhost),
    },
  };

  return { matchId, matchRecord };
}

export function buildStraightShotMatch(params: {
  playerName: string;
  notes?: string;
  totalShots: number;
  identity: Identity;
}): { matchId: string; matchRecord: MatchLogRecord } {
  const matchId = generateUuid();
  const principal = params.identity.getPrincipal();

  const player: Player = {
    id: principal,
    name: params.playerName,
    skillLevel: undefined,
  };

  const matchRecord: MatchLogRecord = {
    __kind__: 'straightShot',
    straightShot: {
      base: {
        matchId,
        mode: MatchMode.straightShot,
        dateTime: BigInt(Date.now() * 1_000_000),
        players: [player],
        notes: params.notes ? params.notes : undefined,
        owner: principal,
      },
      strokes: [BigInt(params.totalShots)],
      scratchStrokes: [],
      time: undefined,
      shots: BigInt(params.totalShots),
      ballsMade: BigInt(0),
      score: {
        firstShot: BigInt(0),
        secondShot: BigInt(0),
        thirdShot: BigInt(0),
        fourthShot: BigInt(0),
        total: BigInt(params.totalShots),
      },
    },
  };

  return { matchId, matchRecord };
}
