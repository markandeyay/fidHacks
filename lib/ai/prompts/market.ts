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

const DIFFICULTY_TEMPLATE: Record<Difficulty, string> = {
  freshman: '10-year timeline, exactly 2 lifeEvents, 0 structuredDecisions.',
  sophomore: '15-year timeline, exactly 3 lifeEvents, 1 structuredDecision.',
  junior: '20-year timeline, exactly 4 lifeEvents, 2 structuredDecisions.',
  senior: '30-year timeline, 5-6 lifeEvents, 3-4 structuredDecisions.',
};

export function buildPrompt(input: ScenarioPromptInput): ScenarioPrompt {
  const { difficulty, hints } = input;

  const data = require('@/data/scenarios/market.json') as Record<string, unknown[]>;
  const example = data[difficulty]?.[0];
  if (!example) {
    throw new Error(`No market example for difficulty: ${difficulty}`);
  }

  const exampleOutput = JSON.stringify(example, null, 2);

  const systemPrompt =
    "You are generating a scenario for the Forte financial-literacy game 'market'.\n" +
    'You must produce ONE scenario object as STRICT JSON. No markdown, no commentary, no code fences.\n' +
    'The output MUST exactly match the example shape below; only the values may change.\n' +
    '\n' +
    'Game-specific design rules:\n' +
    `- Difficulty template: ${DIFFICULTY_TEMPLATE[difficulty]}\n` +
    '- marketSeed must be a random integer between 1000 and 999999.\n' +
    '- Each structuredDecision must have a unique highest-correctness option (no ties for the top correctness value).\n' +
    '- All forcedChoice arrays must be non-empty subsets of: ["hold", "rebalance", "withdraw"].\n' +
    '\n' +
    'Example output (use this exact shape, novel content):\n' +
    exampleOutput;

  const userPrompt = hints
    ? `Generate a fresh ${difficulty} scenario. Player context: ${JSON.stringify(hints)}.`
    : `Generate a fresh, realistic ${difficulty} scenario.`;

  return { systemPrompt, userPrompt, exampleOutput };
}
