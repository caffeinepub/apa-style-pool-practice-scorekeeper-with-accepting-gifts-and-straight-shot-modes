import type { ApiMatch } from '../../backend';
import { getEffectiveMatchTimestamp } from '../matches/effectiveMatchDate';
import { calculatePPI } from './apaScoring';

export interface ApaMatchDataPoint {
  timestamp: number;
  ppi: number | null;
  appi: number | null;
  defensiveShots: number;
  innings: number;
  playerScore: number;
  opponentScore: number;
  didWin: boolean | null;
}

export interface ApaAggregateDataPoint {
  timestamp: number;
  ppi: number | null;
  appi: number | null;
  defensiveShots: number;
  yourPoints: number;
  opponentPoints: number;
}

/**
 * Extract per-player APA match datapoints from both APA Practice and Official APA matches.
 * BUILD 2: Uses getEffectiveMatchTimestamp for numeric timestamp (unique per match).
 */
export function extractApaMatchDataPoints(matches: ApiMatch[], playerName: string): ApaMatchDataPoint[] {
  const dataPoints: ApaMatchDataPoint[] = [];

  for (const match of matches) {
    const timestamp = getEffectiveMatchTimestamp(match); // BUILD 2: Use existing helper

    // Official APA match logs
    if (match.officialApaMatchLogData) {
      const data = match.officialApaMatchLogData;
      const innings = data.innings.trim();
      const myScore = data.myScore.trim();
      const theirScore = data.theirScore.trim();
      const defensiveShots = data.defensiveShots.trim();

      let ppi: number | null = null;
      let playerScore = 0;
      let opponentScore = 0;
      let defShots = 0;
      let inningsNum = 0;

      if (innings && innings !== '0') {
        inningsNum = parseInt(innings, 10);
        if (isNaN(inningsNum)) inningsNum = 0;
      }

      if (myScore && myScore !== '0') {
        playerScore = parseInt(myScore, 10);
        if (isNaN(playerScore)) playerScore = 0;
      }

      if (theirScore && theirScore !== '0') {
        opponentScore = parseInt(theirScore, 10);
        if (isNaN(opponentScore)) opponentScore = 0;
      }

      if (defensiveShots && defensiveShots !== '0') {
        defShots = parseInt(defensiveShots, 10);
        if (isNaN(defShots)) defShots = 0;
      }

      if (inningsNum > 0 && playerScore > 0) {
        ppi = calculatePPI(playerScore, inningsNum);
      }

      dataPoints.push({
        timestamp,
        ppi,
        appi: null,
        defensiveShots: defShots,
        innings: inningsNum,
        playerScore,
        opponentScore,
        didWin: data.didWin ?? null,
      });
    }

    // APA Practice matches
    if (match.apaMatchInfo) {
      const players = match.apaMatchInfo.players.filter((p) => p !== null);
      if (players.length !== 2) continue;

      const player1 = players[0];
      const player2 = players[1];
      if (!player1 || !player2) continue;

      const player1Name = match.players[0]?.name || '';
      const player2Name = match.players[1]?.name || '';

      let myStats = player1;
      let opponentStats = player2;

      if (player2Name.toLowerCase() === playerName.toLowerCase()) {
        myStats = player2;
        opponentStats = player1;
      }

      const ppi = myStats.ppi > 0 ? myStats.ppi : null;
      const appi = opponentStats.ppi > 0 ? opponentStats.ppi : null;

      dataPoints.push({
        timestamp,
        ppi,
        appi,
        defensiveShots: Number(myStats.defensiveShots),
        innings: Number(myStats.innings),
        playerScore: Number(myStats.totalScore),
        opponentScore: Number(opponentStats.totalScore),
        didWin: myStats.isPlayerOfMatch,
      });
    }
  }

  return dataPoints;
}

/**
 * Compute PPI and aPPI series for charting.
 * BUILD 2: timestamp is already numeric (unique per match) from extractApaMatchDataPoints.
 */
export function computeApaAggregateSeries(dataPoints: ApaMatchDataPoint[]): ApaAggregateDataPoint[] {
  return dataPoints.map((dp) => ({
    timestamp: dp.timestamp, // BUILD 2: Already numeric timestamp
    ppi: dp.ppi,
    appi: dp.appi,
    defensiveShots: dp.defensiveShots,
    yourPoints: dp.playerScore,
    opponentPoints: dp.opponentScore,
  }));
}

/**
 * Calculate rolling best 10 of last 20 averages for PPI and aPPI.
 */
export function calculateRollingBest10Of20(dataPoints: ApaMatchDataPoint[]): {
  averagePpi: number | null;
  averageAppi: number | null;
} {
  const sortedByDate = [...dataPoints].sort((a, b) => b.timestamp - a.timestamp);
  const last20 = sortedByDate.slice(0, 20);

  const ppiValues = last20.map((dp) => dp.ppi).filter((v): v is number => v !== null);
  const appiValues = last20.map((dp) => dp.appi).filter((v): v is number => v !== null);

  const best10Ppi = ppiValues.sort((a, b) => b - a).slice(0, 10);
  const best10Appi = appiValues.sort((a, b) => b - a).slice(0, 10);

  const averagePpi = best10Ppi.length > 0 ? best10Ppi.reduce((sum, v) => sum + v, 0) / best10Ppi.length : null;
  const averageAppi = best10Appi.length > 0 ? best10Appi.reduce((sum, v) => sum + v, 0) / best10Appi.length : null;

  return { averagePpi, averageAppi };
}

/**
 * Calculate Official APA win rate using the last 20 matches by effective date.
 */
export function calculateOfficialApaWinRate(dataPoints: ApaMatchDataPoint[]): number | null {
  const sortedByDate = [...dataPoints].sort((a, b) => b.timestamp - a.timestamp);
  const last20 = sortedByDate.slice(0, 20);

  const decisiveMatches = last20.filter((dp) => dp.didWin !== null);
  if (decisiveMatches.length === 0) return null;

  const wins = decisiveMatches.filter((dp) => dp.didWin === true).length;
  return (wins / decisiveMatches.length) * 100;
}
