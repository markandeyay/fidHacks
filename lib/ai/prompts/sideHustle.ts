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

  const data = require('@/data/scenarios/side-hustle.json') as Record<string, unknown[]>;
  const example = data[difficulty]?.[0];
  if (!example) {
    throw new Error(`No side-hustle example for difficulty: ${difficulty}`);
  }

  const exampleOutput = JSON.stringify(example, null, 2);

  const seniorFlags = difficulty === 'senior'
    ? 'For senior difficulty, showsQuarterlyEstimates must be true and llcDecisionApplicable must be true.'
    : 'For non-senior difficulties, showsQuarterlyEstimates must be false and llcDecisionApplicable must be false.';

  const systemPrompt =
    "You are generating a scenario for the Forte financial-literacy game 'side-hustle'.\n" +
    'You must produce ONE scenario object as STRICT JSON. No markdown, no commentary, no code fences.\n' +
    'The output MUST exactly match the example shape below; only the values may change.\n' +
    '\n' +
    'Game-specific design rules:\n' +
    '- Include 8-12 line items per scenario.\n' +
    '- There must be at least one line item per bucket type: taxable_income, deductible_expense, non_deductible.\n' +
    '- All categorization must be IRS-aligned.\n' +
    '- ' + seniorFlags + '\n' +
    '\n' +
    'Example output (use this exact shape, novel content):\n' +
    exampleOutput;

  const userPrompt = hints
    ? `Generate a fresh ${difficulty} scenario. Player context: ${JSON.stringify(hints)}.`
    : `Generate a fresh, realistic ${difficulty} scenario.`;

  return { systemPrompt, userPrompt, exampleOutput };
}
