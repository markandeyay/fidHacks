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
      <div className="card p-4 h-80 flex items-center justify-center">
        <span className="text-sm text-text-muted">No data yet</span>
      </div>
    );
  }

  return (
    <div className="card p-4 h-80 md:h-96">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 24, left: 8, bottom: 10 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--color-border-default)"
            strokeWidth={1}
            vertical={false}
          />
          <XAxis
            dataKey="year"
            stroke="var(--color-text-muted)"
            tick={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 11,
              fill: 'var(--color-text-muted)',
            }}
            tickLine={false}
            axisLine={{ stroke: 'var(--color-border-default)' }}
            label={{
              value: 'Years',
              position: 'insideBottomRight',
              offset: -6,
              style: {
                fontFamily: 'Inter, system-ui, sans-serif',
                fontSize: 11,
                fill: 'var(--color-text-muted)',
              },
            }}
          />
          <YAxis
            stroke="var(--color-text-muted)"
            tick={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 11,
              fill: 'var(--color-text-muted)',
            }}
            tickFormatter={formatCurrency}
            tickLine={false}
            axisLine={{ stroke: 'var(--color-border-default)' }}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload || payload.length === 0) return null;
              return (
                <div className="card !rounded-lg !shadow-sm px-3.5 py-2.5" style={{ border: '1px solid var(--color-border-strong)' }}>
                  <p className="text-xs font-semibold text-text-heading mb-1.5">Year {label}</p>
                  {payload.map((entry, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                      <span
                        className="w-2.5 h-0.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="text-text-muted">{entry.name}:</span>
                      <span className="font-medium text-text-heading tabular-nums">
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
            stroke="var(--color-fid-green)"
            strokeWidth={2.5}
            dot={false}
            animationDuration={300}
          />
          {showGhosts && (
            <>
              <Line
                type="monotone"
                dataKey="ghostPanic"
                name="Panic Seller"
                stroke="var(--color-text-muted)"
                strokeWidth={1.5}
                strokeDasharray="6 3"
                dot={false}
                animationDuration={600}
              />
              <Line
                type="monotone"
                dataKey="ghostConsistent"
                name="Consistent Investor"
                stroke="var(--color-text-muted)"
                strokeWidth={1.5}
                strokeDasharray="2 3"
                dot={false}
                animationDuration={600}
              />
            </>
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
