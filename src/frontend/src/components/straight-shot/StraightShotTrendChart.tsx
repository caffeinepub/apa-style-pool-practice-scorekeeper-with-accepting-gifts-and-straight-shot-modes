import { useMemo } from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, TooltipProps } from 'recharts';
import type { StraightShotTrendDataPoint } from '../../lib/stats/straightShotStats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StraightShotTrendChartProps {
  trendData: StraightShotTrendDataPoint[];
}

export default function StraightShotTrendChart({ trendData }: StraightShotTrendChartProps) {
  const chartData = useMemo(() => {
    return trendData.map((dp) => ({
      timestamp: dp.timestamp, // BUILD 2: Numeric timestamp (unique per match)
      date: dp.date, // BUILD 2: Date-only label
      shots: dp.shots,
    }));
  }, [trendData]);

  // BUILD 2: Custom tooltip to show full date+time
  const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (!active || !payload || payload.length === 0) return null;

    const data = payload[0].payload;
    const fullDateTime = new Date(data.timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    return (
      <div className="rounded-md border bg-background p-3 shadow-md">
        <p className="mb-2 text-sm font-semibold">{fullDateTime}</p>
        <p className="text-sm">Shots: {data.shots}</p>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Straight Shot Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" /> {/* BUILD 2: Date-only label */}
            <YAxis />
            <Tooltip content={<CustomTooltip />} cursor={false} /> {/* BUILD 2: Full date+time in tooltip */}
            <Bar dataKey="shots" fill="#000" stroke="#000" />
            <Line type="monotone" dataKey="shots" stroke="#000" strokeWidth={2} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
