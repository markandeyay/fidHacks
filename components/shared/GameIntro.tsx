'use client';

import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, AlertTriangle } from 'lucide-react';
import { DifficultyPicker } from './DifficultyPicker';
import { Difficulty } from '@/types/game';
import { WindowCard, MarkerText, StickerLabel, LightningStar, PaperButton } from '@/components/paper';

export interface GameIntroProps {
  icon: ReactNode;
  title: string;
  description: string;
  selected: Difficulty | null;
  onSelect: (d: Difficulty) => void;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  extra?: ReactNode;
  ctaLabel?: string;
  onCta?: () => void;
  ctaDisabled?: boolean;
  helperTitle?: string;
  helperBody?: string;
}

export function GameIntro({
  icon, title, description, selected, onSelect,
  loading, error, onRetry, extra, ctaLabel, onCta, ctaDisabled, helperTitle, helperBody,
}: GameIntroProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ maxWidth: 880, margin: '0 auto' }}
    >
      {/* Hero icon + star */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 28, position: 'relative' }}>
        <div style={{ position: 'relative', width: 140, height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <LightningStar size={140} variant={1} animate />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--paper-black)' }}>
            {icon}
          </div>
        </div>
        <div style={{ marginTop: 10 }}>
          <MarkerText as="h2" size="2xl" style={{ textAlign: 'center' }}>{title}</MarkerText>
        </div>
        <div style={{ marginTop: 8, maxWidth: 540, textAlign: 'center', fontFamily: 'var(--font-patrick), cursive', fontSize: 18, color: 'var(--paper-cream)' }}>
          {description}
        </div>
      </div>

      {/* Picker */}
      <div style={{ textAlign: 'center', marginBottom: 14 }}>
        <StickerLabel color="yellow" size="md" tilt={-2}>Select difficulty</StickerLabel>
      </div>
      <DifficultyPicker selected={selected} onSelect={onSelect} />

      {/* Extra slot */}
      {extra && <div style={{ marginTop: 24 }}>{extra}</div>}

      {/* CTA */}
      {ctaLabel && onCta && (
        <div style={{ marginTop: 28, textAlign: 'center' }}>
          <PaperButton color="yellow" size="lg" onClick={onCta} disabled={ctaDisabled || !selected || loading}>
            {ctaLabel}
          </PaperButton>
        </div>
      )}

      {/* Loading / Error / Helper */}
      <AnimatePresence mode="wait">
        {loading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{ marginTop: 28, display: 'flex', justifyContent: 'center' }}
          >
            <WindowCard variant="hydrating" title="LOADING ⊙ ✕" showControls>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Loader2 size={20} className="animate-spin" />
                <span>Hydrating scenario data...</span>
              </div>
              <div className="progress-bar" style={{ marginTop: 12, width: 240 }}>
                <motion.div className="progress-bar-fill" animate={{ width: ['10%', '90%', '10%'] }} transition={{ duration: 2, repeat: Infinity }} />
              </div>
            </WindowCard>
          </motion.div>
        )}

        {error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{ marginTop: 28, display: 'flex', justifyContent: 'center' }}
          >
            <WindowCard variant="error" title="ERROR ✕" showControls onClose={onRetry}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <AlertTriangle size={20} color="#D9344B" />
                <div>
                  <div style={{ fontFamily: 'var(--font-marker)' }}>WHAT WAS THAT?</div>
                  <p style={{ marginTop: 6 }}>{error}</p>
                  {onRetry && (
                    <button onClick={onRetry} style={{ marginTop: 10, background: 'var(--paper-yellow)', border: '2px solid var(--paper-black)', padding: '4px 10px', fontFamily: 'var(--font-marker)', cursor: 'pointer' }}>
                      TRY AGAIN
                    </button>
                  )}
                </div>
              </div>
            </WindowCard>
          </motion.div>
        )}

        {!loading && !error && helperTitle && helperBody && (
          <motion.div
            key="helper"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{ marginTop: 28, display: 'flex', justifyContent: 'center' }}
          >
            <WindowCard variant="info" title={`${helperTitle.toUpperCase()} ⊙ ✕`} showControls>
              <p>{helperBody}</p>
            </WindowCard>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
