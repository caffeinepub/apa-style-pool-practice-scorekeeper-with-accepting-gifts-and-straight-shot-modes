import type { ApiMatch } from '../../backend';
import { MatchMode } from '../../backend';

export function buildMatchResultsText(match: ApiMatch): string {
  if (match.officialApaMatchLogData) {
    const data = match.officialApaMatchLogData;
    const innings = data.innings || '?';
    const defShots = data.defensiveShots || '?';
    const myScore = data.myScore || '?';
    const theirScore = data.theirScore || '?';
    const opponentName = data.opponentName || 'Opponent';
    
    const outcome = data.didWin === true ? 'Won' : data.didWin === false ? 'Lost' : 'Unknown';
    
    return `${outcome} vs ${opponentName} | Total innings ${innings} | Def shots ${defShots} | Opponent ${theirScore} | You ${myScore}`;
  }

  if (match.mode === MatchMode.apaPractice && match.apaMatchInfo) {
    const player1 = match.apaMatchInfo.players[0];
    const player2 = match.apaMatchInfo.players[1];
    
    if (player1 && player2) {
      const innings = player1.innings || 0;
      const defShots = player1.defensiveShots || 0;
      const yourScore = player1.totalScore || 0;
      const oppScore = player2.totalScore || 0;
      const opponentName = match.players[1]?.name || 'Opponent';
      const outcome = player1.isPlayerOfMatch ? 'Won' : 'Lost';
      
      return `${outcome} vs ${opponentName} | Total innings ${innings} | Def shots ${defShots} | Opponent ${oppScore} | You ${yourScore}`;
    }
  }

  if (match.mode === MatchMode.acceptingGifts) {
    const sets = match.setsCompleted || 0;
    const attempts = match.totalAttempts || 0;
    const finalScore = `${match.finalSetScorePlayer || 0}–${match.finalSetScoreGhost || 0}`;
    const startBalls = match.startingObjectBallCount || 2;
    const endBalls = match.endingObjectBallCount || 2;
    
    return `Accepting Gifts | Sets ${sets} | Attempts ${attempts} | Final ${finalScore} | Start ${startBalls} → End ${endBalls}`;
  }

  if (match.mode === MatchMode.straightShot) {
    const totalShots = match.strokes?.[0] !== undefined ? Number(match.strokes[0]) : Number(match.totalScore ?? 0);
    const result = totalShots > 0 && totalShots <= 20 ? 'Win' : 'Loss';
    
    return `Straight Shot | Total shots ${totalShots} | ${result}`;
  }

  return 'Match details';
}
