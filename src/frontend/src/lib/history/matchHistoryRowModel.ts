import type { ApiMatch } from '../../backend';
import { MatchMode } from '../../backend';

/**
 * Build a Match Results narrative string for the Match History table.
 * For Accepting Gifts, display the first line of notes (which contains the summary).
 * For other modes, use existing formatting.
 */
export function buildMatchResultsNarrative(match: ApiMatch): string {
  if (match.officialApaMatchLogData) {
    const data = match.officialApaMatchLogData;
    return `vs ${data.opponentName} | ${data.myScore}–${data.theirScore}`;
  }

  if (match.apaMatchInfo) {
    const players = match.players;
    if (players.length >= 2) {
      const p1 = players[0];
      const p2 = players[1];
      const p1Stats = match.apaMatchInfo.players[0];
      const p2Stats = match.apaMatchInfo.players[1];
      if (p1Stats && p2Stats) {
        return `${p1.name} vs ${p2.name} | ${p1Stats.totalScore}–${p2Stats.totalScore}`;
      }
    }
    return 'APA Practice Match';
  }

  if (match.mode === MatchMode.acceptingGifts) {
    if (match.notes) {
      const firstLine = match.notes.split('\n')[0];
      return firstLine || 'Accepting Gifts';
    }
    return 'Accepting Gifts';
  }

  if (match.mode === MatchMode.straightShot) {
    const totalShots = match.strokes?.[0] ?? match.totalScore ?? 0;
    const isWin = Number(totalShots) <= 20;
    return `Straight Shot | ${totalShots} shots | ${isWin ? 'Win' : 'Loss'}`;
  }

  return 'Match';
}

// Export alias for backward compatibility
export const buildMatchResultsText = buildMatchResultsNarrative;
