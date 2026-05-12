import { Score } from '@/types/game';

export const JUDGE_SEED_SCORES: Omit<Score, 'sessionId'>[] = [
  { gameId: 'negotiation', difficulty: 'junior', total: 84, breakdown: { outcome: 32, moves: 28, composure: 24 }, playedAt: Date.now() - 100000, durationMs: 120000 },
  { gameId: 'offer-faceoff', difficulty: 'junior', total: 76, breakdown: { conversion: 38, pick: 30, speed: 8 }, playedAt: Date.now() - 200000, durationMs: 180000 },
  { gameId: 'budget-blitz', difficulty: 'junior', total: 72, breakdown: { allocation: 30, chaos: 25, buffer: 17 }, playedAt: Date.now() - 300000, durationMs: 90000 },
  { gameId: 'side-hustle', difficulty: 'junior', total: 81, breakdown: { buckets: 48, tax: 33 }, playedAt: Date.now() - 400000, durationMs: 150000 },
  { gameId: 'market', difficulty: 'junior', total: 79, breakdown: { finalValue: 35, holdRate: 24, decisions: 20 }, playedAt: Date.now() - 500000, durationMs: 180000 },
];
