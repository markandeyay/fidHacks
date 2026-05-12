import { describe, it, expect } from 'vitest';
import { scoreSideHustle } from '../sideHustle';
import { SideHustleGameState } from '@/types/sideHustle';

function makeState(partial: Partial<SideHustleGameState> & { scenario: SideHustleGameState['scenario']; playerSorts: SideHustleGameState['playerSorts'] }): SideHustleGameState {
  return {
    status: 'finished',
    ...partial,
  } as SideHustleGameState;
}

describe('scoreSideHustle', () => {
  const lineItems = [
    { id: 'i1', amount: 6000, correctBucket: 'taxable_income' as const },
    { id: 'i2', amount: 5000, correctBucket: 'taxable_income' as const },
    { id: 'i3', amount: 200, correctBucket: 'deductible_expense' as const },
    { id: 'i4', amount: 100, correctBucket: 'non_deductible' as const },
  ];

  it('junior all correct: total=100, breakdown={buckets:60, tax:40}, no llc key', () => {
    const state = makeState({
      scenario: {
        difficulty: 'junior',
        lineItems,
        llcDecisionApplicable: false,
      } as SideHustleGameState['scenario'],
      playerSorts: {
        i1: 'taxable_income',
        i2: 'taxable_income',
        i3: 'deductible_expense',
        i4: 'non_deductible',
      },
      taxOwedPlayer: 1000,
      taxOwedCorrect: 1000,
    });

    const score = scoreSideHustle(state);
    expect(score.total).toBe(100);
    expect(score.breakdown).toEqual({ buckets: 60, tax: 40 });
    expect(score.breakdown).not.toHaveProperty('llc');
  });

  it('senior all correct + correct LLC: total=100, breakdown={buckets:50, tax:30, llc:20}', () => {
    const state = makeState({
      scenario: {
        difficulty: 'senior',
        lineItems,
        llcDecisionApplicable: true,
      } as SideHustleGameState['scenario'],
      playerSorts: {
        i1: 'taxable_income',
        i2: 'taxable_income',
        i3: 'deductible_expense',
        i4: 'non_deductible',
      },
      taxOwedPlayer: 1000,
      taxOwedCorrect: 1000,
      llcChoice: true, // totalIncome = 11000 > 10000, so optimal = true
    });

    const score = scoreSideHustle(state);
    expect(score.total).toBe(100);
    expect(score.breakdown).toEqual({ buckets: 50, tax: 30, llc: 20 });
  });

  it('senior all correct + wrong LLC: total=80', () => {
    const state = makeState({
      scenario: {
        difficulty: 'senior',
        lineItems,
        llcDecisionApplicable: true,
      } as SideHustleGameState['scenario'],
      playerSorts: {
        i1: 'taxable_income',
        i2: 'taxable_income',
        i3: 'deductible_expense',
        i4: 'non_deductible',
      },
      taxOwedPlayer: 1000,
      taxOwedCorrect: 1000,
      llcChoice: false, // totalIncome = 11000 > 10000, optimal = true, so this is wrong
    });

    const score = scoreSideHustle(state);
    expect(score.total).toBe(80);
    expect(score.breakdown.buckets).toBe(50);
    expect(score.breakdown.tax).toBe(30);
    expect(score.breakdown.llc).toBe(0);
  });

  it('half buckets correct: bucketScore halved', () => {
    const juniorState = makeState({
      scenario: {
        difficulty: 'junior',
        lineItems,
        llcDecisionApplicable: false,
      } as SideHustleGameState['scenario'],
      playerSorts: {
        i1: 'taxable_income', // correct
        i2: 'deductible_expense', // wrong
        i3: 'deductible_expense', // correct
        i4: 'taxable_income', // wrong
      },
      taxOwedPlayer: 1000,
      taxOwedCorrect: 1000,
    });

    const seniorState = makeState({
      scenario: {
        difficulty: 'senior',
        lineItems,
        llcDecisionApplicable: true,
      } as SideHustleGameState['scenario'],
      playerSorts: {
        i1: 'taxable_income',
        i2: 'deductible_expense',
        i3: 'deductible_expense',
        i4: 'taxable_income',
      },
      taxOwedPlayer: 1000,
      taxOwedCorrect: 1000,
      llcChoice: true,
    });

    const juniorScore = scoreSideHustle(juniorState);
    const seniorScore = scoreSideHustle(seniorState);

    // 2/4 correct = 50%
    expect(juniorScore.breakdown.buckets).toBe(30); // 60 * 0.5
    expect(seniorScore.breakdown.buckets).toBe(25); // 50 * 0.5
  });

  it('tax off by 50%: taxScore reduced linearly; never negative', () => {
    const juniorState = makeState({
      scenario: {
        difficulty: 'junior',
        lineItems,
        llcDecisionApplicable: false,
      } as SideHustleGameState['scenario'],
      playerSorts: {
        i1: 'taxable_income',
        i2: 'taxable_income',
        i3: 'deductible_expense',
        i4: 'non_deductible',
      },
      taxOwedPlayer: 1500, // 50% over correct 1000
      taxOwedCorrect: 1000,
    });

    const seniorState = makeState({
      scenario: {
        difficulty: 'senior',
        lineItems,
        llcDecisionApplicable: true,
      } as SideHustleGameState['scenario'],
      playerSorts: {
        i1: 'taxable_income',
        i2: 'taxable_income',
        i3: 'deductible_expense',
        i4: 'non_deductible',
      },
      taxOwedPlayer: 1500,
      taxOwedCorrect: 1000,
      llcChoice: true,
    });

    const juniorScore = scoreSideHustle(juniorState);
    const seniorScore = scoreSideHustle(seniorState);

    // taxError = 0.5, taxScore = max(0, round(weight * 0.5))
    expect(juniorScore.breakdown.tax).toBe(20); // round(40 * 0.5) = 20
    expect(seniorScore.breakdown.tax).toBe(15); // round(30 * 0.5) = 15
    expect(juniorScore.breakdown.tax).toBeGreaterThanOrEqual(0);
    expect(seniorScore.breakdown.tax).toBeGreaterThanOrEqual(0);
  });
});
