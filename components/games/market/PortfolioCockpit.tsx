'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Shield } from 'lucide-react';
import { PortfolioAllocation, AssetClass } from '@/types/market';

interface PortfolioCockpitProps {
  timelineYears: number;
  startingCash: number;
  onStart: (allocation: PortfolioAllocation) => void;
}

const ASSET_META: {
  key: AssetClass;
  label: string;
  expectedReturn: number;
  risk: number;
  color: string;
}[] = [
  { key: 'stable',  label: 'Stable',  expectedReturn: 3,   risk: 4,    color: 'var(--color-accent-blue)' },
  { key: 'growth',  label: 'Growth',  expectedReturn: 8,   risk: 16,   color: 'var(--color-fid-green)' },
  { key: 'risky',   label: 'Risky',   expectedReturn: 12,  risk: 35,   color: 'var(--color-accent-purple)' },
  { key: 'safe',    label: 'Safe',    expectedReturn: 2,   risk: 0.5,  color: 'var(--color-accent-amber)' },
];

const DEFAULT_ALLOC: PortfolioAllocation = { stable: 0.25, growth: 0.25, risky: 0.25, safe: 0.25 };

export function PortfolioCockpit({ timelineYears, startingCash, onStart }: PortfolioCockpitProps) {
  const [allocation, setAllocation] = useState<PortfolioAllocation>(DEFAULT_ALLOC);

  const total = allocation.stable + allocation.growth + allocation.risky + allocation.safe;
  const isValid = Math.abs(total - 1) < 0.001;

  const handleChange = (key: AssetClass, value: number) => {
    setAllocation((prev) => ({ ...prev, [key]: value }));
  };

  const normalize = () => {
    const t = allocation.stable + allocation.growth + allocation.risky + allocation.safe;
    if (t <= 0) return;
    setAllocation({
      stable: allocation.stable / t,
      growth: allocation.growth / t,
      risky: allocation.risky / t,
      safe: allocation.safe / t,
    });
  };

  const blendedReturn = ASSET_META.reduce((sum, a) => sum + allocation[a.key] * a.expectedReturn, 0);
  const blendedRisk = ASSET_META.reduce((sum, a) => sum + allocation[a.key] * a.risk, 0);

  const formatPct = (v: number) => `${Math.round(v * 100)}%`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="card p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-text-heading">Portfolio Allocation</h2>
          <div className="text-sm text-text-muted">
            Starting:{' '}
            <span className="font-semibold text-text-heading">
              ${startingCash.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="space-y-5">
          {ASSET_META.map((asset) => {
            const pct = Math.round(allocation[asset.key] * 100);
            return (
              <div key={asset.key}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-text-heading">
                    {asset.label}
                  </span>
                  <span className="text-sm font-semibold text-text-body tabular-nums">
                    {pct}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={pct}
                  onChange={(e) => handleChange(asset.key, parseInt(e.target.value) / 100)}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, ${asset.color} ${pct}%, var(--color-border-default) ${pct}%)`,
                    accentColor: asset.color,
                  }}
                />
                <div className="flex justify-between mt-1">
                  <span className="text-[11px] text-text-muted">Ret: {asset.expectedReturn}%</span>
                  <span className="text-[11px] text-text-muted">Risk: {asset.risk}%</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t border-border-default pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-text-heading font-medium">Total Allocation</span>
            <span className={`text-sm font-bold tabular-nums ${isValid ? 'text-fid-green' : 'text-accent-red'}`}>
              {Math.round(total * 100)}%
            </span>
          </div>

          <div className="progress-bar mb-4">
            <div
              className="progress-bar-fill"
              style={{ width: `${Math.min(100, Math.round(total * 100))}%` }}
            />
          </div>

          {!isValid && (
            <button
              onClick={normalize}
              className="text-xs text-fid-green hover:text-fid-green-dark font-medium underline underline-offset-2 mb-3"
            >
              Normalize to 100%
            </button>
          )}

          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="rounded-lg bg-fid-green-light p-3 flex items-center gap-2.5">
              <TrendingUp className="w-4 h-4 text-fid-green-dark flex-shrink-0" />
              <div>
                <div className="text-[10px] text-fid-green-dark/70 uppercase tracking-wide font-medium">
                  Expected Return
                </div>
                <div className="text-sm font-bold text-fid-green-dark tabular-nums">
                  {blendedReturn.toFixed(1)}%
                </div>
              </div>
            </div>
            <div className="rounded-lg bg-amber-50 p-3 flex items-center gap-2.5">
              <Shield className="w-4 h-4 text-accent-amber flex-shrink-0" />
              <div>
                <div className="text-[10px] text-accent-amber/70 uppercase tracking-wide font-medium">
                  Risk Level
                </div>
                <div className="text-sm font-bold text-accent-amber tabular-nums">
                  {blendedRisk.toFixed(1)}%
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => isValid && onStart(allocation)}
            disabled={!isValid}
            className="btn-primary w-full text-center"
          >
            Begin {timelineYears} Years
          </button>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="text-sm font-semibold text-text-heading mb-3">How It Works</h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs text-text-muted leading-relaxed">
          <div>
            <span className="font-medium text-accent-blue">Stable</span> &mdash; Low risk, modest returns. Bonds and blue chips.
          </div>
          <div>
            <span className="font-medium text-fid-green">Growth</span> &mdash; Balanced growth. Diversified equity funds.
          </div>
          <div>
            <span className="font-medium text-accent-purple">Risky</span> &mdash; High reward potential. Volatile stocks, crypto.
          </div>
          <div>
            <span className="font-medium text-accent-amber">Safe</span> &mdash; Capital preservation. Cash, money market.
          </div>
        </div>
      </div>
    </motion.div>
  );
}
