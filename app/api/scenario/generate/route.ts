import { NextResponse } from 'next/server';
import { GameId, Difficulty } from '@/types/game';
import { callGemini } from '@/lib/ai/gemini';
import { PROMPT_BUILDERS } from '@/lib/ai/prompts';
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
    const { gameId, difficulty, hints } = (await request.json()) as {
      gameId: GameId;
      difficulty: Difficulty;
      hints?: Record<string, unknown>;
    };

    const schema = SCHEMA_MAP[gameId];
    if (!schema) {
      return NextResponse.json({ error: 'Unknown game' }, { status: 400 });
    }

    const builder = PROMPT_BUILDERS[gameId];
    if (!builder) {
      return NextResponse.json({ error: 'Unknown game' }, { status: 400 });
    }

    const { systemPrompt, userPrompt } = builder({ difficulty, hints });

    // Try AI generation
    try {
      const scenario = await callGemini({
        systemPrompt,
        userPrompt,
        schema: schema as any,
        temperature: 0.85,
      });

      // Strip any Gemini-provided top-level id and assign a fresh server-side id
      const generatedScenario = scenario as Record<string, unknown>;
      delete generatedScenario.id;
      generatedScenario.id = `gen-${gameId}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

      // For offer-faceoff, also regenerate ids inside offerA and offerB
      if (gameId === 'offer-faceoff') {
        const offerA = generatedScenario.offerA as Record<string, unknown> | undefined;
        const offerB = generatedScenario.offerB as Record<string, unknown> | undefined;
        if (offerA) {
          delete offerA.id;
          offerA.id = `gen-ofa-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
        }
        if (offerB) {
          delete offerB.id;
          offerB.id = `gen-ofb-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
        }
      }

      return NextResponse.json({ scenario: generatedScenario });
    } catch (err) {
      console.warn('AI scenario generation failed, falling back to static JSON:', err);

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
