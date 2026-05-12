'use client';

import { motion } from 'framer-motion';
import { ChaosCard as ChaosCardType } from '@/types/budget';
import { WindowCard, PaperButton, StickerLabel } from '@/components/paper';

const TAG_VARIANT: Record<string, 'warning' | 'error' | 'cost' | 'info'> = {
  general: 'warning',
  gendered: 'cost',
  health: 'error',
  emergency: 'error',
};

const TAG_TITLE: Record<string, string> = {
  general: 'ERROR',
  gendered: 'COSTS TOO MUCH!',
  health: 'ALERT',
  emergency: 'EMERGENCY',
};

interface Props {
  card: ChaosCardType;
  onResolve: () => void;
}

export function ChaosCardOverlay({ card, onResolve }: Props) {
  const tag = card.contextTag || 'general';
  const variant = TAG_VARIANT[tag] || 'warning';
  const title = `${TAG_TITLE[tag] || 'ERROR'} ✕`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 70,
        background: 'rgba(10,10,10,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <motion.div
        initial={{ scale: 0.7, rotate: -8, y: -20 }}
        animate={{ scale: 1, rotate: -2, y: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 18 }}
        style={{ maxWidth: 440, width: '100%' }}
      >
        <WindowCard title={title} variant={variant} showControls>
          <div style={{ marginBottom: 10 }}>
            <StickerLabel color="yellow" size="sm" tilt={-3}>{card.title.toUpperCase()}</StickerLabel>
          </div>
          <p style={{ fontFamily: 'var(--font-patrick)', fontSize: 17, lineHeight: 1.35, margin: '8px 0 14px' }}>{card.description}</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 700, color: 'var(--paper-cherry)' }}>
              -${Math.abs(card.hit)}
            </div>
            <PaperButton color="yellow" onClick={onResolve}>RESOLVE</PaperButton>
          </div>
        </WindowCard>
      </motion.div>
    </motion.div>
  );
}
