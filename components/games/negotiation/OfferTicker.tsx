'use client';

import { motion } from 'framer-motion';
import { MarkerText, StickerLabel } from '@/components/paper';

interface Props { value: number }

export function OfferTicker({ value }: Props) {
  const isHourly = value < 1000;
  const display = isHourly ? `$${value.toFixed(2)}` : `$${value.toLocaleString()}`;
  return (
    <div style={{ position: 'relative', textAlign: 'center', padding: '14px 8px' }}>
      <div style={{ marginBottom: 4 }}>
        <StickerLabel color="coral" size="sm" tilt={-3}>CURRENT OFFER</StickerLabel>
      </div>
      <motion.div
        key={value}
        initial={{ scale: 1, y: 0 }}
        animate={{ scale: [1, 1.18, 1], y: [0, -6, 0] }}
        transition={{ duration: 0.5 }}
        style={{
          fontFamily: 'var(--font-marker), Impact, sans-serif',
          fontSize: 44,
          lineHeight: 1,
          color: 'var(--paper-black)',
        }}
      >
        {display}
      </motion.div>
      {isHourly && (
        <div style={{ fontFamily: 'var(--font-patrick)', fontSize: 14, marginTop: 4 }}>per hour</div>
      )}
    </div>
  );
}
