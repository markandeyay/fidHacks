'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Calculator } from 'lucide-react';

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
    >
      <div className="px-4 py-3 border-b border-border-default flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calculator className="w-4 h-4 text-fid-green" />
          <span className="text-sm font-semibold text-text-heading">Tax Calculator</span>
        </div>
        <span className="badge badge-blue">2025 Single Filer</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border-default">
        {/* Brackets Table */}
        <div className="p-4 space-y-1">
          <p className="text-xs text-text-muted font-semibold uppercase tracking-wider mb-3">
            Tax Brackets
          </p>
          {BRACKETS.slice(0, 6).map((b, i) => {
            const prev = i === 0 ? 0 : BRACKETS[i - 1].limit;
            const active = netIncome > prev;
            return (
              <div
                key={i}
                className={`flex justify-between text-xs py-1.5 px-2 rounded ${
                  active ? 'text-text-heading bg-bg-subtle' : 'text-text-muted/50'
                }`}
              >
                <span className="tabular-nums">
                  ${prev.toLocaleString()} &ndash;{' '}
                  {b.limit === Infinity ? 'above' : `$${b.limit.toLocaleString()}`}
                </span>
                <span className={`tabular-nums font-bold ${active ? 'text-fid-green-dark' : ''}`}>
                  {(b.rate * 100).toFixed(0)}%
                </span>
              </div>
            );
          })}
          <div className="text-xs text-text-muted pt-2 border-t border-border-default mt-2">
            Self-employment tax: 15.3% on 92.35% of net earnings
          </div>
        </div>

        {/* Calculator */}
        <div className="p-4 space-y-4">
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Taxable income</span>
              <span className="tabular-nums font-medium">${taxableIncome.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Deductions</span>
              <span className="text-accent-blue tabular-nums font-medium">
                -${deductions.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-sm border-t border-border-default pt-1.5">
              <span className="text-text-muted font-semibold">Net income</span>
              <span className="tabular-nums font-bold text-text-heading">
                ${netIncome.toLocaleString()}
              </span>
            </div>
          </div>

          {!submitted ? (
            <div className="space-y-3">
              <p className="text-xs text-text-muted font-semibold uppercase tracking-wider">
                Your Tax Estimate
              </p>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">
                    $
                  </span>
                  <input
                    type="number"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    className="input-field pl-8"
                    placeholder="0.00"
                  />
                </div>
                <button
                  onClick={handleSubmit}
                  className="btn-primary"
                >
                  Submit
                </button>
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2"
            >
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Your estimate</span>
                <span className="tabular-nums font-medium">
                  ${Math.round(parseFloat(input) || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Correct tax</span>
                <span className="text-fid-green tabular-nums font-bold">
                  ${correctTax.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm border-t border-border-default pt-1.5">
                <span className="text-text-muted">Difference</span>
                <span
                  className={`tabular-nums font-bold ${
                    Math.abs((parseFloat(input) || 0) - correctTax) / correctTax < 0.1
                      ? 'text-fid-green'
                      : 'text-accent-red'
                  }`}
                >
                  {(() => {
                    const diff = Math.round(parseFloat(input) || 0) - correctTax;
                    const sign = diff >= 0 ? '+' : '';
                    return `${sign}$${Math.abs(diff).toLocaleString()}`;
                  })()}
                </span>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
