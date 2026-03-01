import type { ApiMatch } from '../../backend';
import { MatchMode } from '../../backend';
import { getPointsToWin } from '../apa/apaEqualizer';
import { getLevelByIndex } from '../accepting-gifts/acceptingGiftsLevels';

/**
 * Structured result from buildMatchResultsNarrative.
 * modeName: the display name for the mode (used for the pill)
 * details: the formatted data string after the mode name
 */
export interface MatchResultsNarrative {
  modeName: string;
  details: string;
}

/**
 * Build a structured Match Results narrative for the Match History table/cards.
 * Returns { modeName, details } so the mode name can be rendered as a pill.
 *
 * Locked formats (DO NOT CHANGE):
 * - Official APA:    [pill: Official APA]   | vs {Opponent} | {myScore}/{target} - {theirScore}/{target} | W/L
 * - Practice APA:   [pill: Practice APA]   | {PlayerA} vs {PlayerB} | {myScore}/{target} - {theirScore}/{target} | W/L
 * - Accepting Gifts:[pill: Accepting Gifts] | {startLevel} | {score} | {endLevel}
 * - Straight Shots: [pill: Straight Shots]  | {N} Shots | W/L
 */
export function buildMatchResultsNarrative(match: ApiMatch): MatchResultsNarrative {
  // Official APA: "vs {OpponentName} | {MyScore}/{MyPointsToWin} - {OppScore}/{OppPointsToWin} | {W|L}"
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

    return {
      modeName: 'Official APA',
      details: `vs ${data.opponentName} | ${myScore}/${myPointsToWin} - ${theirScore}/${theirPointsToWin} | ${outcome}`,
    };
  }

  // APA Practice: "{Player1Name} vs {Player2Name} | {P1Score}/{P1PointsToWin} - {P2Score}/{P2PointsToWin} | {W|L}"
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

        return {
          modeName: 'Practice APA',
          details: `${p1.name} vs ${p2.name} | ${p1Score}/${p1PointsToWin} - ${p2Score}/${p2PointsToWin} | ${outcome}`,
        };
      }
    }
    return { modeName: 'Practice APA', details: 'Match' };
  }

  // Straight Shots: "{ShotCount} Shots | {W|L}"
  if (match.mode === MatchMode.straightShot) {
    const totalShots = match.strokes?.[0] ?? match.totalScore ?? 0;
    const isWin = Number(totalShots) <= 20;
    const outcome = isWin ? 'W' : 'L';
    return {
      modeName: 'Straight Shots',
      details: `${totalShots} Shots | ${outcome}`,
    };
  }

  // Accepting Gifts: "{startingLevel} | {score} | {endingLevel}"
  // Format: startingLevel+balls | myScore-theirScore | endingLevel+balls
  if (match.mode === MatchMode.acceptingGifts) {
    const startingLevel =
      match.startingObjectBallCount !== undefined && match.startingObjectBallCount !== null
        ? getLevelByIndex(Number(match.startingObjectBallCount)).label
        : '?';
    const endingLevel =
      match.endingObjectBallCount !== undefined && match.endingObjectBallCount !== null
        ? getLevelByIndex(Number(match.endingObjectBallCount)).label
        : '?';

    // Get the score from finalSetScorePlayer / finalSetScoreGhost
    let scoreStr = '?-?';
    if (
      match.finalSetScorePlayer !== undefined &&
      match.finalSetScorePlayer !== null &&
      match.finalSetScoreGhost !== undefined &&
      match.finalSetScoreGhost !== null
    ) {
      scoreStr = `${match.finalSetScorePlayer}-${match.finalSetScoreGhost}`;
    } else if (match.notes) {
      // Fallback: parse from notes
      const firstLine = match.notes.split('\n')[0];
      const parts = firstLine.split('|').map((p) => p.trim());
      if (parts.length >= 2) {
        scoreStr = parts[1];
      }
    }

    return {
      modeName: 'Accepting Gifts',
      details: `${startingLevel} | ${scoreStr} | ${endingLevel}`,
    };
  }

  return { modeName: 'Match', details: '' };
}

/**
 * Returns the full narrative as a plain string (for backward compatibility).
 */
export function buildMatchResultsText(match: ApiMatch): string {
  const { modeName, details } = buildMatchResultsNarrative(match);
  return details ? `${modeName} | ${details}` : modeName;
}
