'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BenefitLineItem } from '@/types/offer';
import benefitsReference from '@/data/benefits-reference.json';
import { X, Calculator, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

interface BenefitCalculatorProps {
  benefit: BenefitLineItem;
  onClose: () => void;
  onApplyValue: (value: number) => void;
}

function safeEvaluate(formula: string, inputs: Record<string, number>): number | null {
  try {
    let expr = formula;
    const keys = Object.keys(inputs).sort((a, b) => b.length - a.length);
    for (const key of keys) {
      expr = expr.replace(new RegExp(`\\b${key}\\b`, 'g'), String(inputs[key]));
    }
    expr = expr.replace(/[^0-9+\-*/().\s]/g, '');
    if (!expr.trim()) return null;
    return new Function('return (' + expr + ')')();
  } catch {
    return null;
  }
}

export function BenefitCalculator({ benefit, onClose, onApplyValue }: BenefitCalculatorProps) {
  const reference = (benefitsReference as Record<string, any>)[benefit.type];
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const inputKeys = useMemo(() => {
    if (reference?.inputs) return reference.inputs as string[];
    return [];
  }, [reference]);

  const handleCalculate = () => {
    setError(null);
    const numericInputs: Record<string, number> = {};
    for (const key of inputKeys) {
      const val = parseFloat(inputs[key] || '');
      if (isNaN(val) || val < 0) {
        setError(`Please enter a valid number for "${key.replace(/_/g, ' ')}".`);
        return;
      }
      numericInputs[key] = val;
    }
    const formula = reference?.formula || benefit.formula;
    const calculated = safeEvaluate(formula, numericInputs);
    if (calculated === null) {
      setError('Could not evaluate the formula. Please check your inputs.');
      return;
    }
    setResult(calculated);
  };

  const isWithinTolerance = result !== null && Math.abs(result - benefit.trueDollarValue) <= 50;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-fid-navy/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 28, stiffness: 350 }}
        className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-fid-navy px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-white" />
            <span className="text-white font-semibold text-sm">Benefit Calculator</span>
          </div>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-3 bg-fid-green-light/30 border-b border-fid-green-light">
          <div className="text-xs font-semibold text-fid-green-dark uppercase tracking-wider mb-0.5">
            Benefit
          </div>
          <div className="text-sm font-medium text-text-heading">{benefit.label}</div>
          <div className="text-[11px] text-text-muted mt-0.5">
            Listed as: {benefit.rawValue}
          </div>
        </div>

        <div className="px-5 py-3 border-b border-border-default">
          <div className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
            Formula
          </div>
          <div className="bg-bg-subtle rounded-lg border border-border-default p-3">
            <code className="text-sm font-medium text-fid-navy block">
              {reference?.formula || benefit.formula}
            </code>
            {reference?.worked_example && (
              <div className="text-[11px] text-text-muted mt-2 leading-relaxed border-t border-border-default pt-2">
                <span className="font-medium text-text-body">Example: </span>
                {reference.worked_example}
              </div>
            )}
          </div>
        </div>

        {inputKeys.length > 0 ? (
          <div className="px-5 py-3 border-b border-border-default space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Enter Values
            </div>
            {inputKeys.map((key) => (
              <div key={key}>
                <label className="text-[11px] font-medium text-text-body block mb-1 capitalize">
                  {key.replace(/_/g, ' ')}
                </label>
                <input
                  type="number"
                  value={inputs[key] || ''}
                  onChange={(e) =>
                    setInputs((prev) => ({ ...prev, [key]: e.target.value }))
                  }
                  className="input-field text-sm py-2"
                  placeholder="0"
                  min="0"
                />
              </div>
            ))}

            {error && (
              <div className="flex items-center gap-1.5 text-[11px] text-accent-red">
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                {error}
              </div>
            )}

            <button
              onClick={handleCalculate}
              className="btn-primary w-full text-sm flex items-center justify-center gap-2"
            >
              <Calculator className="w-4 h-4" />
              Calculate
            </button>
          </div>
        ) : (
          <div className="px-5 py-3 border-b border-border-default">
            <div className="text-sm text-text-muted text-center py-2">
              No field calculator available. Use the formula above to compute the value manually, then enter it into the offer card.
            </div>
          </div>
        )}

        {result !== null && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="px-5 py-3 border-b border-border-default"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                Result
              </span>
              {isWithinTolerance ? (
                <span className="badge badge-green text-[10px] flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Match
                </span>
              ) : (
                <span className="badge badge-amber text-[10px] flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Offset
                </span>
              )}
            </div>
            <div className="text-2xl font-bold text-text-heading">
              ${result.toLocaleString()}
            </div>
            {!isWithinTolerance && (
              <div className="text-[11px] text-accent-amber mt-1">
                The correct value is approximately ${benefit.trueDollarValue.toLocaleString()}.
                Your result is off by ${Math.abs(result - benefit.trueDollarValue).toLocaleString()}.
              </div>
            )}
          </motion.div>
        )}

        <div className="px-5 py-3 flex gap-2.5">
          <button
            onClick={onClose}
            className="btn-outline flex-1 text-sm py-2.5"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (result !== null) onApplyValue(result);
              else onClose();
            }}
            disabled={result === null}
            className={`btn-primary flex-1 text-sm py-2.5 flex items-center justify-center gap-2 ${
              result === null ? 'opacity-40 cursor-not-allowed' : ''
            }`}
          >
            {result !== null ? (
              <>
                Apply Value
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              'Calculate first'
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
