import { useNavigate, useParams } from '@tanstack/react-router';
import { useGetAllMatches } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, TrendingUp, Target, Activity, Trophy } from 'lucide-react';
import ApaAggregateCharts from '../../components/players/ApaAggregateCharts';
import { extractPlayerApaMatches, extractOfficialApaWinRate } from '../../lib/apa/apaAggregateStats';

export default function PlayerAggregateStatsPage() {
  const navigate = useNavigate();
  const { playerName } = useParams({ from: '/players/$playerName' });
  const { data: matches = [], isLoading } = useGetAllMatches();

  const decodedPlayerName = decodeURIComponent(playerName);
  const apaMatches = extractPlayerApaMatches(matches, decodedPlayerName);
  const officialApaWinRate = extractOfficialApaWinRate(matches);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Loading player stats...</p>
      </div>
    );
  }

  // Separate APA Practice and Official APA matches for counting
  const apaPracticeMatches = apaMatches.filter(m => m.playerName !== 'You');
  const officialApaMatches = apaMatches.filter(m => m.playerName === 'You');
  
  const totalApaPracticeMatches = apaPracticeMatches.length;
  const apaPracticeWins = apaPracticeMatches.filter(m => m.isWinner).length;
  
  // Combined win rate: APA Practice wins + Official APA wins / total matches with known outcomes
  const totalWins = apaPracticeWins + officialApaWinRate.wins;
  const totalMatchesWithOutcome = totalApaPracticeMatches + officialApaWinRate.totalKnown;
  const winRate = totalMatchesWithOutcome > 0 ? (totalWins / totalMatchesWithOutcome) * 100 : 0;

  // Compute average PPI across all APA matches (Practice + Official)
  const avgPpi = apaMatches.length > 0
    ? apaMatches.reduce((sum, m) => sum + m.ppi, 0) / apaMatches.length
    : 0;
  const totalInnings = apaMatches.reduce((sum, m) => sum + m.innings, 0);
  const totalDefensiveShots = apaMatches.reduce((sum, m) => sum + m.defensiveShots, 0);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Button variant="ghost" onClick={() => navigate({ to: '/history' })} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back to History
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                {decodedPlayerName} - Aggregate Stats
              </CardTitle>
              <CardDescription>
                Performance statistics across all APA 9-Ball matches
              </CardDescription>
            </div>
            <Badge variant="secondary">{apaMatches.length} Total Matches</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {apaMatches.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">
                No APA match history found for {decodedPlayerName}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Matches Won</p>
                      <p className="text-2xl font-bold">{totalWins}</p>
                    </div>
                    <Trophy className="h-8 w-8 text-emerald-500" />
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {winRate.toFixed(1)}% win rate
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {totalMatchesWithOutcome} total matches
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Average PPI</p>
                      <p className="text-2xl font-bold">{avgPpi.toFixed(2)}</p>
                    </div>
                    <Target className="h-8 w-8 text-teal-500" />
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Points per inning
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Innings</p>
                      <p className="text-2xl font-bold">{totalInnings}</p>
                    </div>
                    <Activity className="h-8 w-8 text-cyan-500" />
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Across all matches
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Defensive Shots</p>
                      <p className="text-2xl font-bold">{totalDefensiveShots}</p>
                    </div>
                    <Activity className="h-8 w-8 text-amber-500" />
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Total across matches
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      {apaMatches.length > 0 && (
        <ApaAggregateCharts dataPoints={apaMatches} playerName={decodedPlayerName} />
      )}
    </div>
  );
}
