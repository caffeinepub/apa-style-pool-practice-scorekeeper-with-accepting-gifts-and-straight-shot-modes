import type { ApiMatch } from '../../backend';
import { MatchMode } from '../../backend';

/**
 * Derive Accepting Gifts win/loss outcome from saved match fields.
 * 
 * Win: finalSetScorePlayer === 7 AND finalSetScoreGhost < 7
 * Loss: finalSetScoreGhost === 7 AND finalSetScorePlayer < 7
 * Unknown: any other case
 */
function deriveAcceptingGiftsOutcome(match: ApiMatch): 'win' | 'loss' | 'unknown' {
  const playerScore = match.finalSetScorePlayer;
  const ghostScore = match.finalSetScoreGhost;

  if (playerScore === undefined || playerScore === null || ghostScore === undefined || ghostScore === null) {
    return 'unknown';
  }

  const player = Number(playerScore);
  const ghost = Number(ghostScore);

  if (player === 7 && ghost < 7) {
    return 'win';
  }

  if (ghost === 7 && player < 7) {
    return 'loss';
  }

  return 'unknown';
}

/**
 * Build a Match Results narrative string for the Match History table.
 * For Accepting Gifts, display exactly: "Accepting Gifts | levelPlayed | score | nextLevel | Win/Loss"
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
      // Handle both \n and \r\n line breaks
      const firstLine = match.notes.split(/\r?\n/)[0];
      
      // Parse the first line to extract components
      // Expected format: "levelPlayed | score | nextLevel"
      const parts = firstLine.split('|').map(p => p.trim());
      
      if (parts.length >= 3) {
        const levelPlayed = parts[0];
        const score = parts[1];
        const nextLevel = parts[2];
        
        // Derive Win/Loss from match data
        const outcome = deriveAcceptingGiftsOutcome(match);
        let winLossText = 'Unknown';
        if (outcome === 'win') {
          winLossText = 'Win';
        } else if (outcome === 'loss') {
          winLossText = 'Loss';
        }
        
        return `Accepting Gifts | ${levelPlayed} | ${score} | ${nextLevel} | ${winLossText}`;
      }
      
      // Fallback: if format doesn't match, still prepend "Accepting Gifts |"
      return `Accepting Gifts | ${firstLine}`;
    }
    return 'Accepting Gifts';
  }

  if (match.mode === MatchMode.straightShot) {
    const totalShots = match.strokes?.[0] ?? match.totalScore ?? 0;
    const isWin = Number(totalShots) <= 20 && Number(totalShots) > 0;
    return `Straight Shot | ${totalShots} shots | ${isWin ? 'Win' : 'Loss'}`;
  }

  return 'Match';
}

// Export alias for backward compatibility
export const buildMatchResultsText = buildMatchResultsNarrative;
