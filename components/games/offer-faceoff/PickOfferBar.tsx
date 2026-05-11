'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface PickOfferBarProps {
  onPick: (offer: 'A' | 'B') => void;
  disabled: boolean;
}

export function PickOfferBar({ onPick, disabled }: PickOfferBarProps) {
  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2, type: 'spring', damping: 25, stiffness: 250 }}
      className="fixed bottom-0 left-0 right-0 z-40"
    >
      <div className="bg-white/95 backdrop-blur-md border-t border-border-default shadow-[0_-4px_24px_rgba(0,0,0,0.04)]">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            {disabled ? (
              <>
                <AlertCircle className="w-4 h-4 text-text-muted flex-shrink-0" />
                <span className="text-xs font-medium text-text-muted">
                  Value all benefits on both offers to enable selection
                </span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-fid-green flex-shrink-0" />
                <span className="text-xs font-medium text-text-body">
                  All benefits valued &mdash; pick the better offer
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted hidden sm:inline">
              Choose
            </span>
            <button
              onClick={() => onPick('A')}
              disabled={disabled}
              className="btn-primary text-xs px-5 py-2.5 !bg-fid-green hover:!bg-fid-green-dark disabled:!bg-border-default disabled:!text-text-muted disabled:cursor-not-allowed disabled:shadow-none"
            >
              Offer A
            </button>
            <button
              onClick={() => onPick('B')}
              disabled={disabled}
              className="btn-primary text-xs px-5 py-2.5 !bg-accent-blue hover:!bg-blue-700 disabled:!bg-border-default disabled:!text-text-muted disabled:cursor-not-allowed disabled:shadow-none"
            >
              Offer B
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
