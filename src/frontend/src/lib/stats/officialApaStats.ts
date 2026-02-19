import type { ApiMatch } from '../../backend';
import { extractOfficialApaWinRate, computeBest10Of20Average, computeLast10Of20Average } from '../apa/apaAggregateStats';
import { computeOfficialApaPpi, computeOfficialApaAppiWithContext } from '../apa/officialApaPpi';
import { getEffectiveMatchTimestamp } from '../matches/effectiveMatchDate';

export interface OfficialApaStats {
  totalMatches: number;
  totalKnownOutcome: number;
  wins: number;
  winRate: number | null;
  averagePpiLast10: number | null;
  averageAppiBest10Of20: number | null;
  hasData: boolean;
  avgPpiLast10Label: string;
  avgAppiLast10Label: string;
}

export function computeOfficialApaStats(matches: ApiMatch[], playerName: string): OfficialApaStats {
  const officialMatches = matches.filter(m => m.officialApaMatchLogData);

  const { total, wins, winRate } = extractOfficialApaWinRate(matches);

  // Sort by effective timestamp to get chronological order
  const sortedMatches = [...officialMatches].sort((a, b) => 
    getEffectiveMatchTimestamp(a) - getEffectiveMatchTimestamp(b)
  );

  // Extract all PPI and aPPI values in chronological order
  const allPpiValues: number[] = [];
  const allAppiValues: number[] = [];

  for (const match of sortedMatches) {
    const data = match.officialApaMatchLogData;
    if (!data) continue;

    const ppiResult = computeOfficialApaPpi(data.myScore, data.innings, data.defensiveShots);
    if (ppiResult.isValid && ppiResult.ppi !== null) {
      allPpiValues.push(ppiResult.ppi);
    }

    const appiResult = computeOfficialApaAppiWithContext(match, matches);
    if (appiResult.isValid && appiResult.appi !== null) {
      allAppiValues.push(appiResult.appi);
    }
  }

  // Average PPI: Last 10 matches (most recent 10 chronologically)
  const averagePpiLast10 = computeLast10Of20Average(allPpiValues);
  
  // Average aPPI: Best 10 of last 20 matches (highest-scoring matches)
  const averageAppiBest10Of20 = computeBest10Of20Average(allAppiValues);

  return {
    totalMatches: officialMatches.length,
    totalKnownOutcome: total,
    wins,
    winRate,
    averagePpiLast10,
    averageAppiBest10Of20,
    hasData: officialMatches.length > 0,
    avgPpiLast10Label: 'Last 10 matches',
    avgAppiLast10Label: 'Best 10 out of last 20 matches',
  };
}
