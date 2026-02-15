import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { ApaMatchDataPoint } from '../../lib/apa/apaAggregateStats';
import { computeBest10Of20Average } from '../../lib/apa/apaAggregateStats';
import { getEffectiveMatchTimestamp } from '../../lib/matches/effectiveMatchDate';

interface ApaAggregateChartsProps {
  dataPoints: ApaMatchDataPoint[];
  playerName: string;
}

export default function ApaAggregateCharts({ dataPoints, playerName }: ApaAggregateChartsProps) {
  if (dataPoints.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">No data available for charts</p>
      </div>
    );
  }

  const sortedDataPoints = [...dataPoints].sort((a, b) => {
    const aTime = getEffectiveMatchTimestamp({ dateTime: a.dateTime, officialApaMatchLogData: a.officialApaMatchLogData } as any);
    const bTime = getEffectiveMatchTimestamp({ dateTime: b.dateTime, officialApaMatchLogData: b.officialApaMatchLogData } as any);
    return aTime - bTime;
  });

  const ppiTrendData = sortedDataPoints
    .map((dp, index) => {
      const timestamp = getEffectiveMatchTimestamp({ dateTime: dp.dateTime, officialApaMatchLogData: dp.officialApaMatchLogData } as any);
      const date = new Date(timestamp);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      return {
        index: index + 1,
        date: dateStr,
        ppi: dp.ppi,
        appi: dp.appi,
      };
    });

  const matchResultsData = sortedDataPoints
    .map((dp, index) => {
      const timestamp = getEffectiveMatchTimestamp({ dateTime: dp.dateTime, officialApaMatchLogData: dp.officialApaMatchLogData } as any);
      const date = new Date(timestamp);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      return {
        index: index + 1,
        date: dateStr,
        yourPoints: dp.yourPoints,
        opponentPoints: dp.opponentPoints,
        defensiveShots: dp.defensiveShots,
      };
    });

  const best10PpiValues = sortedDataPoints.map(dp => dp.ppi);
  const best10Ppi = computeBest10Of20Average(best10PpiValues);

  const best10AppiValues = sortedDataPoints.map(dp => dp.appi);
  const best10Appi = computeBest10Of20Average(best10AppiValues);

  return (
    <div className="space-y-8">
      <div>
        <h3 className="mb-4 text-lg font-semibold">PPI Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={ppiTrendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[0, 'auto']} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="ppi" stroke="hsl(var(--primary))" name="PPI" strokeWidth={2} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="appi" stroke="hsl(var(--chart-2))" name="aPPI" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
        {best10Ppi !== null && best10Appi !== null && (
          <p className="mt-2 text-sm text-muted-foreground">
            Best 10 of last 20: PPI {best10Ppi.toFixed(2)} | aPPI {best10Appi.toFixed(2)}
          </p>
        )}
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">Match Results</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={matchResultsData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[0, 'auto']} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="yourPoints" stroke="hsl(var(--primary))" name="Your Points" strokeWidth={2} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="opponentPoints" stroke="hsl(var(--chart-2))" name="Opponent Points" strokeWidth={2} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="defensiveShots" stroke="hsl(var(--chart-3))" name="Defensive Shots" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
