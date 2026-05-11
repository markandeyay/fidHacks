'use client';

import { useDroppable } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import { BudgetCategory } from '@/types/budget';
import { Lock, ShieldAlert, TrendingUp, Wallet } from 'lucide-react';

type BucketId = BudgetCategory | 'emergency-buffer';

const categoryIcons: Record<BucketId, string> = {
  rent: 'Home',
  food: 'Utensils',
  transport: 'Car',
  savings: 'PiggyBank',
  fun: 'Gamepad2',
  health: 'Heart',
  personal_care: 'Sparkles',
  'emergency-buffer': 'Shield',
};

const colorConfig = {
  green: {
    border: 'border-fid-green/30',
    bg: 'bg-fid-green-light',
    badge: 'badge badge-green',
    text: 'text-fid-green-dark',
    progress: 'bg-fid-green',
  },
  amber: {
    border: 'border-accent-amber/30',
    bg: 'bg-amber-50',
    badge: 'badge badge-amber',
    text: 'text-amber-700',
    progress: 'bg-accent-amber',
  },
  red: {
    border: 'border-accent-red/30',
    bg: 'bg-red-50',
    badge: 'badge badge-red',
    text: 'text-red-700',
    progress: 'bg-accent-red',
  },
};

const statusLabels: Record<string, string> = {
  green: 'Healthy',
  amber: 'Tight',
  red: 'Busted',
};

interface CategoryBucketProps {
  category: BucketId;
  label: string;
  allocated: number;
  benchmark: number;
  color: 'green' | 'amber' | 'red';
  locked: boolean;
}

export function CategoryBucket({
  category,
  label,
  allocated,
  benchmark,
  color,
  locked,
}: CategoryBucketProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: category,
    disabled: locked,
  });

  const pc = Math.min(
    100,
    Math.round((allocated / Math.max(1, benchmark)) * 100)
  );

  const styles = colorConfig[color];

  return (
    <motion.div
      ref={setNodeRef}
      animate={
        isOver && !locked
          ? { scale: 1.03, boxShadow: '0 0 0 2px var(--color-fid-green)' }
          : { scale: 1 }
      }
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className={`card rounded-lg p-3.5 transition-all ${
        isOver && !locked
          ? 'border-fid-green shadow-md'
          : `${styles.border} ${styles.bg}`
      } ${locked ? 'opacity-50' : ''}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          {locked && <Lock className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />}
          <span className="text-xs font-semibold text-text-heading truncate">
            {label}
          </span>
        </div>
        <span className={styles.badge}>
          {locked ? 'Locked' : statusLabels[color]}
        </span>
      </div>

      <div className="text-base font-bold text-text-heading mb-1">
        ${allocated.toLocaleString()}
        <span className="text-xs font-normal text-text-muted ml-1">
          / ${benchmark.toLocaleString()}
        </span>
      </div>

      <div className="progress-bar">
        <motion.div
          className={`${styles.progress} h-full rounded-full`}
          animate={{ width: `${pc}%` }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        />
      </div>
      <div className="flex justify-end mt-1">
        <span className="text-[10px] font-medium text-text-muted">
          {pc}%
        </span>
      </div>
    </motion.div>
  );
}
