import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, User, History } from 'lucide-react';
import { useGetAllMatches, useGetCallerUserProfile, useGetCurrentObjectBallCount } from '../../hooks/useQueries';
import ApaAggregateCharts from '../../components/players/ApaAggregateCharts';
import StraightShotTrendChart from '../../components/straight-shot/StraightShotTrendChart';
import StraightShotHistogram from '../../components/straight-shot/StraightShotHistogram';
import AcceptingGiftsPerformanceByBallCountTable from '../../components/accepting-gifts/AcceptingGiftsPerformanceByBallCountTable';
import { extractPlayerApaMatches } from '../../lib/apa/apaAggregateStats';
import { computeOfficialApaStats } from '../../lib/stats/officialApaStats';
import { computeStraightShotStats } from '../../lib/stats/straightShotStats';
import { computeAcceptingGiftsStats } from '../../lib/stats/acceptingGiftsStats';
import { computeAcceptingGiftsPerformanceByBallCount } from '../../lib/stats/acceptingGiftsPerformanceByBallCount';
import { getPlayerStatsRoute } from '../../utils/playerRoutes';
import { setNavigationOrigin } from '../../utils/urlParams';

export default function StatsPage() {
  const navigate = useNavigate();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: allMatches, isLoading } = useGetAllMatches();
  const { data: currentBallCount } = useGetCurrentObjectBallCount();

  const myName = userProfile?.name || '';

  const officialApaStats = myName && allMatches
    ? computeOfficialApaStats(allMatches, myName)
    : null;

  const straightShotStats = allMatches
    ? computeStraightShotStats(allMatches, 20)
    : null;

  const acceptingGiftsStats = allMatches
    ? computeAcceptingGiftsStats(allMatches, 20)
    : null;

  const acceptingGiftsPerformance = allMatches
    ? computeAcceptingGiftsPerformanceByBallCount(allMatches)
    : null;

  const myApaDataPoints = myName && allMatches
    ? extractPlayerApaMatches(allMatches, myName)
    : [];

  const currentObjectBalls = currentBallCount ? Number(currentBallCount) : 2;

  const handleNavigateToPlayerAggregate = () => {
    setNavigationOrigin('stats');
    navigate({ to: getPlayerStatsRoute(myName) });
  };

  const handleNavigateToHistory = () => {
    setNavigationOrigin('stats');
    navigate({ to: '/history' });
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Loading stats...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => navigate({ to: '/' })}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Button>
        <h1 className="text-2xl font-bold">My Stats</h1>
        <div className="w-24" />
      </div>

      {myName && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Viewing stats for</p>
                <p className="font-semibold">{myName}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleNavigateToPlayerAggregate}
              >
                View Player Aggregate Stats
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNavigateToHistory}
                className="gap-2"
              >
                <History className="h-4 w-4" />
                View Match History
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="official" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="official">Official APA</TabsTrigger>
          <TabsTrigger value="straightshot">Straight Shot</TabsTrigger>
          <TabsTrigger value="acceptinggifts">Accepting Gifts</TabsTrigger>
        </TabsList>

        <TabsContent value="official" className="space-y-6">
          {officialApaStats?.hasData ? (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Matches
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{officialApaStats.totalMatches}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Official APA logs
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Win Rate
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {officialApaStats.winRate !== null ? (
                      <>
                        <div className="text-3xl font-bold">
                          {officialApaStats.winRate.toFixed(1)}%
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {officialApaStats.wins} wins of {officialApaStats.totalKnownOutcome} known
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="text-3xl font-bold text-muted-foreground">—</div>
                        <p className="text-xs text-muted-foreground mt-1">
                          No matches with known outcome
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Average PPI
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {officialApaStats.averagePpi !== null ? (
                      <>
                        <div className="text-3xl font-bold">
                          {officialApaStats.averagePpi.toFixed(2)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Points per inning
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="text-3xl font-bold text-muted-foreground">—</div>
                        <p className="text-xs text-muted-foreground mt-1">
                          No valid PPI data
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>APA Performance Charts</CardTitle>
                  <CardDescription>
                    Combined view of all APA matches (Practice + Official)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {myApaDataPoints.length > 0 ? (
                    <ApaAggregateCharts dataPoints={myApaDataPoints} playerName={myName} />
                  ) : (
                    <div className="py-12 text-center">
                      <p className="text-muted-foreground">
                        No APA match data available for charts
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  No Official APA match data available. Log your first match to see stats.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="straightshot" className="space-y-6">
          {straightShotStats?.hasData ? (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Sessions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{straightShotStats.totalSessions}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Last 20 Average
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {straightShotStats.rollingAverage !== null ? (
                      <>
                        <div className="text-3xl font-bold">
                          {straightShotStats.rollingAverage.toFixed(1)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Lifetime: {straightShotStats.lifetimeAverage !== null ? straightShotStats.lifetimeAverage.toFixed(1) : '—'}
                        </p>
                      </>
                    ) : (
                      <div className="text-3xl font-bold text-muted-foreground">—</div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Lowest Shot Count
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {straightShotStats.lowestShotCount !== null ? (
                      <>
                        <div className="text-3xl font-bold">{straightShotStats.lowestShotCount}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {straightShotStats.lowestShotDate}
                        </p>
                      </>
                    ) : (
                      <div className="text-3xl font-bold text-muted-foreground">—</div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <StraightShotTrendChart trendData={straightShotStats.trendData} />
              <StraightShotHistogram shotCounts={straightShotStats.histogramData} />
            </>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  No Straight Shot data available. Complete your first session to see stats.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="acceptinggifts" className="space-y-6">
          {acceptingGiftsStats?.hasData ? (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Sessions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{acceptingGiftsStats.totalSessions}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Current Ball Count
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{currentObjectBalls}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Rolling Average (Last 20)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {acceptingGiftsStats.rollingAverage !== null ? (
                      <div className="text-3xl font-bold">
                        {acceptingGiftsStats.rollingAverage.toFixed(1)}
                      </div>
                    ) : (
                      <div className="text-3xl font-bold text-muted-foreground">—</div>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Ending ball count
                    </p>
                  </CardContent>
                </Card>
              </div>

              {acceptingGiftsPerformance && acceptingGiftsPerformance.rows.length > 0 && (
                <AcceptingGiftsPerformanceByBallCountTable rows={acceptingGiftsPerformance.rows} />
              )}
            </>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  No Accepting Gifts data available. Complete your first session to see stats.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
