import { useMemo } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useGetAllMatches } from '../../hooks/useQueries';
import { extractApaMatchDataPoints, computeApaAggregateSeries, calculateRollingBest10Of20 } from '../../lib/apa/apaAggregateStats';
import { getApaPpiSkillLevel, getApaAppiSkillLevel } from '../../lib/apa/apaSkillLevelPrediction';
import ApaAggregateCharts from '../../components/players/ApaAggregateCharts';

export default function PlayerAggregateStatsPage() {
  const navigate = useNavigate();
  const { playerName } = useParams({ from: '/players/$playerName' });
  const { data: matches = [], isLoading } = useGetAllMatches();

  const decodedPlayerName = decodeURIComponent(playerName);

  const playerDataPoints = useMemo(() => {
    return extractApaMatchDataPoints(matches, decodedPlayerName);
  }, [matches, decodedPlayerName]);

  const aggregateSeries = useMemo(() => {
    return computeApaAggregateSeries(playerDataPoints);
  }, [playerDataPoints]);

  const { averagePpi, averageAppi } = useMemo(() => {
    return calculateRollingBest10Of20(playerDataPoints);
  }, [playerDataPoints]);

  const predictedSkillLevelPpi = averagePpi !== null ? getApaPpiSkillLevel(averagePpi) : null;
  const predictedSkillLevelAppi = averageAppi !== null ? getApaAppiSkillLevel(averageAppi) : null;

  const handleBack = () => {
    navigate({ to: '/history' });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-6xl p-4">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Loading player stats...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl space-y-6 p-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">{decodedPlayerName}</h1>
        <div className="w-24" />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Matches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{playerDataPoints.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Avg PPI (Best 10 of 20)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averagePpi !== null ? averagePpi.toFixed(2) : '—'}</div>
            {predictedSkillLevelPpi !== null && (
              <div className="mt-1 text-xs text-muted-foreground">Predicted SL: {predictedSkillLevelPpi}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Avg aPPI (Best 10 of 20)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageAppi !== null ? averageAppi.toFixed(2) : '—'}</div>
            {predictedSkillLevelAppi !== null && (
              <div className="mt-1 text-xs text-muted-foreground">Predicted SL: {predictedSkillLevelAppi}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Data Source</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">APA Practice & Official</div>
          </CardContent>
        </Card>
      </div>

      {aggregateSeries.length > 0 ? (
        <ApaAggregateCharts dataPoints={aggregateSeries} />
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No APA match data found for {decodedPlayerName}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
