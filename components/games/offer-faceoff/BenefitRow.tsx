'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BenefitLineItem } from '@/types/offer';
import { BenefitCalculator } from './BenefitCalculator';
import { StickerLabel } from '@/components/paper';
import { CheckCircle2 } from 'lucide-react';

interface BenefitRowProps {
  benefit: BenefitLineItem;
  playerValue?: number;
  onChange: (value: number) => void;
  isRevealed?: boolean;
  index?: number;
}

export function BenefitRow({ benefit, playerValue, onChange, isRevealed, index = 0 }: BenefitRowProps) {
  const [showCalculator, setShowCalculator] = useState(false);
  const [inputValue, setInputValue] = useState(
    playerValue !== undefined ? String(playerValue) : ''
  );

  const isCorrect = playerValue !== undefined && Math.abs(playerValue - benefit.trueDollarValue) <= 50;
  const isValued = playerValue !== undefined;

  const handleBlur = () => {
    const num = parseFloat(inputValue);
    if (!isNaN(num) && num >= 0) {
      onChange(num);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const num = parseFloat(inputValue);
      if (!isNaN(num) && num >= 0) {
        onChange(num);
        (e.target as HTMLInputElement).blur();
      }
    }
  };

  const handleApply = (val: number) => {
    setInputValue(String(val));
    onChange(val);
    setShowCalculator(false);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.04, duration: 0.2 }}
        style={{
          background: 'var(--paper-cream)',
          borderBottom: '2px solid var(--paper-black)',
          padding: '12px 4px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
          <span
            style={{
              fontFamily: 'var(--font-patrick), cursive',
              fontSize: 16,
              lineHeight: 1.2,
              flex: 1,
              minWidth: 0,
              color: 'var(--paper-black)',
            }}
          >
            {benefit.label}
          </span>
          <button
            onClick={() => setShowCalculator(true)}
            disabled={isRevealed}
            title="Open calculator"
            style={{
              background: 'transparent',
              border: 'none',
              padding: 0,
              cursor: isRevealed ? 'not-allowed' : 'pointer',
              opacity: isRevealed ? 0.4 : 1,
            }}
          >
            <StickerLabel color="yellow" size="sm" tilt={-3}>
              ? Calc
            </StickerLabel>
          </button>
        </div>

        {benefit.rawValue && (
          <div
            style={{
              fontFamily: 'var(--font-mono), monospace',
              fontSize: 11,
              color: 'var(--paper-black)',
              opacity: 0.7,
              marginBottom: 6,
            }}
          >
            Listed: {benefit.rawValue}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <span
              style={{
                position: 'absolute',
                left: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                fontFamily: 'var(--font-mono), monospace',
                fontSize: 13,
                color: 'var(--paper-black)',
                opacity: 0.6,
                pointerEvents: 'none',
              }}
            >
              $
            </span>
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              disabled={isRevealed}
              placeholder="Enter value"
              className="input-field"
              style={{
                fontFamily: 'var(--font-mono), monospace',
                fontSize: 13,
                padding: '8px 10px 8px 22px',
                width: '100%',
                opacity: isRevealed ? 0.6 : 1,
              }}
            />
          </div>

          <AnimatePresence mode="wait">
            {isCorrect && isRevealed && (
              <motion.span
                key="check"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                style={{ flexShrink: 0 }}
              >
                <CheckCircle2 className="w-5 h-5" style={{ color: '#1F8A4C' }} />
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {isRevealed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            style={{
              marginTop: 6,
              fontFamily: 'var(--font-mono), monospace',
              fontSize: 11,
              color: 'var(--paper-black)',
            }}
          >
            True value: ${benefit.trueDollarValue.toLocaleString()}
          </motion.div>
        )}

        {benefit.hint && !isValued && !isRevealed && (
          <div
            style={{
              marginTop: 6,
              fontFamily: 'var(--font-patrick), cursive',
              fontSize: 12,
              fontStyle: 'italic',
              color: 'var(--paper-black)',
              opacity: 0.7,
            }}
          >
            Hint: {benefit.hint}
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {showCalculator && (
          <BenefitCalculator
            benefit={benefit}
            onClose={() => setShowCalculator(false)}
            onApplyValue={handleApply}
          />
        )}
      </AnimatePresence>
    </>
  );
}
