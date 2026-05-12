'use client';

import { motion } from 'framer-motion';
import { CSSProperties } from 'react';

interface Props {
  size?: number;
  variant?: 1 | 2 | 3;
  animate?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function LightningStar({ size = 64, variant = 1, animate = true, className = '', style }: Props) {
  return (
    <motion.img
      src={`/textures/lightning-star-${variant}.svg`}
      alt=""
      width={size}
      height={size}
      className={className}
      style={style}
      animate={animate ? { scale: [1, 1.08, 1], rotate: [0, 3, -2, 0] } : undefined}
      transition={animate ? { duration: 2.8, repeat: Infinity, ease: 'easeInOut' } : undefined}
    />
  );
}
