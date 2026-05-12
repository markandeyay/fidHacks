'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { seededTilt } from '@/lib/design/tilt';

type Variant = 'warning' | 'error' | 'info' | 'hydrating' | 'cost' | 'success';

interface WindowCardProps {
  children: ReactNode;
  title: string;
  variant?: Variant;
  onClose?: () => void;
  showControls?: boolean;
  tilt?: number;
  seed?: string;
  className?: string;
}

const VARIANT_COLORS: Record<Variant, { bar: string; barText: string }> = {
  warning:   { bar: '#F4A0A0', barText: '#0A0A0A' },
  error:     { bar: '#D9344B', barText: '#F5EBD8' },
  info:      { bar: '#A8D5A2', barText: '#0A0A0A' },
  hydrating: { bar: '#1F3FAF', barText: '#F5EBD8' },
  cost:      { bar: '#F4A0A0', barText: '#0A0A0A' },
  success:   { bar: '#FFD93D', barText: '#0A0A0A' },
};

export function WindowCard({
  children,
  title,
  variant = 'info',
  onClose,
  showControls = true,
  tilt,
  seed,
  className = '',
}: WindowCardProps) {
  const v = VARIANT_COLORS[variant];
  const rotation = tilt !== undefined ? tilt : seed ? seededTilt(seed, 2) : 0;

  return (
    <motion.div
      className={`relative ${className}`}
      style={{
        background: '#F5EBD8',
        border: '3px solid #0A0A0A',
        boxShadow: '5px 5px 0 #0A0A0A',
        transform: `rotate(${rotation}deg)`,
      }}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 220, damping: 18 }}
    >
      {/* Title bar */}
      <div
        style={{
          background: v.bar,
          color: v.barText,
          borderBottom: '3px solid #0A0A0A',
          padding: '6px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontFamily: 'var(--font-marker), Impact, sans-serif',
          fontSize: 14,
          letterSpacing: 1,
          textTransform: 'uppercase',
        }}
      >
        <span>{title}</span>
        {showControls && (
          <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
            <span
              aria-hidden
              style={{
                display: 'inline-block', width: 16, height: 16, borderRadius: '50%',
                border: '2px solid #0A0A0A', background: '#F5EBD8',
              }}
            />
            <button
              onClick={onClose}
              aria-label="close"
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 18, height: 18, border: '2px solid #0A0A0A',
                background: '#D9344B', color: '#F5EBD8',
                fontFamily: 'var(--font-marker), Impact, sans-serif', fontSize: 12,
                cursor: onClose ? 'pointer' : 'default', padding: 0, lineHeight: 1,
              }}
            >
              ✕
            </button>
          </span>
        )}
      </div>
      <div style={{ padding: 14, fontFamily: 'var(--font-patrick), cursive', fontSize: 16 }}>
        {children}
      </div>
    </motion.div>
  );
}
