import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { ApaAggregateDataPoint } from '../../lib/apa/apaAggregateStats';

interface ApaAggregateChartsProps {
  dataPoints: ApaAggregateDataPoint[];
  playerName: string;
}

// Custom dot shapes for differentiation
const CircleDot = (props: any) => {
  const { cx, cy, stroke } = props;
  return <circle cx={cx} cy={cy} r={4} fill={stroke} />;
};

const SquareDot = (props: any) => {
  const { cx, cy, stroke } = props;
  return <rect x={cx - 4} y={cy - 4} width={8} height={8} fill={stroke} />;
};

const TriangleDot = (props: any) => {
  const { cx, cy, stroke } = props;
  const points = `${cx},${cy - 5} ${cx - 4.5},${cy + 3} ${cx + 4.5},${cy + 3}`;
  return <polygon points={points} fill={stroke} />;
};

export default function ApaAggregateCharts({ dataPoints, playerName }: ApaAggregateChartsProps) {
  console.log('APA RAW DATAPOINTS', dataPoints);

  const sortedDataPoints = useMemo(() => {
    return [...dataPoints].sort((a, b) => a.timestamp - b.timestamp);
  }, [dataPoints]);

  // Build unified dataset keyed by timestamp
  const unifiedData = useMemo(() => {
    const dataMap = new Map<number, {
      timestamp: number;
      ppi?: number;
      appi?: number;
      yourPoints?: number;
      opponentPoints?: number;
      defensiveShots?: number;
    }>();

    sortedDataPoints.forEach((dp) => {
      const existing = dataMap.get(dp.timestamp) || { timestamp: dp.timestamp };

      if (typeof dp.ppi === 'number' && isFinite(dp.ppi)) {
        existing.ppi = dp.ppi;
      }
      if (typeof dp.appi === 'number' && isFinite(dp.appi)) {
        existing.appi = dp.appi;
      }
      if (typeof dp.yourPoints === 'number' && isFinite(dp.yourPoints)) {
        existing.yourPoints = dp.yourPoints;
      }
      if (typeof dp.opponentPoints === 'number' && isFinite(dp.opponentPoints)) {
        existing.opponentPoints = dp.opponentPoints;
      }
      if (typeof dp.defensiveShots === 'number' && isFinite(dp.defensiveShots)) {
        existing.defensiveShots = dp.defensiveShots;
      }

      dataMap.set(dp.timestamp, existing);
    });

    return Array.from(dataMap.values()).sort((a, b) => a.timestamp - b.timestamp);
  }, [sortedDataPoints]);

  console.log('UNIFIED DATA (final):', unifiedData);

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

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="space-y-6" data-apa-aggregate-root>
      <Card>
        <CardHeader>
          <CardTitle>PPI & aPPI Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={unifiedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="timestamp"
                type="number"
                scale="time"
                domain={['dataMin', 'dataMax']}
                tickFormatter={formatTimestamp}
              />
              <YAxis />
              <Tooltip labelFormatter={formatTimestamp} />
              <Legend />
              <Line
                dataKey="ppi"
                name="PPI"
                stroke="#000"
                strokeWidth={2}
                dot={CircleDot}
                connectNulls={true}
              />
              <Line
                dataKey="appi"
                name="aPPI"
                stroke="#2563eb"
                strokeWidth={2}
                dot={SquareDot}
                connectNulls={true}
              />
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
            <LineChart data={unifiedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="timestamp"
                type="number"
                scale="time"
                domain={['dataMin', 'dataMax']}
                tickFormatter={formatTimestamp}
              />
              <YAxis />
              <Tooltip labelFormatter={formatTimestamp} />
              <Legend />
              <Line
                dataKey="yourPoints"
                name="Your Points"
                stroke="#000"
                strokeWidth={2}
                dot={CircleDot}
                connectNulls={true}
              />
              <Line
                dataKey="opponentPoints"
                name="Opponent Points"
                stroke="#2563eb"
                strokeWidth={2}
                dot={SquareDot}
                connectNulls={true}
              />
              <Line
                dataKey="defensiveShots"
                name="Defensive Shots"
                stroke="#7c3aed"
                strokeWidth={2}
                dot={TriangleDot}
                connectNulls={true}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
