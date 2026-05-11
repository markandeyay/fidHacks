import { create } from 'zustand';
import { MarketScenario, PortfolioAllocation, MarketTick, AssetClass } from '@/types/market';
import { GhostPaths } from '@/lib/market/simulator';

interface MarketStore {
  scenario: MarketScenario | null;
  allocation: PortfolioAllocation;
  ticks: MarketTick[];
  decisions: { id: string; choice: string; correctness: number }[];
  holdRate: number;
  status: 'configuring' | 'running' | 'paused' | 'finished';
  currentYear: number;
  currentAllocation: PortfolioAllocation;
  currentNetWorth: number;
  ghostPaths: GhostPaths;
  yearlyReturns: Record<AssetClass, number>[];

  setScenario: (scenario: MarketScenario) => void;
  setInitialAllocation: (allocation: PortfolioAllocation) => void;
  startGame: (ghostPaths: GhostPaths, yearlyReturns: Record<AssetClass, number>[]) => void;
  pauseGame: () => void;
  resumeGame: () => void;
  advanceYear: (tick: MarketTick, newAllocation: PortfolioAllocation, newNetWorth: number) => void;
  finishGame: () => void;
  addDecision: (decision: { id: string; choice: string; correctness: number }) => void;
  reset: () => void;
}

const defaultAllocation: PortfolioAllocation = {
  stable: 0.25,
  growth: 0.25,
  risky: 0.25,
  safe: 0.25,
};

function getInitialState() {
  return {
    scenario: null,
    allocation: { ...defaultAllocation },
    ticks: [] as MarketTick[],
    decisions: [] as { id: string; choice: string; correctness: number }[],
    holdRate: 0,
    status: 'configuring' as const,
    currentYear: 0,
    currentAllocation: { ...defaultAllocation },
    currentNetWorth: 0,
    ghostPaths: { panic: [] as number[], consistent: [] as number[] },
    yearlyReturns: [] as Record<AssetClass, number>[],
  };
}

export const useMarketStore = create<MarketStore>((set) => ({
  ...getInitialState(),

  setScenario: (scenario) =>
    set({
      scenario,
      currentNetWorth: scenario.startingCash,
    }),

  setInitialAllocation: (allocation) =>
    set({
      allocation,
      currentAllocation: allocation,
    }),

  startGame: (ghostPaths, yearlyReturns) =>
    set((state) => ({
      status: 'running',
      ghostPaths,
      yearlyReturns,
      currentYear: 0,
      currentNetWorth: state.scenario?.startingCash ?? 0,
      ticks: [],
      decisions: [],
      holdRate: 0,
    })),

  pauseGame: () => set({ status: 'paused' }),

  resumeGame: () => set({ status: 'running' }),

  advanceYear: (tick, newAllocation, newNetWorth) =>
    set((state) => ({
      ticks: [...state.ticks, tick],
      currentYear: state.currentYear + 1,
      currentAllocation: newAllocation,
      currentNetWorth: newNetWorth,
    })),

  finishGame: () => set({ status: 'finished' }),

  addDecision: (decision) =>
    set((state) => {
      const newDecisions = [...state.decisions, decision];
      const holds = newDecisions.filter((d) => d.choice === 'hold').length;
      const holdRate = newDecisions.length > 0 ? holds / newDecisions.length : 0;
      return { decisions: newDecisions, holdRate };
    }),

  reset: () => set(getInitialState()),
}));
