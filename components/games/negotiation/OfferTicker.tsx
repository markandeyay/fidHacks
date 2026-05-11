'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, animate } from 'framer-motion';

interface OfferTickerProps {
  value: number;
}

export function OfferTicker({ value }: OfferTickerProps) {
  const [display, setDisplay] = useState(value);
  const [changed, setChanged] = useState(false);
  const prevRef = useRef(value);

  useEffect(() => {
    if (value === prevRef.current) return;
    prevRef.current = value;
    setChanged(true);
    const t = setTimeout(() => setChanged(false), 700);
    const controls = animate(display, value, {
      duration: 0.6,
      ease: 'easeOut',
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => { controls.stop(); clearTimeout(t); };
  }, [value, display]);

  const formatted = display < 1000
    ? `$${display.toFixed(2)}`
    : `$${display.toLocaleString()}`;

  return (
    <div className="text-center">
      <div className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">Current Offer</div>
      <motion.div
        animate={{ scale: changed ? 1.08 : 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
        className="text-3xl font-extrabold text-fid-green"
      >
        {formatted}
      </motion.div>
    </div>
  );
}
