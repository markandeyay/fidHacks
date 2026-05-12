'use client';

import { ReactNode, CSSProperties } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { seededTilt } from '@/lib/design/tilt';
import { TapeStrip } from './TapeStrip';

type PaperColor = 'cream' | 'yellow' | 'coral' | 'mint' | 'cobalt' | 'cherry' | 'teal' | 'black' | 'white';

interface PaperCardProps extends Omit<HTMLMotionProps<'div'>, 'color'> {
  children: ReactNode;
  color?: PaperColor;
  tilt?: number;
  seed?: string;
  tape?: 'tl' | 'tr' | 'tc' | 'bl' | 'br' | 'none';
  tapeColor?: 'yellow' | 'cream' | 'coral';
  grainy?: boolean;
  hover?: boolean;
  className?: string;
  style?: CSSProperties;
}

const COLOR_MAP: Record<PaperColor, { bg: string; fg: string }> = {
  cream: { bg: '#F5EBD8', fg: '#0A0A0A' },
  yellow: { bg: '#FFD93D', fg: '#0A0A0A' },
  coral: { bg: '#F4A0A0', fg: '#0A0A0A' },
  mint: { bg: '#A8D5A2', fg: '#0A0A0A' },
  cobalt: { bg: '#1F3FAF', fg: '#F5EBD8' },
  cherry: { bg: '#D9344B', fg: '#F5EBD8' },
  teal: { bg: '#1F8FA8', fg: '#F5EBD8' },
  black: { bg: '#0A0A0A', fg: '#F5EBD8' },
  white: { bg: '#FFFFFF', fg: '#0A0A0A' },
};

export function PaperCard({
  children,
  color = 'cream',
  tilt,
  seed,
  tape = 'none',
  tapeColor = 'yellow',
  grainy = true,
  hover = true,
  className = '',
  style,
  ...rest
}: PaperCardProps) {
  const c = COLOR_MAP[color];
  const rotation = tilt !== undefined ? tilt : seed ? seededTilt(seed, 2) : 0;

  return (
    <motion.div
      className={`relative ${className}`}
      style={{
        background: c.bg,
        color: c.fg,
        border: '3px solid #0A0A0A',
        boxShadow: '4px 4px 0 rgba(10,10,10,0.85)',
        transform: `rotate(${rotation}deg)`,
        ...style,
      }}
      whileHover={hover ? { y: -4, rotate: rotation + 0.5, boxShadow: '7px 7px 0 rgba(10,10,10,0.85)' } : undefined}
      transition={{ type: 'spring', stiffness: 200, damping: 18 }}
      {...rest}
    >
      {grainy && (
        <div
          aria-hidden
          style={{
            position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.35, mixBlendMode: 'multiply',
            backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.18 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
          }}
        />
      )}
      {tape !== 'none' && <TapeStrip position={tape} color={tapeColor} />}
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </motion.div>
  );
}
