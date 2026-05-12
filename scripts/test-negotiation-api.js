const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('GEMINI_API_KEY not set');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

const scenario = {
  id: 'test-1',
  difficulty: 'junior',
  role: 'Research Assistant',
  company: 'State University',
  initialOffer: 35000,
  hiddenCeiling: 42000,
};

const currentOffer = scenario.initialOffer;
const room = scenario.hiddenCeiling - currentOffer;

const systemPrompt = `You are Alex, an experienced recruiter at ${scenario.company}. You are playing a realistic salary negotiation simulation game. Your job is to respond like a real recruiter: you want to close this hire, but you have a budget ceiling you cannot exceed.

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
}

Output ONLY valid JSON (no markdown fences, no commentary).`;

const playerMessage = "I hold a PhD in this field with 3 published papers in top-tier journals, and similar roles at peer institutions pay $45k. I'd need at least $40k to consider this.";

async function test() {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.9,
        responseMimeType: 'application/json',
      },
    });

    const result = await model.generateContent(
      `${systemPrompt}\n\nCandidate says: "${playerMessage}"\n\nPrevious turns: []`
    );
    const text = result.response.text();
    const parsed = JSON.parse(text);
    console.log('Gemini raw response:', JSON.stringify(parsed, null, 2));
    console.log('\n--- ANALYSIS ---');
    console.log(`Initial offer: $${currentOffer}`);
    console.log(`Gemini newOffer: $${parsed.newOffer}`);
    console.log(`Hidden ceiling: $${scenario.hiddenCeiling}`);
    console.log(`Offer moved: ${parsed.newOffer > currentOffer ? 'YES ✓' : 'NO ✗ (STUCK)'}`);
    if (parsed.newOffer > currentOffer) {
      const increase = parsed.newOffer - currentOffer;
      const pctOfRoom = ((increase / room) * 100).toFixed(1);
      console.log(`Increase amount: $${increase} (${pctOfRoom}% of remaining room)`);
    }
    console.log(`Move quality: ${parsed.moveQuality}`);
    console.log(`Emotion: ${parsed.avatarEmotion}`);
  } catch (err) {
    console.error('Test failed:', err);
    process.exit(1);
  }
}

test();
