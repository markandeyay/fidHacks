'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useMarketStore } from '@/stores/marketStore';
import {
  MarketScenario,
  LifeEvent,
  LifeEventChoice,
  PortfolioAllocation,
  MarketTick,
  StructuredDecision,
  AssetClass,
} from '@/types/market';
import { simulateGhosts } from '@/lib/market/simulator';
import { scoreMarket } from '@/lib/scoring/market';
import { useSessionStore } from '@/stores/sessionStore';
import { TrendingUp, DollarSign, BarChart3 } from 'lucide-react';
import { PortfolioCockpit } from './PortfolioCockpit';
import { NetWorthGraph } from './NetWorthGraph';
import { LifeEventCard } from './LifeEventCard';
import { GhostLineOverlay } from './GhostLineOverlay';

interface MarketGameProps {
  scenario: MarketScenario;
}

const ASSETS: AssetClass[] = ['stable', 'growth', 'risky', 'safe'];

export function MarketGame({ scenario }: MarketGameProps) {
  const router = useRouter();
  const { init, addScore, session } = useSessionStore();
  const {
    status,
    ticks,
    currentYear,
    currentNetWorth,
    setScenario: setStoreScenario,
    setInitialAllocation,
    startGame,
    pauseGame,
    resumeGame,
    advanceYear,
    finishGame,
    addDecision,
  } = useMarketStore();

  const [pendingLifeEvent, setPendingLifeEvent] = useState<LifeEvent | null>(null);
  const [pendingStructuredDecision, setPendingStructuredDecision] =
    useState<StructuredDecision | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasInit = useRef(false);

  useEffect(() => {
    if (!hasInit.current) {
      hasInit.current = true;
      init();
    }
  }, [init]);

  useEffect(() => {
    setStoreScenario(scenario);
  }, [scenario, setStoreScenario]);

  const handleStart = useCallback(
    (alloc: PortfolioAllocation) => {
      setInitialAllocation(alloc);
      const { returns, ghostPaths } = simulateGhosts(scenario, alloc);
      startGame(ghostPaths, returns);
    },
    [scenario, setInitialAllocation, startGame]
  );

  const processYear = useCallback(
    (
      lifeEventChoice?: LifeEventChoice,
      structuredChoice?: { id: string; choice: string; correctness: number }
    ) => {
      const state = useMarketStore.getState();
      const year = state.currentYear;
      if (year >= scenario.timelineYears) {
        finishGame();
        return;
      }

      const returns = state.yearlyReturns[year];
      let newNetWorth = state.currentNetWorth;
      let newAlloc = { ...state.currentAllocation };

      // Calculate post-market dollar amounts for each asset class
      const assetDollars: Record<AssetClass, number> = { stable: 0, growth: 0, risky: 0, safe: 0 };
      let postMarketValue = 0;
      for (const asset of ASSETS) {
        const dollarAmount = newNetWorth * newAlloc[asset];
        const postReturn = dollarAmount * (1 + returns[asset]);
        assetDollars[asset] = Math.max(0, postReturn);
        postMarketValue += assetDollars[asset];
      }
      newNetWorth = postMarketValue;

      // BUG FIX: Recalculate allocation from actual post-market dollar composition
      // before applying life event effects. This prevents NaN when nonSafe is 0
      // and ensures withdrawal math uses real post-market proportions.
      if (postMarketValue > 0) {
        for (const asset of ASSETS) {
          newAlloc[asset] = assetDollars[asset] / postMarketValue;
        }
      } else {
        // Edge case: all assets worthless. Reset to equal allocation.
        newAlloc = { stable: 0.25, growth: 0.25, risky: 0.25, safe: 0.25 };
      }

      // Apply life event effects on post-market allocation
      const lifeEvent = scenario.lifeEvents.find((le) => le.yearIndex === year);
      if (lifeEvent && lifeEventChoice) {
        newNetWorth += lifeEvent.effect.cashFlow;

        if (lifeEventChoice === 'rebalance') {
          newAlloc = { ...state.allocation };
        } else if (lifeEventChoice === 'withdraw') {
          const nonSafe = newAlloc.stable + newAlloc.growth + newAlloc.risky;
          if (nonSafe > 0) {
            const moveToSafe = nonSafe * 0.5;
            const stableRatio = newAlloc.stable / nonSafe;
            const growthRatio = newAlloc.growth / nonSafe;
            const riskyRatio = newAlloc.risky / nonSafe;
            newAlloc.stable -= stableRatio * moveToSafe;
            newAlloc.growth -= growthRatio * moveToSafe;
            newAlloc.risky -= riskyRatio * moveToSafe;
            newAlloc.safe += moveToSafe;
          }
          // If nonSafe is 0, there's nothing to withdraw — skip silently
        }
      }

      // Normalize to guard against floating-point drift
      const totalAlloc =
        newAlloc.stable + newAlloc.growth + newAlloc.risky + newAlloc.safe;
      if (totalAlloc > 0) {
        newAlloc.stable /= totalAlloc;
        newAlloc.growth /= totalAlloc;
        newAlloc.risky /= totalAlloc;
        newAlloc.safe /= totalAlloc;
      }

      if (structuredChoice) {
        addDecision(structuredChoice);
      } else if (lifeEvent && lifeEventChoice) {
        addDecision({ id: lifeEvent.id, choice: lifeEventChoice, correctness: 1 });
      }

      const tick: MarketTick = {
        yearIndex: year,
        netWorth: newNetWorth,
        ghostNetWorth_panic: state.ghostPaths.panic[year] ?? newNetWorth,
        ghostNetWorth_consistent: state.ghostPaths.consistent[year] ?? newNetWorth,
        marketReturns: returns,
      };

      advanceYear(tick, newAlloc, newNetWorth);
    },
    [scenario, finishGame, advanceYear, addDecision]
  );

  const runTick = useCallback(() => {
    const state = useMarketStore.getState();
    const year = state.currentYear;
    if (year >= scenario.timelineYears) {
      finishGame();
      return;
    }

    const lifeEvent = scenario.lifeEvents.find((le) => le.yearIndex === year);
    const structuredDecision = scenario.structuredDecisions.find(
      (sd) => sd.yearIndex === year
    );

    if (lifeEvent) {
      pauseGame();
      setPendingLifeEvent(lifeEvent);
      return;
    }

    if (structuredDecision) {
      pauseGame();
      setPendingStructuredDecision(structuredDecision);
      return;
    }

    processYear();
  }, [scenario, finishGame, pauseGame, processYear]);

  useEffect(() => {
    if (status === 'running') {
      timerRef.current = setInterval(() => {
        runTick();
      }, scenario.tickIntervalMs);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [status, scenario.tickIntervalMs, runTick]);

  const handleLifeEventChoice = (choice: LifeEventChoice) => {
    setPendingLifeEvent(null);
    processYear(choice);
    resumeGame();
  };

  const handleStructuredDecision = (optionIndex: number) => {
    const sd = pendingStructuredDecision;
    setPendingStructuredDecision(null);
    if (sd) {
      const option = sd.options[optionIndex];
      processYear(undefined, {
        id: sd.id,
        choice: option.label,
        correctness: option.correctness,
      });
    }
    resumeGame();
  };

  useEffect(() => {
    if (status === 'finished') {
      const state = useMarketStore.getState();
      if (!state.scenario) return;
      const gameState = {
        scenario: state.scenario,
        allocation: state.allocation,
        ticks: state.ticks,
        decisions: state.decisions,
        holdRate: state.holdRate,
        status: state.status,
      };
      const score = scoreMarket(gameState);
      if (session) {
        addScore({ ...score, sessionId: session.sessionId });
      }
      const timeout = setTimeout(() => {
        router.push('/debrief/market');
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [status, router, addScore, session]);

  const formatCurrency = (v: number) => `$${Math.round(v).toLocaleString()}`;
  const yearDisplay = Math.min(currentYear + 1, scenario.timelineYears);

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {status === 'configuring' && (
          <motion.div
            key="configuring"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <PortfolioCockpit
              timelineYears={scenario.timelineYears}
              startingCash={scenario.startingCash}
              onStart={handleStart}
            />
          </motion.div>
        )}

        {(status === 'running' || status === 'paused') && (
          <motion.div
            key="running"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-5"
          >
            <div className="card p-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-[11px] text-text-muted uppercase tracking-wide mb-1">
                    Year
                  </div>
                  <div className="flex items-center justify-center gap-1.5">
                    <BarChart3 className="w-4 h-4 text-fid-green" />
                    <span className="text-lg font-bold text-text-heading tabular-nums">
                      {yearDisplay}/{scenario.timelineYears}
                    </span>
                  </div>
                  {status === 'paused' &&
                    !pendingLifeEvent &&
                    !pendingStructuredDecision && (
                      <span className="badge badge-amber mt-1 text-[10px]">Paused</span>
                    )}
                </div>
                <div className="text-center">
                  <div className="text-[11px] text-text-muted uppercase tracking-wide mb-1">
                    Net Worth
                  </div>
                  <div className="flex items-center justify-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-fid-green" />
                    <span className="text-lg font-bold text-text-heading tabular-nums">
                      {formatCurrency(currentNetWorth)}
                    </span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-[11px] text-text-muted uppercase tracking-wide mb-1">
                    Status
                  </div>
                  <div className="flex items-center justify-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-fid-green" />
                    <span className="text-sm font-medium text-fid-green">
                      {status === 'running' ? 'Simulating' : 'Paused'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <NetWorthGraph ticks={ticks} showGhosts={false} />

            {status === 'running' && (
              <div className="flex justify-center">
                <motion.div
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-xs text-text-muted"
                >
                  Simulating market data...
                </motion.div>
              </div>
            )}
          </motion.div>
        )}

        {status === 'finished' && (
          <motion.div
            key="finished"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-5"
          >
            <div className="card p-6 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-fid-green flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text-heading">Simulation Complete</h3>
                  <p className="text-xs text-text-muted">
                    Redirecting to debrief...
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-lg bg-white border border-fid-green/20 p-3.5">
                  <div className="text-[10px] text-text-muted uppercase tracking-wide font-medium mb-1">
                    Your Net Worth
                  </div>
                  <div className="text-xl font-bold text-fid-green-dark tabular-nums">
                    {formatCurrency(ticks[ticks.length - 1]?.netWorth ?? currentNetWorth)}
                  </div>
                </div>
                <div className="rounded-lg bg-white border border-border-default p-3.5">
                  <div className="text-[10px] text-text-muted uppercase tracking-wide font-medium mb-1">
                    Panic Seller
                  </div>
                  <div className="text-xl font-bold text-accent-red tabular-nums">
                    {formatCurrency(ticks[ticks.length - 1]?.ghostNetWorth_panic ?? 0)}
                  </div>
                </div>
                <div className="rounded-lg bg-white border border-border-default p-3.5">
                  <div className="text-[10px] text-text-muted uppercase tracking-wide font-medium mb-1">
                    Consistent Investor
                  </div>
                  <div className="text-xl font-bold text-accent-blue tabular-nums">
                    {formatCurrency(ticks[ticks.length - 1]?.ghostNetWorth_consistent ?? 0)}
                  </div>
                </div>
              </div>
            </div>

            <NetWorthGraph ticks={ticks} showGhosts={true} />
            <GhostLineOverlay show={true} />
          </motion.div>
        )}
      </AnimatePresence>

      <LifeEventCard event={pendingLifeEvent} onChoice={handleLifeEventChoice} />

      <AnimatePresence>
        {pendingStructuredDecision && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-fid-navy/40 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 12 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="card p-6 max-w-md w-full"
            >
              <div className="mb-1">
                <span className="badge badge-purple text-[11px]">
                  Decision &middot; Year {pendingStructuredDecision.yearIndex + 1}
                </span>
              </div>
              <p className="text-sm text-text-body leading-relaxed mb-5">
                {pendingStructuredDecision.prompt}
              </p>
              <div className="space-y-2">
                {pendingStructuredDecision.options.map((option, idx) => (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.005, x: 1 }}
                    whileTap={{ scale: 0.995 }}
                    onClick={() => handleStructuredDecision(idx)}
                    className="w-full p-4 rounded-lg border border-border-default bg-white text-left hover:border-border-strong hover:bg-bg-hover transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-fid-navy text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-sm font-medium text-text-heading">
                        {option.label}
                      </span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
