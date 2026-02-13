// APA 9-Ball Match Point Conversion (20-point system)

export type MatchPointOutcome = '20-0' | '19-1' | '18-2' | '17-3' | '16-4' | '15-5' | '14-6' | '13-7' | '12-8';

export interface MatchPointThreshold {
  outcome: MatchPointOutcome;
  minPoints: number;
  maxPoints: number;
}

// Default APA 9-Ball Match Point Conversion Chart
// Based on loser's points earned vs their skill level requirement
export const DEFAULT_MATCH_POINT_CHART: Record<number, MatchPointThreshold[]> = {
  1: [ // SL1 needs 14 points
    { outcome: '20-0', minPoints: 0, maxPoints: 2 },
    { outcome: '19-1', minPoints: 3, maxPoints: 3 },
    { outcome: '18-2', minPoints: 4, maxPoints: 4 },
    { outcome: '17-3', minPoints: 5, maxPoints: 6 },
    { outcome: '16-4', minPoints: 7, maxPoints: 7 },
    { outcome: '15-5', minPoints: 8, maxPoints: 8 },
    { outcome: '14-6', minPoints: 9, maxPoints: 10 },
    { outcome: '13-7', minPoints: 11, maxPoints: 11 },
    { outcome: '12-8', minPoints: 12, maxPoints: 13 },
  ],
  2: [ // SL2 needs 19 points
    { outcome: '20-0', minPoints: 0, maxPoints: 3 },
    { outcome: '19-1', minPoints: 4, maxPoints: 5 },
    { outcome: '18-2', minPoints: 6, maxPoints: 7 },
    { outcome: '17-3', minPoints: 8, maxPoints: 8 },
    { outcome: '16-4', minPoints: 9, maxPoints: 10 },
    { outcome: '15-5', minPoints: 11, maxPoints: 12 },
    { outcome: '14-6', minPoints: 13, maxPoints: 14 },
    { outcome: '13-7', minPoints: 15, maxPoints: 16 },
    { outcome: '12-8', minPoints: 17, maxPoints: 18 },
  ],
  3: [ // SL3 needs 25 points
    { outcome: '20-0', minPoints: 0, maxPoints: 4 },
    { outcome: '19-1', minPoints: 5, maxPoints: 6 },
    { outcome: '18-2', minPoints: 7, maxPoints: 9 },
    { outcome: '17-3', minPoints: 10, maxPoints: 11 },
    { outcome: '16-4', minPoints: 12, maxPoints: 14 },
    { outcome: '15-5', minPoints: 15, maxPoints: 16 },
    { outcome: '14-6', minPoints: 17, maxPoints: 19 },
    { outcome: '13-7', minPoints: 20, maxPoints: 21 },
    { outcome: '12-8', minPoints: 22, maxPoints: 24 },
  ],
  4: [ // SL4 needs 31 points
    { outcome: '20-0', minPoints: 0, maxPoints: 5 },
    { outcome: '19-1', minPoints: 6, maxPoints: 8 },
    { outcome: '18-2', minPoints: 9, maxPoints: 11 },
    { outcome: '17-3', minPoints: 12, maxPoints: 14 },
    { outcome: '16-4', minPoints: 15, maxPoints: 18 },
    { outcome: '15-5', minPoints: 19, maxPoints: 21 },
    { outcome: '14-6', minPoints: 22, maxPoints: 24 },
    { outcome: '13-7', minPoints: 25, maxPoints: 27 },
    { outcome: '12-8', minPoints: 28, maxPoints: 30 },
  ],
  5: [ // SL5 needs 38 points
    { outcome: '20-0', minPoints: 0, maxPoints: 6 },
    { outcome: '19-1', minPoints: 7, maxPoints: 10 },
    { outcome: '18-2', minPoints: 11, maxPoints: 14 },
    { outcome: '17-3', minPoints: 15, maxPoints: 18 },
    { outcome: '16-4', minPoints: 19, maxPoints: 22 },
    { outcome: '15-5', minPoints: 23, maxPoints: 26 },
    { outcome: '14-6', minPoints: 27, maxPoints: 30 },
    { outcome: '13-7', minPoints: 31, maxPoints: 34 },
    { outcome: '12-8', minPoints: 35, maxPoints: 37 },
  ],
  6: [ // SL6 needs 46 points
    { outcome: '20-0', minPoints: 0, maxPoints: 8 },
    { outcome: '19-1', minPoints: 9, maxPoints: 12 },
    { outcome: '18-2', minPoints: 13, maxPoints: 17 },
    { outcome: '17-3', minPoints: 18, maxPoints: 22 },
    { outcome: '16-4', minPoints: 23, maxPoints: 27 },
    { outcome: '15-5', minPoints: 28, maxPoints: 32 },
    { outcome: '14-6', minPoints: 33, maxPoints: 37 },
    { outcome: '13-7', minPoints: 38, maxPoints: 42 },
    { outcome: '12-8', minPoints: 43, maxPoints: 45 },
  ],
  7: [ // SL7 needs 55 points
    { outcome: '20-0', minPoints: 0, maxPoints: 10 },
    { outcome: '19-1', minPoints: 11, maxPoints: 15 },
    { outcome: '18-2', minPoints: 16, maxPoints: 21 },
    { outcome: '17-3', minPoints: 22, maxPoints: 26 },
    { outcome: '16-4', minPoints: 27, maxPoints: 32 },
    { outcome: '15-5', minPoints: 33, maxPoints: 38 },
    { outcome: '14-6', minPoints: 39, maxPoints: 44 },
    { outcome: '13-7', minPoints: 45, maxPoints: 50 },
    { outcome: '12-8', minPoints: 51, maxPoints: 54 },
  ],
  8: [ // SL8 needs 65 points
    { outcome: '20-0', minPoints: 0, maxPoints: 13 },
    { outcome: '19-1', minPoints: 14, maxPoints: 19 },
    { outcome: '18-2', minPoints: 20, maxPoints: 26 },
    { outcome: '17-3', minPoints: 27, maxPoints: 32 },
    { outcome: '16-4', minPoints: 33, maxPoints: 39 },
    { outcome: '15-5', minPoints: 40, maxPoints: 46 },
    { outcome: '14-6', minPoints: 47, maxPoints: 53 },
    { outcome: '13-7', minPoints: 54, maxPoints: 60 },
    { outcome: '12-8', minPoints: 61, maxPoints: 64 },
  ],
  9: [ // SL9 needs 75 points
    { outcome: '20-0', minPoints: 0, maxPoints: 17 },
    { outcome: '19-1', minPoints: 18, maxPoints: 24 },
    { outcome: '18-2', minPoints: 25, maxPoints: 31 },
    { outcome: '17-3', minPoints: 32, maxPoints: 38 },
    { outcome: '16-4', minPoints: 39, maxPoints: 46 },
    { outcome: '15-5', minPoints: 47, maxPoints: 54 },
    { outcome: '14-6', minPoints: 55, maxPoints: 61 },
    { outcome: '13-7', minPoints: 62, maxPoints: 68 },
    { outcome: '12-8', minPoints: 69, maxPoints: 74 },
  ],
};

export function calculateMatchPoints(
  loserSkillLevel: number,
  loserPoints: number,
  chart: Record<number, MatchPointThreshold[]> = DEFAULT_MATCH_POINT_CHART
): MatchPointOutcome {
  const thresholds = chart[loserSkillLevel];
  if (!thresholds) {
    return '20-0'; // Default if skill level not found
  }

  for (const threshold of thresholds) {
    if (loserPoints >= threshold.minPoints && loserPoints <= threshold.maxPoints) {
      return threshold.outcome;
    }
  }

  return '12-8'; // Default to closest match if out of range
}

export function parseMatchPointOutcome(outcome: MatchPointOutcome): { winner: number; loser: number } {
  const [winner, loser] = outcome.split('-').map(Number);
  return { winner, loser };
}
