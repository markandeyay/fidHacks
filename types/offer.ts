import { Difficulty } from './game';

export type BenefitType =
  | 'base_salary'
  | 'signing_bonus'
  | 'annual_bonus'
  | 'rsu_grant'
  | 'options_grant'
  | '401k_match'
  | 'health_insurance'
  | 'pto_days'
  | 'remote_stipend'
  | 'tuition_reimbursement'
  | 'commuter_benefit'
  | 'wellness_stipend'
  | 'food'
  | 'housing_stipend';

export interface BenefitLineItem {
  id: string;
  type: BenefitType;
  label: string;                   // "20% 401k match up to 6% of salary"
  rawValue: string | number;       // what's printed on the letter
  formula: string;                 // human-readable formula
  trueDollarValue: number;         // server-computed correct answer
  hint?: string;                   // shown on '?' tap
}

export interface VestingSchedule {
  totalShares: number;
  pricePerShare: number;
  cliffMonths: number;             // typically 12
  totalMonths: number;             // typically 48
  // computed value if you leave at month N
}

export interface OfferLetter {
  id: string;
  company: string;
  role: string;
  benefits: BenefitLineItem[];
  vesting?: VestingSchedule;       // senior diff only
  trueTotalCompYear1: number;      // sum of all true values, year 1
}

export interface OfferFaceoffScenario {
  difficulty: Difficulty;
  offerA: OfferLetter;
  offerB: OfferLetter;
  optimalChoice: 'A' | 'B';
  optimalReasoning: string;
}

export interface OfferFaceoffGameState {
  scenario: OfferFaceoffScenario;
  playerValuations: Record<string, number>;  // benefit id -> player's entered value
  selectedOffer?: 'A' | 'B';
  startedAt: number;
  submittedAt?: number;
}
