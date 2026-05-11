import { z } from 'zod';
import { Difficulty } from '@/types/game';

export const DifficultySchema = z.enum(['freshman', 'sophomore', 'junior', 'senior']);

export const NegotiationScenarioSchema = z.object({
  id: z.string(),
  difficulty: DifficultySchema,
  role: z.string(),
  company: z.string(),
  initialOffer: z.number(),
  hiddenCeiling: z.number(),
  context: z.string(),
  competingOffers: z.array(z.number()).optional(),
  hasEquity: z.boolean(),
  deadlinePressure: z.boolean(),
});

export const NegotiationTurnResponseSchema = z.object({
  reply: z.string(),
  newOffer: z.number(),
  moveQuality: z.enum(['strong', 'neutral', 'weak']),
  filler: z.boolean(),
  avatarEmotion: z.enum(['neutral', 'leaning_in', 'arms_crossed', 'frozen', 'impressed', 'closing']),
  candidateCapitulated: z.boolean(),
});

export const OfferFaceoffScenarioSchema = z.object({
  difficulty: DifficultySchema,
  offerA: z.object({
    id: z.string(),
    company: z.string(),
    role: z.string(),
    benefits: z.array(z.object({
      id: z.string(),
      type: z.string(),
      label: z.string(),
      rawValue: z.union([z.string(), z.number()]),
      formula: z.string(),
      trueDollarValue: z.number(),
      hint: z.string().optional(),
    })),
    vesting: z.object({
      totalShares: z.number(),
      pricePerShare: z.number(),
      cliffMonths: z.number(),
      totalMonths: z.number(),
    }).optional(),
    trueTotalCompYear1: z.number(),
  }),
  offerB: z.object({
    id: z.string(),
    company: z.string(),
    role: z.string(),
    benefits: z.array(z.object({
      id: z.string(),
      type: z.string(),
      label: z.string(),
      rawValue: z.union([z.string(), z.number()]),
      formula: z.string(),
      trueDollarValue: z.number(),
      hint: z.string().optional(),
    })),
    vesting: z.object({
      totalShares: z.number(),
      pricePerShare: z.number(),
      cliffMonths: z.number(),
      totalMonths: z.number(),
    }).optional(),
    trueTotalCompYear1: z.number(),
  }),
  optimalChoice: z.enum(['A', 'B']),
  optimalReasoning: z.string(),
});

export const BudgetBlitzScenarioSchema = z.object({
  difficulty: DifficultySchema,
  monthlyIncome: z.number(),
  fixedCosts: z.record(z.number()),
  chaosCardPool: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    hit: z.number(),
    forcedCategory: z.string().optional(),
    contextTag: z.enum(['general', 'gendered', 'health', 'emergency']).optional(),
  })),
  timerSeconds: z.number(),
  isPersonalMode: z.boolean(),
});

export const SideHustleScenarioSchema = z.object({
  difficulty: DifficultySchema,
  hustleType: z.string(),
  semester: z.string(),
  lineItems: z.array(z.object({
    id: z.string(),
    description: z.string(),
    amount: z.number(),
    correctBucket: z.enum(['taxable_income', 'deductible_expense', 'non_deductible']),
    ruling: z.string(),
  })),
  hoursWorked: z.number(),
  campusJobHourlyEquivalent: z.number(),
  showsQuarterlyEstimates: z.boolean(),
  llcDecisionApplicable: z.boolean(),
});

export const MarketScenarioSchema = z.object({
  difficulty: DifficultySchema,
  startingCash: z.number(),
  timelineYears: z.number(),
  tickIntervalMs: z.number(),
  lifeEvents: z.array(z.object({
    id: z.string(),
    yearIndex: z.number(),
    title: z.string(),
    description: z.string(),
    effect: z.object({
      cashFlow: z.number(),
      forcedChoice: z.array(z.enum(['hold', 'rebalance', 'withdraw'])),
    }),
  })),
  structuredDecisions: z.array(z.object({
    id: z.string(),
    yearIndex: z.number(),
    prompt: z.string(),
    options: z.array(z.object({
      label: z.string(),
      correctness: z.number(),
    })),
  })),
  marketSeed: z.number(),
});
