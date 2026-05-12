'use client';

import { ReactNode, CSSProperties } from 'react';

type Color = 'cream' | 'yellow' | 'coral' | 'mint' | 'cobalt' | 'cherry' | 'teal';

const COLOR_MAP: Record<Color, { bg: string; fg: string }> = {
  cream: { bg: '#F5EBD8', fg: '#0A0A0A' },
  yellow: { bg: '#FFD93D', fg: '#0A0A0A' },
  coral: { bg: '#F4A0A0', fg: '#0A0A0A' },
  mint: { bg: '#A8D5A2', fg: '#0A0A0A' },
  cobalt: { bg: '#1F3FAF', fg: '#F5EBD8' },
  cherry: { bg: '#D9344B', fg: '#F5EBD8' },
  teal: { bg: '#1F8FA8', fg: '#F5EBD8' },
};

interface Props {
  children: ReactNode;
  color?: Color;
  className?: string;
  style?: CSSProperties;
}

export function TornBanner({ children, color = 'cream', className = '', style }: Props) {
  const c = COLOR_MAP[color];
  return (
    <div
      className={className}
      style={{
        background: c.bg,
        color: c.fg,
        borderTop: '3px solid #0A0A0A',
        borderBottom: '3px solid #0A0A0A',
        position: 'relative',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
