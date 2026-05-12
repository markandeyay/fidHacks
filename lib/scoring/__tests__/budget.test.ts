import { describe, it, expect } from 'vitest';
import { scoreBudgetBlitz } from '../budget';
import { BudgetBlitzGameState } from '@/types/budget';

function makeState(partial: Partial<BudgetBlitzGameState> & { scenario: BudgetBlitzGameState['scenario']; allocations: BudgetBlitzGameState['allocations'] }): BudgetBlitzGameState {
  return {
    triggeredChaos: [],
    balance: 0,
    emergencyBuffer: 0,
    timeRemainingMs: 0,
    status: 'finished',
    ...partial,
  } as BudgetBlitzGameState;
}

describe('scoreBudgetBlitz', () => {
  it('perfect 50/30/20: allocationScore should be 40', () => {
    const state = makeState({
      scenario: { difficulty: 'junior', monthlyIncome: 2000, fixedCosts: {}, chaosCardPool: [], timerSeconds: 90, isPersonalMode: false } as BudgetBlitzGameState['scenario'],
      allocations: {
        rent: 500,
        food: 300,
        transport: 200,
        savings: 400,
        fun: 600,
        health: 0,
        personal_care: 0,
      },
      triggeredChaos: [],
      emergencyBuffer: 0,
    });

    const score = scoreBudgetBlitz(state);
    // needs = 1000/2000 = 0.5, wants = 600/2000 = 0.3, savings = 400/2000 = 0.2
    // All ratios hit the benchmark exactly → allocationScore = 40
    expect(score.breakdown.allocation).toBe(40);
  });

  it('all rent: allocationScore should be very low', () => {
    const state = makeState({
      scenario: { difficulty: 'junior', monthlyIncome: 2000, fixedCosts: {}, chaosCardPool: [], timerSeconds: 90, isPersonalMode: false } as BudgetBlitzGameState['scenario'],
      allocations: {
        rent: 2000,
        food: 0,
        transport: 0,
        savings: 0,
        fun: 0,
        health: 0,
        personal_care: 0,
      },
      triggeredChaos: [],
      emergencyBuffer: 0,
    });

    const score = scoreBudgetBlitz(state);
    expect(score.breakdown.allocation).toBe(0);
  });

  it('chaos on savings: chaosScore = 35 - 10 = 25', () => {
    const state = makeState({
      scenario: { difficulty: 'junior', monthlyIncome: 2000, fixedCosts: {}, chaosCardPool: [], timerSeconds: 90, isPersonalMode: false } as BudgetBlitzGameState['scenario'],
      allocations: { rent: 500, food: 300, transport: 200, savings: 400, fun: 600, health: 0, personal_care: 0 },
      triggeredChaos: [
        { forcedCategory: 'savings' } as any,
      ],
      emergencyBuffer: 0,
    });

    const score = scoreBudgetBlitz(state);
    expect(score.breakdown.chaos).toBe(25);
  });

  it('chaos on rent: chaosScore = 35 - 5 = 30', () => {
    const state = makeState({
      scenario: { difficulty: 'junior', monthlyIncome: 2000, fixedCosts: {}, chaosCardPool: [], timerSeconds: 90, isPersonalMode: false } as BudgetBlitzGameState['scenario'],
      allocations: { rent: 500, food: 300, transport: 200, savings: 400, fun: 600, health: 0, personal_care: 0 },
      triggeredChaos: [
        { forcedCategory: 'rent' } as any,
      ],
      emergencyBuffer: 0,
    });

    const score = scoreBudgetBlitz(state);
    expect(score.breakdown.chaos).toBe(30);
  });

  it('buffer positive: bufferScore=25', () => {
    const state = makeState({
      scenario: { difficulty: 'junior', monthlyIncome: 2000, fixedCosts: {}, chaosCardPool: [], timerSeconds: 90, isPersonalMode: false } as BudgetBlitzGameState['scenario'],
      allocations: { rent: 500, food: 300, transport: 200, savings: 400, fun: 600, health: 0, personal_care: 0 },
      triggeredChaos: [],
      emergencyBuffer: 500,
    });

    const score = scoreBudgetBlitz(state);
    expect(score.breakdown.buffer).toBe(25);
  });
});
