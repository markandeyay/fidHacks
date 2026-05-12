'use client';

import { motion } from 'framer-motion';
import { PaperButton } from '@/components/paper';

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
      style={{
        position: 'fixed',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: 16,
        zIndex: 40,
        background: 'var(--paper-cream)',
        border: '3px solid var(--paper-black)',
        boxShadow: '5px 5px 0 var(--paper-black)',
        padding: 14,
      }}
    >
      <PaperButton color="coral" size="lg" disabled={disabled} onClick={() => onPick('A')}>
        OFFER A
      </PaperButton>
      <PaperButton color="mint" size="lg" disabled={disabled} onClick={() => onPick('B')}>
        OFFER B
      </PaperButton>
    </motion.div>
  );
}
