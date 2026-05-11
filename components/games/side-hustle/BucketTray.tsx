'use client';

import { LineItemBucket } from '@/types/sideHustle';
import { motion } from 'framer-motion';

interface BucketTrayProps {
  bucket: LineItemBucket;
  count: number;
  children?: React.ReactNode;
  isOver?: boolean;
}

const CONFIG: Record<
  LineItemBucket,
  { label: string; accentColor: string; borderClass: string; bgClass: string }
> = {
  taxable_income: {
    label: 'Taxable Income',
    accentColor: 'text-fid-green-dark',
    borderClass: 'border-fid-green/40',
    bgClass: 'bg-fid-green-light',
  },
  deductible_expense: {
    label: 'Deductible Expense',
    accentColor: 'text-accent-blue',
    borderClass: 'border-accent-blue/40',
    bgClass: 'bg-accent-blue/10',
  },
  non_deductible: {
    label: 'Non-Deductible',
    accentColor: 'text-accent-red',
    borderClass: 'border-accent-red/40',
    bgClass: 'bg-accent-red/5',
  },
};

export function BucketTray({ bucket, count, children, isOver }: BucketTrayProps) {
  const cfg = CONFIG[bucket];

  return (
    <motion.div layout>
      <div
        className={`card overflow-hidden ${
          isOver ? 'ring-2 ring-fid-green/60 border-fid-green' : cfg.borderClass
        }`}
      >
        <div
          className={`px-3 py-2 border-b ${
            isOver ? 'border-fid-green bg-fid-green-light' : `${cfg.borderClass} ${cfg.bgClass}`
          } flex items-center justify-between`}
        >
          <span className={`text-xs font-semibold ${cfg.accentColor}`}>{cfg.label}</span>
          <span className="badge badge-amber">{count}</span>
        </div>

        <div className="min-h-[160px] p-2 space-y-1.5">{children}</div>
      </div>
    </motion.div>
  );
}
