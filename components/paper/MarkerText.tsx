'use client';

import { ReactNode, CSSProperties } from 'react';

type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';

const SIZE: Record<Size, number> = {
  xs: 12, sm: 16, md: 20, lg: 28, xl: 40, '2xl': 56, '3xl': 80,
};

interface Props {
  children: ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div';
  size?: Size;
  color?: string;
  wobble?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function MarkerText({
  children, as: As = 'span', size = 'md', color = '#0A0A0A', wobble = false, className = '', style,
}: Props) {
  return (
    <As
      className={className}
      style={{
        fontFamily: 'var(--font-marker), Impact, sans-serif',
        fontSize: SIZE[size],
        color,
        lineHeight: 1.1,
        letterSpacing: 0.5,
        filter: wobble ? 'url(#marker-wobble)' : undefined,
        ...style,
      }}
    >
      {children}
    </As>
  );
}
