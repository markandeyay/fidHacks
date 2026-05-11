'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Clock } from 'lucide-react';

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
    <div>
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="w-4 h-4 text-fid-green" />
        <span className="text-xs font-semibold uppercase tracking-wider text-text-body">
          Equity Vesting
        </span>
      </div>

      <div className="bg-bg-subtle rounded-lg border border-border-default p-3 mb-3 max-h-28 overflow-y-auto">
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
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] transition-colors ${
                isActive
                  ? 'bg-fid-green-light text-fid-green-dark font-medium'
                  : 'text-text-muted hover:bg-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <Clock className="w-3 h-3" />
                <span>Month {m}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="tabular-nums">{shares.toLocaleString()} shares</span>
                <span className="tabular-nums font-medium">
                  ${val.toLocaleString()}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mb-2">
        <div className="flex justify-between text-[10px] text-text-muted mb-1.5 font-medium">
          <span>M0</span>
          <span className="text-fid-green font-semibold">M{month}</span>
          <span>M{vesting.totalMonths}</span>
        </div>
        <div className="relative">
          <input
            type="range"
            min={0}
            max={vesting.totalMonths}
            step={1}
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer bg-border-default"
            style={{
              background: `linear-gradient(to right, #009A44 0%, #009A44 ${progressPct}%, #E2E8F0 ${progressPct}%, #E2E8F0 100%)`,
            }}
          />
        </div>
      </div>

      <motion.div
        className="flex items-center justify-between bg-fid-green-light rounded-lg px-3 py-2.5"
        key={value}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <span className="text-xs text-fid-green-dark">
          {vestedShares.toLocaleString()} shares @ ${vesting.pricePerShare}
        </span>
        <span className="text-sm font-bold text-fid-green">
          ${value.toLocaleString()}
        </span>
      </motion.div>
    </div>
  );
}
