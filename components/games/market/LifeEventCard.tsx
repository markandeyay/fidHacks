'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { LifeEvent, LifeEventChoice } from '@/types/market';
import { ArrowRight, Minus, RefreshCw } from 'lucide-react';
import { WindowCard, PaperButton, StickerLabel, MarkerText } from '@/components/paper';

interface LifeEventCardProps {
  event: LifeEvent | null;
  onChoice: (choice: LifeEventChoice) => void;
}

const CHOICE_META: Record<
  LifeEventChoice,
  { label: string; desc: string; icon: typeof ArrowRight; color: 'mint' | 'yellow' | 'coral' }
> = {
  hold: {
    label: 'Hold',
    desc: 'Stay the course. No changes to your allocation.',
    icon: ArrowRight,
    color: 'mint',
  },
  rebalance: {
    label: 'Rebalance',
    desc: 'Reset your portfolio to your target allocation.',
    icon: RefreshCw,
    color: 'yellow',
  },
  withdraw: {
    label: 'Withdraw',
    desc: 'Move half of non-safe assets to safe assets.',
    icon: Minus,
    color: 'coral',
  },
};

export function LifeEventCard({ event, onChoice }: LifeEventCardProps) {
  return (
    <AnimatePresence>
      {event && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(10,10,10,0.55)' }}
        >
          <motion.div
            initial={{ scale: 0.95, y: 12 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 12 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="max-w-md w-full"
          >
            <WindowCard variant="error" title="LIFE EVENT ✕" showControls={true}>
              <div style={{ marginBottom: 10 }}>
                <StickerLabel color="yellow" size="md" tilt={-2}>
                  YEAR {event.yearIndex + 1}
                </StickerLabel>
              </div>

              <MarkerText as="h3" size="md" color="#0A0A0A" style={{ marginBottom: 8 }}>
                {event.title.toUpperCase()}
              </MarkerText>
              <p style={{ fontFamily: 'var(--font-patrick), cursive', fontSize: 16, color: '#0A0A0A', lineHeight: 1.45, marginBottom: 14 }}>
                {event.description}
              </p>

              {event.effect.cashFlow !== 0 && (
                <div
                  style={{
                    background: event.effect.cashFlow >= 0 ? '#A8D5A2' : '#F4A0A0',
                    border: '2px solid #0A0A0A',
                    boxShadow: '3px 3px 0 #0A0A0A',
                    padding: '10px 14px',
                    marginBottom: 14,
                  }}
                >
                  <div style={{ fontFamily: 'var(--font-marker), Impact, sans-serif', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: '#0A0A0A', marginBottom: 2 }}>
                    Cash Flow Impact
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 20, fontWeight: 700, color: '#0A0A0A' }}>
                    {event.effect.cashFlow >= 0 ? '+' : '-'}$
                    {Math.abs(event.effect.cashFlow).toLocaleString()}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-2.5">
                {event.effect.forcedChoice.map((choice) => {
                  const meta = CHOICE_META[choice];
                  const Icon = meta.icon;
                  return (
                    <PaperButton
                      key={choice}
                      color={meta.color}
                      size="md"
                      onClick={() => onChoice(choice)}
                      style={{ width: '100%', justifyContent: 'flex-start', textTransform: 'none' }}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span style={{ fontFamily: 'var(--font-marker), Impact, sans-serif', fontSize: 15, letterSpacing: 1, textTransform: 'uppercase' }}>
                        {meta.label}
                      </span>
                      <span style={{ fontFamily: 'var(--font-patrick), cursive', fontSize: 13, textTransform: 'none', letterSpacing: 0, opacity: 0.85, marginLeft: 6 }}>
                        — {meta.desc}
                      </span>
                    </PaperButton>
                  );
                })}
              </div>
            </WindowCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
