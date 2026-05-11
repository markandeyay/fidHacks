import { create } from 'zustand';
import { PlayerSession, Score } from '@/types/game';
import { storage } from '@/lib/persistence/localStorage';

interface SessionState {
  session: PlayerSession | null;
  init: () => void;
  addScore: (score: Score) => void;
  setDisplayName: (name: string) => void;
}

function createSession(): PlayerSession {
  return {
    sessionId: crypto.randomUUID?.() || Math.random().toString(36).slice(2),
    createdAt: Date.now(),
    scores: [],
  };
}

export const useSessionStore = create<SessionState>((set, get) => ({
  session: null,
  init: () => {
    let session = storage.getSession();
    if (!session) {
      session = createSession();
      storage.setSession(session);
    }
    set({ session });
  },
  addScore: (score) => {
    const { session } = get();
    if (!session) return;
    const updated = { ...session, scores: [...session.scores, score] };
    storage.setSession(updated);
    set({ session: updated });
  },
  setDisplayName: (name) => {
    const { session } = get();
    if (!session) return;
    const updated = { ...session, displayName: name };
    storage.setSession(updated);
    set({ session: updated });
  },
}));
