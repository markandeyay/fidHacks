'use client';

type Pos = 'tl' | 'tr' | 'tc' | 'bl' | 'br' | 'bc';
type Color = 'yellow' | 'cream' | 'coral';

interface Props {
  position: Pos;
  color?: Color;
  width?: number;
  rotation?: number;
}

const POS_STYLE: Record<Pos, React.CSSProperties> = {
  tl: { top: -10, left: 10 },
  tr: { top: -10, right: 10 },
  tc: { top: -10, left: '50%', transform: 'translateX(-50%)' },
  bl: { bottom: -10, left: 10 },
  br: { bottom: -10, right: 10 },
  bc: { bottom: -10, left: '50%', transform: 'translateX(-50%)' },
};

export function TapeStrip({ position, color = 'yellow', width = 80, rotation }: Props) {
  const defaultRot = position === 'tl' || position === 'bl' ? -8 : position === 'tr' || position === 'br' ? 8 : -3;
  const r = rotation ?? defaultRot;
  const base = POS_STYLE[position];
  return (
    <img
      src={`/textures/tape-${color}.svg`}
      alt=""
      style={{
        position: 'absolute',
        width,
        height: 20,
        zIndex: 5,
        ...base,
        transform: `${base.transform ?? ''} rotate(${r}deg)`,
        pointerEvents: 'none',
      }}
    />
  );
}
