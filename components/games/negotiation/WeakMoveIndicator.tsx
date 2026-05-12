'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { WindowCard } from '@/components/paper';

interface Props { visible: boolean }

export function WeakMoveIndicator({ visible }: Props) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ x: 400, opacity: 0, rotate: 8 }}
          animate={{ x: 0, opacity: 1, rotate: 4 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 22 }}
          style={{
            position: 'fixed',
            top: 90,
            right: 24,
            zIndex: 60,
            maxWidth: 320,
          }}
        >
          <WindowCard variant="warning" title="WEAK MOVE ✕" showControls tilt={4}>
            <p style={{ margin: 0, fontFamily: 'var(--font-patrick), cursive', fontSize: 16 }}>
              Vague hedging won't move the offer. Try specifics: market data, competing offers, or measurable achievements.
            </p>
          </WindowCard>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
