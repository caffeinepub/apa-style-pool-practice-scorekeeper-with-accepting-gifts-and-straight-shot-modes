import type { ApiMatch } from '../../backend';
import { calculateOfficialApaWinRate } from '../apa/apaAggregateStats';
import { computeOfficialApaPpi, computeOfficialApaAppiWithContext } from '../apa/officialApaPpi';
import { extractApaMatchDataPoints } from '../apa/apaAggregateStats';

export interface OfficialApaStats {
  totalMatches: number;
  totalKnownOutcome: number;
  wins: number;
  winRate: number | null;
  averagePpi: number | null;
  averageAppi: number | null;
  hasData: boolean;
}

export function computeOfficialApaStats(matches: ApiMatch[], playerName: string): OfficialApaStats {
  const officialMatches = matches.filter(m => m.officialApaMatchLogData);

  const dataPoints = extractApaMatchDataPoints(matches, playerName);
  const officialDataPoints = dataPoints.filter(dp => dp.didWin !== null);
  
  const wins = officialDataPoints.filter(dp => dp.didWin === true).length;
  const total = officialDataPoints.length;
  const winRate = calculateOfficialApaWinRate(dataPoints);

  const validPpiValues: number[] = [];
  const validAppiValues: number[] = [];

  for (const match of officialMatches) {
    const data = match.officialApaMatchLogData;
    if (!data) continue;

    const ppiResult = computeOfficialApaPpi(data.myScore, data.innings, data.defensiveShots);
    if (ppiResult.isValid && ppiResult.ppi !== null) {
      validPpiValues.push(ppiResult.ppi);
    }

    const appiResult = computeOfficialApaAppiWithContext(match, matches);
    if (appiResult.isValid && appiResult.appi !== null) {
      validAppiValues.push(appiResult.appi);
    }
  }

  const averagePpi =
    validPpiValues.length > 0 ? validPpiValues.reduce((sum, ppi) => sum + ppi, 0) / validPpiValues.length : null;

  const averageAppi =
    validAppiValues.length > 0 ? validAppiValues.reduce((sum, appi) => sum + appi, 0) / validAppiValues.length : null;

  return {
    totalMatches: officialMatches.length,
    totalKnownOutcome: total,
    wins,
    winRate,
    averagePpi,
    averageAppi,
    hasData: officialMatches.length > 0,
  };
}
