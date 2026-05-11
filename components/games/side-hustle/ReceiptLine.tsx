'use client';

import { ReceiptLineItem, LineItemBucket } from '@/types/sideHustle';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Check, X } from 'lucide-react';

interface ReceiptLineProps {
  item: ReceiptLineItem;
  assignedBucket?: LineItemBucket;
  showRuling?: boolean;
  dragHandle?: React.ReactNode;
}

const BUCKET_LABELS: Record<LineItemBucket, string> = {
  taxable_income: 'Taxable',
  deductible_expense: 'Deductible',
  non_deductible: 'Non-Deductible',
};

export function ReceiptLine({ item, assignedBucket, showRuling, dragHandle }: ReceiptLineProps) {
  const [expanded, setExpanded] = useState(false);
  const isCorrect = assignedBucket === item.correctBucket;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => setExpanded((c) => !c)}
      className={`card cursor-pointer transition-colors group ${
        assignedBucket
          ? isCorrect
            ? 'border-fid-green/40'
            : 'border-accent-red/40'
          : ''
      }`}
    >
      <div className="flex items-center gap-2 px-3 py-2.5">
        {dragHandle && <div className="shrink-0">{dragHandle}</div>}

        {!assignedBucket ? (
          <div className="w-4 h-4 rounded-full border-2 border-border-strong shrink-0" />
        ) : isCorrect ? (
          <Check className="w-4 h-4 text-fid-green shrink-0" />
        ) : (
          <X className="w-4 h-4 text-accent-red shrink-0" />
        )}

        <span className="flex-1 truncate text-sm text-text-heading">{item.description}</span>

        <span className="text-sm text-text-heading shrink-0 tabular-nums font-semibold">
          ${item.amount.toLocaleString()}
        </span>

        {assignedBucket && (
          <span
            className={`badge shrink-0 ${
              assignedBucket === 'taxable_income'
                ? 'badge-green'
                : assignedBucket === 'deductible_expense'
                  ? 'badge-blue'
                  : 'badge-red'
            }`}
          >
            {BUCKET_LABELS[assignedBucket]}
          </span>
        )}
      </div>

      <AnimatePresence>
        {(showRuling || expanded) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-2.5 text-xs text-text-muted leading-relaxed border-t border-border-default pt-2 mx-3">
              {item.ruling}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
