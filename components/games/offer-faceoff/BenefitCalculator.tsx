'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BenefitLineItem } from '@/types/offer';
import benefitsReference from '@/data/benefits-reference.json';
import { WindowCard, PaperButton, StickerLabel } from '@/components/paper';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

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
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(10,10,10,0.45)',
        backdropFilter: 'blur(4px)',
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{ maxWidth: 460, width: '100%' }}
        onClick={(e) => e.stopPropagation()}
      >
        <WindowCard variant="info" title="CALCULATOR ⊙ ✕" onClose={onClose} tilt={-1}>
          <div style={{ marginBottom: 12 }}>
            <div
              style={{
                fontFamily: 'var(--font-marker), Impact, sans-serif',
                fontSize: 13,
                letterSpacing: 1,
                textTransform: 'uppercase',
                marginBottom: 4,
              }}
            >
              Benefit
            </div>
            <div style={{ fontFamily: 'var(--font-patrick), cursive', fontSize: 18 }}>
              {benefit.label}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-mono), monospace',
                fontSize: 11,
                opacity: 0.7,
                marginTop: 2,
              }}
            >
              Listed as: {benefit.rawValue}
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <div
              style={{
                fontFamily: 'var(--font-marker), Impact, sans-serif',
                fontSize: 13,
                letterSpacing: 1,
                textTransform: 'uppercase',
                marginBottom: 6,
              }}
            >
              Formula
            </div>
            <div
              style={{
                background: 'var(--paper-cream)',
                border: '2px solid var(--paper-black)',
                padding: 10,
                fontFamily: 'var(--font-mono), monospace',
                fontSize: 13,
              }}
            >
              <code>{reference?.formula || benefit.formula}</code>
              {reference?.worked_example && (
                <div
                  style={{
                    marginTop: 8,
                    paddingTop: 8,
                    borderTop: '1px dashed var(--paper-black)',
                    fontFamily: 'var(--font-patrick), cursive',
                    fontSize: 13,
                    opacity: 0.85,
                  }}
                >
                  <strong>Example:</strong> {reference.worked_example}
                </div>
              )}
            </div>
          </div>

          {inputKeys.length > 0 ? (
            <div style={{ marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div
                style={{
                  fontFamily: 'var(--font-marker), Impact, sans-serif',
                  fontSize: 13,
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                }}
              >
                Enter Values
              </div>
              {inputKeys.map((key) => (
                <div key={key}>
                  <label
                    style={{
                      fontFamily: 'var(--font-patrick), cursive',
                      fontSize: 13,
                      display: 'block',
                      marginBottom: 4,
                      textTransform: 'capitalize',
                    }}
                  >
                    {key.replace(/_/g, ' ')}
                  </label>
                  <input
                    type="number"
                    value={inputs[key] || ''}
                    onChange={(e) =>
                      setInputs((prev) => ({ ...prev, [key]: e.target.value }))
                    }
                    className="input-field"
                    style={{
                      fontFamily: 'var(--font-mono), monospace',
                      fontSize: 14,
                      width: '100%',
                    }}
                    placeholder="0"
                    min="0"
                  />
                </div>
              ))}

              {error && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontFamily: 'var(--font-patrick), cursive',
                    fontSize: 13,
                    color: '#D9344B',
                  }}
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {error}
                </div>
              )}

              <PaperButton color="yellow" onClick={handleCalculate} style={{ width: '100%' }}>
                Calculate
              </PaperButton>
            </div>
          ) : (
            <div style={{ marginBottom: 12, fontFamily: 'var(--font-patrick), cursive', fontSize: 14, textAlign: 'center', padding: '8px 0' }}>
              No field calculator available. Use the formula above to compute the value manually, then enter it into the offer card.
            </div>
          )}

          {result !== null && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              style={{
                marginBottom: 12,
                padding: 10,
                border: '2px solid var(--paper-black)',
                background: 'var(--paper-cream)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 6,
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-marker), Impact, sans-serif',
                    fontSize: 13,
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                  }}
                >
                  Result
                </span>
                {isWithinTolerance ? (
                  <StickerLabel color="mint" size="sm" tilt={-2}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <CheckCircle2 className="w-3 h-3" /> Match
                    </span>
                  </StickerLabel>
                ) : (
                  <StickerLabel color="yellow" size="sm" tilt={-2}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <AlertTriangle className="w-3 h-3" /> Offset
                    </span>
                  </StickerLabel>
                )}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-mono), monospace',
                  fontSize: 24,
                  fontWeight: 700,
                }}
              >
                ${result.toLocaleString()}
              </div>
              {!isWithinTolerance && (
                <div
                  style={{
                    fontFamily: 'var(--font-patrick), cursive',
                    fontSize: 12,
                    marginTop: 4,
                    opacity: 0.85,
                  }}
                >
                  The correct value is approximately ${benefit.trueDollarValue.toLocaleString()}.
                  Your result is off by ${Math.abs(result - benefit.trueDollarValue).toLocaleString()}.
                </div>
              )}
            </motion.div>
          )}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <PaperButton color="cream" onClick={onClose}>
              Cancel
            </PaperButton>
            <PaperButton
              color="mint"
              disabled={result === null}
              onClick={() => {
                if (result !== null) onApplyValue(result);
                else onClose();
              }}
            >
              {result !== null ? 'Apply Value' : 'Calculate first'}
            </PaperButton>
          </div>
        </WindowCard>
      </div>
    </motion.div>
  );
}
