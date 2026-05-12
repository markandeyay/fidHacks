'use client';

import { useDroppable } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import { BudgetCategory } from '@/types/budget';
import { Lock } from 'lucide-react';

type Color = 'green' | 'amber' | 'red';

const CAT_COLOR: Record<string, { bg: string; fg: string }> = {
  rent: { bg: '#1F3FAF', fg: '#F5EBD8' },
  food: { bg: '#A8D5A2', fg: '#0A0A0A' },
  transport: { bg: '#F5EBD8', fg: '#0A0A0A' },
  savings: { bg: '#FFD93D', fg: '#0A0A0A' },
  fun: { bg: '#F4A0A0', fg: '#0A0A0A' },
  health: { bg: '#6BAE5C', fg: '#F5EBD8' },
  personal_care: { bg: '#D9344B', fg: '#F5EBD8' },
  'emergency-buffer': { bg: '#FFD93D', fg: '#0A0A0A' },
};

const STATUS_GLOW: Record<Color, string> = {
  green: '0 0 0 4px rgba(168,213,162,0.6), 4px 4px 0 #0A0A0A',
  amber: '0 0 0 4px rgba(255,217,61,0.6), 4px 4px 0 #0A0A0A',
  red: '0 0 0 4px rgba(217,52,75,0.6), 4px 4px 0 #0A0A0A',
};

interface Props {
  category: BudgetCategory | 'emergency-buffer';
  label: string;
  allocated: number;
  benchmark: number;
  color: Color;
  locked: boolean;
}

export function CategoryBucket({ category, label, allocated, benchmark, color, locked }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: category });
  const cc = CAT_COLOR[category] || { bg: '#F5EBD8', fg: '#0A0A0A' };

  return (
    <motion.div
      ref={setNodeRef}
      animate={color === 'red' ? { x: [0, -2, 2, -2, 2, 0] } : {}}
      transition={{ duration: 0.3 }}
      style={{
        background: cc.bg,
        color: cc.fg,
        border: '3px solid var(--paper-black)',
        boxShadow: STATUS_GLOW[color],
        padding: '14px 12px',
        position: 'relative',
        minHeight: 100,
        transform: `rotate(${(category.length % 3) - 1}deg) scale(${isOver ? 1.04 : 1})`,
        transition: 'transform 0.15s',
      }}
    >
      {/* Torn paper label on top */}
      <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%) rotate(-3deg)', background: 'var(--paper-cream)', color: 'var(--paper-black)', border: '2px solid var(--paper-black)', padding: '2px 10px', fontFamily: 'var(--font-marker)', fontSize: 12, letterSpacing: 1, boxShadow: '2px 2px 0 var(--paper-black)', whiteSpace: 'nowrap' }}>
        {label.toUpperCase()}
      </div>

      <div style={{ marginTop: 10, fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 700 }}>
        ${allocated.toLocaleString()}
      </div>
      <div style={{ fontFamily: 'var(--font-patrick)', fontSize: 13, opacity: 0.85 }}>
        / ${benchmark.toLocaleString()}
      </div>
      {locked && (
        <div style={{ position: 'absolute', top: 6, right: 6 }}>
          <Lock size={16} strokeWidth={3} />
        </div>
      )}
    </motion.div>
  );
}
