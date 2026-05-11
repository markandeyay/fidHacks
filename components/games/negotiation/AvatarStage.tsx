'use client';

import { useEffect, useRef } from 'react';
import { AvatarEmotion } from '@/types/negotiation';

interface AvatarStageProps {
  emotion: AvatarEmotion;
  size?: number;
}

export function AvatarStage({ emotion, size = 140 }: AvatarStageProps) {
  const leftEyeRef = useRef<SVGCircleElement>(null);
  const rightEyeRef = useRef<SVGCircleElement>(null);
  const leftBrowRef = useRef<SVGLineElement>(null);
  const rightBrowRef = useRef<SVGLineElement>(null);
  const mouthRef = useRef<SVGPathElement>(null);
  const faceRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const anims: Animation[] = [];
    const eye = (ref: SVGCircleElement | null, ry: number) => {
      if (!ref) return;
      anims.push(ref.animate([{ ry: `${ry}px` }], { duration: 400, fill: 'forwards', easing: 'ease-out' }));
    };
    const brow = (ref: SVGLineElement | null, y1: number, y2: number, angle: number) => {
      if (!ref) return;
      const cx = ref === leftBrowRef.current ? 82 : 118;
      const len = 18;
      const rad = (angle * Math.PI) / 180;
      anims.push(ref.animate([
        { x1: `${cx - len * Math.cos(rad)}px`, y1: `${y1 - len * Math.sin(rad)}px`, x2: `${cx + len * Math.cos(rad)}px`, y2: `${y2 + len * Math.sin(rad)}px` }
      ], { duration: 400, fill: 'forwards', easing: 'ease-out' }));
    };
    const mouth = (d: string) => {
      if (!mouthRef.current) return;
      anims.push(mouthRef.current.animate([{ d }], { duration: 400, fill: 'forwards', easing: 'ease-out' }));
    };
    const glow = (color: string) => {
      if (!faceRef.current) return;
      const circle = faceRef.current.querySelector('ellipse');
      if (!circle) return;
      anims.push(circle.animate([
        { stroke: color, filter: color !== 'none' ? `drop-shadow(0 0 6px ${color})` : 'none' }
      ], { duration: 600, fill: 'forwards', easing: 'ease-out' }));
    };

    switch (emotion) {
      case 'neutral': eye(leftEyeRef.current, 6); eye(rightEyeRef.current, 6); brow(leftBrowRef.current, 72, 72, 0); brow(rightBrowRef.current, 72, 72, 0); mouth('M 88 112 Q 100 116 112 112'); glow('none'); break;
      case 'leaning_in': eye(leftEyeRef.current, 8); eye(rightEyeRef.current, 8); brow(leftBrowRef.current, 70, 70, 0); brow(rightBrowRef.current, 68, 68, 0); mouth('M 88 114 Q 100 110 112 114'); glow('#009A44'); break;
      case 'arms_crossed': eye(leftEyeRef.current, 4); eye(rightEyeRef.current, 4); brow(leftBrowRef.current, 68, 68, -8); brow(rightBrowRef.current, 68, 68, 8); mouth('M 92 114 L 108 114'); glow('#D97706'); break;
      case 'frozen': eye(leftEyeRef.current, 9); eye(rightEyeRef.current, 9); brow(leftBrowRef.current, 68, 68, -6); brow(rightBrowRef.current, 66, 66, 6); mouth('M 92 116 Q 100 108 108 116'); glow('#2563EB');
        if (faceRef.current) { const c = faceRef.current.querySelector('ellipse'); if (c) anims.push(c.animate([{ filter: 'drop-shadow(0 0 4px #2563EB)' }, { filter: 'drop-shadow(0 0 14px #2563EB)' }, { filter: 'drop-shadow(0 0 4px #2563EB)' }], { duration: 1500, iterations: Infinity, easing: 'ease-in-out' })); } break;
      case 'impressed': eye(leftEyeRef.current, 9); eye(rightEyeRef.current, 9); brow(leftBrowRef.current, 66, 66, -2); brow(rightBrowRef.current, 64, 64, 2); mouth('M 88 110 Q 100 108 112 110 Q 100 120 88 110'); glow('#7C3AED'); break;
      case 'closing': eye(leftEyeRef.current, 3); eye(rightEyeRef.current, 3); brow(leftBrowRef.current, 70, 70, -8); brow(rightBrowRef.current, 70, 70, 8); mouth('M 92 116 L 108 116'); glow('#DC2626'); break;
    }
    return () => anims.forEach((a) => a.cancel());
  }, [emotion]);

  const s = size / 200;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} viewBox="0 0 200 200">
        <defs>
          <radialGradient id="faceGrad" cx="50%" cy="40%" r="50%">
            <stop offset="0%" stopColor="#FEFDF8" />
            <stop offset="100%" stopColor="#F0EBD8" />
          </radialGradient>
          <filter id="sofShadow"><feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#000" floodOpacity="0.08" /></filter>
        </defs>

        <g ref={faceRef}>
          <ellipse cx="100" cy="90" rx="70" ry="76" fill="url(#faceGrad)" stroke="#E2E0D5" strokeWidth="2" filter="url(#sofShadow)" />
          {/* Hair */}
          <path d="M 34 90 Q 32 42 100 20 Q 168 42 166 90" fill="#2D2A24" stroke="#2D2A24" strokeWidth="1" />
          {/* Eyes */}
          <ellipse cx="80" cy="82" rx="13" ry="5" fill="white" stroke="#D1CEC0" strokeWidth="1" />
          <circle ref={leftEyeRef} cx="80" cy="82" r="6" fill="#1A1A1A" />
          <ellipse cx="120" cy="82" rx="13" ry="5" fill="white" stroke="#D1CEC0" strokeWidth="1" />
          <circle ref={rightEyeRef} cx="120" cy="82" r="6" fill="#1A1A1A" />
          {/* Eyebrows */}
          <line ref={leftBrowRef} x1="66" y1="72" x2="94" y2="72" stroke="#5C5545" strokeWidth="2.5" strokeLinecap="round" />
          <line ref={rightBrowRef} x1="106" y1="72" x2="134" y2="72" stroke="#5C5545" strokeWidth="2.5" strokeLinecap="round" />
          {/* Nose */}
          <path d="M 100 86 L 97 108 L 103 108 Z" fill="#E8E4D5" stroke="#D1CEC0" strokeWidth="1" opacity="0.7" />
          {/* Mouth */}
          <path ref={mouthRef} d="M 88 112 Q 100 116 112 112" fill="none" stroke="#5C5545" strokeWidth="2" strokeLinecap="round" />
        </g>
        {/* Shirt */}
        <path d="M 60 153 L 100 136 L 140 153 L 140 200 L 60 200 Z" fill="#009A44" stroke="#008A3D" strokeWidth="1" />
        <path d="M 100 136 L 82 200 M 100 136 L 118 200" fill="none" stroke="#008A3D" strokeWidth="1" />
        <polygon points="96,136 104,136 104,168 100,176 96,168" fill="#007A35" stroke="#008A3D" strokeWidth="1" />
      </svg>
    </div>
  );
}
