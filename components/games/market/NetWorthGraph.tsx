'use client';

import { MarketTick } from '@/types/market';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { PaperCard, StickerLabel, MarkerText } from '@/components/paper';

interface NetWorthGraphProps {
  ticks: MarketTick[];
  showGhosts?: boolean;
}

function formatCurrency(value: number): string {
  if (Math.abs(value) >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (Math.abs(value) >= 1_000) return `$${(value / 1_000).toFixed(0)}k`;
  return `$${Math.round(value).toLocaleString()}`;
}

export function NetWorthGraph({ ticks, showGhosts = false }: NetWorthGraphProps) {
  const data = ticks.map((tick) => ({
    year: tick.yearIndex + 1,
    netWorth: tick.netWorth,
    ghostPanic: tick.ghostNetWorth_panic,
    ghostConsistent: tick.ghostNetWorth_consistent,
  }));

  if (data.length === 0) {
    return (
      <PaperCard color="cream" hover={false} style={{ padding: 14 }}>
        <MarkerText as="h3" size="lg" color="#0A0A0A" style={{ marginBottom: 10 }}>
          NET WORTH
        </MarkerText>
        <div className="h-72 flex items-center justify-center" style={{ fontFamily: 'var(--font-patrick), cursive', fontSize: 14, color: '#0A0A0A' }}>
          No data yet
        </div>
      </PaperCard>
    );
  }

  return (
    <PaperCard color="cream" hover={false} style={{ padding: 14 }}>
      <div className="flex items-center justify-between mb-2">
        <MarkerText as="h3" size="lg" color="#0A0A0A">
          NET WORTH
        </MarkerText>
        <div className="flex items-center gap-2 flex-wrap">
          <StickerLabel color="cobalt" size="sm" tilt={-2}>You</StickerLabel>
          {showGhosts && (
            <>
              <StickerLabel color="cherry" size="sm" tilt={1.5}>Panic</StickerLabel>
              <StickerLabel color="mint" size="sm" tilt={-1}>Consistent</StickerLabel>
            </>
          )}
        </div>
      </div>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 18, left: 8, bottom: 10 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#0A0A0A"
              strokeOpacity={0.15}
              strokeWidth={1}
              vertical={false}
            />
            <XAxis
              dataKey="year"
              stroke="#0A0A0A"
              tick={{
                fontFamily: 'var(--font-mono), monospace',
                fontSize: 11,
                fill: '#0A0A0A',
              }}
              tickLine={false}
              axisLine={{ stroke: '#0A0A0A', strokeWidth: 1.5 }}
              label={{
                value: 'Years',
                position: 'insideBottomRight',
                offset: -6,
                style: {
                  fontFamily: 'var(--font-mono), monospace',
                  fontSize: 11,
                  fill: '#0A0A0A',
                },
              }}
            />
            <YAxis
              stroke="#0A0A0A"
              tick={{
                fontFamily: 'var(--font-mono), monospace',
                fontSize: 11,
                fill: '#0A0A0A',
              }}
              tickFormatter={formatCurrency}
              tickLine={false}
              axisLine={{ stroke: '#0A0A0A', strokeWidth: 1.5 }}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload || payload.length === 0) return null;
                return (
                  <div
                    style={{
                      background: '#F5EBD8',
                      border: '2px solid #0A0A0A',
                      boxShadow: '3px 3px 0 #0A0A0A',
                      padding: '8px 12px',
                    }}
                  >
                    <div style={{ fontFamily: 'var(--font-marker), Impact, sans-serif', fontSize: 13, letterSpacing: 1, textTransform: 'uppercase', color: '#0A0A0A', marginBottom: 4 }}>
                      Year {label}
                    </div>
                    {payload.map((entry, idx) => (
                      <div key={idx} className="flex items-center gap-2" style={{ fontSize: 12 }}>
                        <span
                          style={{
                            display: 'inline-block',
                            width: 10,
                            height: 3,
                            background: entry.color,
                            border: '1px solid #0A0A0A',
                            flexShrink: 0,
                          }}
                        />
                        <span style={{ fontFamily: 'var(--font-patrick), cursive', color: '#0A0A0A' }}>{entry.name}:</span>
                        <span style={{ fontFamily: 'var(--font-mono), monospace', fontWeight: 700, color: '#0A0A0A' }}>
                          {formatCurrency(entry.value as number)}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              }}
            />
            <Line
              type="monotone"
              dataKey="netWorth"
              name="You"
              stroke="#1F3FAF"
              strokeWidth={3}
              dot={false}
              animationDuration={300}
            />
            {showGhosts && (
              <>
                <Line
                  type="monotone"
                  dataKey="ghostPanic"
                  name="Panic Seller"
                  stroke="#D9344B"
                  strokeWidth={2.5}
                  strokeDasharray="4 3"
                  dot={false}
                  animationDuration={600}
                />
                <Line
                  type="monotone"
                  dataKey="ghostConsistent"
                  name="Consistent Investor"
                  stroke="#6BAE5C"
                  strokeWidth={2.5}
                  strokeDasharray="4 3"
                  dot={false}
                  animationDuration={600}
                />
              </>
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </PaperCard>
  );
}
