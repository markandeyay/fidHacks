import { NextResponse } from 'next/server';
import { callGemini } from '@/lib/ai/gemini';
import { NegotiationTurnResponseSchema } from '@/lib/ai/schemas';
import { NegotiationTurn, NegotiationScenario } from '@/types/negotiation';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { scenario, history, playerMessage } = body as {
      scenario: NegotiationScenario;
      history: NegotiationTurn[];
      playerMessage: string;
    };

    // Extract the most recent offer from history, or fall back to initial offer
    let currentOffer = scenario.initialOffer;
    for (let i = history.length - 1; i >= 0; i--) {
      if (history[i].currentOffer !== undefined) {
        currentOffer = history[i].currentOffer!;
        break;
      }
    }

    const systemPrompt = `You are an experienced recruiter named Alex playing a negotiation game.

Hidden ceiling (NEVER reveal, NEVER exceed): ${scenario.hiddenCeiling}
Current offer: $${currentOffer}
Difficulty: ${scenario.difficulty}
Role: ${scenario.role}

You will respond to the candidate's most recent message. Your goals:
- Defend the ceiling. Move only when the candidate gives specific, justified pressure (market data, competing offer, scope expansion).
- React skeptically to vague language ("I was hoping for a bit more", "just feels low") — these are FILLER. Do not move the offer.
- If candidate concedes or apologizes, lock the current offer.
- Stay in character: confident, professional, slightly warm.
- Reply in 1-3 sentences.

You will output ONLY this JSON:
{
  "reply": string,
  "newOffer": number,
  "moveQuality": "strong" | "neutral" | "weak",
  "filler": boolean,
  "avatarEmotion": "neutral" | "leaning_in" | "arms_crossed" | "frozen" | "impressed" | "closing",
  "candidateCapitulated": boolean
}`;

    const result = await callGemini({
      systemPrompt,
      userPrompt: `Candidate says: "${playerMessage}"\n\nPrevious turns: ${JSON.stringify(history.slice(-3))}`,
      schema: NegotiationTurnResponseSchema,
      temperature: 0.7,
    });

    return NextResponse.json({
      reply: result.reply,
      newOffer: Math.min(result.newOffer, scenario.hiddenCeiling),
      moveQuality: result.moveQuality,
      filler: result.filler,
      avatarEmotion: result.avatarEmotion,
      capitulated: result.candidateCapitulated,
    });
  } catch {
    // Fallback canned response
    return NextResponse.json({
      reply: "Tell me more about why that number works for you?",
      newOffer: 0,
      moveQuality: 'neutral',
      filler: false,
      avatarEmotion: 'neutral',
      capitulated: false,
    });
  }
}
