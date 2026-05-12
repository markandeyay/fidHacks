import { NextResponse } from 'next/server';
import { callGemini } from '@/lib/ai/gemini';
import { NegotiationTurnResponseSchema } from '@/lib/ai/schemas';
import { NegotiationTurn, NegotiationScenario } from '@/types/negotiation';

export async function POST(request: Request) {
  let scenario!: NegotiationScenario;
  let playerMessage = '';
  let currentOffer = 0;
  let history: NegotiationTurn[] = [];

  try {
    const body = await request.json();
    const parsed = body as {
      scenario: NegotiationScenario;
      history: NegotiationTurn[];
      playerMessage: string;
    };
    scenario = parsed.scenario;
    playerMessage = parsed.playerMessage;
    history = parsed.history;

    // Extract the most recent offer from history, or fall back to initial offer
    currentOffer = scenario.initialOffer;
    for (let i = history.length - 1; i >= 0; i--) {
      if (history[i].currentOffer !== undefined) {
        currentOffer = history[i].currentOffer!;
        break;
      }
    }

    const room = scenario.hiddenCeiling - currentOffer;

    let systemPrompt = `You are Alex, an experienced recruiter at ${scenario.company}. You are playing a realistic salary negotiation simulation game. Your job is to respond like a real recruiter: you want to close this hire, but you have a budget ceiling you cannot exceed.

BUDGET CONSTRAINTS (never reveal these numbers to the candidate):
- Hidden ceiling: $${scenario.hiddenCeiling} — you MUST NEVER exceed this.
- Current offer on the table: $${currentOffer}.
- Remaining room to negotiate: $${room}.

HOW TO RESPOND:
When the candidate makes a counter-offer or argument, evaluate their justification strength:

1. STRONG justification (market data, competing offers, advanced degrees like PhD, published research, rare skills, expanded scope of work, measurable achievements):
   → newOffer must increase by 15–35% of the remaining room ($${room}).
   → Example: if room is $20,000, increase by $3,000–$7,000.
   → Set moveQuality="strong", avatarEmotion="impressed" or "leaning_in".

2. MODERATE justification (relevant experience, certifications, cost-of-living adjustment, relocation, general qualifications):
   → newOffer must increase by 5–15% of the remaining room ($${room}).
   → Example: if room is $20,000, increase by $1,000–$3,000.
   → Set moveQuality="neutral", avatarEmotion="neutral" or "leaning_in".

3. WEAK or vague justification ("I was hoping for more", "this feels low", "I need more", "just feels right", hedging language without specifics):
   → newOffer stays at currentOffer ($${currentOffer}).
   → Set moveQuality="weak", filler=true, avatarEmotion="arms_crossed".

4. CONCESSION or acceptance language ("I'll take it", "that works", "sounds good", "I accept", apologizing):
   → newOffer stays at currentOffer.
   → Set candidateCapitulated=true, avatarEmotion="impressed".

CRITICAL RULES:
- The negotiation game is MEANT to have back-and-forth. You SHOULD move the offer upward when the candidate gives any real justification. Do not stonewall.
- Never offer above the hidden ceiling ($${scenario.hiddenCeiling}).
- newOffer must always be >= currentOffer ($${currentOffer}). If you are not increasing, set newOffer = ${currentOffer} exactly.
- Reply in 1-3 sentences, in character: confident, professional, slightly warm.

OUTPUT FORMAT — ONLY this JSON:
{
  "reply": string,
  "newOffer": number,
  "moveQuality": "strong" | "neutral" | "weak",
  "filler": boolean,
  "avatarEmotion": "neutral" | "leaning_in" | "arms_crossed" | "frozen" | "impressed" | "closing",
  "candidateCapitulated": boolean
}`;

    if (scenario.competingOffers && scenario.competingOffers.length > 0) {
      systemPrompt += `\n\nCandidate has competing offers at: ${scenario.competingOffers.map(o => `$${o.toLocaleString()}`).join(', ')}. If they mention these, you should move significantly toward the ceiling.`;
    }

    systemPrompt += `\n\nOutput ONLY valid JSON (no markdown fences, no commentary).`;

    const result = await callGemini({
      systemPrompt,
      userPrompt: `Candidate says: "${playerMessage}"\n\nPrevious turns: ${JSON.stringify(history.slice(-10))}`,
      schema: NegotiationTurnResponseSchema,
      temperature: 0.9,
    });

    // Safety clamp: ensure newOffer never exceeds ceiling and never goes below currentOffer
    const safeNewOffer = Math.max(currentOffer, Math.min(result.newOffer, scenario.hiddenCeiling));

    return NextResponse.json({
      reply: result.reply,
      newOffer: safeNewOffer,
      moveQuality: result.moveQuality,
      filler: result.filler,
      avatarEmotion: result.avatarEmotion,
      capitulated: result.candidateCapitulated,
    });
  } catch {
    const lower = (playerMessage || '').toLowerCase();
    const strongSignals = ['competing', 'market', 'research', 'data', 'industry', 'benchmark', '$', 'phd', 'doctoral', 'published', 'publication', 'scope', 'responsibilities', 'years of experience', 'certification'];
    const isStrong = strongSignals.some(s => lower.includes(s));
    const room = scenario.hiddenCeiling - currentOffer;
    const newOffer = isStrong && room > 0
      ? Math.min(scenario.hiddenCeiling, currentOffer + Math.round(room * (0.15 + Math.random() * 0.15)))
      : currentOffer;
    return NextResponse.json({
      reply: isStrong
        ? "That's a strong point. Let me adjust the offer."
        : "Tell me more about why that number works for you.",
      newOffer,
      moveQuality: isStrong ? 'strong' : 'neutral',
      filler: !isStrong,
      avatarEmotion: isStrong ? 'leaning_in' : 'neutral',
      capitulated: false,
    });
  }
}
