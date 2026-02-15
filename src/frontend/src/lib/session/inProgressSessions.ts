/**
 * Centralized helpers for managing per-mode in-progress session state in sessionStorage.
 * Each mode (APA Practice, Accepting Gifts, Straight Shot) has its own independent session slot.
 */

export const SESSION_KEYS = {
  APA_PRACTICE: 'apaPracticeGame',
  ACCEPTING_GIFTS: 'acceptingGiftsGame',
  STRAIGHT_SHOT: 'straightShotGame',
} as const;

export type SessionKey = typeof SESSION_KEYS[keyof typeof SESSION_KEYS];

/**
 * Check if a session exists for the given mode
 */
export function hasInProgressSession(key: SessionKey): boolean {
  return sessionStorage.getItem(key) !== null;
}

/**
 * Clear the in-progress session for the given mode
 */
export function clearInProgressSession(key: SessionKey): void {
  sessionStorage.removeItem(key);
}

/**
 * Get all active session keys
 */
export function getActiveSessionKeys(): SessionKey[] {
  return Object.values(SESSION_KEYS).filter(key => hasInProgressSession(key));
}
