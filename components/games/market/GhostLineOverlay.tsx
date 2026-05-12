'use client';

import { motion } from 'framer-motion';
import { PaperCard, StickerLabel } from '@/components/paper';

interface GhostLineOverlayProps {
  show: boolean;
}

export function GhostLineOverlay({ show }: GhostLineOverlayProps) {
  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <PaperCard color="cream" hover={false} style={{ padding: 14 }}>
        <div className="flex flex-wrap gap-x-6 gap-y-3 justify-center items-center">
          <div className="flex items-center gap-2.5">
            <span
              style={{
                display: 'inline-block',
                width: 32,
                height: 3,
                background: '#1F3FAF',
                border: '1px solid #0A0A0A',
              }}
            />
            <StickerLabel color="cobalt" size="sm" tilt={-2}>You</StickerLabel>
          </div>
          <div className="flex items-center gap-2.5">
            <span
              style={{
                display: 'inline-block',
                width: 32,
                height: 0,
                borderTop: '3px dashed #D9344B',
              }}
            />
            <StickerLabel color="cherry" size="sm" tilt={1.5}>Panic Seller</StickerLabel>
          </div>
          <div className="flex items-center gap-2.5">
            <span
              style={{
                display: 'inline-block',
                width: 32,
                height: 0,
                borderTop: '3px dashed #6BAE5C',
              }}
            />
            <StickerLabel color="mint" size="sm" tilt={-1}>Consistent Investor</StickerLabel>
          </div>
        </div>
      </PaperCard>
    </motion.div>
  );
}
