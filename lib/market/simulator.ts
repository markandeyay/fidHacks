import { AssetClass, MarketScenario, PortfolioAllocation, MarketTick } from '@/types/market';

const ASSET_PARAMS: Record<AssetClass, { mean: number; sd: number }> = {
  stable: { mean: 0.03, sd: 0.04 },
  growth: { mean: 0.08, sd: 0.16 },
  risky: { mean: 0.12, sd: 0.35 },
  safe: { mean: 0.02, sd: 0.005 },
};

function createLCG(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

function boxMuller(rand: () => number): [number, number] {
  const u1 = Math.max(1e-10, rand());
  const u2 = rand();
  const mag = Math.sqrt(-2 * Math.log(u1));
  const z1 = mag * Math.cos(2 * Math.PI * u2);
  const z2 = mag * Math.sin(2 * Math.PI * u2);
  return [z1, z2];
}

function generateReturns(rand: () => number): Record<AssetClass, number> {
  const assets: AssetClass[] = ['stable', 'growth', 'risky', 'safe'];
  const result = {} as Record<AssetClass, number>;

  const samples: number[] = [];
  for (let i = 0; i < 2; i++) {
    const [z1, z2] = boxMuller(rand);
    samples.push(z1, z2);
  }

  assets.forEach((asset, i) => {
    const { mean, sd } = ASSET_PARAMS[asset];
    result[asset] = mean + sd * samples[i];
  });

  return result;
}

function applyReturns(
  allocation: PortfolioAllocation,
  returns: Record<AssetClass, number>,
  totalValue: number
): number {
  const assets: AssetClass[] = ['stable', 'growth', 'risky', 'safe'];
  let newValue = 0;
  for (const asset of assets) {
    const dollarAmount = totalValue * allocation[asset];
    newValue += dollarAmount * (1 + returns[asset]);
  }
  return newValue;
}

export interface GhostPaths {
  panic: number[];
  consistent: number[];
}

export interface SimulationResult {
  returns: Record<AssetClass, number>[];
  ghostPaths: GhostPaths;
}

export function simulateGhosts(
  scenario: MarketScenario,
  initialAllocation: PortfolioAllocation
): SimulationResult {
  const rand = createLCG(scenario.marketSeed);
  const returns: Record<AssetClass, number>[] = [];

  for (let i = 0; i < scenario.timelineYears; i++) {
    returns.push(generateReturns(rand));
  }

  const consistentPath: number[] = [];
  let consistentValue = scenario.startingCash;
  const consistentAlloc = { ...initialAllocation };

  const panicPath: number[] = [];
  let panicValue = scenario.startingCash;
  let panicAlloc = { ...initialAllocation };
  let panicPeak = scenario.startingCash;

  for (let year = 0; year < scenario.timelineYears; year++) {
    const yearReturns = returns[year];

    // Consistent investor: rebalance to initial allocation annually
    consistentValue = applyReturns(consistentAlloc, yearReturns, consistentValue);
    consistentPath.push(consistentValue);

    // Panic seller
    panicValue = applyReturns(panicAlloc, yearReturns, panicValue);
    panicPath.push(panicValue);

    if (panicValue < panicPeak * 0.85) {
      // >15% drawdown: sell 80% of non-safe into safe
      const nonSafe = panicAlloc.stable + panicAlloc.growth + panicAlloc.risky;
      const moveToSafe = nonSafe * 0.8;
      if (nonSafe > 0) {
        panicAlloc.stable -= (panicAlloc.stable / nonSafe) * moveToSafe;
        panicAlloc.growth -= (panicAlloc.growth / nonSafe) * moveToSafe;
        panicAlloc.risky -= (panicAlloc.risky / nonSafe) * moveToSafe;
        panicAlloc.safe += moveToSafe;
      }
    }

    if (panicValue > panicPeak) {
      panicPeak = panicValue;
    }
  }

  return {
    returns,
    ghostPaths: {
      panic: panicPath,
      consistent: consistentPath,
    },
  };
}

export function createTick(
  yearIndex: number,
  netWorth: number,
  ghostPaths: GhostPaths,
  marketReturns: Record<AssetClass, number>
): MarketTick {
  return {
    yearIndex,
    netWorth,
    ghostNetWorth_panic: ghostPaths.panic[yearIndex] ?? netWorth,
    ghostNetWorth_consistent: ghostPaths.consistent[yearIndex] ?? netWorth,
    marketReturns,
  };
}
