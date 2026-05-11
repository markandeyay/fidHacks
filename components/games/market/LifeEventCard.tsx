'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { LifeEvent, LifeEventChoice } from '@/types/market';
import { ArrowRight, Minus, RefreshCw } from 'lucide-react';

interface LifeEventCardProps {
  event: LifeEvent | null;
  onChoice: (choice: LifeEventChoice) => void;
}

const CHOICE_META: Record<
  LifeEventChoice,
  { label: string; desc: string; icon: typeof ArrowRight; variant: 'green' | 'amber' | 'red' }
> = {
  hold: {
    label: 'Hold',
    desc: 'Stay the course. No changes to your allocation.',
    icon: ArrowRight,
    variant: 'green',
  },
  rebalance: {
    label: 'Rebalance',
    desc: 'Reset your portfolio to your target allocation.',
    icon: RefreshCw,
    variant: 'amber',
  },
  withdraw: {
    label: 'Withdraw',
    desc: 'Move half of non-safe assets to safe assets.',
    icon: Minus,
    variant: 'red',
  },
};

const VARIANT_STYLES: Record<string, string> = {
  green: 'text-fid-green hover:bg-fid-green-light border-transparent',
  amber: 'text-accent-amber hover:bg-amber-50 border-transparent',
  red: 'text-accent-red hover:bg-red-50 border-transparent',
};

export function LifeEventCard({ event, onChoice }: LifeEventCardProps) {
  return (
    <AnimatePresence>
      {event && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-fid-navy/40 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.95, y: 12 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 12 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="card p-6 max-w-md w-full"
          >
            <div className="mb-1">
              <span className="badge badge-blue text-[11px]">
                Year {event.yearIndex + 1}
              </span>
            </div>

            <h3 className="text-lg font-bold text-text-heading mb-2">{event.title}</h3>
            <p className="text-sm text-text-body leading-relaxed mb-4">{event.description}</p>

            {event.effect.cashFlow !== 0 && (
              <div
                className={`rounded-lg px-4 py-3 mb-4 ${
                  event.effect.cashFlow >= 0
                    ? 'bg-fid-green-light border border-fid-green/20'
                    : 'bg-red-50 border border-accent-red/20'
                }`}
              >
                <div className="text-[11px] font-medium uppercase tracking-wide text-text-muted mb-0.5">
                  Cash Flow Impact
                </div>
                <div
                  className={`text-lg font-bold tabular-nums ${
                    event.effect.cashFlow >= 0 ? 'text-fid-green-dark' : 'text-accent-red'
                  }`}
                >
                  {event.effect.cashFlow >= 0 ? '+' : '-'}$
                  {Math.abs(event.effect.cashFlow).toLocaleString()}
                </div>
              </div>
            )}

            <div className="space-y-2">
              {event.effect.forcedChoice.map((choice) => {
                const meta = CHOICE_META[choice];
                const Icon = meta.icon;
                return (
                  <motion.button
                    key={choice}
                    whileHover={{ scale: 1.005 }}
                    whileTap={{ scale: 0.995 }}
                    onClick={() => onChoice(choice)}
                    className={`w-full p-4 rounded-lg border text-left transition-colors bg-white ${VARIANT_STYLES[meta.variant]} border-border-default hover:border-border-strong`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${
                        meta.variant === 'green'
                          ? 'text-fid-green'
                          : meta.variant === 'amber'
                          ? 'text-accent-amber'
                          : 'text-accent-red'
                      }`} />
                      <div>
                        <div className="text-sm font-semibold">{meta.label}</div>
                        <div className="text-xs text-text-muted mt-0.5">{meta.desc}</div>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
