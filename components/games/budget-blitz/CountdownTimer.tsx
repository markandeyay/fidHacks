'use client';

import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

interface Props {
  timeRemainingMs: number;
  totalMs: number;
}

export function CountdownTimer({ timeRemainingMs, totalMs }: Props) {
  const seconds = Math.max(0, Math.ceil(timeRemainingMs / 1000));
  const pct = Math.max(0, Math.min(100, (timeRemainingMs / totalMs) * 100));
  const isLow = seconds <= 15;
  const isCrit = seconds <= 5;

  return (
    <motion.div
      animate={isCrit ? { x: [0, -3, 3, -3, 0] } : {}}
      transition={{ duration: 0.4, repeat: isCrit ? Infinity : 0 }}
      style={{ display: 'flex', alignItems: 'center', gap: 12 }}
    >
      <div
        style={{
          background: isLow ? 'var(--paper-cherry)' : 'var(--paper-coral)',
          color: isLow ? 'var(--paper-cream)' : 'var(--paper-black)',
          border: '3px solid var(--paper-black)',
          boxShadow: '3px 3px 0 var(--paper-black)',
          padding: '6px 14px',
          fontFamily: 'var(--font-marker)',
          fontSize: 28,
          minWidth: 86,
          textAlign: 'center',
          transform: 'rotate(-2deg)',
        }}
      >
        {seconds}s
      </div>
      <div style={{ flex: 1, minWidth: 100 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
          <Clock size={12} strokeWidth={3} /> TIMER
        </div>
        <div className="progress-bar"><div className="progress-bar-fill" style={{ width: `${pct}%`, background: isLow ? 'var(--paper-cherry)' : 'var(--paper-yellow)' }} /></div>
      </div>
    </motion.div>
  );
}
