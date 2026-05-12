'use client';

import { motion } from 'framer-motion';
import { CSSProperties } from 'react';

export type ForteCatEmotion = 'idle' | 'happy' | 'surprised' | 'alert' | 'money' | 'sleepy';

interface Props {
  emotion?: ForteCatEmotion;
  size?: number;
  animate?: boolean;
  className?: string;
  style?: CSSProperties;
  alt?: string;
}

export function ForteCat({
  emotion = 'idle',
  size = 96,
  animate = true,
  className = '',
  style,
  alt = 'Forte cat mascot',
}: Props) {
  const src = `/mascot/forte-cat-${emotion}.svg`;
  const aspect = 240 / 280; // width/height ratio
  const width = size;
  const height = size / aspect;

  return (
    <motion.img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      style={style}
      animate={animate ? { y: [0, -3, 0, -2, 0] } : undefined}
      transition={animate ? { duration: 3.5, repeat: Infinity, ease: 'easeInOut' } : undefined}
      draggable={false}
    />
  );
}
