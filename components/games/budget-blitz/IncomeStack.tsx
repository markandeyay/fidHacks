'use client';

import { useDraggable } from '@dnd-kit/core';
import { IncomeTile as IncomeTileType } from '@/types/budget';
import { DollarSign } from 'lucide-react';

interface DraggableTileProps {
  tile: IncomeTileType;
}

function DraggableTile({ tile }: DraggableTileProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: tile.id,
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`card px-4 py-2.5 cursor-grab active:cursor-grabbing select-none transition-all ${
        isDragging
          ? 'opacity-30 scale-95'
          : 'hover:border-fid-green hover:shadow-md'
      }`}
    >
      <div className="flex items-center gap-1.5">
        <DollarSign className="w-3.5 h-3.5 text-fid-green" />
        <span className="text-sm font-semibold text-text-heading">
          {tile.value.toLocaleString()}
        </span>
      </div>
    </div>
  );
}

interface IncomeStackProps {
  tiles: IncomeTileType[];
}

export function IncomeStack({ tiles }: IncomeStackProps) {
  return (
    <div className="card p-5 min-h-[5rem]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-fid-green-light flex items-center justify-center">
            <DollarSign className="w-3.5 h-3.5 text-fid-green" />
          </div>
          <span className="text-sm font-semibold text-text-heading">
            Income Stack
          </span>
        </div>
        <span className="badge badge-blue text-xs">
          {tiles.length} tile{tiles.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {tiles.length === 0 ? (
          <p className="text-sm text-text-muted py-2">
            All tiles placed
          </p>
        ) : (
          tiles.map((tile, index) => (
            <div
              key={tile.id}
              className="relative animate-fade-in"
              style={{
                zIndex: tiles.length - index,
                animationDelay: `${index * 30}ms`,
              }}
            >
              <DraggableTile tile={tile} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
