import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface StraightShotHistogramProps {
  shotCounts: number[];
}

export default function StraightShotHistogram({ shotCounts }: StraightShotHistogramProps) {
  if (shotCounts.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No histogram data available</p>
        </CardContent>
      </Card>
    );
  }

  const frequencyMap = new Map<number, number>();
  for (const count of shotCounts) {
    frequencyMap.set(count, (frequencyMap.get(count) || 0) + 1);
  }

  const histogramData = Array.from(frequencyMap.entries())
    .map(([shots, frequency]) => ({ shots, frequency }))
    .sort((a, b) => a.shots - b.shots);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Straight Shot Distribution</CardTitle>
        <CardDescription>Frequency of shot counts</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={histogramData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="shots" label={{ value: 'Shot Count', position: 'insideBottom', offset: -5 }} />
            <YAxis label={{ value: 'Frequency', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="frequency" fill="#000" stroke="#000" name="Frequency" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
