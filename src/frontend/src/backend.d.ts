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
export interface AcceptingGiftsMatch {
    completionStatus: boolean;
    base: BaseMatchEntry;
    score: bigint;
    rulesReference: string;
}
export type Time = bigint;
export interface BaseMatchEntry {
    owner: Principal;
    mode: MatchMode;
    matchId: string;
    players: Array<Player>;
    notes?: string;
    dateTime: Time;
}
export interface StraightShotMatch {
    makes: bigint;
    completionTime?: bigint;
    base: BaseMatchEntry;
    attempts: bigint;
}
export type MatchRecord = {
    __kind__: "straightShot";
    straightShot: StraightShotMatch;
} | {
    __kind__: "acceptingGifts";
    acceptingGifts: AcceptingGiftsMatch;
} | {
    __kind__: "practice";
    practice: PracticeMatch;
};
export interface ApiMatch {
    makes?: bigint;
    completionTime?: bigint;
    completionStatus?: boolean;
    owner: Principal;
    mode: MatchMode;
    attempts?: bigint;
    score?: bigint;
    rulesReference?: string;
    matchId: string;
    players: Array<Player>;
    notes?: string;
    dateTime: Time;
    streaks?: bigint;
}
export interface UserProfile {
    name: string;
}
export interface PracticeMatch {
    makes?: bigint;
    base: BaseMatchEntry;
    attempts?: bigint;
    streaks?: bigint;
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
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    clearHistory(): Promise<void>;
    deleteMatch(matchId: string): Promise<void>;
    getAllMatches(): Promise<Array<ApiMatch>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getMatch(matchId: string): Promise<ApiMatch | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveMatch(matchId: string, matchRecord: MatchRecord): Promise<void>;
    updateMatch(matchId: string, updatedMatch: MatchRecord): Promise<void>;
}
