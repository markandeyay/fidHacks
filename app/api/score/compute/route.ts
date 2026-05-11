import { NextResponse } from 'next/server';
import { GameId } from '@/types/game';
import { scoreNegotiation } from '@/lib/scoring/negotiation';
import { scoreOfferFaceoff } from '@/lib/scoring/compensation';
import { scoreBudgetBlitz } from '@/lib/scoring/budget';
import { scoreSideHustle } from '@/lib/scoring/sideHustle';
import { scoreMarket } from '@/lib/scoring/market';

const SCORERS: Record<GameId, (state: any) => any> = {
  negotiation: scoreNegotiation,
  'offer-faceoff': scoreOfferFaceoff,
  'budget-blitz': scoreBudgetBlitz,
  'side-hustle': scoreSideHustle,
  market: scoreMarket,
};

export async function POST(request: Request) {
  try {
    const { gameId, state } = (await request.json()) as { gameId: GameId; state: any };
    const scorer = SCORERS[gameId];
    if (!scorer) {
      return NextResponse.json({ error: 'Unknown game' }, { status: 400 });
    }
    const score = scorer(state);
    return NextResponse.json({ score });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
