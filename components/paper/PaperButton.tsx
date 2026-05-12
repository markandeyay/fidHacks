'use client';

import { ButtonHTMLAttributes, ReactNode } from 'react';

type Color = 'yellow' | 'coral' | 'mint' | 'cobalt' | 'cherry' | 'cream';

const COLOR_MAP: Record<Color, { bg: string; fg: string }> = {
  yellow: { bg: '#FFD93D', fg: '#0A0A0A' },
  coral: { bg: '#F4A0A0', fg: '#0A0A0A' },
  mint: { bg: '#A8D5A2', fg: '#0A0A0A' },
  cobalt: { bg: '#1F3FAF', fg: '#F5EBD8' },
  cherry: { bg: '#D9344B', fg: '#F5EBD8' },
  cream: { bg: '#F5EBD8', fg: '#0A0A0A' },
};

interface Props extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color'> {
  children: ReactNode;
  color?: Color;
  size?: 'sm' | 'md' | 'lg';
}

export function PaperButton({ children, color = 'yellow', size = 'md', className = '', style, ...rest }: Props) {
  const c = COLOR_MAP[color];
  const padding = size === 'sm' ? '6px 14px' : size === 'lg' ? '14px 28px' : '10px 22px';
  const fs = size === 'sm' ? 13 : size === 'lg' ? 20 : 16;

  return (
    <button
      className={`paper-button ${className}`}
      style={{
        background: c.bg,
        color: c.fg,
        border: '3px solid #0A0A0A',
        padding,
        fontFamily: 'var(--font-marker), Impact, sans-serif',
        fontSize: fs,
        letterSpacing: 1,
        textTransform: 'uppercase',
        boxShadow: '4px 4px 0 #0A0A0A',
        cursor: rest.disabled ? 'not-allowed' : 'pointer',
        opacity: rest.disabled ? 0.55 : 1,
        transition: 'transform 0.12s, box-shadow 0.12s',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        ...style,
      }}
      onMouseDown={(e) => {
        if (!rest.disabled) {
          e.currentTarget.style.transform = 'translate(2px, 2px)';
          e.currentTarget.style.boxShadow = '0 0 0 #0A0A0A';
        }
      }}
      onMouseUp={(e) => {
        if (!rest.disabled) {
          e.currentTarget.style.transform = '';
          e.currentTarget.style.boxShadow = '4px 4px 0 #0A0A0A';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = '';
        e.currentTarget.style.boxShadow = '4px 4px 0 #0A0A0A';
      }}
      onMouseEnter={(e) => {
        if (!rest.disabled) {
          e.currentTarget.style.transform = 'translate(-2px, -2px) rotate(-1deg)';
          e.currentTarget.style.boxShadow = '7px 7px 0 #0A0A0A';
        }
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
