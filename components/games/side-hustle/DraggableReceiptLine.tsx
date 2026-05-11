'use client';

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { ReceiptLineItem } from '@/types/sideHustle';
import { ReceiptLine } from './ReceiptLine';
import { GripVertical } from 'lucide-react';

interface DraggableReceiptLineProps {
  item: ReceiptLineItem;
}

export function DraggableReceiptLine({ item }: DraggableReceiptLineProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
    data: { item },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : ('auto' as const),
  };

  return (
    <div ref={setNodeRef} style={style}>
      <ReceiptLine
        item={item}
        dragHandle={
          <div
            {...attributes}
            {...listeners}
            className="p-0.5 hover:bg-fid-green-light rounded cursor-grab active:cursor-grabbing select-none"
          >
            <GripVertical className="w-4 h-4 text-text-muted group-hover:text-fid-green transition-colors" />
          </div>
        }
      />
    </div>
  );
}
