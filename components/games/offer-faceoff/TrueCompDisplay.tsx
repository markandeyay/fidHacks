'use client';

import { useEffect, useState, useRef } from 'react';
import { animate } from 'framer-motion';

interface TrueCompDisplayProps {
  total: number;
  label?: string;
}

export function TrueCompDisplay({ total, label = 'Total Compensation' }: TrueCompDisplayProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const prevTotalRef = useRef(total);

  useEffect(() => {
    const from = prevTotalRef.current;
    const controls = animate(from, total, {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
      onUpdate: (value) => setDisplayValue(value),
    });
    prevTotalRef.current = total;
    return () => controls.stop();
  }, [total]);

  const formattedValue = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(displayValue);

  return (
    <div
      style={{
        background: 'var(--paper-yellow)',
        border: '3px solid var(--paper-black)',
        boxShadow: '4px 4px 0 var(--paper-black)',
        padding: 14,
        textAlign: 'center',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-marker), Impact, sans-serif',
          fontSize: 14,
          letterSpacing: 1,
          textTransform: 'uppercase',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: 'var(--font-mono), monospace',
          fontSize: 28,
          fontWeight: 700,
          marginTop: 4,
        }}
      >
        {formattedValue}
      </div>
    </div>
  );
}
