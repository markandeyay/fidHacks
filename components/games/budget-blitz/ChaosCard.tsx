'use client';

import { motion } from 'framer-motion';
import { ChaosCard as ChaosCardType } from '@/types/budget';
import { AlertTriangle, ArrowRight } from 'lucide-react';

interface ChaosCardOverlayProps {
  card: ChaosCardType;
  onResolve: () => void;
}

export function ChaosCardOverlay({ card, onResolve }: ChaosCardOverlayProps) {
  return (
    <motion.div
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed right-4 top-24 z-50 w-80"
    >
       <div className="card border-accent-red/30 rounded-lg p-5 shadow-sm shadow-red-500/5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-4 h-4 text-accent-red" />
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-bold text-text-heading truncate">
              {card.title}
            </h4>
            <span className="badge badge-red text-[10px]">Urgent</span>
          </div>
        </div>

        <p className="text-xs text-text-body leading-relaxed mb-3">
          {card.description}
        </p>

        <div className="flex items-center gap-2 text-xs mb-4 bg-red-50 rounded-lg p-2.5">
          <span className="font-bold text-accent-red">
            -${Math.abs(card.hit)}
          </span>
          <ArrowRight className="w-3 h-3 text-text-muted" />
          <span className="badge badge-red text-[10px]">
            {card.forcedCategory || 'fun'}
          </span>
        </div>

        <button
          onClick={onResolve}
          className="w-full py-2.5 border-2 border-accent-red/30 text-accent-red font-semibold text-sm rounded-lg bg-white hover:bg-red-50 transition-colors"
        >
          Resolve
        </button>
      </div>
    </motion.div>
  );
}
