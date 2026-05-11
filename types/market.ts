import { Difficulty } from './game';

export type AssetClass = 'stable' | 'growth' | 'risky' | 'safe';

export interface PortfolioAllocation {
  stable: number;     // 0-1
  growth: number;
  risky: number;
  safe: number;
}

export interface MarketTick {
  yearIndex: number;          // 0-30
  netWorth: number;
  ghostNetWorth_panic: number;
  ghostNetWorth_consistent: number;
  marketReturns: Record<AssetClass, number>;
}

export type LifeEventChoice = 'hold' | 'rebalance' | 'withdraw';

export interface LifeEvent {
  id: string;
  yearIndex: number;
  title: string;              // "You got laid off"
  description: string;
  effect: {
    cashFlow: number;          // can be negative
    forcedChoice: LifeEventChoice[];   // subset of choices available
  };
}

export interface StructuredDecision {
  id: string;
  yearIndex: number;
  prompt: string;              // "401k match offered: contribute 6%?"
  options: { label: string; correctness: number }[];  // 0-1
}

export interface MarketScenario {
  difficulty: Difficulty;
  startingCash: number;        // 10000
  timelineYears: number;       // 30
  tickIntervalMs: number;      // ~6000 for 30 yrs in 3 min
  lifeEvents: LifeEvent[];
  structuredDecisions: StructuredDecision[];
  marketSeed: number;
}

export interface MarketGameState {
  scenario: MarketScenario;
  allocation: PortfolioAllocation;
  ticks: MarketTick[];
  decisions: { id: string; choice: string; correctness: number }[];
  holdRate: number;            // computed: holds / total decisions
  status: 'configuring' | 'running' | 'paused' | 'finished';
}
