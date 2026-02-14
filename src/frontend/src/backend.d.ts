import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Player {
    id: Principal;
    name: string;
    skillLevel?: bigint;
}
export interface BallState {
    by: string;
    id: bigint;
    all: string;
    eoi: boolean;
    inn: bigint;
    pna: bigint;
    ballNumber: bigint;
    calledShot: boolean;
    runOut: string;
    difficulty: string;
    rack: bigint;
    gameId: string;
    isBreak: boolean;
    defensiveShot: boolean;
    positionPlay: string;
    intendedPocket: string;
    score: bigint;
    pocketed: string;
    finalBall: bigint;
    activePlayer: string;
    defense: boolean;
    points: bigint;
}
export interface ApaNineBallMatch {
    matchType: string;
    base: BaseMatchEntry;
    winner: Principal;
    playerStats: Array<ApaPlayerStats>;
    teamStats: Array<TeamStats>;
    umpire?: Principal;
    seasonType: string;
}
export type Time = bigint;
export interface APAMatchStatsUiRackStats {
    extraStats: string;
    description: string;
    summary: string;
    matchId: string;
    playerStats: Array<APA9MatchPlayerStatsUi | null>;
    rackStats: Array<RackStat>;
    timestamp: Time;
    rackNumber: bigint;
}
export interface APA9MatchPlayerStatsUi {
    id: string;
    ppi: number;
    rankIcon: string;
    matchType: string;
    breakMaidenCount: bigint;
    defensiveShots: bigint;
    pointsAwarded: bigint;
    matchBehaviorPhase: string;
    totalBallsScoredPerRack: Array<bigint>;
    breakRuns: Array<bigint>;
    runOutAttempts: bigint;
    inningScores: Array<bigint>;
    rank: string;
    rackCount: bigint;
    pointsNeeded: bigint;
    deadBallsPerRack: Array<bigint>;
    pointsWonConverted: bigint;
    level: Variant_all_playerMatch_teamMatch_detailRack;
    totalScore: bigint;
    summary: string;
    rackStats: APAMatchStatsUiRackStats;
    innings: bigint;
    timestamp: Time;
    validBreakCount: bigint;
    ballsOnBreakAwardedToOpponentCount: bigint;
    winPercentage: number;
    pointsEarnedRunningTotal: bigint;
    isPlayerOfMatch: boolean;
    comments: string;
    skillLevel: bigint;
    runOutCount: bigint;
    umpire: string;
    racksPlayed: bigint;
    seasonType: string;
    location: string;
    ballsOnBreak: Array<bigint>;
    points: bigint;
}
export interface TeamStats {
    teamName: string;
    teamAverageScore: number;
    score: {
        totalPoints: bigint;
    };
    playtimes: Array<number>;
    matchesPlayed: bigint;
    teamId: string;
    matchesWon: bigint;
    teamWinState: {
        __kind__: "win";
        win: string;
    } | {
        __kind__: "loss";
        loss: string;
    } | {
        __kind__: "teammatchInProgress";
        teammatchInProgress: null;
    } | {
        __kind__: "forfeit";
        forfeit: string;
    };
    teamPenaltyState: {
        __kind__: "penalty";
        penalty: string;
    } | {
        __kind__: "pending";
        pending: null;
    } | {
        __kind__: "none";
        none: null;
    } | {
        __kind__: "penaltyAwarded";
        penaltyAwarded: string;
    };
}
export interface OfficialAPAMatchLogData {
    defensiveShots: string;
    theirScore: string;
    myScore: string;
    playerTwoSkillLevel?: bigint;
    date: string;
    opponentName: string;
    playerOneSkillLevel?: bigint;
    notes: string;
    innings: string;
    didWin?: boolean;
}
export interface APAMatchStatsUiContainer {
    matchType: string;
    summary: APAMatchStatsUiSummary;
    players: Array<APA9MatchPlayerStatsUi | null>;
    seasonType: string;
}
export interface OfficialAPAMatchLog {
    defensiveShots: string;
    theirScore: string;
    myScore: string;
    owner: Principal;
    playerTwoSkillLevel?: bigint;
    date: string;
    opponentName: string;
    matchId: string;
    playerOneSkillLevel?: bigint;
    notes: string;
    innings: string;
    didWin?: boolean;
    dateTime: Time;
}
export interface AcceptingGiftsMatch {
    startingObjectBallCount: bigint;
    completionStatus: boolean;
    base: BaseMatchEntry;
    endingObjectBallCount: bigint;
    score: bigint;
    finalSetScorePlayer: bigint;
    rulesReference: string;
    totalAttempts: bigint;
    finalSetScoreGhost: bigint;
    setsCompleted: bigint;
}
export interface APADetailedInnningSummary {
    defensiveShots: bigint;
    player: string;
    deadBalls: bigint;
    points: bigint;
}
export interface UserApprovalInfo {
    status: ApprovalStatus;
    principal: Principal;
}
export interface RackStat {
    extraStats: string;
    description: string;
    summary: string;
    matchId: string;
    timestamp: Time;
    rackNumberCopy: bigint;
    rackNumber: bigint;
}
export type MatchLogRecord = {
    __kind__: "straightShot";
    straightShot: StraightShotMatch;
} | {
    __kind__: "acceptingGifts";
    acceptingGifts: AcceptingGiftsMatch;
} | {
    __kind__: "officialApaMatchLog";
    officialApaMatchLog: OfficialAPAMatchLog;
} | {
    __kind__: "practice";
    practice: PracticeMatch;
} | {
    __kind__: "apaNineBall";
    apaNineBall: ApaNineBallMatch;
};
export interface ApaPlayerStats {
    ppi: number;
    defensiveShots: bigint;
    matchBehaviorPhase: string;
    playerId: Principal;
    pointsNeeded: bigint;
    pointsWonConverted: bigint;
    totalScore: bigint;
    innings: bigint;
    winPercentage: number;
    pointsEarnedRunningTotal: bigint;
    isPlayerOfMatch: boolean;
    skillLevel: bigint;
    racks: Array<RackScore>;
}
export interface BaseMatchEntry {
    owner: Principal;
    mode: MatchMode;
    matchId: string;
    players: Array<Player>;
    notes?: string;
    dateTime: Time;
}
export interface RackScore {
    validBreak: boolean;
    breakMaiden: boolean;
    runOut: boolean;
    totalRackScore: bigint;
    ballsOnBreakAwardedToOpponent: bigint;
    inningScore: bigint;
    ballsOnBreak: bigint;
    deadBalls: bigint;
}
export interface StraightShotMatch {
    base: BaseMatchEntry;
    scratchStrokes: Array<bigint>;
    time?: bigint;
    score: {
        firstShot: bigint;
        total: bigint;
        fourthShot: bigint;
        thirdShot: bigint;
        secondShot: bigint;
    };
    shots: bigint;
    ballsMade: bigint;
    strokes: Array<bigint>;
}
export interface APAMatchStatsUiSummary {
    id: string;
    matchType: string;
    extraStats: string;
    pointsAwarded: bigint;
    level: Variant_all_playerMatch_teamMatch_detailRack;
    summary: string;
    playerStats: Array<APA9MatchPlayerStatsUi | null>;
    rackStats: APAMatchStatsUiRackStats;
    timestamp: Time;
    isInProgress: boolean;
    comments: string;
    phase: string;
    umpire?: Principal;
    seasonType: string;
    location: string;
    points: bigint;
}
export interface ApiMatch {
    makes?: bigint;
    thirdShotScore?: bigint;
    startingObjectBallCount?: bigint;
    completionTime?: bigint;
    completionStatus?: boolean;
    owner: Principal;
    scratchStrokes?: Array<bigint>;
    mode: MatchMode;
    attempts?: bigint;
    endingObjectBallCount?: bigint;
    score?: bigint;
    shots?: bigint;
    finalSetScorePlayer?: bigint;
    totalScore?: bigint;
    rulesReference?: string;
    fourthShotScore?: bigint;
    matchId: string;
    players: Array<Player>;
    totalAttempts?: bigint;
    firstShotScore?: bigint;
    ballsMade?: bigint;
    notes?: string;
    apaMatchInfo?: APAMatchStatsUiContainer;
    secondShotScore?: bigint;
    dateTime: Time;
    officialApaMatchLogData?: OfficialAPAMatchLogData;
    finalSetScoreGhost?: bigint;
    streaks?: bigint;
    strokes?: Array<bigint>;
    setsCompleted?: bigint;
}
export interface UserProfile {
    name: string;
    apaSkillLevel?: bigint;
}
export interface PracticeMatch {
    makes?: bigint;
    base: BaseMatchEntry;
    attempts?: bigint;
    streaks?: bigint;
}
export enum ApprovalStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum MatchMode {
    straightShot = "straightShot",
    apaPractice = "apaPractice",
    acceptingGifts = "acceptingGifts"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_all_playerMatch_teamMatch_detailRack {
    all = "all",
    playerMatch = "playerMatch",
    teamMatch = "teamMatch",
    detailRack = "detailRack"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    clearHistory(): Promise<void>;
    completeSession(finalCount: bigint): Promise<bigint>;
    computeAPASummary(startingPlayer: string, ballStates: Array<BallState>): Promise<APADetailedInnningSummary>;
    deleteMatch(matchId: string): Promise<void>;
    getAllMatches(): Promise<Array<ApiMatch>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCurrentObjectBallCount(): Promise<bigint>;
    getInviteOnlyMode(): Promise<boolean>;
    getMatch(matchId: string): Promise<ApiMatch | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isCallerApproved(): Promise<boolean>;
    listApprovals(): Promise<Array<UserApprovalInfo>>;
    requestApproval(): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveMatch(matchId: string, matchRecord: MatchLogRecord): Promise<void>;
    setApproval(user: Principal, status: ApprovalStatus): Promise<void>;
    setCurrentObjectBallCount(newCount: bigint): Promise<bigint>;
    setInviteOnlyMode(enabled: boolean): Promise<void>;
    updateMatch(matchId: string, updatedMatch: MatchLogRecord): Promise<void>;
}
