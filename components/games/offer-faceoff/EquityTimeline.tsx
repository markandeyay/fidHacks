'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { PaperCard } from '@/components/paper';

interface VestingSchedule {
  totalShares: number;
  pricePerShare: number;
  cliffMonths: number;
  totalMonths: number;
}

interface EquityTimelineProps {
  vesting: VestingSchedule;
}

export function EquityTimeline({ vesting }: EquityTimelineProps) {
  const [month, setMonth] = useState(vesting.cliffMonths);

  const vestedShares = useMemo(() => {
    if (month < vesting.cliffMonths) return 0;
    return Math.round(vesting.totalShares * (month / vesting.totalMonths));
  }, [month, vesting]);

  const value = vestedShares * vesting.pricePerShare;

  const milestones = useMemo(() => {
    const ms: number[] = [0, vesting.cliffMonths, vesting.totalMonths];
    for (let m = vesting.cliffMonths; m < vesting.totalMonths; m += 12) {
      if (!ms.includes(m)) ms.push(m);
    }
    ms.sort((a, b) => a - b);
    return ms;
  }, [vesting]);

  const progressPct = (month / vesting.totalMonths) * 100;

  return (
    <PaperCard color="cream" tilt={0} hover={false} grainy={false} style={{ padding: 12 }}>
      <div
        style={{
          fontFamily: 'var(--font-marker), Impact, sans-serif',
          fontSize: 14,
          letterSpacing: 1,
          textTransform: 'uppercase',
          marginBottom: 10,
        }}
      >
        Equity Vesting
      </div>

      <div
        style={{
          background: 'var(--paper-cream)',
          border: '2px solid var(--paper-black)',
          padding: 8,
          marginBottom: 10,
          maxHeight: 120,
          overflowY: 'auto',
        }}
      >
        {milestones.map((m) => {
          const shares =
            m < vesting.cliffMonths
              ? 0
              : Math.round(vesting.totalShares * (m / vesting.totalMonths));
          const val = shares * vesting.pricePerShare;
          const isActive = m === month;
          return (
            <button
              key={m}
              onClick={() => setMonth(m)}
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '6px 8px',
                fontFamily: 'var(--font-mono), monospace',
                fontSize: 11,
                background: isActive ? 'var(--paper-yellow)' : 'transparent',
                border: isActive ? '2px solid var(--paper-black)' : '2px solid transparent',
                color: 'var(--paper-black)',
                cursor: 'pointer',
                marginBottom: 2,
              }}
            >
              <span>Month {m}</span>
              <span>
                {shares.toLocaleString()} sh &middot; ${val.toLocaleString()}
              </span>
            </button>
          );
        })}
      </div>

      <div style={{ marginBottom: 8 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontFamily: 'var(--font-mono), monospace',
            fontSize: 10,
            marginBottom: 6,
          }}
        >
          <span>M0</span>
          <span style={{ fontWeight: 700 }}>M{month}</span>
          <span>M{vesting.totalMonths}</span>
        </div>
        <div
          style={{
            position: 'relative',
            background: 'var(--paper-cream)',
            border: '2px solid var(--paper-black)',
            height: 14,
            padding: 0,
          }}
        >
          <div
            aria-hidden
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              width: `${progressPct}%`,
              background: 'var(--paper-yellow)',
              borderRight: progressPct > 0 && progressPct < 100 ? '2px solid var(--paper-black)' : 'none',
            }}
          />
          <input
            type="range"
            min={0}
            max={vesting.totalMonths}
            step={1}
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value))}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              opacity: 0,
              cursor: 'pointer',
              margin: 0,
              padding: 0,
            }}
          />
        </div>
      </div>

      <motion.div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--paper-yellow)',
          border: '2px solid var(--paper-black)',
          padding: '8px 10px',
        }}
        key={value}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <span style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 12 }}>
          {vestedShares.toLocaleString()} shares @ ${vesting.pricePerShare}
        </span>
        <span style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 14, fontWeight: 700 }}>
          ${value.toLocaleString()}
        </span>
      </motion.div>
    </PaperCard>
  );
}
