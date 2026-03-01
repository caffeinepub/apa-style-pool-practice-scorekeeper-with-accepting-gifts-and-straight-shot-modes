// APA 9-Ball Match Point Conversion (20-point system)
// Based on loser's skill level and loser's points pocketed

export type MatchPointOutcome = '20-0' | '19-1' | '18-2' | '17-3' | '16-4' | '15-5' | '14-6' | '13-7' | '12-8';

export interface MatchPointThreshold {
  outcome: MatchPointOutcome;
  minPoints: number;
  maxPoints: number;
}

// APA 9-Ball Match Point Conversion Chart
// Based on the official APA chart: loser's SL row, loser's points column
export const DEFAULT_MATCH_POINT_CHART: Record<number, MatchPointThreshold[]> = {
  1: [ // SL1 loser
    { outcome: '20-0', minPoints: 0, maxPoints: 2 },    // < 3
    { outcome: '19-1', minPoints: 3, maxPoints: 3 },    // 3
    { outcome: '18-2', minPoints: 4, maxPoints: 4 },    // 4
    { outcome: '17-3', minPoints: 5, maxPoints: 6 },    // 5&6
    { outcome: '16-4', minPoints: 7, maxPoints: 7 },    // 7
    { outcome: '15-5', minPoints: 8, maxPoints: 8 },    // 8
    { outcome: '14-6', minPoints: 9, maxPoints: 10 },   // 9&10
    { outcome: '13-7', minPoints: 11, maxPoints: 11 },  // 11
    { outcome: '12-8', minPoints: 12, maxPoints: 13 },  // 12&13
  ],
  2: [ // SL2 loser
    { outcome: '20-0', minPoints: 0, maxPoints: 3 },    // < 4
    { outcome: '19-1', minPoints: 4, maxPoints: 5 },    // 4&5
    { outcome: '18-2', minPoints: 6, maxPoints: 7 },    // 6&7
    { outcome: '17-3', minPoints: 8, maxPoints: 8 },    // 8
    { outcome: '16-4', minPoints: 9, maxPoints: 10 },   // 9&10
    { outcome: '15-5', minPoints: 11, maxPoints: 12 },  // 11&12
    { outcome: '14-6', minPoints: 13, maxPoints: 14 },  // 13&14
    { outcome: '13-7', minPoints: 15, maxPoints: 16 },  // 15&16
    { outcome: '12-8', minPoints: 17, maxPoints: 18 },  // 17&18
  ],
  3: [ // SL3 loser
    { outcome: '20-0', minPoints: 0, maxPoints: 4 },    // < 5
    { outcome: '19-1', minPoints: 5, maxPoints: 6 },    // 5&6
    { outcome: '18-2', minPoints: 7, maxPoints: 9 },    // 7-9
    { outcome: '17-3', minPoints: 10, maxPoints: 11 },  // 10&11
    { outcome: '16-4', minPoints: 12, maxPoints: 14 },  // 12-14
    { outcome: '15-5', minPoints: 15, maxPoints: 16 },  // 15&16
    { outcome: '14-6', minPoints: 17, maxPoints: 19 },  // 17-19
    { outcome: '13-7', minPoints: 20, maxPoints: 21 },  // 20&21
    { outcome: '12-8', minPoints: 22, maxPoints: 24 },  // 22-24
  ],
  4: [ // SL4 loser
    { outcome: '20-0', minPoints: 0, maxPoints: 5 },    // < 6
    { outcome: '19-1', minPoints: 6, maxPoints: 8 },    // 6-8
    { outcome: '18-2', minPoints: 9, maxPoints: 11 },   // 9-11
    { outcome: '17-3', minPoints: 12, maxPoints: 14 },  // 12-14
    { outcome: '16-4', minPoints: 15, maxPoints: 18 },  // 15-18
    { outcome: '15-5', minPoints: 19, maxPoints: 21 },  // 19-21
    { outcome: '14-6', minPoints: 22, maxPoints: 24 },  // 22-24
    { outcome: '13-7', minPoints: 25, maxPoints: 27 },  // 25-27
    { outcome: '12-8', minPoints: 28, maxPoints: 30 },  // 28-30
  ],
  5: [ // SL5 loser
    { outcome: '20-0', minPoints: 0, maxPoints: 6 },    // < 7
    { outcome: '19-1', minPoints: 7, maxPoints: 10 },   // 7-10
    { outcome: '18-2', minPoints: 11, maxPoints: 14 },  // 11-14
    { outcome: '17-3', minPoints: 15, maxPoints: 18 },  // 15-18
    { outcome: '16-4', minPoints: 19, maxPoints: 22 },  // 19-22
    { outcome: '15-5', minPoints: 23, maxPoints: 26 },  // 23-26
    { outcome: '14-6', minPoints: 27, maxPoints: 29 },  // 27-29
    { outcome: '13-7', minPoints: 30, maxPoints: 33 },  // 30-33
    { outcome: '12-8', minPoints: 34, maxPoints: 37 },  // 34-37
  ],
  6: [ // SL6 loser
    { outcome: '20-0', minPoints: 0, maxPoints: 8 },    // < 9
    { outcome: '19-1', minPoints: 9, maxPoints: 12 },   // 9-12
    { outcome: '18-2', minPoints: 13, maxPoints: 17 },  // 13-17
    { outcome: '17-3', minPoints: 18, maxPoints: 22 },  // 18-22
    { outcome: '16-4', minPoints: 23, maxPoints: 27 },  // 23-27
    { outcome: '15-5', minPoints: 28, maxPoints: 31 },  // 28-31
    { outcome: '14-6', minPoints: 32, maxPoints: 36 },  // 32-36
    { outcome: '13-7', minPoints: 37, maxPoints: 40 },  // 37-40
    { outcome: '12-8', minPoints: 41, maxPoints: 45 },  // 41-45
  ],
  7: [ // SL7 loser
    { outcome: '20-0', minPoints: 0, maxPoints: 10 },   // < 11
    { outcome: '19-1', minPoints: 11, maxPoints: 15 },  // 11-15
    { outcome: '18-2', minPoints: 16, maxPoints: 21 },  // 16-21
    { outcome: '17-3', minPoints: 22, maxPoints: 26 },  // 22-26
    { outcome: '16-4', minPoints: 27, maxPoints: 32 },  // 27-32
    { outcome: '15-5', minPoints: 33, maxPoints: 37 },  // 33-37
    { outcome: '14-6', minPoints: 38, maxPoints: 43 },  // 38-43
    { outcome: '13-7', minPoints: 44, maxPoints: 49 },  // 44-49
    { outcome: '12-8', minPoints: 50, maxPoints: 54 },  // 50-54
  ],
  8: [ // SL8 loser
    { outcome: '20-0', minPoints: 0, maxPoints: 13 },   // < 14
    { outcome: '19-1', minPoints: 14, maxPoints: 19 },  // 14-19
    { outcome: '18-2', minPoints: 20, maxPoints: 26 },  // 20-26
    { outcome: '17-3', minPoints: 27, maxPoints: 32 },  // 27-32
    { outcome: '16-4', minPoints: 33, maxPoints: 39 },  // 33-39
    { outcome: '15-5', minPoints: 40, maxPoints: 45 },  // 40-45
    { outcome: '14-6', minPoints: 46, maxPoints: 52 },  // 46-52
    { outcome: '13-7', minPoints: 53, maxPoints: 58 },  // 53-58
    { outcome: '12-8', minPoints: 59, maxPoints: 64 },  // 59-64
  ],
  9: [ // SL9 loser
    { outcome: '20-0', minPoints: 0, maxPoints: 17 },   // < 18
    { outcome: '19-1', minPoints: 18, maxPoints: 24 },  // 18-24
    { outcome: '18-2', minPoints: 25, maxPoints: 31 },  // 25-31
    { outcome: '17-3', minPoints: 32, maxPoints: 38 },  // 32-38
    { outcome: '16-4', minPoints: 39, maxPoints: 46 },  // 39-46
    { outcome: '15-5', minPoints: 47, maxPoints: 53 },  // 47-53
    { outcome: '14-6', minPoints: 54, maxPoints: 60 },  // 54-60
    { outcome: '13-7', minPoints: 61, maxPoints: 67 },  // 61-67
    { outcome: '12-8', minPoints: 68, maxPoints: 74 },  // 68-74
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
