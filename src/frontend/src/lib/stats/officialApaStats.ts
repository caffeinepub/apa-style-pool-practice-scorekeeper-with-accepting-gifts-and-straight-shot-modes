import type { ApiMatch } from '../../backend';
import { extractOfficialApaWinRate } from '../apa/apaAggregateStats';
import { computeOfficialApaPpi, computeOfficialApaAppi } from '../apa/officialApaPpi';

export interface OfficialApaStats {
  totalMatches: number;
  totalKnownOutcome: number;
  wins: number;
  winRate: number | null;
  averagePpi: number | null;
  averageAppi: number | null;
  hasData: boolean;
}

export function computeOfficialApaStats(
  matches: ApiMatch[],
  playerName: string
): OfficialApaStats {
  const officialMatches = matches.filter(m => m.officialApaMatchLogData);
  
  const { total, wins, winRate } = extractOfficialApaWinRate(matches);
  
  const validPpiValues: number[] = [];
  const validAppiValues: number[] = [];
  
  for (const match of officialMatches) {
    const data = match.officialApaMatchLogData;
    if (!data) continue;
    
    const ppiResult = computeOfficialApaPpi(data.myScore, data.innings, data.defensiveShots);
    if (ppiResult.isValid && ppiResult.ppi !== null) {
      validPpiValues.push(ppiResult.ppi);
    }

    const appiResult = computeOfficialApaAppi(data.myScore, data.innings, data.defensiveShots);
    if (appiResult.isValid && appiResult.appi !== null) {
      validAppiValues.push(appiResult.appi);
    }
  }
  
  const averagePpi = validPpiValues.length > 0
    ? validPpiValues.reduce((sum, ppi) => sum + ppi, 0) / validPpiValues.length
    : null;

  const averageAppi = validAppiValues.length > 0
    ? validAppiValues.reduce((sum, appi) => sum + appi, 0) / validAppiValues.length
    : null;
  
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
