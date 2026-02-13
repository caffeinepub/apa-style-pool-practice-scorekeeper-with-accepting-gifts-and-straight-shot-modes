import { type MatchRecord, MatchMode } from '../../backend';
import { type Identity } from '@icp-sdk/core/agent';

function generateMatchId(): string {
  return `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function getCurrentTimestamp(): bigint {
  return BigInt(Date.now() * 1_000_000);
}

interface ApaPracticeParams {
  player1: string;
  player2: string;
  score1: number;
  score2: number;
  notes?: string;
  innings: Array<{ player: number; points: number; description: string }>;
  identity: Identity;
}

export function buildApaPracticeMatch(params: ApaPracticeParams): { matchId: string; matchRecord: MatchRecord } {
  const matchId = generateMatchId();
  const principal = params.identity.getPrincipal();

  const matchRecord: MatchRecord = {
    __kind__: 'practice',
    practice: {
      base: {
        matchId,
        mode: MatchMode.apaPractice,
        dateTime: getCurrentTimestamp(),
        players: [
          { id: principal, name: params.player1, skillLevel: undefined },
          { id: principal, name: params.player2, skillLevel: undefined },
        ],
        notes: params.notes,
        owner: principal,
      },
      attempts: BigInt(params.innings.length),
      makes: BigInt(params.score1 + params.score2),
      streaks: undefined,
    },
  };

  return { matchId, matchRecord };
}

interface AcceptingGiftsParams {
  playerName: string;
  score: number;
  notes?: string;
  completionStatus: boolean;
  identity: Identity;
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
      score: BigInt(params.score),
      completionStatus: params.completionStatus,
      rulesReference: 'Accepting Gifts drill - practice position play and shot selection',
    },
  };

  return { matchId, matchRecord };
}

interface StraightShotParams {
  playerName: string;
  attempts: number;
  makes: number;
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
      attempts: BigInt(params.attempts),
      makes: BigInt(params.makes),
      completionTime: undefined,
    },
  };

  return { matchId, matchRecord };
}
