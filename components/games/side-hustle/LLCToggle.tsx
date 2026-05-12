'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { calculateTaxOwed } from './TaxPanel';
import { PaperCard, StickerLabel } from '@/components/paper';

interface LLCToggleProps {
  taxableIncome: number;
  deductions: number;
  onChange: (llc: boolean) => void;
}

export function LLCToggle({ taxableIncome, deductions, onChange }: LLCToggleProps) {
  const [llc, setLlc] = useState(false);
  const netIncome = Math.max(0, taxableIncome - deductions);

  const solePropTax = calculateTaxOwed(taxableIncome, deductions);

  const distribution = netIncome * 0.4;
  const seTaxSavings = distribution * 0.9235 * 0.153;
  const llcTax = Math.round(solePropTax - seTaxSavings);
  const savings = Math.round(seTaxSavings);

  const handleToggle = () => {
    const val = !llc;
    setLlc(val);
    onChange(val);
  };

  return (
    <PaperCard color="cream" seed="llc-toggle" hover={false}>
      <div style={{ padding: 16 }}>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <span
            className="font-marker"
            style={{
              fontFamily: 'var(--font-marker), Impact, sans-serif',
              fontSize: 18,
              letterSpacing: 1,
              color: 'var(--paper-black)',
            }}
          >
            BUSINESS STRUCTURE
          </span>
          <StickerLabel color="cherry" size="sm" tilt={2}>
            Senior
          </StickerLabel>
        </div>

        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <span
            className="font-marker"
            style={{
              fontFamily: 'var(--font-marker), Impact, sans-serif',
              fontSize: 14,
              letterSpacing: 1,
              color: 'var(--paper-black)',
            }}
          >
            {llc ? 'LLC (S-CORP)' : 'SOLE PROP'}
          </span>
          <button
            onClick={handleToggle}
            className={`toggle-track ${llc ? 'active' : ''}`}
            role="switch"
            aria-checked={llc}
          >
            <div className={`toggle-thumb ${llc ? 'active' : ''}`} />
          </button>
          <span
            className="font-patrick"
            style={{ fontSize: 14, color: 'var(--paper-black)' }}
          >
            toggle to compare
          </span>
        </div>

        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <PaperCard color="cream" seed="sole-prop" tilt={-1.5} hover={false}>
            <div
              style={{
                padding: 14,
                background: !llc ? 'rgba(168,213,162,0.35)' : 'transparent',
                transition: 'background 0.2s',
              }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-marker), Impact, sans-serif',
                  fontSize: 13,
                  letterSpacing: 1,
                  color: 'var(--paper-black)',
                  marginBottom: 6,
                }}
              >
                SOLE PROPRIETOR TAX
              </p>
              <p
                className="font-mono tabular-nums"
                style={{ fontSize: 28, fontWeight: 700, color: 'var(--paper-black)' }}
              >
                ${solePropTax.toLocaleString()}
              </p>
              <p
                className="font-patrick"
                style={{ fontSize: 13, color: 'var(--paper-black)', marginTop: 6 }}
              >
                Full SE tax on all net earnings
              </p>
            </div>
          </PaperCard>

          <PaperCard color="cream" seed="llc-card" tilt={1.5} hover={false}>
            <div
              style={{
                padding: 14,
                background: llc ? 'rgba(168,213,162,0.35)' : 'transparent',
                transition: 'background 0.2s',
              }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-marker), Impact, sans-serif',
                  fontSize: 13,
                  letterSpacing: 1,
                  color: 'var(--paper-black)',
                  marginBottom: 6,
                }}
              >
                LLC TAX (EST.)
              </p>
              <p
                className="font-mono tabular-nums"
                style={{ fontSize: 28, fontWeight: 700, color: 'var(--paper-black)' }}
              >
                ${llcTax.toLocaleString()}
              </p>
              <p
                className="font-patrick"
                style={{ fontSize: 13, color: 'var(--paper-black)', marginTop: 6 }}
              >
                SE tax only on salary portion (60%)
              </p>
            </div>
          </PaperCard>
        </motion.div>

        <div className="mt-4">
          {netIncome > 10000 ? (
            <p
              className="font-patrick"
              style={{
                fontSize: 15,
                color: 'var(--paper-black)',
                background: 'var(--paper-mint)',
                border: '2px dashed var(--paper-black)',
                padding: '10px 14px',
                lineHeight: 1.4,
              }}
            >
              With ${netIncome.toLocaleString()} net income, LLC election saves approximately $
              {savings.toLocaleString()} in self-employment taxes.
            </p>
          ) : (
            <p
              className="font-patrick"
              style={{
                fontSize: 15,
                color: 'var(--paper-black)',
                background: 'var(--paper-coral)',
                border: '2px dashed var(--paper-black)',
                padding: '10px 14px',
                lineHeight: 1.4,
              }}
            >
              At lower income levels, LLC setup costs may exceed tax savings.
            </p>
          )}
        </div>
      </div>
    </PaperCard>
  );
}
