/**
 * Official APA PPI and aPPI calculation helpers
 * PPI Formula: myScore / (innings - defensiveShots)
 * aPPI: For wins, aPPI = max(PPI, expectedPpiFromTable); for losses, aPPI = PPI
 */

import type { ApiMatch } from '../../backend';
import { lookupExpectedPpi } from './officialApaExpectedPpiTable';
import { getOfficialApaOutcome } from './officialApaOutcome';
import { getEffectiveMatchTimestamp } from '../matches/effectiveMatchDate';

export interface OfficialPpiResult {
  ppi: number | null;
  isValid: boolean;
}

export interface OfficialAppiResult {
  appi: number | null;
  isValid: boolean;
}

/**
 * Parse and validate a text field as a non-negative integer
 */
function parseNonNegativeInt(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === '') return null;

  const num = Number(trimmed);
  if (isNaN(num) || num < 0 || !Number.isInteger(num)) {
    return null;
  }

  return num;
}

/**
 * Compute Official APA PPI from text fields
 * Returns null PPI if any field is invalid or denominator <= 0
 */
export function computeOfficialApaPpi(
  myScore: string,
  innings: string,
  defensiveShots: string
): OfficialPpiResult {
  const score = parseNonNegativeInt(myScore);
  const inn = parseNonNegativeInt(innings);
  const defShots = parseNonNegativeInt(defensiveShots);

  // If any field is invalid, return invalid result
  if (score === null || inn === null || defShots === null) {
    return { ppi: null, isValid: false };
  }

  const denominator = inn - defShots;

  // If denominator is zero or negative, return invalid result
  if (denominator <= 0) {
    return { ppi: null, isValid: false };
  }

  const ppi = score / denominator;
  return { ppi, isValid: true };
}

/**
 * Compute win% for a specific Official APA match using last up-to-20 matches on/before that match's effective date
 * Excludes unknown outcomes from the denominator
 */
function computeWinPercentageForMatch(
  allMatches: ApiMatch[],
  currentMatch: ApiMatch
): number | null {
  const officialMatches = allMatches.filter(m => m.officialApaMatchLogData);

  const currentEffectiveTime = getEffectiveMatchTimestamp(currentMatch);

  // Filter to matches on or before current match's effective date
  const eligibleMatches = officialMatches.filter(m => {
    const effectiveTime = getEffectiveMatchTimestamp(m);
    return effectiveTime <= currentEffectiveTime;
  });

  // Sort by effective date descending (newest first)
  const sortedMatches = [...eligibleMatches].sort((a, b) => {
    const timeA = getEffectiveMatchTimestamp(a);
    const timeB = getEffectiveMatchTimestamp(b);
    return timeB - timeA;
  });

  // Take up to 20 matches
  const last20Matches = sortedMatches.slice(0, 20);

  let wins = 0;
  let total = 0;

  for (const match of last20Matches) {
    const data = match.officialApaMatchLogData;
    if (!data) continue;

    const outcome = getOfficialApaOutcome(
      data.didWin,
      data.playerOneSkillLevel,
      data.playerTwoSkillLevel,
      data.myScore,
      data.theirScore
    );

    if (outcome === 'win' || outcome === 'loss') {
      total++;
      if (outcome === 'win') {
        wins++;
      }
    }
  }

  if (total === 0) return null;

  return (wins / total) * 100;
}

/**
 * Compute Official APA aPPI for a specific match with full context
 * For wins: aPPI = max(PPI, expectedPpiFromTable) OR expectedPpiFromTable if PPI unavailable
 * For losses: aPPI = PPI (requires valid PPI)
 * Returns null aPPI if required inputs are missing
 */
export function computeOfficialApaAppiWithContext(
  currentMatch: ApiMatch,
  allMatches: ApiMatch[]
): OfficialAppiResult {
  const data = currentMatch.officialApaMatchLogData;
  if (!data) {
    return { appi: null, isValid: false };
  }

  const ppiResult = computeOfficialApaPpi(data.myScore, data.innings, data.defensiveShots);

  // Determine outcome
  const outcome = getOfficialApaOutcome(
    data.didWin,
    data.playerOneSkillLevel,
    data.playerTwoSkillLevel,
    data.myScore,
    data.theirScore
  );

  // For losses or unknown outcomes, aPPI = PPI (requires valid PPI)
  if (outcome === 'loss' || outcome === 'unknown') {
    if (!ppiResult.isValid || ppiResult.ppi === null) {
      return { appi: null, isValid: false };
    }
    return { appi: ppiResult.ppi, isValid: true };
  }

  // For wins, compute aPPI using expected PPI table
  if (outcome === 'win') {
    // Check if we have skill level
    if (data.playerOneSkillLevel === undefined) {
      // Missing skill level, fallback to PPI if available
      if (ppiResult.isValid && ppiResult.ppi !== null) {
        return { appi: ppiResult.ppi, isValid: true };
      }
      return { appi: null, isValid: false };
    }

    const skillLevel = Number(data.playerOneSkillLevel);

    // Compute win% for this match
    const winPercent = computeWinPercentageForMatch(allMatches, currentMatch);

    if (winPercent === null) {
      // No win% data, fallback to PPI if available
      if (ppiResult.isValid && ppiResult.ppi !== null) {
        return { appi: ppiResult.ppi, isValid: true };
      }
      return { appi: null, isValid: false };
    }

    // Lookup expected PPI from table
    const expectedPpi = lookupExpectedPpi(skillLevel, winPercent);

    if (expectedPpi === null) {
      // Skill level out of range (not SL2-SL7), fallback to PPI if available
      if (ppiResult.isValid && ppiResult.ppi !== null) {
        return { appi: ppiResult.ppi, isValid: true };
      }
      return { appi: null, isValid: false };
    }

    // If PPI is valid, aPPI = max(PPI, expectedPpi)
    // If PPI is invalid (e.g., missing innings), aPPI = expectedPpi
    if (ppiResult.isValid && ppiResult.ppi !== null) {
      const appi = Math.max(ppiResult.ppi, expectedPpi);
      return { appi, isValid: true };
    } else {
      // Win without valid PPI: use expectedPpi as aPPI
      return { appi: expectedPpi, isValid: true };
    }
  }

  // Fallback (should not reach here)
  if (ppiResult.isValid && ppiResult.ppi !== null) {
    return { appi: ppiResult.ppi, isValid: true };
  }
  return { appi: null, isValid: false };
}

/**
 * Compute Official APA aPPI from text fields (legacy interface for backward compatibility)
 * This version does not have match context, so it falls back to aPPI = PPI
 * Use computeOfficialApaAppiWithContext for correct aPPI computation
 */
export function computeOfficialApaAppi(
  myScore: string,
  innings: string,
  defensiveShots: string
): OfficialAppiResult {
  const ppiResult = computeOfficialApaPpi(myScore, innings, defensiveShots);

  // Without context, fallback to aPPI = PPI
  return {
    appi: ppiResult.ppi,
    isValid: ppiResult.isValid,
  };
}

/**
 * Format PPI for display
 * Returns "—" for invalid/unavailable PPI
 */
export function formatOfficialPpi(result: OfficialPpiResult): string {
  if (!result.isValid || result.ppi === null) {
    return '—';
  }
  return result.ppi.toFixed(2);
}

/**
 * Format aPPI for display
 * Returns "—" for invalid/unavailable aPPI
 */
export function formatOfficialAppi(result: OfficialAppiResult): string {
  if (!result.isValid || result.appi === null) {
    return '—';
  }
  return result.appi.toFixed(2);
}
