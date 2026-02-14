import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from 'recharts';
import type { ApaMatchDataPoint } from '../../lib/apa/apaAggregateStats';
import {
  computePpiSeries,
  computeMatchResultSeries,
  computeRollingBest10Of20,
  formatChartDate,
} from '../../lib/apa/apaAggregateStats';

interface ApaAggregateChartsProps {
  dataPoints: ApaMatchDataPoint[];
  playerName: string;
}

export default function ApaAggregateCharts({ dataPoints, playerName }: ApaAggregateChartsProps) {
  if (dataPoints.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No APA match data available for {playerName}</p>
        </CardContent>
      </Card>
    );
  }

  const ppiSeries = computePpiSeries(dataPoints);
  const matchResultSeries = computeMatchResultSeries(dataPoints);
  const ppiRollingAvg = computeRollingBest10Of20(ppiSeries);
  const matchResultRollingAvg = computeRollingBest10Of20(matchResultSeries);

  // Prepare chart data
  const ppiChartData = dataPoints.map((dp, idx) => ({
    date: formatChartDate(dp.dateTime),
    ppi: ppiSeries[idx],
    rollingAvg: ppiRollingAvg[idx],
  }));

  const matchResultChartData = dataPoints.map((dp, idx) => ({
    date: formatChartDate(dp.dateTime),
    points: matchResultSeries[idx],
    rollingAvg: matchResultRollingAvg[idx],
  }));

  const chartConfig = {
    ppi: {
      label: 'PPI',
      color: 'hsl(var(--chart-1))',
    },
    points: {
      label: 'Points Earned',
      color: 'hsl(var(--chart-2))',
    },
    rollingAvg: {
      label: 'Best 10 of Last 20',
      color: 'hsl(var(--chart-3))',
    },
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>PPI Trend</CardTitle>
          <CardDescription>
            Points per inning over time with rolling best-10-of-20 average
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ppiChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="ppi"
                  stroke="var(--color-ppi)"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="PPI"
                />
                <Line
                  type="monotone"
                  dataKey="rollingAvg"
                  stroke="var(--color-rollingAvg)"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Best 10 of Last 20"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Match Results</CardTitle>
          <CardDescription>
            Points earned per match with rolling best-10-of-20 average
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={matchResultChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="points"
                  stroke="var(--color-points)"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Points Earned"
                />
                <Line
                  type="monotone"
                  dataKey="rollingAvg"
                  stroke="var(--color-rollingAvg)"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Best 10 of Last 20"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
