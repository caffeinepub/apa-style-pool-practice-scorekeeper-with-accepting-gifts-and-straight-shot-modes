import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Bar,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface StraightShotTrendChartProps {
  trendData: Array<{ date: string; shots: number }>;
}

interface CandleDay {
  date: string;
  open: number;
  close: number;
  high: number;
  low: number;
  /** Used by the trend line — average of the day's shots */
  avg: number;
}

function groupByDay(trendData: Array<{ date: string; shots: number }>): CandleDay[] {
  // trendData is already sorted chronologically (oldest → newest)
  const dayMap = new Map<string, number[]>();

  for (const item of trendData) {
    const existing = dayMap.get(item.date);
    if (existing) {
      existing.push(item.shots);
    } else {
      dayMap.set(item.date, [item.shots]);
    }
  }

  const result: CandleDay[] = [];
  for (const [date, shots] of dayMap.entries()) {
    const open = shots[0];
    const close = shots[shots.length - 1];
    const high = Math.max(...shots);
    const low = Math.min(...shots);
    const avg = shots.reduce((s, v) => s + v, 0) / shots.length;
    result.push({ date, open, close, high, low, avg });
  }

  return result;
}

// Custom candlestick shape rendered inside a Recharts Bar
interface CandleShapeProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  // Recharts passes the full payload entry
  open?: number;
  close?: number;
  high?: number;
  low?: number;
  // recharts internal
  background?: { x: number; y: number; width: number; height: number };
  // yAxis scale helper passed via custom data
  yAxisMap?: unknown;
}

// We need access to the chart's y-scale to position wicks correctly.
// Recharts passes `background` (the full bar background rect) and the
// actual bar rect (x, y, width, height) to custom shapes.
// We'll encode high/low as extra dataKeys and use a fully custom shape.

interface CandleBarEntry {
  date: string;
  open: number;
  close: number;
  high: number;
  low: number;
  avg: number;
  // These are the values we'll use for the bar domain so recharts scales correctly
  candleMin: number;
  candleMax: number;
}

// The custom shape receives recharts-computed x/y/width/height for the "bar"
// which we've set to span [low, high]. We then draw the body [open, close] on top.
function CandleShape(props: {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  open?: number;
  close?: number;
  high?: number;
  low?: number;
  // recharts also passes the raw payload
  payload?: CandleBarEntry;
  // The chart's yAxis scale — recharts injects this via the shape prop context
  // We'll compute positions manually from the bar rect + data values
}) {
  const { x = 0, y = 0, width = 0, height = 0, payload } = props;

  if (!payload || width <= 0 || height <= 0) return null;

  const { open, close, high, low } = payload;

  if (high === low) return null;

  // The bar rect spans from low (bottom) to high (top) in pixel space.
  // y = top of bar (high value), y + height = bottom of bar (low value)
  const range = high - low; // value range
  const pixelsPerUnit = height / range; // px per shot unit

  // Pixel positions (y increases downward)
  const yHigh = y; // top of wick
  const yLow = y + height; // bottom of wick

  const yOpen = yHigh + (high - open) * pixelsPerUnit;
  const yClose = yHigh + (high - close) * pixelsPerUnit;

  const bodyTop = Math.min(yOpen, yClose);
  const bodyBottom = Math.max(yOpen, yClose);
  const bodyHeight = Math.max(bodyBottom - bodyTop, 1);

  const isUp = close >= open;
  const fill = isUp ? '#ffffff' : '#000000';
  const stroke = '#000000';
  const strokeWidth = 1;

  const centerX = x + width / 2;
  const bodyWidth = Math.max(width * 0.6, 4);
  const bodyX = centerX - bodyWidth / 2;

  return (
    <g>
      {/* Upper wick: from yHigh to bodyTop */}
      <line
        x1={centerX}
        y1={yHigh}
        x2={centerX}
        y2={bodyTop}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
      {/* Lower wick: from bodyBottom to yLow */}
      <line
        x1={centerX}
        y1={bodyBottom}
        x2={centerX}
        y2={yLow}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
      {/* Candle body */}
      <rect
        x={bodyX}
        y={bodyTop}
        width={bodyWidth}
        height={bodyHeight}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    </g>
  );
}

// Custom tooltip
function CandleTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ payload: CandleBarEntry }>;
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded border border-border bg-background px-3 py-2 text-xs shadow">
      <p className="font-semibold mb-1">{label}</p>
      <p>High: {d.high}</p>
      <p>Open: {d.open}</p>
      <p>Close: {d.close}</p>
      <p>Low: {d.low}</p>
    </div>
  );
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

  const candleData: CandleBarEntry[] = groupByDay(trendData).map((d) => ({
    ...d,
    candleMin: d.low,
    candleMax: d.high,
  }));

  // Y domain: give a little padding
  const allLows = candleData.map((d) => d.low);
  const allHighs = candleData.map((d) => d.high);
  const yMin = Math.max(0, Math.min(...allLows) - 2);
  const yMax = Math.max(...allHighs) + 2;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Straight Shot Trend</CardTitle>
        <CardDescription>Shot count over time (candlestick by day)</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={candleData} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis domain={[yMin, yMax]} />
            <Tooltip content={<CandleTooltip />} cursor={false} />
            <Legend
              payload={[
                { value: 'Shots (day)', type: 'square', color: '#000' },
                { value: 'Trend', type: 'line', color: '#000' },
              ]}
            />
            {/*
              We use a Bar whose value spans [low, high] so recharts allocates
              the correct pixel height. The custom shape then draws the body and wicks.
              minPointSize=0 prevents recharts from forcing a minimum bar height.
            */}
            <Bar
              dataKey="candleMax"
              shape={(shapeProps: unknown) => {
                // recharts passes x, y, width, height plus the full payload
                const p = shapeProps as {
                  x: number;
                  y: number;
                  width: number;
                  height: number;
                  payload: CandleBarEntry;
                };
                return (
                  <CandleShape
                    x={p.x}
                    y={p.y}
                    width={p.width}
                    height={p.height}
                    payload={p.payload}
                  />
                );
              }}
              isAnimationActive={false}
              legendType="none"
              name="Candle"
              fill="transparent"
              stroke="transparent"
            />
            <Line
              type="monotone"
              dataKey="avg"
              stroke="#000"
              strokeWidth={2}
              dot={false}
              name="Trend"
              connectNulls
            />
          </ComposedChart>
        </ResponsiveContainer>
        <p className="mt-2 text-sm text-muted-foreground">
          Average: {averageShots.toFixed(1)} shots
        </p>
      </CardContent>
    </Card>
  );
}
