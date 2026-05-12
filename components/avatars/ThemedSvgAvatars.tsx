'use client';

import { SvgAvatar, Emotion } from './SvgAvatar';

interface Props { emotion?: Emotion; size?: number; }

function Tie() {
  return (
    <g>
      <polygon points="116,214 124,214 128,232 112,232" fill="#D9344B" stroke="#0A0A0A" strokeWidth="2" />
      <polygon points="118,232 122,232 124,252 116,252" fill="#D9344B" stroke="#0A0A0A" strokeWidth="2" />
    </g>
  );
}

function CalcAccent() {
  return (
    <g>
      <rect x="158" y="218" width="22" height="28" fill="#FFD93D" stroke="#0A0A0A" strokeWidth="2" transform="rotate(8 169 232)" />
      <text x="169" y="240" textAnchor="middle" fontFamily="Impact, sans-serif" fontSize="12" fill="#0A0A0A" transform="rotate(8 169 240)">$$$</text>
    </g>
  );
}

function PencilAccent() {
  return (
    <g>
      <rect x="170" y="60" width="6" height="40" fill="#FFD93D" stroke="#0A0A0A" strokeWidth="2" transform="rotate(35 173 80)" />
      <polygon points="172,98 176,98 174,108" fill="#0A0A0A" transform="rotate(35 173 80)" />
    </g>
  );
}

function ChartIcon() {
  return (
    <g>
      <rect x="162" y="218" width="22" height="22" fill="#F5EBD8" stroke="#0A0A0A" strokeWidth="2" transform="rotate(-6 173 229)" />
      <polyline points="166,236 170,228 174,232 180,222" fill="none" stroke="#6BAE5C" strokeWidth="2" transform="rotate(-6 173 229)" />
    </g>
  );
}

export function NegotiationAvatar({ emotion, size }: Props) {
  return <SvgAvatar emotion={emotion} size={size} shirtColor="#1F3FAF" hairColor="#3D2B1F" hairStyle="slick" accent={<Tie />} />;
}
export function OfferFaceoffAvatar({ emotion, size }: Props) {
  return <SvgAvatar emotion={emotion} size={size} shirtColor="#D9344B" hairColor="#2A1810" hairStyle="ponytail" />;
}
export function BudgetBlitzAvatar({ emotion, size }: Props) {
  return <SvgAvatar emotion={emotion} size={size} shirtColor="#FFD93D" hairColor="#4A2C1B" hairStyle="messy" accent={<CalcAccent />} />;
}
export function SideHustleAvatar({ emotion, size }: Props) {
  return <SvgAvatar emotion={emotion} size={size} shirtColor="#F4A0A0" hairColor="#3D2B1F" hairStyle="curly" accent={<PencilAccent />} />;
}
export function MarketAvatar({ emotion, size }: Props) {
  return <SvgAvatar emotion={emotion} size={size} shirtColor="#6BAE5C" hairColor="#2A1810" hairStyle="sidepart" accent={<ChartIcon />} />;
}
