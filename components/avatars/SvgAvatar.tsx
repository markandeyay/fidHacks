'use client';

import { useEffect, useState, ReactNode } from 'react';
import { useTalking } from './talkingState';

export type Emotion = 'neutral' | 'leaning_in' | 'arms_crossed' | 'frozen' | 'impressed' | 'closing';
type HairStyle = 'sidepart' | 'messy' | 'ponytail' | 'curly' | 'slick';

interface Props {
  emotion?: Emotion;
  size?: number;
  skinTone?: string;
  shirtColor?: string;
  hairColor?: string;
  hairStyle?: HairStyle;
  accent?: ReactNode;
}

function Hair({ style, color }: { style: HairStyle; color: string }) {
  switch (style) {
    case 'sidepart':
      return (
        <g>
          <path d="M 50 80 Q 50 40 120 38 Q 190 40 190 80 L 50 80 Z" fill={color} stroke="#0A0A0A" strokeWidth="3" />
          <path d="M 100 60 L 80 40 L 140 36 L 130 56 Z" fill={color} stroke="#0A0A0A" strokeWidth="2.5" />
        </g>
      );
    case 'messy':
      return (
        <g>
          <path d="M 48 82 Q 60 30 120 32 Q 180 30 192 82 L 48 82 Z" fill={color} stroke="#0A0A0A" strokeWidth="3" />
          <polygon points="70,42 75,28 88,40" fill={color} stroke="#0A0A0A" strokeWidth="2.5" />
          <polygon points="120,30 130,18 140,32" fill={color} stroke="#0A0A0A" strokeWidth="2.5" />
          <polygon points="160,40 168,26 178,38" fill={color} stroke="#0A0A0A" strokeWidth="2.5" />
        </g>
      );
    case 'ponytail':
      return (
        <g>
          <path d="M 50 80 Q 50 38 120 38 Q 190 38 190 80 L 50 80 Z" fill={color} stroke="#0A0A0A" strokeWidth="3" />
          <ellipse cx="200" cy="100" rx="20" ry="36" fill={color} stroke="#0A0A0A" strokeWidth="3" transform="rotate(20 200 100)" />
        </g>
      );
    case 'curly':
      return (
        <g>
          <path d="M 46 84 Q 56 36 120 32 Q 184 36 194 84 L 46 84 Z" fill={color} stroke="#0A0A0A" strokeWidth="3" />
          <circle cx="70" cy="46" r="10" fill={color} stroke="#0A0A0A" strokeWidth="2.5" />
          <circle cx="100" cy="36" r="11" fill={color} stroke="#0A0A0A" strokeWidth="2.5" />
          <circle cx="140" cy="34" r="12" fill={color} stroke="#0A0A0A" strokeWidth="2.5" />
          <circle cx="170" cy="46" r="10" fill={color} stroke="#0A0A0A" strokeWidth="2.5" />
        </g>
      );
    case 'slick':
      return (
        <g>
          <path d="M 52 82 Q 52 56 120 54 Q 188 56 188 82 L 52 82 Z" fill={color} stroke="#0A0A0A" strokeWidth="3" />
          <path d="M 110 58 Q 130 38 150 54" fill="none" stroke="#0A0A0A" strokeWidth="2.5" />
        </g>
      );
  }
}

function EmotionEyes({ emotion }: { emotion: Emotion }) {
  switch (emotion) {
    case 'impressed':
      return (
        <g>
          {/* wide bright eyes */}
          <ellipse cx="98" cy="125" rx="22" ry="20" fill="none" stroke="#1F3FAF" strokeWidth="5" />
          <ellipse cx="142" cy="125" rx="22" ry="20" fill="none" stroke="#1F3FAF" strokeWidth="5" />
          <rect x="116" y="123" width="8" height="4" fill="#1F3FAF" />
          <ellipse cx="98" cy="125" rx="7" ry="11" fill="#FFD93D" />
          <ellipse cx="142" cy="125" rx="7" ry="11" fill="#FFD93D" />
          <circle cx="100" cy="123" r="2" fill="#F5EBD8" />
          <circle cx="144" cy="123" r="2" fill="#F5EBD8" />
        </g>
      );
    case 'frozen':
      return (
        <g>
          <ellipse cx="98" cy="125" rx="22" ry="18" fill="none" stroke="#1F3FAF" strokeWidth="5" />
          <ellipse cx="142" cy="125" rx="22" ry="18" fill="none" stroke="#1F3FAF" strokeWidth="5" />
          <rect x="116" y="122" width="8" height="5" fill="#1F3FAF" />
          <line x1="86" y1="125" x2="110" y2="125" stroke="#0A0A0A" strokeWidth="3.5" strokeLinecap="round" />
          <line x1="130" y1="125" x2="154" y2="125" stroke="#0A0A0A" strokeWidth="3.5" strokeLinecap="round" />
        </g>
      );
    case 'arms_crossed':
      return (
        <g transform="rotate(-3 120 125)">
          <ellipse cx="98" cy="125" rx="22" ry="14" fill="none" stroke="#1F3FAF" strokeWidth="5" />
          <ellipse cx="142" cy="125" rx="22" ry="14" fill="none" stroke="#1F3FAF" strokeWidth="5" />
          <rect x="116" y="122" width="8" height="4" fill="#1F3FAF" />
          <ellipse cx="98" cy="125" rx="5" ry="8" fill="#0A0A0A" />
          <ellipse cx="142" cy="125" rx="5" ry="8" fill="#0A0A0A" />
        </g>
      );
    case 'closing':
      return (
        <g>
          <ellipse cx="98" cy="125" rx="22" ry="18" fill="none" stroke="#1F3FAF" strokeWidth="5" />
          <ellipse cx="142" cy="125" rx="22" ry="18" fill="none" stroke="#1F3FAF" strokeWidth="5" />
          <rect x="116" y="122" width="8" height="5" fill="#1F3FAF" />
          <path d="M 88 130 Q 98 124 108 130" fill="none" stroke="#0A0A0A" strokeWidth="3" strokeLinecap="round" />
          <path d="M 132 130 Q 142 124 152 130" fill="none" stroke="#0A0A0A" strokeWidth="3" strokeLinecap="round" />
        </g>
      );
    case 'leaning_in':
      return (
        <g>
          <ellipse cx="98" cy="123" rx="22" ry="20" fill="none" stroke="#1F3FAF" strokeWidth="5" />
          <ellipse cx="142" cy="123" rx="22" ry="20" fill="none" stroke="#1F3FAF" strokeWidth="5" />
          <rect x="116" y="121" width="8" height="5" fill="#1F3FAF" />
          <ellipse cx="98" cy="123" rx="7" ry="11" fill="#FFD93D" />
          <ellipse cx="142" cy="123" rx="7" ry="11" fill="#FFD93D" />
          <ellipse cx="98" cy="123" rx="2.5" ry="9" fill="#0A0A0A" />
          <ellipse cx="142" cy="123" rx="2.5" ry="9" fill="#0A0A0A" />
        </g>
      );
    default: // neutral
      return (
        <g>
          <ellipse cx="98" cy="125" rx="22" ry="18" fill="none" stroke="#1F3FAF" strokeWidth="5" />
          <ellipse cx="142" cy="125" rx="22" ry="18" fill="none" stroke="#1F3FAF" strokeWidth="5" />
          <rect x="116" y="122" width="8" height="5" fill="#1F3FAF" />
          <ellipse cx="98" cy="125" rx="6" ry="10" fill="#FFD93D" />
          <ellipse cx="142" cy="125" rx="6" ry="10" fill="#FFD93D" />
          <ellipse cx="98" cy="125" rx="2" ry="8" fill="#0A0A0A" />
          <ellipse cx="142" cy="125" rx="2" ry="8" fill="#0A0A0A" />
        </g>
      );
  }
}

function EmotionMouth({ emotion, talking }: { emotion: Emotion; talking: boolean }) {
  if (talking) {
    return <ellipse cx="120" cy="172" rx="10" ry="6" fill="#0A0A0A" className="avatar-mouth talking" />;
  }
  switch (emotion) {
    case 'impressed':
      return <path d="M 100 168 Q 120 188 140 168" fill="none" stroke="#0A0A0A" strokeWidth="3.5" strokeLinecap="round" />;
    case 'leaning_in':
      return <path d="M 105 170 Q 120 178 135 170" fill="none" stroke="#0A0A0A" strokeWidth="3" strokeLinecap="round" />;
    case 'arms_crossed':
      return <line x1="108" y1="172" x2="132" y2="172" stroke="#0A0A0A" strokeWidth="3.5" strokeLinecap="round" />;
    case 'frozen':
      return <line x1="112" y1="172" x2="128" y2="172" stroke="#0A0A0A" strokeWidth="3" strokeLinecap="round" />;
    case 'closing':
      return <path d="M 105 175 Q 120 165 135 175" fill="none" stroke="#0A0A0A" strokeWidth="3" strokeLinecap="round" />;
    default:
      return <path d="M 108 170 Q 120 174 132 170" fill="none" stroke="#0A0A0A" strokeWidth="3" strokeLinecap="round" />;
  }
}

export function SvgAvatar({
  emotion = 'neutral',
  size = 180,
  skinTone = '#F5EBD8',
  shirtColor = '#1F3FAF',
  hairColor = '#0A0A0A',
  hairStyle = 'sidepart',
  accent,
}: Props) {
  const talking = useTalking();
  const aspect = 240 / 280;
  const width = size;
  const height = size / aspect;

  return (
    <svg width={width} height={height} viewBox="0 0 240 280" style={{ display: 'block' }}>
      {/* Tape strip on top of head */}
      <rect x="80" y="6" width="80" height="18" fill="#FFD93D" opacity="0.75" stroke="#0A0A0A" strokeWidth="1.5" transform="rotate(-4 120 15)" />

      {/* Head (skin) */}
      <ellipse cx="120" cy="130" rx="68" ry="62" fill={skinTone} stroke="#0A0A0A" strokeWidth="3" />

      {/* Hair layer */}
      <Hair style={hairStyle} color={hairColor} />

      {/* Glasses + eyes by emotion */}
      <EmotionEyes emotion={emotion} />

      {/* Nose */}
      <polygon points="115,150 125,150 120,158" fill="#F4A0A0" stroke="#0A0A0A" strokeWidth="1.5" />

      {/* Mouth */}
      <EmotionMouth emotion={emotion} talking={talking} />

      {/* Shoulders / shirt */}
      <rect x="60" y="200" width="120" height="80" fill={shirtColor} stroke="#0A0A0A" strokeWidth="3" />
      <rect x="60" y="200" width="120" height="14" fill="rgba(0,0,0,0.15)" />

      {/* Accent layer */}
      {accent}
    </svg>
  );
}
