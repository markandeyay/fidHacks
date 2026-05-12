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
    <div ref={setNodeRef} style={{ transition: 'all 0.15s' }}>
      <BucketTray bucket={bucket} count={count} isOver={isOver}>
        {children}
      </BucketTray>
    </div>
  );
}
