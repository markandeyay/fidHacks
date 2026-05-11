import { NextResponse } from 'next/server';
import { GameId, Difficulty } from '@/types/game';
import { callGemini } from '@/lib/ai/gemini';
import {
  NegotiationScenarioSchema,
  OfferFaceoffScenarioSchema,
  BudgetBlitzScenarioSchema,
  SideHustleScenarioSchema,
  MarketScenarioSchema,
} from '@/lib/ai/schemas';
import negotiationData from '@/data/scenarios/negotiation.json';
import offerFaceoffData from '@/data/scenarios/offer-faceoff.json';
import budgetBlitzData from '@/data/scenarios/budget-blitz.json';
import sideHustleData from '@/data/scenarios/side-hustle.json';
import marketData from '@/data/scenarios/market.json';

const SCHEMA_MAP: Record<GameId, unknown> = {
  negotiation: NegotiationScenarioSchema,
  'offer-faceoff': OfferFaceoffScenarioSchema,
  'budget-blitz': BudgetBlitzScenarioSchema,
  'side-hustle': SideHustleScenarioSchema,
  market: MarketScenarioSchema,
};

const FALLBACK_MAP: Record<GameId, Record<string, unknown[]>> = {
  negotiation: negotiationData,
  'offer-faceoff': offerFaceoffData,
  'budget-blitz': budgetBlitzData,
  'side-hustle': sideHustleData,
  market: marketData,
};

export async function POST(request: Request) {
  try {
    const { gameId, difficulty } = (await request.json()) as {
      gameId: GameId;
      difficulty: Difficulty;
    };

    const schema = SCHEMA_MAP[gameId];
    if (!schema) {
      return NextResponse.json({ error: 'Unknown game' }, { status: 400 });
    }

    // Try AI generation
    try {
      const scenario = await callGemini({
        systemPrompt: `You are a scenario generator for a financial literacy game called Forte. Generate a realistic, detailed scenario for the ${gameId} game at ${difficulty} difficulty. Output valid JSON matching the expected schema.`,
        userPrompt: `Generate a ${difficulty} difficulty scenario for ${gameId}. Make it realistic and detailed.`,
        schema: schema as any,
        temperature: 0.9,
      });

      return NextResponse.json({ scenario });
    } catch {
      // Fallback to static data
      const fallback = FALLBACK_MAP[gameId];
      if (!fallback) {
        return NextResponse.json({ error: 'Failed to generate scenario' }, { status: 500 });
      }

      const pool = (fallback as Record<string, unknown[]>)[difficulty] || Object.values(fallback)[0];
      const picked = Array.isArray(pool) ? pool[Math.floor(Math.random() * pool.length)] : pool;
      return NextResponse.json({ fallback: true, scenario: picked });
    }
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
