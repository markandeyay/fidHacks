'use client';

import { useDroppable } from '@dnd-kit/core';
import { LineItemBucket } from '@/types/sideHustle';
import { BucketTray } from './BucketTray';

interface DroppableBucketTrayProps {
  bucket: LineItemBucket;
  count: number;
  children?: React.ReactNode;
}

export function DroppableBucketTray({ bucket, count, children }: DroppableBucketTrayProps) {
  const { setNodeRef, isOver } = useDroppable({ id: bucket, data: { bucket } });

  return (
    <div
      ref={setNodeRef}
      className={`transition-all rounded-lg ${
        isOver ? 'ring-2 ring-fid-green/60 ring-offset-2' : ''
      }`}
    >
      <BucketTray bucket={bucket} count={count} isOver={isOver}>
        {children}
      </BucketTray>
    </div>
  );
}
