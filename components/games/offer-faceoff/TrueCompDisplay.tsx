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
    <div className="flex items-center justify-between">
      <span className="text-xs font-medium text-text-muted">{label}</span>
      <span className="text-lg font-extrabold text-fid-green tracking-tight">
        {formattedValue}
      </span>
    </div>
  );
}
