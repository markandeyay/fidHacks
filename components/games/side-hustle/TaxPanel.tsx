'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { WindowCard, PaperButton, StickerLabel } from '@/components/paper';

interface TaxPanelProps {
  taxableIncome: number;
  deductions: number;
  onSubmit: (playerTax: number, correctTax: number) => void;
}

const BRACKETS = [
  { limit: 11600, rate: 0.10 },
  { limit: 47150, rate: 0.12 },
  { limit: 100525, rate: 0.22 },
  { limit: 191950, rate: 0.24 },
  { limit: 243725, rate: 0.32 },
  { limit: 609350, rate: 0.35 },
  { limit: Infinity, rate: 0.37 },
];

export function calculateTaxOwed(taxableIncome: number, deductions: number): number {
  const netIncome = Math.max(0, taxableIncome - deductions);

  let remaining = netIncome;
  let prevLimit = 0;
  let incomeTax = 0;

  for (const bracket of BRACKETS) {
    const band = Math.min(Math.max(0, remaining - prevLimit), bracket.limit - prevLimit);
    incomeTax += band * bracket.rate;
    prevLimit = bracket.limit;
    if (remaining <= bracket.limit) break;
  }

  const seTaxable = netIncome * 0.9235;
  const seTax = seTaxable * 0.153;

  return Math.round(incomeTax + seTax);
}

export function TaxPanel({ taxableIncome, deductions, onSubmit }: TaxPanelProps) {
  const [input, setInput] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const netIncome = Math.max(0, taxableIncome - deductions);
  const correctTax = calculateTaxOwed(taxableIncome, deductions);

  const handleSubmit = () => {
    const val = parseFloat(input);
    if (Number.isNaN(val)) return;
    setSubmitted(true);
    onSubmit(Math.round(val), correctTax);
  };

  const diff = Math.round(parseFloat(input) || 0) - correctTax;
  const closeEnough = Math.abs(diff) / correctTax < 0.1;

  return (
    <WindowCard variant="info" title="TAX FORM ⊙ ✕" seed="tax-panel">
      <div className="flex items-center justify-end mb-2">
        <StickerLabel color="cobalt" size="sm" tilt={-2}>
          2025 SINGLE FILER
        </StickerLabel>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Brackets Table */}
        <div className="space-y-1">
          <p
            className="mb-3"
            style={{
              fontFamily: 'var(--font-marker), Impact, sans-serif',
              fontSize: 14,
              letterSpacing: 1,
              color: 'var(--paper-black)',
            }}
          >
            TAX BRACKETS
          </p>
          {BRACKETS.slice(0, 6).map((b, i) => {
            const prev = i === 0 ? 0 : BRACKETS[i - 1].limit;
            const active = netIncome > prev;
            return (
              <div
                key={i}
                className="font-mono flex justify-between py-1 px-2"
                style={{
                  fontSize: 12,
                  background: active ? 'rgba(168,213,162,0.35)' : 'transparent',
                  color: active ? 'var(--paper-black)' : 'rgba(10,10,10,0.45)',
                  border: active ? '1px dashed var(--paper-black)' : '1px dashed transparent',
                }}
              >
                <span className="tabular-nums">
                  ${prev.toLocaleString()} &ndash;{' '}
                  {b.limit === Infinity ? 'above' : `$${b.limit.toLocaleString()}`}
                </span>
                <span className="tabular-nums font-bold">
                  {(b.rate * 100).toFixed(0)}%
                </span>
              </div>
            );
          })}
          <p
            className="font-patrick pt-2 mt-2"
            style={{
              borderTop: '1px dashed var(--paper-black)',
              fontSize: 13,
              color: 'var(--paper-black)',
            }}
          >
            Self-employment tax: 15.3% on 92.35% of net earnings
          </p>
        </div>

        {/* Calculator */}
        <div className="space-y-4">
          <div className="space-y-1.5 font-mono" style={{ fontSize: 13, color: 'var(--paper-black)' }}>
            <div className="flex justify-between">
              <span>Taxable income</span>
              <span className="tabular-nums font-semibold">${taxableIncome.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Deductions</span>
              <span className="tabular-nums font-semibold">
                -${deductions.toLocaleString()}
              </span>
            </div>
            <div
              className="flex justify-between pt-1.5"
              style={{ borderTop: '1px dashed var(--paper-black)' }}
            >
              <span className="font-semibold">Net income</span>
              <span className="tabular-nums font-bold">${netIncome.toLocaleString()}</span>
            </div>
          </div>

          {!submitted ? (
            <div className="space-y-3">
              <p
                style={{
                  fontFamily: 'var(--font-marker), Impact, sans-serif',
                  fontSize: 14,
                  letterSpacing: 1,
                  color: 'var(--paper-black)',
                }}
              >
                YOUR TAX ESTIMATE
              </p>
              <div className="flex gap-2 items-stretch">
                <div className="relative flex-1">
                  <span
                    className="font-mono absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ fontSize: 14, color: 'var(--paper-black)' }}
                  >
                    $
                  </span>
                  <input
                    type="number"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    className="input-field font-mono"
                    style={{ paddingLeft: 28 }}
                    placeholder="0.00"
                  />
                </div>
                <PaperButton color="yellow" size="md" onClick={handleSubmit}>
                  Submit
                </PaperButton>
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2 font-mono"
              style={{ fontSize: 13, color: 'var(--paper-black)' }}
            >
              <div className="flex justify-between">
                <span>Your estimate</span>
                <span className="tabular-nums font-semibold">
                  ${Math.round(parseFloat(input) || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Correct tax</span>
                <span className="tabular-nums font-bold">
                  ${correctTax.toLocaleString()}
                </span>
              </div>
              <div
                className="flex justify-between pt-1.5 items-center"
                style={{ borderTop: '1px dashed var(--paper-black)' }}
              >
                <span>Difference</span>
                <StickerLabel
                  color={closeEnough ? 'mint' : 'cherry'}
                  size="sm"
                  tilt={-2}
                >
                  {diff >= 0 ? '+' : ''}${Math.abs(diff).toLocaleString()}
                </StickerLabel>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </WindowCard>
  );
}
