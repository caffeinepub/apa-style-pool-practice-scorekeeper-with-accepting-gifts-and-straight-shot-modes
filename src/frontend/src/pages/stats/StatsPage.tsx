import { useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Users } from 'lucide-react';
import { useGetAllMatches, useGetCallerUserProfile } from '../../hooks/useQueries';
import { computeOfficialApaStats } from '../../lib/stats/officialApaStats';
import { computeStraightShotStats } from '../../lib/stats/straightShotStats';
import { computeAcceptingGiftsStats } from '../../lib/stats/acceptingGiftsStats';
import { extractApaMatchDataPoints, computeApaAggregateSeries } from '../../lib/apa/apaAggregateStats';
import { computeAcceptingGiftsPerformanceByBallCount } from '../../lib/stats/acceptingGiftsPerformanceByBallCount';
import ApaAggregateCharts from '../../components/players/ApaAggregateCharts';
import StraightShotTrendChart from '../../components/straight-shot/StraightShotTrendChart';
import StraightShotHistogram from '../../components/straight-shot/StraightShotHistogram';
import AcceptingGiftsPerformanceByBallCountTable from '../../components/accepting-gifts/AcceptingGiftsPerformanceByBallCountTable';

export default function StatsPage() {
  const navigate = useNavigate();
  const { data: matches = [], isLoading: matchesLoading } = useGetAllMatches();
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();

  const playerName = userProfile?.name || '';

  const officialApaStats = useMemo(() => computeOfficialApaStats(matches, playerName), [matches, playerName]);
  const straightShotStats = useMemo(() => computeStraightShotStats(matches), [matches]);
  const acceptingGiftsStats = useMemo(() => computeAcceptingGiftsStats(matches), [matches]);
  const acceptingGiftsPerformance = useMemo(() => computeAcceptingGiftsPerformanceByBallCount(matches), [matches]);

  const apaDataPoints = useMemo(() => extractApaMatchDataPoints(matches, playerName), [matches, playerName]);
  const apaAggregateSeries = useMemo(() => computeApaAggregateSeries(apaDataPoints), [apaDataPoints]);

  const isLoading = matchesLoading || profileLoading;

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-6xl p-4">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Loading stats...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl space-y-6 p-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate({ to: '/' })}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
        <h1 className="text-2xl font-bold">Stats</h1>
        <div className="w-24" />
      </div>

      {/* BUILD 4: Matchups entry */}
      <Card>
        <CardHeader>
          <CardTitle>Matchups</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={() => navigate({ to: '/stats/matchups' })} className="w-full" variant="outline">
            <Users className="mr-2 h-4 w-4" />
            View Matchup Reports
          </Button>
        </CardContent>
      </Card>

      <Tabs defaultValue="official-apa" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="official-apa">Official APA</TabsTrigger>
          <TabsTrigger value="straight-shot">Straight Shot</TabsTrigger>
          <TabsTrigger value="accepting-gifts">Accepting Gifts</TabsTrigger>
        </TabsList>

        <TabsContent value="official-apa" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Total Matches</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{officialApaStats.totalMatches}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Win Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{officialApaStats.winRate !== null ? `${officialApaStats.winRate.toFixed(0)}%` : '—'}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Avg PPI</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{officialApaStats.averagePpi !== null ? officialApaStats.averagePpi.toFixed(2) : '—'}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Avg aPPI</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{officialApaStats.averageAppi !== null ? officialApaStats.averageAppi.toFixed(2) : '—'}</div>
              </CardContent>
            </Card>
          </div>

          {apaAggregateSeries.length > 0 && <ApaAggregateCharts dataPoints={apaAggregateSeries} />}
        </TabsContent>

        <TabsContent value="straight-shot" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Total Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{straightShotStats.totalSessions}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Rolling Avg (Last 10)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{straightShotStats.rollingAverage !== null ? straightShotStats.rollingAverage.toFixed(1) : '—'}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Lifetime Avg</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{straightShotStats.lifetimeAverage !== null ? straightShotStats.lifetimeAverage.toFixed(1) : '—'}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Lowest Shot Count</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{straightShotStats.lowestShotCount !== null ? straightShotStats.lowestShotCount : '—'}</div>
                {straightShotStats.lowestShotDate && <div className="text-xs text-muted-foreground">{straightShotStats.lowestShotDate}</div>}
              </CardContent>
            </Card>
          </div>

          {straightShotStats.trendData.length > 0 && <StraightShotTrendChart trendData={straightShotStats.trendData} />}
          {straightShotStats.shotCounts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Shot Count Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <StraightShotHistogram shotCounts={straightShotStats.shotCounts.map(bucket => bucket.count)} />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="accepting-gifts" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Total Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{acceptingGiftsStats.totalSessions}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Rolling Avg (Last 10)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{acceptingGiftsStats.rollingAverage !== null ? acceptingGiftsStats.rollingAverage.toFixed(1) : '—'}</div>
              </CardContent>
            </Card>
          </div>

          {acceptingGiftsPerformance.rows.length > 0 && <AcceptingGiftsPerformanceByBallCountTable rows={acceptingGiftsPerformance.rows} />}
        </TabsContent>
      </Tabs>
    </div>
  );
}
