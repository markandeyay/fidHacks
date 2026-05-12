import { GameId, Difficulty } from '@/types/game';

const FALLBACK_JSON_LOADERS: Record<GameId, () => Promise<Record<string, unknown[]>>> = {
  negotiation: () => import('@/data/scenarios/negotiation.json').then((m) => m.default),
  'offer-faceoff': () => import('@/data/scenarios/offer-faceoff.json').then((m) => m.default),
  'budget-blitz': () => import('@/data/scenarios/budget-blitz.json').then((m) => m.default),
  'side-hustle': () => import('@/data/scenarios/side-hustle.json').then((m) => m.default),
  market: () => import('@/data/scenarios/market.json').then((m) => m.default),
};

export async function loadScenario<T>(
  gameId: GameId,
  difficulty: Difficulty,
  hints?: Record<string, unknown>
): Promise<T> {
  try {
    const res = await fetch('/api/scenario/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId, difficulty, hints }),
    });
    const data = await res.json();
    return (data.scenario || data) as T;
  } catch {
    // Ultimate fallback: import static JSON directly
    const loader = FALLBACK_JSON_LOADERS[gameId];
    if (!loader) throw new Error(`No fallback loader for ${gameId}`);
    try {
      const json = await loader();
      const pool = json[difficulty] || Object.values(json)[0];
      const picked = Array.isArray(pool) ? pool[Math.floor(Math.random() * pool.length)] : pool;
      return picked as T;
    } catch {
      throw new Error(`Failed to load scenario for ${gameId}`);
    }
  }
}
