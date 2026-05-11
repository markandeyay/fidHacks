import { GameId, PlayerSession, Score } from '@/types/game';

const NAMESPACE = 'forte:v1:';

function safeGet<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(NAMESPACE + key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function safeSet(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(NAMESPACE + key, JSON.stringify(value));
  } catch {
    // Storage full or disabled
  }
}

export const storage = {
  getSession: (): PlayerSession | null => safeGet<PlayerSession>('session'),
  setSession: (s: PlayerSession) => safeSet('session', s),
  appendScore: (score: Score) => {
    const session = storage.getSession();
    if (!session) return;
    session.scores.push(score);
    storage.setSession(session);
  },
  clear: () => {
    if (typeof window === 'undefined') return;
    Object.keys(localStorage)
      .filter((k) => k.startsWith(NAMESPACE))
      .forEach((k) => localStorage.removeItem(k));
  },
  saveGameState: <T>(gameId: GameId, state: T) => safeSet(`game:${gameId}`, state),
  loadGameState: <T>(gameId: GameId): T | null => safeGet<T>(`game:${gameId}`),
};
