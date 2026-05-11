'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, ArrowRightLeft } from 'lucide-react';
import { calculateTaxOwed } from './TaxPanel';

interface LLCToggleProps {
  taxableIncome: number;
  deductions: number;
  onChange: (llc: boolean) => void;
}

export function LLCToggle({ taxableIncome, deductions, onChange }: LLCToggleProps) {
  const [llc, setLlc] = useState(false);
  const netIncome = Math.max(0, taxableIncome - deductions);

  const solePropTax = calculateTaxOwed(taxableIncome, deductions);

  const reasonableSalary = netIncome * 0.6;
  const distribution = netIncome * 0.4;
  const seTaxSavings = distribution * 0.9235 * 0.153;
  const llcTax = Math.round(solePropTax - seTaxSavings);
  const savings = Math.round(seTaxSavings);

  const handleToggle = (val: boolean) => {
    setLlc(val);
    onChange(val);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
    >
      <div className="px-4 py-3 border-b border-border-default flex items-center gap-2">
        <Building2 className="w-4 h-4 text-accent-purple" />
        <span className="text-sm font-semibold text-text-heading">Business Structure</span>
        <span className="badge badge-purple ml-auto">Senior</span>
      </div>

      <div className="p-4 space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-sm text-text-muted">Structure:</span>
          <button
            onClick={() => handleToggle(false)}
            className={`px-4 py-2 text-sm font-medium rounded-lg border-2 transition-all ${
              !llc
                ? 'border-accent-blue bg-accent-blue/10 text-accent-blue'
                : 'border-border-default text-text-muted hover:border-border-strong'
            }`}
          >
            Sole Proprietorship
          </button>
          <ArrowRightLeft className="w-4 h-4 text-text-muted" />
          <button
            onClick={() => handleToggle(true)}
            className={`px-4 py-2 text-sm font-medium rounded-lg border-2 transition-all ${
              llc
                ? 'border-accent-purple bg-accent-purple/10 text-accent-purple'
                : 'border-border-default text-text-muted hover:border-border-strong'
            }`}
          >
            LLC (S-Corp)
          </button>
        </div>

        <div className="grid grid-cols-2 gap-0 border border-border-default rounded-lg overflow-hidden">
          <div className={`p-4 border-r border-border-default ${!llc ? 'bg-bg-subtle' : ''}`}>
            <p className="text-xs text-text-muted font-semibold uppercase tracking-wider mb-1">
              Sole Proprietor Tax
            </p>
            <p className="text-xl tabular-nums text-accent-blue font-bold">
              ${solePropTax.toLocaleString()}
            </p>
            <p className="text-xs text-text-muted mt-2">
              Full SE tax on all net earnings
            </p>
          </div>

          <div className={`p-4 ${llc ? 'bg-bg-subtle' : ''}`}>
            <p className="text-xs text-text-muted font-semibold uppercase tracking-wider mb-1">
              LLC Tax (Est.)
            </p>
            <p className="text-xl tabular-nums text-accent-purple font-bold">
              ${llcTax.toLocaleString()}
            </p>
            <p className="text-xs text-text-muted mt-2">
              SE tax only on salary portion (60%)
            </p>
          </div>
        </div>

        {netIncome > 10000 ? (
          <div className="flex items-start gap-2 px-3 py-2.5 bg-fid-green-light border border-fid-green/20 rounded-lg">
            <div className="w-1.5 h-1.5 rounded-full bg-fid-green mt-1.5 shrink-0" />
            <p className="text-sm text-fid-green-dark">
              With ${netIncome.toLocaleString()} net income, LLC election saves approximately
              ${savings.toLocaleString()} in self-employment taxes.
            </p>
          </div>
        ) : (
          <div className="flex items-start gap-2 px-3 py-2.5 bg-bg-subtle border border-border-default rounded-lg">
            <div className="w-1.5 h-1.5 rounded-full bg-text-muted mt-1.5 shrink-0" />
            <p className="text-sm text-text-muted">
              At lower income levels, LLC setup costs may exceed tax savings.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
