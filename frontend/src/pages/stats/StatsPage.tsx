import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, User, History } from 'lucide-react';
import { useGetAllMatches, useGetCallerUserProfile, useGetAgLevelIndex } from '../../hooks/useQueries';
import ApaAggregateCharts from '../../components/players/ApaAggregateCharts';
import StraightShotTrendChart from '../../components/straight-shot/StraightShotTrendChart';
import StraightShotHistogram from '../../components/straight-shot/StraightShotHistogram';
import AcceptingGiftsPerformanceByBallCountTable from '../../components/accepting-gifts/AcceptingGiftsPerformanceByBallCountTable';
import MatchupAnalysisDropdown from '../../components/apa/MatchupAnalysisDropdown';
import MatchupAnalysisPanel from '../../components/apa/MatchupAnalysisPanel';
import { extractPlayerApaMatches } from '../../lib/apa/apaAggregateStats';
import { computeOfficialApaStats } from '../../lib/stats/officialApaStats';
import { computeStraightShotStats } from '../../lib/stats/straightShotStats';
import { computeAcceptingGiftsStats } from '../../lib/stats/acceptingGiftsStats';
import { computeAcceptingGiftsPerformanceByBallCount } from '../../lib/stats/acceptingGiftsPerformanceByBallCount';
import { getPlayerStatsRoute } from '../../utils/playerRoutes';
import { setNavigationOrigin } from '../../utils/urlParams';
import { ACCEPTING_GIFTS_LEVELS } from '../../lib/accepting-gifts/acceptingGiftsLevels';

export default function StatsPage() {
  const navigate = useNavigate();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: allMatches, isLoading } = useGetAllMatches();
  const { data: agLevelIndex } = useGetAgLevelIndex();

  const [selectedOpponent, setSelectedOpponent] = useState<string | null>(null);

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

  // Extract only official APA data points (no practice data)
  const myApaDataPoints = myName && allMatches
    ? extractPlayerApaMatches(allMatches, myName, true)
    : [];

  const currentLevelIndex = agLevelIndex ? Number(agLevelIndex) : 0;
  const currentLevel = ACCEPTING_GIFTS_LEVELS[currentLevelIndex];

  const handleNavigateToPlayerAggregate = () => {
    setNavigationOrigin('stats');
    navigate({ to: getPlayerStatsRoute(myName) });
  };

  const handleNavigateToHistory = () => {
    setNavigationOrigin('stats');
    navigate({ to: '/history' });
  };

  const handleSelectOpponent = (opponentName: string) => {
    setSelectedOpponent(opponentName);
  };

  const handleCloseMatchupAnalysis = () => {
    setSelectedOpponent(null);
  };

  // Filter matches for selected opponent
  const opponentMatches = selectedOpponent && allMatches
    ? allMatches.filter(m => 
        m.officialApaMatchLogData?.opponentName === selectedOpponent
      )
    : [];

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl space-y-6 p-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate({ to: '/' })}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          <h1 className="text-3xl font-bold">Stats</h1>
          <div className="w-24" />
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Loading stats...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate({ to: '/' })}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
        <h1 className="text-3xl font-bold">Stats</h1>
        <div className="w-24" />
      </div>

      <Tabs defaultValue="official-apa" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="official-apa">Official APA</TabsTrigger>
          <TabsTrigger value="straight-shot">Straight Shot</TabsTrigger>
          <TabsTrigger value="accepting-gifts">Accepting Gifts</TabsTrigger>
        </TabsList>

        <TabsContent value="official-apa" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {officialApaStats?.winRate !== null && officialApaStats?.winRate !== undefined
                    ? `${officialApaStats.winRate.toFixed(1)}%`
                    : '—'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Last 20 matches
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Average PPI</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {officialApaStats?.averagePpiLast10 !== null && officialApaStats?.averagePpiLast10 !== undefined
                    ? officialApaStats.averagePpiLast10.toFixed(2)
                    : '—'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {officialApaStats?.avgPpiLast10Label || 'Last 10 matches'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Average aPPI</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {officialApaStats?.averageAppiBest10Of20 !== null && officialApaStats?.averageAppiBest10Of20 !== undefined
                    ? officialApaStats.averageAppiBest10Of20.toFixed(2)
                    : '—'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {officialApaStats?.avgAppiLast10Label || 'Best 10 out of last 20 matches'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Matches</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {officialApaStats?.totalMatches ?? 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Official APA logs
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-center">
            <MatchupAnalysisDropdown 
              matches={allMatches || []} 
              onSelectOpponent={handleSelectOpponent}
            />
          </div>

          {selectedOpponent && (
            <MatchupAnalysisPanel
              opponentName={selectedOpponent}
              matches={opponentMatches}
              allMatches={allMatches || []}
              playerName={myName}
              onClose={handleCloseMatchupAnalysis}
            />
          )}

          {myApaDataPoints.length > 0 ? (
            <ApaAggregateCharts dataPoints={myApaDataPoints} playerName={myName} />
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No APA match data available yet.</p>
              </CardContent>
            </Card>
          )}

          {myName && (
            <div className="flex justify-center">
              <Button variant="outline" onClick={handleNavigateToPlayerAggregate} className="gap-2">
                <User className="h-4 w-4" />
                View Detailed Player Stats
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="straight-shot" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {straightShotStats?.totalSessions ?? 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Last 20 Average</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {straightShotStats?.rollingAverage !== null && straightShotStats?.rollingAverage !== undefined
                    ? straightShotStats.rollingAverage.toFixed(1)
                    : '—'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Lifetime: {straightShotStats?.lifetimeAverage !== null && straightShotStats?.lifetimeAverage !== undefined
                    ? straightShotStats.lifetimeAverage.toFixed(1)
                    : '—'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Best Session</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {straightShotStats?.lowestShotCount ?? '—'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {straightShotStats?.lowestShotDate || 'No data'}
                </p>
              </CardContent>
            </Card>
          </div>

          {straightShotStats && straightShotStats.trendData.length > 0 ? (
            <>
              <StraightShotTrendChart trendData={straightShotStats.trendData} />
              <StraightShotHistogram shotCounts={straightShotStats.histogramData} />
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No Straight Shot data available yet.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="accepting-gifts" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {acceptingGiftsStats?.totalSessions ?? 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Last 20 Average</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {acceptingGiftsStats?.rollingAverage !== null && acceptingGiftsStats?.rollingAverage !== undefined
                    ? acceptingGiftsStats.rollingAverage.toFixed(1)
                    : '—'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Ending ball count
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Current Level</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {currentLevel ? currentLevel.label : '—'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {currentLevel ? `${currentLevel.objectBallCount} balls (${currentLevel.gameType})` : 'No data'}
                </p>
              </CardContent>
            </Card>
          </div>

          {acceptingGiftsPerformance && acceptingGiftsPerformance.rows.length > 0 ? (
            <AcceptingGiftsPerformanceByBallCountTable rows={acceptingGiftsPerformance.rows} />
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No Accepting Gifts data available yet.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <div className="flex justify-center">
        <Button variant="outline" onClick={handleNavigateToHistory} className="gap-2">
          <History className="h-4 w-4" />
          View Match History
        </Button>
      </div>
    </div>
  );
}
