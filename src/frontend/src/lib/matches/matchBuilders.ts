import { type MatchRecord, MatchMode } from '../../backend';
import { type Identity } from '@icp-sdk/core/agent';
import type { RackData } from '../apa/apaScoring';
import type { MatchPointOutcome } from '../apa/apaMatchPoints';
import { calculatePPI } from '../apa/apaScoring';

function generateMatchId(): string {
  return `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function getCurrentTimestamp(): bigint {
  return BigInt(Date.now() * 1_000_000);
}

interface ApaNineBallParams {
  player1: string;
  player2: string;
  player1SL: number;
  player2SL: number;
  player1Points: number;
  player2Points: number;
  player1Innings: number;
  player2Innings: number;
  player1DefensiveShots: number;
  player2DefensiveShots: number;
  racks: RackData[];
  notes?: string;
  identity: Identity;
  matchPointOutcome: MatchPointOutcome;
}

export function buildApaNineBallMatch(params: ApaNineBallParams): { matchId: string; matchRecord: MatchRecord } {
  const matchId = generateMatchId();
  const principal = params.identity.getPrincipal();
  const player1Won = params.player1Points >= params.player1SL;
  const winner = player1Won ? principal : principal; // In practice mode, both are same user

  const player1PPI = calculatePPI(params.player1Points, params.player1Innings);
  const player2PPI = calculatePPI(params.player2Points, params.player2Innings);

  const matchRecord: MatchRecord = {
    __kind__: 'apaNineBall',
    apaNineBall: {
      base: {
        matchId,
        mode: MatchMode.apaPractice,
        dateTime: getCurrentTimestamp(),
        players: [
          { id: principal, name: params.player1, skillLevel: BigInt(params.player1SL) },
          { id: principal, name: params.player2, skillLevel: BigInt(params.player2SL) },
        ],
        notes: params.notes,
        owner: principal,
      },
      seasonType: 'Practice',
      matchType: '9-Ball',
      winner,
      umpire: undefined,
      playerStats: [
        {
          playerId: principal,
          skillLevel: BigInt(params.player1SL),
          pointsNeeded: BigInt(params.player1Points),
          defensiveShots: BigInt(params.player1DefensiveShots),
          innings: BigInt(params.player1Innings),
          ppi: player1PPI,
          matchBehaviorPhase: 'Complete',
          racks: params.racks.map(rack => ({
            validBreak: true,
            breakMaiden: false,
            ballsOnBreak: BigInt(0),
            runOut: false,
            deadBalls: BigInt(rack.deadBalls),
            ballsOnBreakAwardedToOpponent: BigInt(0),
            inningScore: BigInt(rack.playerA.innings),
            totalRackScore: BigInt(rack.playerA.points),
          })),
          totalScore: BigInt(params.player1Points),
          winPercentage: player1Won ? 1.0 : 0.0,
          isPlayerOfMatch: player1Won,
          pointsWonConverted: BigInt(player1Won ? parseInt(params.matchPointOutcome.split('-')[0]) : parseInt(params.matchPointOutcome.split('-')[1])),
          pointsEarnedRunningTotal: BigInt(params.player1Points),
        },
        {
          playerId: principal,
          skillLevel: BigInt(params.player2SL),
          pointsNeeded: BigInt(params.player2Points),
          defensiveShots: BigInt(params.player2DefensiveShots),
          innings: BigInt(params.player2Innings),
          ppi: player2PPI,
          matchBehaviorPhase: 'Complete',
          racks: params.racks.map(rack => ({
            validBreak: true,
            breakMaiden: false,
            ballsOnBreak: BigInt(0),
            runOut: false,
            deadBalls: BigInt(rack.deadBalls),
            ballsOnBreakAwardedToOpponent: BigInt(0),
            inningScore: BigInt(rack.playerB.innings),
            totalRackScore: BigInt(rack.playerB.points),
          })),
          totalScore: BigInt(params.player2Points),
          winPercentage: player1Won ? 0.0 : 1.0,
          isPlayerOfMatch: !player1Won,
          pointsWonConverted: BigInt(player1Won ? parseInt(params.matchPointOutcome.split('-')[1]) : parseInt(params.matchPointOutcome.split('-')[0])),
          pointsEarnedRunningTotal: BigInt(params.player2Points),
        },
      ],
      teamStats: [],
    },
  };

  return { matchId, matchRecord };
}

interface AcceptingGiftsParams {
  playerName: string;
  notes?: string;
  completionStatus: boolean;
  identity: Identity;
  startingObjectBallCount: number;
  endingObjectBallCount: number;
  totalAttempts: number;
  setsCompleted: number;
  finalSetScorePlayer: number;
  finalSetScoreGhost: number;
}

export function buildAcceptingGiftsMatch(params: AcceptingGiftsParams): { matchId: string; matchRecord: MatchRecord } {
  const matchId = generateMatchId();
  const principal = params.identity.getPrincipal();

  const matchRecord: MatchRecord = {
    __kind__: 'acceptingGifts',
    acceptingGifts: {
      base: {
        matchId,
        mode: MatchMode.acceptingGifts,
        dateTime: getCurrentTimestamp(),
        players: [{ id: principal, name: params.playerName, skillLevel: undefined }],
        notes: params.notes,
        owner: principal,
      },
      score: BigInt(params.finalSetScorePlayer),
      completionStatus: params.completionStatus,
      rulesReference: 'Accepting Gifts drill - practice position play and shot selection',
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

interface StraightShotParams {
  playerName: string;
  totalStrokes: number;
  scratches: number;
  ballsMade: number;
  eightBallPocketed: boolean;
  notes?: string;
  identity: Identity;
}

export function buildStraightShotMatch(params: StraightShotParams): { matchId: string; matchRecord: MatchRecord } {
  const matchId = generateMatchId();
  const principal = params.identity.getPrincipal();

  const matchRecord: MatchRecord = {
    __kind__: 'straightShot',
    straightShot: {
      base: {
        matchId,
        mode: MatchMode.straightShot,
        dateTime: getCurrentTimestamp(),
        players: [{ id: principal, name: params.playerName, skillLevel: undefined }],
        notes: params.notes,
        owner: principal,
      },
      strokes: [],
      scratchStrokes: Array(params.scratches).fill(BigInt(2)),
      time: undefined,
      shots: BigInt(params.totalStrokes),
      ballsMade: BigInt(params.ballsMade),
      score: {
        firstShot: BigInt(0),
        secondShot: BigInt(0),
        thirdShot: BigInt(0),
        fourthShot: BigInt(0),
        total: BigInt(params.totalStrokes),
      },
    },
  };

  return { matchId, matchRecord };
}
