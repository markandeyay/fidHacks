'use client';

import { useEffect, useRef, ReactNode } from 'react';

interface Props {
  width: number;
  height: number;
  fill?: string;
  stroke?: string;
  fillStyle?: 'hachure' | 'solid' | 'cross-hatch' | 'zigzag';
  seed?: number;
  roughness?: number;
  children?: ReactNode;
  className?: string;
}

export function RoughBox({
  width, height, fill = '#FFD93D', stroke = '#0A0A0A', fillStyle = 'hachure', seed = 42, roughness = 1.5, children, className = '',
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const rough = (await import('roughjs')).default;
        if (!mounted || !svgRef.current) return;
        svgRef.current.innerHTML = '';
        const rc = rough.svg(svgRef.current);
        const node = rc.rectangle(5, 5, width - 10, height - 10, {
          fill, stroke, fillStyle, roughness, strokeWidth: 2.5, seed,
        });
        svgRef.current.appendChild(node);
      } catch {}
    })();
    return () => { mounted = false; };
  }, [width, height, fill, stroke, fillStyle, seed, roughness]);

  return (
    <div className={className} style={{ position: 'relative', width, height }}>
      <svg ref={svgRef} width={width} height={height} style={{ position: 'absolute', inset: 0 }} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {children}
      </div>
    </div>
  );
}
