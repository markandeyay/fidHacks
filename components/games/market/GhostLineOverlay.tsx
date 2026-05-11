'use client';

import { motion } from 'framer-motion';

interface GhostLineOverlayProps {
  show: boolean;
}

export function GhostLineOverlay({ show }: GhostLineOverlayProps) {
  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="card !shadow-none bg-bg-subtle flex flex-wrap gap-x-8 gap-y-2 justify-center p-3 text-xs"
    >
      <div className="flex items-center gap-2">
        <span
          className="inline-block w-8 h-0 border-t-2 rounded-full"
          style={{ borderColor: 'var(--color-fid-green)' }}
        />
        <span className="font-medium text-fid-green-dark">You</span>
      </div>
      <div className="flex items-center gap-2">
        <span
          className="inline-block w-8 h-0 border-t-2 rounded-full"
          style={{
            borderColor: 'var(--color-text-muted)',
            borderStyle: 'dashed',
          }}
        />
        <span className="font-medium text-text-muted">Panic Seller</span>
      </div>
      <div className="flex items-center gap-2">
        <span
          className="inline-block w-8 h-0 border-t-2 rounded-full"
          style={{
            borderColor: 'var(--color-text-muted)',
            borderStyle: 'dotted',
          }}
        />
        <span className="font-medium text-text-muted">Consistent Investor</span>
      </div>
    </motion.div>
  );
}
