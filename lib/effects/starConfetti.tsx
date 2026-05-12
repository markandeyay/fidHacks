'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LightningStar } from '@/components/paper/LightningStar';

interface ConfettiOpts {
  duration?: number; // ms
  count?: number;
}

interface BurstStar {
  id: number;
  dx: number;
  dy: number;
  rot: number;
  size: number;
  variant: 1 | 2 | 3;
}

let confettiTrigger: ((opts?: ConfettiOpts) => void) | null = null;

export function fireStarConfetti(opts: ConfettiOpts = {}) {
  confettiTrigger?.(opts);
}

export function StarConfettiHost() {
  const [stars, setStars] = useState<BurstStar[]>([]);

  useEffect(() => {
    confettiTrigger = (opts?: ConfettiOpts) => {
      const count = opts?.count ?? 14;
      const duration = opts?.duration ?? 1800;
      const next: BurstStar[] = [];
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + Math.random() * 0.4;
        const dist = 180 + Math.random() * 160;
        next.push({
          id: Date.now() + i,
          dx: Math.cos(angle) * dist,
          dy: Math.sin(angle) * dist - 80,
          rot: (Math.random() - 0.5) * 720,
          size: 28 + Math.random() * 36,
          variant: (1 + Math.floor(Math.random() * 3)) as 1 | 2 | 3,
        });
      }
      setStars(next);
      setTimeout(() => setStars([]), duration);
    };
    return () => { confettiTrigger = null; };
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999 }} aria-hidden>
      <AnimatePresence>
        {stars.map((s) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, x: '50vw', y: '50vh', scale: 0.3, rotate: 0 }}
            animate={{ opacity: [0, 1, 1, 0], x: `calc(50vw + ${s.dx}px)`, y: `calc(50vh + ${s.dy}px)`, scale: 1, rotate: s.rot }}
            transition={{ duration: 1.6, ease: 'easeOut' }}
            style={{ position: 'absolute' }}
          >
            <LightningStar size={s.size} variant={s.variant} animate={false} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
