import { describe, it, expect } from 'vitest';
import { scoreMarket } from '../market';
import { MarketGameState } from '@/types/market';

function makeState(partial: Partial<MarketGameState> & { scenario: MarketGameState['scenario'] }): MarketGameState {
  return {
    allocation: { stable: 0.25, growth: 0.25, risky: 0.25, safe: 0.25 },
    ticks: [],
    decisions: [],
    holdRate: 0,
    status: 'finished',
    ...partial,
  } as MarketGameState;
}

describe('scoreMarket', () => {
  it('empty ticks: total=0, breakdown zeros, no NaN', () => {
    const state = makeState({
      scenario: { difficulty: 'junior', startingCash: 10000, timelineYears: 5, tickIntervalMs: 1000, lifeEvents: [], structuredDecisions: [], marketSeed: 42 } as MarketGameState['scenario'],
      ticks: [],
    });

    const score = scoreMarket(state);
    expect(score.total).toBe(0);
    expect(score.breakdown).toEqual({ finalValue: 0, holdRate: 0, decisions: 0 });
    expect(Number.isNaN(score.total)).toBe(false);
  });

  it('matches consistent: playerFinal === consistentFinal, all hold, all correctness=1 → total=100', () => {
    const state = makeState({
      scenario: { difficulty: 'junior', startingCash: 10000, timelineYears: 5, tickIntervalMs: 1000, lifeEvents: [], structuredDecisions: [], marketSeed: 42 } as MarketGameState['scenario'],
      ticks: [
        { yearIndex: 0, netWorth: 10000, ghostNetWorth_panic: 10000, ghostNetWorth_consistent: 10000, marketReturns: {} as any },
        { yearIndex: 1, netWorth: 12000, ghostNetWorth_panic: 11000, ghostNetWorth_consistent: 12000, marketReturns: {} as any },
      ],
      decisions: [
        { id: 'd1', choice: 'hold', correctness: 1 },
        { id: 'd2', choice: 'hold', correctness: 1 },
      ],
    });

    const score = scoreMarket(state);
    expect(score.breakdown.finalValue).toBe(45); // 12000 / 12000 = 1 => 45
    expect(score.breakdown.holdRate).toBe(30); // 2/2 hold => 30
    expect(score.breakdown.decisions).toBe(25); // avg correctness = 1 => 25
    expect(score.total).toBe(100);
  });

  it('half consistent: playerFinal = 0.5 * consistentFinal → valueScore ≈ 22 or 23', () => {
    const state = makeState({
      scenario: { difficulty: 'junior', startingCash: 10000, timelineYears: 5, tickIntervalMs: 1000, lifeEvents: [], structuredDecisions: [], marketSeed: 42 } as MarketGameState['scenario'],
      ticks: [
        { yearIndex: 0, netWorth: 10000, ghostNetWorth_panic: 10000, ghostNetWorth_consistent: 10000, marketReturns: {} as any },
        { yearIndex: 1, netWorth: 6000, ghostNetWorth_panic: 11000, ghostNetWorth_consistent: 12000, marketReturns: {} as any },
      ],
      decisions: [
        { id: 'd1', choice: 'hold', correctness: 1 },
        { id: 'd2', choice: 'hold', correctness: 1 },
      ],
    });

    const score = scoreMarket(state);
    // valueRatio = 6000 / 12000 = 0.5 => 45 * 0.5 = 22.5 => Math.round => 22 or 23
    expect(score.breakdown.finalValue).toBeGreaterThanOrEqual(22);
    expect(score.breakdown.finalValue).toBeLessThanOrEqual(23);
  });

  it('zero decisions: holdScore=0, decisionScore=0', () => {
    const state = makeState({
      scenario: { difficulty: 'junior', startingCash: 10000, timelineYears: 5, tickIntervalMs: 1000, lifeEvents: [], structuredDecisions: [], marketSeed: 42 } as MarketGameState['scenario'],
      ticks: [
        { yearIndex: 0, netWorth: 10000, ghostNetWorth_panic: 10000, ghostNetWorth_consistent: 10000, marketReturns: {} as any },
        { yearIndex: 1, netWorth: 12000, ghostNetWorth_panic: 11000, ghostNetWorth_consistent: 12000, marketReturns: {} as any },
      ],
      decisions: [],
    });

    const score = scoreMarket(state);
    expect(score.breakdown.holdRate).toBe(0);
    expect(score.breakdown.decisions).toBe(0);
    expect(score.total).toBe(45); // only finalValue counts
  });

  it('all rebalance: holdRate=0 → holdScore=0', () => {
    const state = makeState({
      scenario: { difficulty: 'junior', startingCash: 10000, timelineYears: 5, tickIntervalMs: 1000, lifeEvents: [], structuredDecisions: [], marketSeed: 42 } as MarketGameState['scenario'],
      ticks: [
        { yearIndex: 0, netWorth: 10000, ghostNetWorth_panic: 10000, ghostNetWorth_consistent: 10000, marketReturns: {} as any },
        { yearIndex: 1, netWorth: 12000, ghostNetWorth_panic: 11000, ghostNetWorth_consistent: 12000, marketReturns: {} as any },
      ],
      decisions: [
        { id: 'd1', choice: 'rebalance', correctness: 0.5 },
        { id: 'd2', choice: 'rebalance', correctness: 0.5 },
      ],
    });

    const score = scoreMarket(state);
    expect(score.breakdown.holdRate).toBe(0);
    expect(score.breakdown.decisions).toBe(13); // 25 * 0.5 = 12.5 => Math.round = 13
  });
});
