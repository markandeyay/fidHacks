'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Shield } from 'lucide-react';
import { PortfolioAllocation, AssetClass } from '@/types/market';
import { WindowCard, PaperCard, PaperButton, StickerLabel, MarkerText } from '@/components/paper';

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
  { key: 'stable',  label: 'Stable',  expectedReturn: 3,   risk: 4,    color: '#1F3FAF' },
  { key: 'growth',  label: 'Growth',  expectedReturn: 8,   risk: 16,   color: '#A8D5A2' },
  { key: 'risky',   label: 'Risky',   expectedReturn: 12,  risk: 35,   color: '#D9344B' },
  { key: 'safe',    label: 'Safe',    expectedReturn: 2,   risk: 0.5,  color: '#FFD93D' },
];

const DEFAULT_ALLOC: PortfolioAllocation = { stable: 0.25, growth: 0.25, risky: 0.25, safe: 0.25 };

const CREAM = '#F5EBD8';

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <PaperCard color="cobalt" tape="tr" tapeColor="yellow" hover={false} style={{ padding: 24 }}>
        <div className="flex items-center justify-between mb-5">
          <MarkerText as="h2" size="lg" color={CREAM}>
            PORTFOLIO ALLOCATION
          </MarkerText>
          <div style={{ fontFamily: 'var(--font-patrick), cursive', fontSize: 14, color: CREAM }}>
            Starting:{' '}
            <span style={{ fontFamily: 'var(--font-mono), monospace', fontWeight: 700 }}>
              ${startingCash.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="space-y-5">
          {ASSET_META.map((asset) => {
            const pct = Math.round(allocation[asset.key] * 100);
            return (
              <div key={asset.key}>
                <div className="flex items-center justify-between mb-2">
                  <MarkerText size="md" color={CREAM}>
                    {asset.label.toUpperCase()}
                  </MarkerText>
                  <StickerLabel color="yellow" size="sm" tilt={-2}>
                    {pct}%
                  </StickerLabel>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={pct}
                  onChange={(e) => handleChange(asset.key, parseInt(e.target.value) / 100)}
                  className="market-paper-slider w-full cursor-pointer"
                  style={{
                    WebkitAppearance: 'none',
                    appearance: 'none',
                    height: 8,
                    background: `linear-gradient(to right, ${asset.color} ${pct}%, rgba(245,235,216,0.25) ${pct}%)`,
                    border: '2px solid #0A0A0A',
                    borderRadius: 2,
                    outline: 'none',
                  }}
                />
                <div className="flex justify-between mt-1.5">
                  <span style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 11, color: CREAM, opacity: 0.85 }}>
                    Ret: {asset.expectedReturn}%
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 11, color: CREAM, opacity: 0.85 }}>
                    Risk: {asset.risk}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-5" style={{ borderTop: '2px dashed rgba(245,235,216,0.4)' }}>
          <div className="flex items-center justify-between mb-3">
            <MarkerText size="md" color={CREAM}>TOTAL</MarkerText>
            <StickerLabel color={isValid ? 'mint' : 'coral'} size="md" tilt={2}>
              {Math.round(total * 100)}%
            </StickerLabel>
          </div>

          {!isValid && (
            <button
              onClick={normalize}
              style={{
                fontFamily: 'var(--font-patrick), cursive',
                fontSize: 14,
                color: '#FFD93D',
                textDecoration: 'underline',
                marginBottom: 12,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              Normalize to 100%
            </button>
          )}

          <div className="grid grid-cols-2 gap-3 mb-5 mt-3">
            <div
              style={{
                background: CREAM,
                border: '2px solid #0A0A0A',
                boxShadow: '3px 3px 0 #0A0A0A',
                padding: 10,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <TrendingUp className="w-4 h-4 flex-shrink-0" style={{ color: '#0A0A0A' }} />
              <div>
                <div style={{ fontFamily: 'var(--font-marker), Impact, sans-serif', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: '#0A0A0A' }}>
                  Exp Return
                </div>
                <div style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 14, fontWeight: 700, color: '#0A0A0A' }}>
                  {blendedReturn.toFixed(1)}%
                </div>
              </div>
            </div>
            <div
              style={{
                background: CREAM,
                border: '2px solid #0A0A0A',
                boxShadow: '3px 3px 0 #0A0A0A',
                padding: 10,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Shield className="w-4 h-4 flex-shrink-0" style={{ color: '#0A0A0A' }} />
              <div>
                <div style={{ fontFamily: 'var(--font-marker), Impact, sans-serif', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: '#0A0A0A' }}>
                  Risk Level
                </div>
                <div style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 14, fontWeight: 700, color: '#0A0A0A' }}>
                  {blendedRisk.toFixed(1)}%
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <PaperButton
              color="yellow"
              size="lg"
              onClick={() => isValid && onStart(allocation)}
              disabled={!isValid}
            >
              Begin {timelineYears} Years
            </PaperButton>
          </div>
        </div>
      </PaperCard>

      <PaperCard color="cream" hover={false} style={{ padding: 18 }}>
        <MarkerText as="h3" size="md" color="#0A0A0A" style={{ marginBottom: 10 }}>
          HOW IT WORKS
        </MarkerText>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3" style={{ fontFamily: 'var(--font-patrick), cursive', fontSize: 14, color: '#0A0A0A' }}>
          <div>
            <StickerLabel color="cobalt" size="sm" tilt={-2}>Stable</StickerLabel>
            <div className="mt-1.5">Low risk, modest returns. Bonds and blue chips.</div>
          </div>
          <div>
            <StickerLabel color="mint" size="sm" tilt={1.5}>Growth</StickerLabel>
            <div className="mt-1.5">Balanced growth. Diversified equity funds.</div>
          </div>
          <div>
            <StickerLabel color="cherry" size="sm" tilt={-1}>Risky</StickerLabel>
            <div className="mt-1.5">High reward potential. Volatile stocks, crypto.</div>
          </div>
          <div>
            <StickerLabel color="yellow" size="sm" tilt={2}>Safe</StickerLabel>
            <div className="mt-1.5">Capital preservation. Cash, money market.</div>
          </div>
        </div>
      </PaperCard>

      <style jsx>{`
        .market-paper-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 22px;
          height: 22px;
          background: #FFD93D;
          border: 2px solid #0A0A0A;
          box-shadow: 2px 2px 0 #0A0A0A;
          cursor: pointer;
          border-radius: 0;
        }
        .market-paper-slider::-moz-range-thumb {
          width: 22px;
          height: 22px;
          background: #FFD93D;
          border: 2px solid #0A0A0A;
          box-shadow: 2px 2px 0 #0A0A0A;
          cursor: pointer;
          border-radius: 0;
        }
      `}</style>
    </motion.div>
  );
}
