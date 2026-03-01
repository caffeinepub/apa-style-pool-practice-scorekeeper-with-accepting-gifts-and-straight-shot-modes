import type { ApiMatch } from '../../backend';
import { MatchMode } from '../../backend';

export interface StraightShotStats {
  hasData: boolean;
  totalSessions: number;
  rollingAverage: number | null;
  lifetimeAverage: number | null;
  lowestShotCount: number | null;
  lowestShotDate: string | null;
  trendData: Array<{ date: string; shots: number }>;
  histogramData: number[];
  summaryRows: Array<{ balls: number; wins: number; losses: number; firstWinDate: string | null }>;
}

export function computeStraightShotStats(
  matches: ApiMatch[],
  rollingWindow: number = 20
): StraightShotStats {
  const straightShotMatches = matches.filter(m => m.mode === MatchMode.straightShot);

  if (straightShotMatches.length === 0) {
    return {
      hasData: false,
      totalSessions: 0,
      rollingAverage: null,
      lifetimeAverage: null,
      lowestShotCount: null,
      lowestShotDate: null,
      trendData: [],
      histogramData: [],
      summaryRows: [],
    };
  }

  const shotCounts: Array<{ shots: number; date: string; dateTime: bigint }> = [];
  for (const match of straightShotMatches) {
    const shots = match.strokes?.[0] !== undefined 
      ? Number(match.strokes[0]) 
      : Number(match.totalScore ?? 0);
    
    if (shots > 0) {
      const date = new Date(Number(match.dateTime) / 1_000_000);
      shotCounts.push({
        shots,
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        dateTime: match.dateTime,
      });
    }
  }

  shotCounts.sort((a, b) => Number(b.dateTime - a.dateTime));

  const totalSessions = shotCounts.length;

  const rollingShots = shotCounts.slice(0, Math.min(rollingWindow, shotCounts.length));
  const rollingAverage = rollingShots.length > 0
    ? rollingShots.reduce((sum, item) => sum + item.shots, 0) / rollingShots.length
    : null;

  const lifetimeAverage = shotCounts.length > 0
    ? shotCounts.reduce((sum, item) => sum + item.shots, 0) / shotCounts.length
    : null;

  let lowestShotCount: number | null = null;
  let lowestShotDate: string | null = null;
  for (const item of shotCounts) {
    if (lowestShotCount === null || item.shots < lowestShotCount) {
      lowestShotCount = item.shots;
      lowestShotDate = item.date;
    }
  }

  const trendData = [...shotCounts].reverse().map(item => ({
    date: item.date,
    shots: item.shots,
  }));

  const histogramData = shotCounts.map(item => item.shots);

  const ballCountMap = new Map<number, { wins: number; losses: number; firstWinDate: string | null }>();
  
  for (const item of shotCounts) {
    const balls = 15;
    if (!ballCountMap.has(balls)) {
      ballCountMap.set(balls, { wins: 0, losses: 0, firstWinDate: null });
    }
    const entry = ballCountMap.get(balls)!;
    
    if (item.shots <= 20) {
      entry.wins++;
      if (entry.firstWinDate === null) {
        entry.firstWinDate = item.date;
      }
    } else {
      entry.losses++;
    }
  }

  const summaryRows = Array.from(ballCountMap.entries())
    .map(([balls, data]) => ({
      balls,
      wins: data.wins,
      losses: data.losses,
      firstWinDate: data.firstWinDate,
    }))
    .sort((a, b) => a.balls - b.balls);

  return {
    hasData: true,
    totalSessions,
    rollingAverage,
    lifetimeAverage,
    lowestShotCount,
    lowestShotDate,
    trendData,
    histogramData,
    summaryRows,
  };
}
