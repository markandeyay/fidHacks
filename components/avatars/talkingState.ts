'use client';

import { useState, useEffect } from 'react';

let talking = false;
const listeners = new Set<(t: boolean) => void>();

export function startTalkingIndicator() {
  talking = true;
  listeners.forEach((l) => l(true));
}

export function stopTalkingIndicator() {
  talking = false;
  listeners.forEach((l) => l(false));
}

export function useTalking(): boolean {
  const [isTalking, setIsTalking] = useState(talking);
  useEffect(() => {
    const listener = (t: boolean) => setIsTalking(t);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);
  return isTalking;
}
