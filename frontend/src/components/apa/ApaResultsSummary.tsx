import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Target, Shield, Activity } from 'lucide-react';
import { formatSkillLevel, formatPointsTarget } from '../../lib/apa/apaEqualizer';
import { formatPPI } from '../../lib/apa/apaScoring';
import { type MatchPointOutcome, parseMatchPointOutcome } from '../../lib/apa/apaMatchPoints';

interface PlayerSummary {
  name: string;
  skillLevel: number;
  pointsNeeded: number;
  pointsEarned: number;
  defensiveShots: number;
  innings: number;
  ppi: number;
  isWinner: boolean;
}

interface ApaResultsSummaryProps {
  player1: PlayerSummary;
  player2: PlayerSummary;
  matchPointOutcome: MatchPointOutcome;
}

export default function ApaResultsSummary({ player1, player2, matchPointOutcome }: ApaResultsSummaryProps) {
  const { winner: winnerPoints, loser: loserPoints } = parseMatchPointOutcome(matchPointOutcome);

  return (
    <div className="space-y-6">
      <Card className="border-emerald-500/50 bg-emerald-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Match Complete
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <p className="text-lg font-semibold">
              {player1.isWinner ? player1.name : player2.name} Wins!
            </p>
            <p className="text-sm text-muted-foreground">
              Team Match Points: {matchPointOutcome} (Winner gets {winnerPoints}, Loser gets {loserPoints})
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className={player1.isWinner ? 'ring-2 ring-emerald-500' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{player1.name}</span>
              {player1.isWinner && <Trophy className="h-5 w-5 text-yellow-500" />}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Skill Level</span>
              <Badge variant="secondary">{formatSkillLevel(player1.skillLevel)}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                <Target className="mr-1 inline h-4 w-4" />
                Points Needed
              </span>
              <span className="font-semibold">{player1.pointsNeeded}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Points Earned</span>
              <span className="text-2xl font-bold text-emerald-600">{player1.pointsEarned}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                <Shield className="mr-1 inline h-4 w-4" />
                Defensive Shots
              </span>
              <span className="font-semibold">{player1.defensiveShots}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                <Activity className="mr-1 inline h-4 w-4" />
                Innings
              </span>
              <span className="font-semibold">{player1.innings}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border bg-muted/50 p-2">
              <span className="text-sm font-medium">PPI</span>
              <span className="text-lg font-bold">{formatPPI(player1.ppi)}</span>
            </div>
          </CardContent>
        </Card>

        <Card className={player2.isWinner ? 'ring-2 ring-emerald-500' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{player2.name}</span>
              {player2.isWinner && <Trophy className="h-5 w-5 text-yellow-500" />}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Skill Level</span>
              <Badge variant="secondary">{formatSkillLevel(player2.skillLevel)}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                <Target className="mr-1 inline h-4 w-4" />
                Points Needed
              </span>
              <span className="font-semibold">{player2.pointsNeeded}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Points Earned</span>
              <span className="text-2xl font-bold text-emerald-600">{player2.pointsEarned}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                <Shield className="mr-1 inline h-4 w-4" />
                Defensive Shots
              </span>
              <span className="font-semibold">{player2.defensiveShots}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                <Activity className="mr-1 inline h-4 w-4" />
                Innings
              </span>
              <span className="font-semibold">{player2.innings}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border bg-muted/50 p-2">
              <span className="text-sm font-medium">PPI</span>
              <span className="text-lg font-bold">{formatPPI(player2.ppi)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
