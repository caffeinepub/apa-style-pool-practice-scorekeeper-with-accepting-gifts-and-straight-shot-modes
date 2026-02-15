import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface StraightShotTrendChartProps {
  trendData: Array<{ date: string; shots: number }>;
}

export default function StraightShotTrendChart({ trendData }: StraightShotTrendChartProps) {
  if (trendData.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No trend data available</p>
        </CardContent>
      </Card>
    );
  }

  const averageShots = trendData.reduce((sum, item) => sum + item.shots, 0) / trendData.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Straight Shot Trend</CardTitle>
        <CardDescription>Shot count over time</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[0, 'auto']} />
            <Tooltip />
            <Legend />
            <Bar dataKey="shots" fill="hsl(var(--primary))" name="Shots" />
            <Line type="monotone" dataKey="shots" stroke="hsl(var(--chart-2))" name="Trend" strokeWidth={2} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
        <p className="mt-2 text-sm text-muted-foreground">
          Average: {averageShots.toFixed(1)} shots
        </p>
      </CardContent>
    </Card>
  );
}
