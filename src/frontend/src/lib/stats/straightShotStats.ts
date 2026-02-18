import type { ApiMatch } from '../../backend';
import { getEffectiveMatchTimestamp } from '../matches/effectiveMatchDate';

export interface StraightShotTrendDataPoint {
  timestamp: number; // BUILD 2: Numeric timestamp (unique per match)
  date: string; // BUILD 2: Date-only label for display
  shots: number;
}

export interface StraightShotHistogramBucket {
  range: string;
  count: number;
}

export interface StraightShotSummaryRow {
  balls: string;
  wins: number;
  losses: number;
  firstWinOn: string | null;
}

export interface StraightShotStats {
  totalSessions: number;
  rollingAverage: number | null;
  lifetimeAverage: number | null;
  lowestShotCount: number | null;
  lowestShotDate: string | null;
  trendData: StraightShotTrendDataPoint[];
  shotCounts: StraightShotHistogramBucket[];
  summaryRows: StraightShotSummaryRow[];
}

export function computeStraightShotStats(matches: ApiMatch[]): StraightShotStats {
  const straightShotMatches = matches.filter((m) => m.mode === 'straightShot');

  if (straightShotMatches.length === 0) {
    return {
      totalSessions: 0,
      rollingAverage: null,
      lifetimeAverage: null,
      lowestShotCount: null,
      lowestShotDate: null,
      trendData: [],
      shotCounts: [],
      summaryRows: [],
    };
  }

  // BUILD 2: Sort by numeric timestamp
  const sortedMatches = [...straightShotMatches].sort((a, b) => {
    const tsA = getEffectiveMatchTimestamp(a);
    const tsB = getEffectiveMatchTimestamp(b);
    return tsA - tsB; // Ascending (oldest first for trend)
  });

  const shotValues = sortedMatches.map((m) => {
    if (m.strokes && m.strokes.length > 0) {
      return Number(m.strokes[0]);
    }
    return m.totalScore ? Number(m.totalScore) : 0;
  });

  const totalSessions = shotValues.length;
  const lifetimeAverage = shotValues.length > 0 ? shotValues.reduce((sum, v) => sum + v, 0) / shotValues.length : null;

  const last10 = shotValues.slice(-10);
  const rollingAverage = last10.length > 0 ? last10.reduce((sum, v) => sum + v, 0) / last10.length : null;

  let lowestShotCount: number | null = null;
  let lowestShotDate: string | null = null;

  for (let i = 0; i < sortedMatches.length; i++) {
    const shots = shotValues[i];
    if (shots > 0 && (lowestShotCount === null || shots < lowestShotCount)) {
      lowestShotCount = shots;
      const timestamp = getEffectiveMatchTimestamp(sortedMatches[i]);
      lowestShotDate = new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  }

  // BUILD 2: Trend data with numeric timestamp
  const trendData: StraightShotTrendDataPoint[] = sortedMatches.map((m) => {
    const timestamp = getEffectiveMatchTimestamp(m);
    const date = new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const shots = m.strokes && m.strokes.length > 0 ? Number(m.strokes[0]) : m.totalScore ? Number(m.totalScore) : 0;
    return { timestamp, date, shots };
  });

  // Histogram
  const buckets: { [key: string]: number } = {
    '1-10': 0,
    '11-15': 0,
    '16-20': 0,
    '21-25': 0,
    '26-30': 0,
    '31+': 0,
  };

  for (const shots of shotValues) {
    if (shots >= 1 && shots <= 10) buckets['1-10']++;
    else if (shots >= 11 && shots <= 15) buckets['11-15']++;
    else if (shots >= 16 && shots <= 20) buckets['16-20']++;
    else if (shots >= 21 && shots <= 25) buckets['21-25']++;
    else if (shots >= 26 && shots <= 30) buckets['26-30']++;
    else if (shots >= 31) buckets['31+']++;
  }

  const shotCounts: StraightShotHistogramBucket[] = Object.entries(buckets).map(([range, count]) => ({ range, count }));

  // Summary rows (per-ball breakdown)
  const ballRanges = [
    { label: '1-10', min: 1, max: 10 },
    { label: '11-15', min: 11, max: 15 },
    { label: '16-20', min: 16, max: 20 },
    { label: '21-25', min: 21, max: 25 },
    { label: '26-30', min: 26, max: 30 },
    { label: '31+', min: 31, max: Infinity },
  ];

  const summaryRows: StraightShotSummaryRow[] = ballRanges.map((range) => {
    let wins = 0;
    let losses = 0;
    let firstWinOn: string | null = null;

    for (let i = 0; i < sortedMatches.length; i++) {
      const shots = shotValues[i];
      if (shots >= range.min && shots <= range.max) {
        if (shots <= 20) {
          wins++;
          if (firstWinOn === null) {
            const timestamp = getEffectiveMatchTimestamp(sortedMatches[i]);
            firstWinOn = new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
          }
        } else {
          losses++;
        }
      }
    }

    return {
      balls: range.label,
      wins,
      losses,
      firstWinOn,
    };
  });

  return {
    totalSessions,
    rollingAverage,
    lifetimeAverage,
    lowestShotCount,
    lowestShotDate,
    trendData,
    shotCounts,
    summaryRows,
  };
}
