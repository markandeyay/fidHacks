export type GameId =
  | 'negotiation'
  | 'offer-faceoff'
  | 'budget-blitz'
  | 'side-hustle'
  | 'market';

export type Difficulty = 'freshman' | 'sophomore' | 'junior' | 'senior';

export interface Score {
  gameId: GameId;
  difficulty: Difficulty;
  total: number;          // 0-100
  breakdown: Record<string, number>;
  playedAt: number;       // epoch ms
  durationMs: number;
  sessionId: string;
}

export interface PlayerSession {
  sessionId: string;      // uuid, persisted in localStorage
  createdAt: number;
  displayName?: string;
  scores: Score[];
}
