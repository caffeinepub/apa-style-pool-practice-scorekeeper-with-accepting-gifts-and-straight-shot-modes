import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, TooltipProps } from 'recharts';
import type { ApaAggregateDataPoint } from '../../lib/apa/apaAggregateStats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ApaAggregateChartsProps {
  dataPoints: ApaAggregateDataPoint[];
}

export default function ApaAggregateCharts({ dataPoints }: ApaAggregateChartsProps) {
  const chartData = useMemo(() => {
    return dataPoints.map((dp) => ({
      timestamp: dp.timestamp, // BUILD 2: Numeric timestamp (unique per match)
      date: new Date(dp.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), // BUILD 2: Date-only label
      ppi: dp.ppi,
      appi: dp.appi,
      defensiveShots: dp.defensiveShots,
      yourPoints: dp.yourPoints,
      opponentPoints: dp.opponentPoints,
    }));
  }, [dataPoints]);

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
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value !== null && entry.value !== undefined ? Number(entry.value).toFixed(2) : '—'}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>PPI & aPPI Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" /> {/* BUILD 2: Date-only label */}
              <YAxis />
              <Tooltip content={<CustomTooltip />} /> {/* BUILD 2: Full date+time in tooltip */}
              <Legend />
              <Line type="monotone" dataKey="ppi" stroke="#000" strokeWidth={2} name="PPI" dot={{ r: 4, fill: '#000' }} connectNulls={true} />
              <Line type="monotone" dataKey="appi" stroke="#3b82f6" strokeWidth={2} name="aPPI" dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#3b82f6' }} connectNulls={true} />
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
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" /> {/* BUILD 2: Date-only label */}
              <YAxis />
              <Tooltip content={<CustomTooltip />} /> {/* BUILD 2: Full date+time in tooltip */}
              <Legend />
              <Line type="monotone" dataKey="yourPoints" stroke="#000" strokeWidth={2} name="Your Points" dot={{ r: 4, fill: '#000' }} connectNulls={true} />
              <Line type="monotone" dataKey="opponentPoints" stroke="#3b82f6" strokeWidth={2} name="Opponent Points" dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#3b82f6' }} connectNulls={true} />
              <Line type="monotone" dataKey="defensiveShots" stroke="#9333ea" strokeWidth={2} name="Defensive Shots" dot={{ r: 4, fill: '#9333ea', strokeWidth: 2, stroke: '#9333ea' }} connectNulls={true} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
