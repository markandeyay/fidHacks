import { describe, it, expect } from 'vitest';
import { simulateGhosts, GhostPaths } from '../simulator';
import { MarketScenario, PortfolioAllocation } from '@/types/market';

function makeScenario(partial: Partial<MarketScenario>): MarketScenario {
  return {
    difficulty: 'junior',
    startingCash: 10000,
    timelineYears: 10,
    tickIntervalMs: 1000,
    lifeEvents: [],
    structuredDecisions: [],
    marketSeed: 42,
    ...partial,
  } as MarketScenario;
}

const balancedAllocation: PortfolioAllocation = {
  stable: 0.25,
  growth: 0.25,
  risky: 0.25,
  safe: 0.25,
};

describe('simulateGhosts', () => {
  it('determinism: same seed + same allocation → identical returns and ghostPaths', () => {
    const scenario = makeScenario({ marketSeed: 42, timelineYears: 5 });
    const result1 = simulateGhosts(scenario, balancedAllocation);
    const result2 = simulateGhosts(scenario, balancedAllocation);

    expect(result1.returns).toEqual(result2.returns);
    expect(result1.ghostPaths).toEqual(result2.ghostPaths);
  });

  it('different seeds: seed 42 vs seed 43 → different first-year returns', () => {
    const scenario42 = makeScenario({ marketSeed: 42, timelineYears: 5 });
    const scenario43 = makeScenario({ marketSeed: 43, timelineYears: 5 });

    const result42 = simulateGhosts(scenario42, balancedAllocation);
    const result43 = simulateGhosts(scenario43, balancedAllocation);

    // Compare at least one asset class return in year 0
    const year0_42 = result42.returns[0];
    const year0_43 = result43.returns[0];
    expect(year0_42).not.toEqual(year0_43);
  });

  it('100% safe: consistent path should be monotonically non-decreasing', () => {
    const safeAlloc: PortfolioAllocation = { safe: 1, stable: 0, growth: 0, risky: 0 };
    const scenario = makeScenario({ marketSeed: 1, timelineYears: 10 });
    const result = simulateGhosts(scenario, safeAlloc);

    const consistent = result.ghostPaths.consistent;
    for (let i = 1; i < consistent.length; i++) {
      expect(consistent[i]).toBeGreaterThanOrEqual(consistent[i - 1]);
    }
  });

  it('panic triggered: after a >15% drawdown, panic path diverges from consistent path', () => {
    const seedsToTry = [1, 7, 13, 42];
    let foundPanic = false;
    let chosenResult: { returns: Record<string, number>[]; ghostPaths: GhostPaths } | null = null;
    let chosenSeed = -1;

    for (const seed of seedsToTry) {
      const scenario = makeScenario({ marketSeed: seed, timelineYears: 10 });
      const result = simulateGhosts(scenario, balancedAllocation);
      const { panic, consistent } = result.ghostPaths;

      // Find if there is a drawdown year where panic diverges afterward
      let peak = scenario.startingCash;
      for (let year = 0; year < panic.length; year++) {
        if (panic[year] > peak) {
          peak = panic[year];
        }
        if (panic[year] < peak * 0.85) {
          // Check that panic and consistent were identical before this year
          let identicalBefore = true;
          for (let j = 0; j <= year; j++) {
            if (panic[j] !== consistent[j]) {
              identicalBefore = false;
              break;
            }
          }
          // And different after (if there's a next year)
          const differentAfter = year + 1 < panic.length && panic[year + 1] !== consistent[year + 1];

          if (identicalBefore && differentAfter) {
            foundPanic = true;
            chosenResult = result;
            chosenSeed = seed;
            break;
          }
        }
      }
      if (foundPanic) break;
    }

    expect(foundPanic).toBe(true);
    expect(chosenSeed).not.toBe(-1);
    expect(chosenResult).not.toBeNull();
  });

  it('returns length: returns array length equals scenario.timelineYears', () => {
    const timelineYears = 15;
    const scenario = makeScenario({ marketSeed: 99, timelineYears });
    const result = simulateGhosts(scenario, balancedAllocation);

    expect(result.returns.length).toBe(timelineYears);
    expect(result.ghostPaths.consistent.length).toBe(timelineYears);
    expect(result.ghostPaths.panic.length).toBe(timelineYears);
  });
});
