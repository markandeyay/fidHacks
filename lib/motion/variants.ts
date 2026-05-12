import { Variants } from 'framer-motion';

export const paperDrop: Variants = {
  initial: { y: -60, opacity: 0, rotate: 0 },
  animate: (custom: number = 0) => ({
    y: 0,
    opacity: 1,
    rotate: custom,
    transition: { type: 'spring', stiffness: 200, damping: 18, delay: Math.random() * 0.12 },
  }),
};

export const liftTilt: Variants = {
  rest: { y: 0, rotate: 0 },
  hover: { y: -6, rotate: 1, transition: { duration: 0.18 } },
};

export const tapePeel: Variants = {
  rest: { rotate: 0, x: 0, opacity: 1 },
  exit: { rotate: 6, x: 20, opacity: 0 },
};

export const starPulse: Variants = {
  animate: {
    scale: [1, 1.08, 1],
    rotate: [0, 3, -2, 0],
    transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
  },
};

export const stickerEntrance: Variants = {
  initial: { scale: 0.5, opacity: 0, rotate: -8 },
  animate: { scale: 1, opacity: 1, rotate: -2, transition: { type: 'spring', stiffness: 240, damping: 14 } },
};
