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

  // Build separate filtered datasets for PPI Trend chart
  const ppiList = sortedDataPoints
    .map((dp, index) => {
      const timestamp = getEffectiveMatchTimestamp({ dateTime: dp.dateTime, officialApaMatchLogData: dp.officialApaMatchLogData } as any);
      const date = new Date(timestamp);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      const ppiValue = dp.ppi;
      const ppi = typeof ppiValue === 'number' && isFinite(ppiValue) ? ppiValue : null;

      return {
        index: index + 1,
        date: dateStr,
        ppi,
      };
    })
    .filter(row => row.ppi !== null);

  const appiList = sortedDataPoints
    .map((dp, index) => {
      const timestamp = getEffectiveMatchTimestamp({ dateTime: dp.dateTime, officialApaMatchLogData: dp.officialApaMatchLogData } as any);
      const date = new Date(timestamp);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      const appiValue = dp.appi;
      const appi = typeof appiValue === 'number' && isFinite(appiValue) ? appiValue : null;

      return {
        index: index + 1,
        date: dateStr,
        appi,
      };
    })
    .filter(row => row.appi !== null);

  // Build separate filtered datasets for Match Results chart
  const yourPointsList = sortedDataPoints
    .map((dp, index) => {
      const timestamp = getEffectiveMatchTimestamp({ dateTime: dp.dateTime, officialApaMatchLogData: dp.officialApaMatchLogData } as any);
      const date = new Date(timestamp);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      const yourPointsValue = dp.yourPoints;
      const yourPoints = typeof yourPointsValue === 'number' && isFinite(yourPointsValue) ? yourPointsValue : null;

      return {
        index: index + 1,
        date: dateStr,
        yourPoints,
      };
    })
    .filter(row => row.yourPoints !== null);

  const opponentPointsList = sortedDataPoints
    .map((dp, index) => {
      const timestamp = getEffectiveMatchTimestamp({ dateTime: dp.dateTime, officialApaMatchLogData: dp.officialApaMatchLogData } as any);
      const date = new Date(timestamp);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      const opponentPointsValue = dp.opponentPoints;
      const opponentPoints = typeof opponentPointsValue === 'number' && isFinite(opponentPointsValue) ? opponentPointsValue : null;

      return {
        index: index + 1,
        date: dateStr,
        opponentPoints,
      };
    })
    .filter(row => row.opponentPoints !== null);

  const defensiveShotsList = sortedDataPoints
    .map((dp, index) => {
      const timestamp = getEffectiveMatchTimestamp({ dateTime: dp.dateTime, officialApaMatchLogData: dp.officialApaMatchLogData } as any);
      const date = new Date(timestamp);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      const defensiveShotsValue = dp.defensiveShots;
      const defensiveShots = typeof defensiveShotsValue === 'number' && isFinite(defensiveShotsValue) ? defensiveShotsValue : null;

      return {
        index: index + 1,
        date: dateStr,
        defensiveShots,
      };
    })
    .filter(row => row.defensiveShots !== null);

  const best10PpiValues = sortedDataPoints.map(dp => dp.ppi);
  const best10Ppi = computeBest10Of20Average(best10PpiValues);

  const best10AppiValues = sortedDataPoints.map(dp => dp.appi);
  const best10Appi = computeBest10Of20Average(best10AppiValues);

  const hasPpiTrendData = ppiList.length > 0 || appiList.length > 0;
  const hasMatchResultsData = yourPointsList.length > 0 || opponentPointsList.length > 0 || defensiveShotsList.length > 0;

  return (
    <div className="space-y-8">
      {hasPpiTrendData && (
        <div>
          <h3 className="mb-4 text-lg font-semibold">PPI Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" type="category" allowDuplicatedCategory={false} />
              <YAxis domain={[0, 'auto']} />
              <Tooltip />
              <Legend />
              {ppiList.length > 0 && (
                <Line 
                  data={ppiList}
                  type="monotone" 
                  dataKey="ppi" 
                  stroke="hsl(var(--primary))" 
                  name="PPI" 
                  strokeWidth={2} 
                  dot={{ r: 4 }} 
                />
              )}
              {appiList.length > 0 && (
                <Line 
                  data={appiList}
                  type="monotone" 
                  dataKey="appi" 
                  stroke="hsl(var(--chart-2))" 
                  name="aPPI" 
                  strokeWidth={2} 
                  dot={{ r: 4 }} 
                />
              )}
            </LineChart>
          </ResponsiveContainer>
          {best10Ppi !== null && best10Appi !== null && (
            <p className="mt-2 text-sm text-muted-foreground">
              Best 10 of last 20: PPI {best10Ppi.toFixed(2)} | aPPI {best10Appi.toFixed(2)}
            </p>
          )}
        </div>
      )}

      {hasMatchResultsData && (
        <div>
          <h3 className="mb-4 text-lg font-semibold">Match Results</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" type="category" allowDuplicatedCategory={false} />
              <YAxis domain={[0, 'auto']} />
              <Tooltip />
              <Legend />
              {yourPointsList.length > 0 && (
                <Line 
                  data={yourPointsList}
                  type="monotone" 
                  dataKey="yourPoints" 
                  stroke="hsl(var(--primary))" 
                  name="Your Points" 
                  strokeWidth={2} 
                  dot={{ r: 4 }} 
                />
              )}
              {opponentPointsList.length > 0 && (
                <Line 
                  data={opponentPointsList}
                  type="monotone" 
                  dataKey="opponentPoints" 
                  stroke="hsl(var(--chart-2))" 
                  name="Opponent Points" 
                  strokeWidth={2} 
                  dot={{ r: 4 }} 
                />
              )}
              {defensiveShotsList.length > 0 && (
                <Line 
                  data={defensiveShotsList}
                  type="monotone" 
                  dataKey="defensiveShots" 
                  stroke="hsl(var(--chart-3))" 
                  name="Defensive Shots" 
                  strokeWidth={2} 
                  dot={{ r: 4 }} 
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {!hasPpiTrendData && !hasMatchResultsData && (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">No valid chart data available</p>
        </div>
      )}
    </div>
  );
}
