import { Difficulty } from '@/types/game';
import { BudgetCategory } from '@/types/budget';

export interface ScenarioPromptInput {
  difficulty: Difficulty;
  hints?: Record<string, unknown>;
}

export interface ScenarioPrompt {
  systemPrompt: string;
  userPrompt: string;
  exampleOutput: string;
}

const VALID_CATEGORIES: BudgetCategory[] = [
  'rent',
  'food',
  'transport',
  'savings',
  'fun',
  'health',
  'personal_care',
];

const TAG_DISTRIBUTION: Record<Difficulty, string> = {
  freshman: 'All chaos cards must have contextTag: "general" only.',
  sophomore: 'Include at least one chaos card with contextTag: "health". The rest should be "general".',
  junior: 'Include at least one chaos card with contextTag: "gendered" and at least one with contextTag: "health". The rest should be "general".',
  senior: 'Include at least one chaos card with contextTag: "emergency", at least one with contextTag: "health", and at least one with contextTag: "gendered". The rest should be "general".',
};

export function buildPrompt(input: ScenarioPromptInput): ScenarioPrompt {
  const { difficulty, hints } = input;

  const data = require('@/data/scenarios/budget-blitz.json') as Record<string, unknown[]>;
  const example = data[difficulty]?.[0];
  if (!example) {
    throw new Error(`No budget-blitz example for difficulty: ${difficulty}`);
  }

  const exampleOutput = JSON.stringify(example, null, 2);

  const systemPrompt =
    "You are generating a scenario for the Forte financial-literacy game 'budget-blitz'.\n" +
    'You must produce ONE scenario object as STRICT JSON. No markdown, no commentary, no code fences.\n' +
    'The output MUST exactly match the example shape below; only the values may change.\n' +
    '\n' +
    'Game-specific design rules:\n' +
    `- All forcedCategory values must be valid BudgetCategory values: ${VALID_CATEGORIES.join(', ')}.\n` +
    '- All chaos card hit values must be negative numbers.\n' +
    '- timerSeconds must always be 90.\n' +
    '- isPersonalMode must always be false.\n' +
    '- Difficulty tag distribution rules:\n' +
    '  ' + TAG_DISTRIBUTION[difficulty] + '\n' +
    '\n' +
    'Example output (use this exact shape, novel content):\n' +
    exampleOutput;

  const userPrompt = hints
    ? `Generate a fresh ${difficulty} scenario. Player context: ${JSON.stringify(hints)}.`
    : `Generate a fresh, realistic ${difficulty} scenario.`;

  return { systemPrompt, userPrompt, exampleOutput };
}
