import { Difficulty } from '@/types/game';
import { BenefitType } from '@/types/offer';

export interface ScenarioPromptInput {
  difficulty: Difficulty;
  hints?: Record<string, unknown>;
}

export interface ScenarioPrompt {
  systemPrompt: string;
  userPrompt: string;
  exampleOutput: string;
}

const VALID_BENEFIT_TYPES: BenefitType[] = [
  'base_salary',
  'signing_bonus',
  'annual_bonus',
  'rsu_grant',
  'options_grant',
  '401k_match',
  'health_insurance',
  'pto_days',
  'remote_stipend',
  'tuition_reimbursement',
  'commuter_benefit',
  'wellness_stipend',
  'food',
  'housing_stipend',
];

export function buildPrompt(input: ScenarioPromptInput): ScenarioPrompt {
  const { difficulty, hints } = input;

  const data = require('@/data/scenarios/offer-faceoff.json') as Record<string, unknown[]>;
  const example = data[difficulty]?.[0];
  if (!example) {
    throw new Error(`No offer-faceoff example for difficulty: ${difficulty}`);
  }

  const exampleOutput = JSON.stringify(example, null, 2);

  const systemPrompt =
    "You are generating a scenario for the Forte financial-literacy game 'offer-faceoff'.\n" +
    'You must produce ONE scenario object as STRICT JSON. No markdown, no commentary, no code fences.\n' +
    'The output MUST exactly match the example shape below; only the values may change.\n' +
    '\n' +
    'Game-specific design rules:\n' +
    `- trueTotalCompYear1 for each offer must equal the sum of that offer's benefit trueDollarValue values (within ±$10).\n` +
    `- Every benefit type must be one of: ${VALID_BENEFIT_TYPES.join(', ')}.\n` +
    '- optimalChoice must point to the offer with the strictly higher trueTotalCompYear1. No ties allowed.\n' +
    '- For senior difficulty, BOTH offers MUST include a vesting object with cliffMonths: 12 and totalMonths: 48.\n' +
    '- Lower difficulties must NOT include vesting.\n' +
    '\n' +
    'Example output (use this exact shape, novel content):\n' +
    exampleOutput;

  const userPrompt = hints
    ? `Generate a fresh ${difficulty} scenario. Player context: ${JSON.stringify(hints)}.`
    : `Generate a fresh, realistic ${difficulty} scenario.`;

  return { systemPrompt, userPrompt, exampleOutput };
}
