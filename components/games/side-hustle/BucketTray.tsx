'use client';

import { LineItemBucket } from '@/types/sideHustle';
import { motion } from 'framer-motion';
import { StickerLabel } from '@/components/paper';

interface BucketTrayProps {
  bucket: LineItemBucket;
  count: number;
  children?: React.ReactNode;
  isOver?: boolean;
}

const CONFIG: Record<
  LineItemBucket,
  { label: string; bg: string; fg: string; tilt: number }
> = {
  taxable_income: {
    label: 'TAXABLE INCOME ⇣',
    bg: 'var(--paper-cherry)',
    fg: 'var(--paper-cream)',
    tilt: -1,
  },
  deductible_expense: {
    label: 'DEDUCTIBLE ⇣',
    bg: 'var(--paper-mint)',
    fg: 'var(--paper-black)',
    tilt: 1,
  },
  non_deductible: {
    label: 'NON-DEDUCTIBLE ⇣',
    bg: 'var(--paper-coral)',
    fg: 'var(--paper-black)',
    tilt: -1.5,
  },
};

export function BucketTray({ bucket, count, children, isOver }: BucketTrayProps) {
  const cfg = CONFIG[bucket];

  return (
    <motion.div layout>
      <div
        style={{
          background: cfg.bg,
          color: cfg.fg,
          border: '3px solid var(--paper-black)',
          boxShadow: isOver
            ? '6px 6px 0 var(--paper-black)'
            : '4px 4px 0 var(--paper-black)',
          padding: 14,
          minHeight: 200,
          transform: `rotate(${cfg.tilt}deg)`,
          transition: 'box-shadow 0.15s, transform 0.15s',
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <span
            style={{
              fontFamily: 'var(--font-marker), Impact, sans-serif',
              fontSize: 18,
              letterSpacing: 1,
              color: cfg.fg,
            }}
          >
            {cfg.label}
          </span>
          <StickerLabel color="yellow" size="sm" tilt={3}>
            {count}
          </StickerLabel>
        </div>

        <div className="space-y-2">{children}</div>
      </div>
    </motion.div>
  );
}
