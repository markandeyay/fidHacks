'use client';

import { ReceiptLineItem, LineItemBucket } from '@/types/sideHustle';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { seededTilt } from '@/lib/design/tilt';
import { StickerLabel } from '@/components/paper';

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

const BUCKET_STICKER: Record<LineItemBucket, 'mint' | 'coral' | 'cherry'> = {
  taxable_income: 'cherry',
  deductible_expense: 'mint',
  non_deductible: 'coral',
};

export function ReceiptLine({ item, assignedBucket, showRuling, dragHandle }: ReceiptLineProps) {
  const [expanded, setExpanded] = useState(false);
  const isCorrect = assignedBucket === item.correctBucket;
  const tilt = seededTilt(item.id, 1.5);

  const borderColor = assignedBucket
    ? isCorrect
      ? 'var(--paper-mint-dk, #6BAE5C)'
      : 'var(--paper-cherry)'
    : 'var(--paper-black)';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => setExpanded((c) => !c)}
      className="cursor-pointer group"
      style={{
        background: 'var(--paper-cream)',
        border: `2px dashed ${borderColor}`,
        boxShadow: '2px 2px 0 var(--paper-black)',
        padding: '8px 12px',
        transform: `rotate(${tilt}deg)`,
      }}
    >
      <div className="flex items-center gap-2">
        {dragHandle && <div className="shrink-0">{dragHandle}</div>}

        {!assignedBucket ? (
          <div
            className="w-4 h-4 shrink-0"
            style={{ border: '2px solid var(--paper-black)', borderRadius: '50%' }}
          />
        ) : isCorrect ? (
          <Check className="w-4 h-4 shrink-0" style={{ color: 'var(--paper-mint-dk, #6BAE5C)' }} />
        ) : (
          <X className="w-4 h-4 shrink-0" style={{ color: 'var(--paper-cherry)' }} />
        )}

        <span
          className="font-mono flex-1 truncate text-sm"
          style={{ color: 'var(--paper-black)' }}
        >
          {item.description}
        </span>

        <span
          className="font-mono text-sm shrink-0 tabular-nums font-semibold"
          style={{ color: 'var(--paper-black)' }}
        >
          ${item.amount.toLocaleString()}
        </span>

        {assignedBucket && (
          <StickerLabel color={BUCKET_STICKER[assignedBucket]} size="sm" tilt={-2}>
            {BUCKET_LABELS[assignedBucket]}
          </StickerLabel>
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
            <div
              className="font-patrick leading-relaxed pt-2 mt-2"
              style={{
                borderTop: '1px dashed var(--paper-black)',
                fontSize: 13,
                color: 'var(--paper-black)',
              }}
            >
              {item.ruling}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
