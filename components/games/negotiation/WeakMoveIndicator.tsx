'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

interface WeakMoveIndicatorProps {
  visible: boolean;
}

export function WeakMoveIndicator({ visible }: WeakMoveIndicatorProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          className="absolute top-2 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="flex items-center gap-2 bg-accent-red text-white px-4 py-2.5 rounded-lg shadow-lg text-sm font-semibold">
            <AlertTriangle className="w-4 h-4" />
            Be specific — use data or competing offers to move the needle
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
