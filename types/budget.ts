import { Difficulty } from './game';

export type BudgetCategory =
  | 'rent'
  | 'food'
  | 'transport'
  | 'savings'
  | 'fun'
  | 'health'        // appears at higher difficulty
  | 'personal_care'; // gendered cost realities

export interface IncomeTile {
  id: string;
  value: number;       // each tile worth $50 or $100
}

export interface ChaosCard {
  id: string;
  title: string;        // "Laptop screen cracked"
  description: string;
  hit: number;          // negative number, dollars
  forcedCategory?: BudgetCategory;
  contextTag?: 'general' | 'gendered' | 'health' | 'emergency';
}

export interface BudgetAllocation {
  category: BudgetCategory;
  allocated: number;
  required: number;     // benchmark from 50/30/20
  status: 'healthy' | 'tight' | 'busted';
}

export interface BudgetBlitzScenario {
  difficulty: Difficulty;
  monthlyIncome: number;
  fixedCosts: Partial<Record<BudgetCategory, number>>;
  chaosCardPool: ChaosCard[];      // 3-5 will fire
  timerSeconds: number;            // 90
  isPersonalMode: boolean;
}

export interface BudgetBlitzGameState {
  scenario: BudgetBlitzScenario;
  allocations: Record<BudgetCategory, number>;
  triggeredChaos: ChaosCard[];
  balance: number;
  emergencyBuffer: number;
  timeRemainingMs: number;
  status: 'running' | 'finished';
}
