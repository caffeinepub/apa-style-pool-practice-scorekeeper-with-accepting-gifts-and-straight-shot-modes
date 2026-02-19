import type { ApiMatch } from '../../backend';
import { MatchMode } from '../../backend';
import { getPointsToWin } from '../apa/apaEqualizer';
import { getLevelByIndex } from '../accepting-gifts/acceptingGiftsLevels';

/**
 * Build a Match Results narrative string for the Match History table.
 * Each mode displays a specific format with a trailing W/L indicator.
 */
export function buildMatchResultsNarrative(match: ApiMatch): string {
  // Official APA: "Official APA | vs {OpponentName} | {MyScore}/{MyPointsToWin} - {OppScore}/{OppPointsToWin} | {W|L}"
  if (match.officialApaMatchLogData) {
    const data = match.officialApaMatchLogData;
    const myScore = data.myScore;
    const theirScore = data.theirScore;
    
    let myPointsToWin = '?';
    let theirPointsToWin = '?';
    
    if (data.playerOneSkillLevel !== undefined && data.playerOneSkillLevel !== null) {
      myPointsToWin = String(getPointsToWin(Number(data.playerOneSkillLevel)));
    }
    if (data.playerTwoSkillLevel !== undefined && data.playerTwoSkillLevel !== null) {
      theirPointsToWin = String(getPointsToWin(Number(data.playerTwoSkillLevel)));
    }
    
    let outcome = '—';
    if (data.didWin === true) {
      outcome = 'W';
    } else if (data.didWin === false) {
      outcome = 'L';
    }
    
    return `Official APA | vs ${data.opponentName} | ${myScore}/${myPointsToWin} - ${theirScore}/${theirPointsToWin} | ${outcome}`;
  }

  // APA Practice: "APA Practice | {Player1Name} vs {Player2Name} | {P1Score}/{P1PointsToWin} - {P2Score}/{P2PointsToWin} | {W|L}"
  if (match.apaMatchInfo) {
    const players = match.players;
    if (players.length >= 2) {
      const p1 = players[0];
      const p2 = players[1];
      const p1Stats = match.apaMatchInfo.players[0];
      const p2Stats = match.apaMatchInfo.players[1];
      if (p1Stats && p2Stats) {
        const p1Score = Number(p1Stats.totalScore);
        const p2Score = Number(p2Stats.totalScore);
        const p1PointsToWin = Number(p1Stats.pointsNeeded);
        const p2PointsToWin = Number(p2Stats.pointsNeeded);
        
        let outcome = '—';
        if (p1Score >= p1PointsToWin && p2Score < p2PointsToWin) {
          outcome = 'W';
        } else if (p2Score >= p2PointsToWin && p1Score < p1PointsToWin) {
          outcome = 'L';
        }
        
        return `APA Practice | ${p1.name} vs ${p2.name} | ${p1Score}/${p1PointsToWin} - ${p2Score}/${p2PointsToWin} | ${outcome}`;
      }
    }
    return 'APA Practice Match';
  }

  // Straight Shots: "Straight Shots | {ShotCount} Shots | {W|L}"
  if (match.mode === MatchMode.straightShot) {
    const totalShots = match.strokes?.[0] ?? match.totalScore ?? 0;
    const isWin = Number(totalShots) <= 20;
    const outcome = isWin ? 'W' : 'L';
    return `Straight Shots | ${totalShots} Shots | ${outcome}`;
  }

  // Accepting Gifts: "Accepting Gifts | {StartingLevel} | {ResultScore} | {EndingLevel} | {W|L}"
  if (match.mode === MatchMode.acceptingGifts) {
    if (match.notes) {
      const firstLine = match.notes.split('\n')[0];
      // Expected format: "levelPlayed | result"
      // We need to parse this and reconstruct with starting/ending levels
      const parts = firstLine.split('|').map(p => p.trim());
      if (parts.length >= 2) {
        const levelPlayedStr = parts[0]; // e.g., "2+8"
        const resultStr = parts[1]; // e.g., "7-4"
        
        // Parse result to determine W/L
        const resultParts = resultStr.split('-').map(p => p.trim());
        let outcome = '—';
        if (resultParts.length === 2) {
          const playerScore = parseInt(resultParts[0]) || 0;
          const ghostScore = parseInt(resultParts[1]) || 0;
          if (playerScore >= 7 && ghostScore < 7) {
            outcome = 'W';
          } else if (ghostScore >= 7 && playerScore < 7) {
            outcome = 'L';
          }
        }
        
        // For starting/ending levels, we use the stored data
        const startingLevel = match.startingObjectBallCount !== undefined && match.startingObjectBallCount !== null
          ? getLevelByIndex(Number(match.startingObjectBallCount)).label
          : '?';
        const endingLevel = match.endingObjectBallCount !== undefined && match.endingObjectBallCount !== null
          ? getLevelByIndex(Number(match.endingObjectBallCount)).label
          : '?';
        
        return `Accepting Gifts | ${startingLevel} | ${resultStr} | ${endingLevel} | ${outcome}`;
      }
    }
    return 'Accepting Gifts';
  }

  return 'Match';
}

// Export alias for backward compatibility
export const buildMatchResultsText = buildMatchResultsNarrative;
