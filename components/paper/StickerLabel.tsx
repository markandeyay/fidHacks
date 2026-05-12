'use client';

import { ReactNode } from 'react';

type StickerColor = 'cream' | 'yellow' | 'coral' | 'mint' | 'cobalt' | 'cherry';
type Size = 'sm' | 'md' | 'lg';

const COLOR_MAP: Record<StickerColor, { bg: string; fg: string }> = {
  cream: { bg: '#F5EBD8', fg: '#0A0A0A' },
  yellow: { bg: '#FFD93D', fg: '#0A0A0A' },
  coral: { bg: '#F4A0A0', fg: '#0A0A0A' },
  mint: { bg: '#A8D5A2', fg: '#0A0A0A' },
  cobalt: { bg: '#1F3FAF', fg: '#F5EBD8' },
  cherry: { bg: '#D9344B', fg: '#F5EBD8' },
};

const SIZE_MAP: Record<Size, { padX: number; padY: number; fs: number }> = {
  sm: { padX: 8, padY: 3, fs: 11 },
  md: { padX: 12, padY: 5, fs: 14 },
  lg: { padX: 18, padY: 8, fs: 18 },
};

interface Props {
  children: ReactNode;
  color?: StickerColor;
  size?: Size;
  tilt?: number;
  className?: string;
}

export function StickerLabel({ children, color = 'cream', size = 'md', tilt = -1.5, className = '' }: Props) {
  const c = COLOR_MAP[color];
  const s = SIZE_MAP[size];
  return (
    <span
      className={className}
      style={{
        display: 'inline-block',
        background: c.bg,
        color: c.fg,
        border: '2px solid #0A0A0A',
        padding: `${s.padY}px ${s.padX}px`,
        fontFamily: 'var(--font-marker), Impact, sans-serif',
        fontSize: s.fs,
        letterSpacing: 1,
        textTransform: 'uppercase',
        boxShadow: '2px 2px 0 #0A0A0A',
        transform: `rotate(${tilt}deg)`,
        lineHeight: 1.2,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  );
}
