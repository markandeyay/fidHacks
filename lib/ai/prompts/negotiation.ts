import { Difficulty } from '@/types/game';

export interface ScenarioPromptInput {
  difficulty: Difficulty;
  hints?: Record<string, unknown>;
}

export interface ScenarioPrompt {
  systemPrompt: string;
  userPrompt: string;
  exampleOutput: string;
}

export function buildPrompt(input: ScenarioPromptInput): ScenarioPrompt {
  const { difficulty, hints } = input;

  // Lazy-import static data to extract an example shape
  const examplePromise = import('@/data/scenarios/negotiation.json').then(
    (mod) => (mod.default as Record<string, unknown[]>)[difficulty]?.[0]
  );

  // Since we can't use top-level await in a synchronous export, we compute synchronously by requiring inline.
  // In Next.js server context, dynamic import() returns a Promise; buildPrompt is sync per spec.
  // We throw to force the caller to handle this, but the spec wants a sync function.
  // Instead, we read via require-like synchronous read. However, in ESM + Next.js,
  // the simplest workaround is to use the statically-known JSON shape and read from the already-imported module.
  // Because the route.ts already imports the JSON statically, we can import it statically here too.
  // This keeps buildPrompt synchronous as required.
  const data = require('@/data/scenarios/negotiation.json') as Record<string, unknown[]>;
  const example = data[difficulty]?.[0];
  if (!example) {
    throw new Error(`No negotiation example for difficulty: ${difficulty}`);
  }

  const exampleOutput = JSON.stringify(example, null, 2);

  const difficultyRules: Record<Difficulty, string> = {
    freshman: ' freshman: simple campus or retail roles, no equity, no deadline pressure.',
    sophomore: ' sophomore: small office or research roles, modest deadline pressure possible, no equity.',
    junior: ' junior: internships or entry-level professional roles, equity may be present, deadline pressure common.',
    senior: ' senior: full-time SWE/PM/finance roles, equity present, multiple competing offers allowed.',
  };

  const systemPrompt =
    "You are generating a scenario for the Forte financial-literacy game 'negotiation'.\n" +
    'You must produce ONE scenario object as STRICT JSON. No markdown, no commentary, no code fences.\n' +
    'The output MUST exactly match the example shape below; only the values may change.\n' +
    '\n' +
    'Game-specific design rules:\n' +
    '- hiddenCeiling must be 10-25% above initialOffer.\n' +
    '- Hourly roles: initialOffer and hiddenCeiling numbers must be < 100.\n' +
    '- Annual roles: initialOffer and hiddenCeiling numbers must be >= 1000.\n' +
    '- competingOffers array is only allowed for junior and senior difficulties.\n' +
    '- When competingOffers exist, every value must lie strictly between initialOffer and hiddenCeiling.\n' +
    '- context must be 1-2 sentences, ASCII characters only.\n' +
    '- hasEquity and deadlinePressure must follow the difficulty calibration below.\n' +
    '\n' +
    'Difficulty calibration:' +
    difficultyRules[difficulty] +
    '\n\n' +
    'Example output (use this exact shape, novel content):\n' +
    exampleOutput;

  const userPrompt = hints
    ? `Generate a fresh ${difficulty} scenario. Player context: ${JSON.stringify(hints)}.`
    : `Generate a fresh, realistic ${difficulty} scenario.`;

  return { systemPrompt, userPrompt, exampleOutput };
}
