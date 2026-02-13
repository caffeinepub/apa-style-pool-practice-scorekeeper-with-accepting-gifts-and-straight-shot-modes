// APA 9-Ball Rack Scoring and PPI Calculation

export interface RackScoring {
  playerAPoints: number;
  playerBPoints: number;
  deadBalls: number;
}

export interface PlayerRackData {
  points: number;
  defensiveShots: number;
  innings: number;
}

export interface RackData {
  rackNumber: number;
  playerA: PlayerRackData;
  playerB: PlayerRackData;
  deadBalls: number;
}

// Each rack in APA 9-ball has exactly 10 points available
export const POINTS_PER_RACK = 10;
export const NINE_BALL_VALUE = 2;
export const REGULAR_BALL_VALUE = 1;

export function validateRackTotal(playerA: number, playerB: number, dead: number): boolean {
  return playerA + playerB + dead === POINTS_PER_RACK;
}

export function getRackError(playerA: number, playerB: number, dead: number): string | null {
  const total = playerA + playerB + dead;
  if (total < POINTS_PER_RACK) {
    return `Rack total is ${total}. Need ${POINTS_PER_RACK - total} more points.`;
  }
  if (total > POINTS_PER_RACK) {
    return `Rack total is ${total}. Remove ${total - POINTS_PER_RACK} points.`;
  }
  return null;
}

export function calculatePPI(totalPoints: number, totalInnings: number): number {
  if (totalInnings === 0) return 0;
  return totalPoints / totalInnings;
}

export function formatPPI(ppi: number): string {
  return ppi.toFixed(2);
}

export interface PlayerStats {
  totalPoints: number;
  totalInnings: number;
  defensiveShots: number;
  racks: RackData[];
}

export function calculatePlayerStats(racks: RackData[], isPlayerA: boolean): PlayerStats {
  let totalPoints = 0;
  let totalInnings = 0;
  let defensiveShots = 0;

  racks.forEach(rack => {
    const playerData = isPlayerA ? rack.playerA : rack.playerB;
    totalPoints += playerData.points;
    totalInnings += playerData.innings;
    defensiveShots += playerData.defensiveShots;
  });

  return {
    totalPoints,
    totalInnings,
    defensiveShots,
    racks,
  };
}
