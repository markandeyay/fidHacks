'use client';

import { useDraggable } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import { IncomeTile as IncomeTileType } from '@/types/budget';
import { seededTilt } from '@/lib/design/tilt';

function Bill({ tile }: { tile: IncomeTileType }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: tile.id });
  const style: React.CSSProperties = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0) rotate(${seededTilt(tile.id, 4)}deg)` : `rotate(${seededTilt(tile.id, 4)}deg)`,
    background: 'var(--paper-mint)',
    border: '3px solid var(--paper-black)',
    boxShadow: isDragging ? '6px 6px 0 var(--paper-black)' : '3px 3px 0 var(--paper-black)',
    padding: '10px 16px',
    cursor: 'grab',
    minWidth: 72,
    textAlign: 'center',
    color: 'var(--paper-black)',
    fontFamily: 'var(--font-mono), monospace',
    fontWeight: 700,
    fontSize: 18,
    userSelect: 'none',
    opacity: isDragging ? 0.7 : 1,
    touchAction: 'none',
  };
  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      ${tile.value}
    </div>
  );
}

interface Props { tiles: IncomeTileType[] }

export function IncomeStack({ tiles }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'var(--paper-cream)',
        border: '3px solid var(--paper-black)',
        boxShadow: '4px 4px 0 var(--paper-black)',
        padding: 14,
        display: 'flex',
        flexWrap: 'wrap',
        gap: 10,
        minHeight: 90,
        transform: 'rotate(-0.5deg)',
      }}
    >
      <div style={{ width: '100%', fontFamily: 'var(--font-marker)', fontSize: 16, marginBottom: 4 }}>
        INCOME — DRAG INTO BUCKETS
      </div>
      {tiles.length === 0 ? (
        <div style={{ fontFamily: 'var(--font-patrick)', fontSize: 16, opacity: 0.6 }}>All allocated.</div>
      ) : (
        tiles.map((t) => <Bill key={t.id} tile={t} />)
      )}
    </motion.div>
  );
}
