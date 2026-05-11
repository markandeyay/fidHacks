'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BenefitLineItem } from '@/types/offer';
import { BenefitCalculator } from './BenefitCalculator';
import { HelpCircle, CheckCircle2, DollarSign } from 'lucide-react';

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
  const [focused, setFocused] = useState(false);

  const isCorrect = playerValue !== undefined && Math.abs(playerValue - benefit.trueDollarValue) <= 50;
  const isValued = playerValue !== undefined;

  const handleBlur = () => {
    setFocused(false);
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
        className={`rounded-lg p-3 transition-all duration-200 ${
          isCorrect && isRevealed
            ? 'bg-fid-green-light/50 border border-fid-green/20'
            : !isCorrect && isRevealed && isValued
              ? 'bg-red-50/50 border border-accent-red/10'
              : isValued
                ? 'bg-bg-subtle border border-transparent'
                : focused
                  ? 'bg-bg-subtle border border-fid-green/20'
                  : 'bg-bg-subtle border border-transparent'
        }`}
      >
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[11px] font-medium text-text-body leading-tight flex-1 min-w-0">
            {benefit.label}
          </span>
          <button
            onClick={() => setShowCalculator(true)}
            disabled={isRevealed}
            className="flex-shrink-0 flex items-center gap-1 text-[10px] font-medium text-fid-green hover:text-fid-green-dark transition-colors px-2 py-1 rounded-full bg-fid-green-light hover:bg-fid-green-light/80 disabled:opacity-40 disabled:cursor-not-allowed"
            title="Open calculator"
          >
            <HelpCircle className="w-3 h-3" />
            <span className="hidden sm:inline">Calc</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              onFocus={() => setFocused(true)}
              disabled={isRevealed}
              placeholder="Enter value"
              className="input-field text-xs py-2 pl-7 pr-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-bg-subtle"
            />
          </div>

          <AnimatePresence mode="wait">
            {isCorrect && isRevealed && (
              <motion.span
                key="check"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="flex-shrink-0"
              >
                <CheckCircle2 className="w-5 h-5 text-fid-green" />
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {isRevealed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-1.5 text-[10px] text-fid-green-dark"
          >
            True value: ${benefit.trueDollarValue.toLocaleString()}
          </motion.div>
        )}

        {benefit.hint && !isValued && !isRevealed && (
          <div className="mt-1.5 text-[10px] text-text-muted italic">
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
