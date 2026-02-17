import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { ApaAggregateDataPoint } from '../../lib/apa/apaAggregateStats';

interface ApaAggregateChartsProps {
  dataPoints: ApaAggregateDataPoint[];
  playerName: string;
}

export default function ApaAggregateCharts({ dataPoints, playerName }: ApaAggregateChartsProps) {
  console.log('APA RAW DATAPOINTS', dataPoints);

  const sortedDataPoints = useMemo(() => {
    return [...dataPoints].sort((a, b) => a.timestamp - b.timestamp);
  }, [dataPoints]);

  // Build five independent series arrays
  const ppiSeries = useMemo(() => {
    return sortedDataPoints
      .filter((dp) => typeof dp.ppi === 'number' && isFinite(dp.ppi))
      .map((dp) => ({
        date: new Date(dp.timestamp).toLocaleDateString(),
        ppi: dp.ppi,
      }));
  }, [sortedDataPoints]);

  const appiSeries = useMemo(() => {
    return sortedDataPoints
      .filter((dp) => typeof dp.appi === 'number' && isFinite(dp.appi))
      .map((dp) => ({
        date: new Date(dp.timestamp).toLocaleDateString(),
        appi: dp.appi,
      }));
  }, [sortedDataPoints]);

  const yourPointsSeries = useMemo(() => {
    return sortedDataPoints
      .filter((dp) => typeof dp.yourPoints === 'number' && isFinite(dp.yourPoints))
      .map((dp) => ({
        date: new Date(dp.timestamp).toLocaleDateString(),
        yourPoints: dp.yourPoints,
      }));
  }, [sortedDataPoints]);

  const opponentPointsSeries = useMemo(() => {
    return sortedDataPoints
      .filter((dp) => typeof dp.opponentPoints === 'number' && isFinite(dp.opponentPoints))
      .map((dp) => ({
        date: new Date(dp.timestamp).toLocaleDateString(),
        opponentPoints: dp.opponentPoints,
      }));
  }, [sortedDataPoints]);

  const defensiveShotsSeries = useMemo(() => {
    return sortedDataPoints
      .filter((dp) => typeof dp.defensiveShots === 'number' && isFinite(dp.defensiveShots))
      .map((dp) => ({
        date: new Date(dp.timestamp).toLocaleDateString(),
        defensiveShots: dp.defensiveShots,
      }));
  }, [sortedDataPoints]);

  // Debug taps: log final series arrays right before they're fed into LineChart
  console.log('PPI SERIES (final):', ppiSeries);
  console.log('APPI SERIES (final):', appiSeries);
  console.log('YOUR POINTS SERIES (final):', yourPointsSeries);
  console.log('OPPONENT POINTS SERIES (final):', opponentPointsSeries);
  console.log('DEFENSIVE SHOTS SERIES (final):', defensiveShotsSeries);

  if (dataPoints.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>APA Performance Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No APA match data available for {playerName}.</p>
        </CardContent>
      </Card>
    );
  }

  // Combine all series for unified x-axis (all unique dates)
  const allDates = Array.from(
    new Set([
      ...ppiSeries.map((d) => d.date),
      ...appiSeries.map((d) => d.date),
      ...yourPointsSeries.map((d) => d.date),
      ...opponentPointsSeries.map((d) => d.date),
      ...defensiveShotsSeries.map((d) => d.date),
    ])
  ).sort();

  // Build unified datasets for each chart
  const ppiAppiChartData = allDates.map((date) => {
    const ppiPoint = ppiSeries.find((d) => d.date === date);
    const appiPoint = appiSeries.find((d) => d.date === date);
    return {
      date,
      ppi: ppiPoint?.ppi,
      appi: appiPoint?.appi,
    };
  });

  const matchResultsChartData = allDates.map((date) => {
    const yourPoint = yourPointsSeries.find((d) => d.date === date);
    const oppPoint = opponentPointsSeries.find((d) => d.date === date);
    const defPoint = defensiveShotsSeries.find((d) => d.date === date);
    return {
      date,
      yourPoints: yourPoint?.yourPoints,
      opponentPoints: oppPoint?.opponentPoints,
      defensiveShots: defPoint?.defensiveShots,
    };
  });

  return (
    <div className="space-y-6" data-apa-aggregate-root>
      <Card>
        <CardHeader>
          <CardTitle>PPI & aPPI Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={ppiAppiChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="ppi" name="PPI" stroke="hsl(var(--chart-1))" connectNulls={false} />
              <Line type="monotone" dataKey="appi" name="aPPI" stroke="hsl(var(--chart-2))" connectNulls={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Match Results</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={matchResultsChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="yourPoints"
                name="Your Points"
                stroke="hsl(var(--chart-3))"
                connectNulls={false}
              />
              <Line
                type="monotone"
                dataKey="opponentPoints"
                name="Opponent Points"
                stroke="hsl(var(--chart-4))"
                connectNulls={false}
              />
              <Line
                type="monotone"
                dataKey="defensiveShots"
                name="Defensive Shots"
                stroke="hsl(var(--chart-5))"
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
