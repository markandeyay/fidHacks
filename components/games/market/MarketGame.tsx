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
import { MarketAvatar } from '@/components/avatars';
import { PortfolioCockpit } from './PortfolioCockpit';
import { NetWorthGraph } from './NetWorthGraph';
import { LifeEventCard } from './LifeEventCard';
import { GhostLineOverlay } from './GhostLineOverlay';
import { WindowCard, PaperCard, PaperButton, StickerLabel, MarkerText } from '@/components/paper';

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
      addScore({ ...score, sessionId: session?.sessionId ?? '' });
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
            className="space-y-5"
          >
            <div className="flex items-center justify-center">
              <MarketAvatar size={80} />
            </div>
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
            <div>
              <div className="flex items-center justify-center mb-4">
                <MarketAvatar size={64} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <PaperCard color="cream" hover={false} tilt={-1} style={{ padding: 12, textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-marker), Impact, sans-serif', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: '#0A0A0A', marginBottom: 4 }}>
                    Year
                  </div>
                  <div className="flex items-center justify-center gap-1.5">
                    <BarChart3 className="w-4 h-4" style={{ color: '#1F3FAF' }} />
                    <span style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 18, fontWeight: 700, color: '#0A0A0A' }}>
                      {yearDisplay}/{scenario.timelineYears}
                    </span>
                  </div>
                  {status === 'paused' &&
                    !pendingLifeEvent &&
                    !pendingStructuredDecision && (
                      <div className="mt-1.5 flex justify-center">
                        <StickerLabel color="yellow" size="sm" tilt={-2}>Paused</StickerLabel>
                      </div>
                    )}
                </PaperCard>
                <PaperCard color="yellow" hover={false} tilt={0.8} style={{ padding: 12, textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-marker), Impact, sans-serif', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: '#0A0A0A', marginBottom: 4 }}>
                    Net Worth
                  </div>
                  <div className="flex items-center justify-center gap-1.5">
                    <DollarSign className="w-4 h-4" style={{ color: '#0A0A0A' }} />
                    <span style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 18, fontWeight: 700, color: '#0A0A0A' }}>
                      {formatCurrency(currentNetWorth)}
                    </span>
                  </div>
                </PaperCard>
                <PaperCard color="mint" hover={false} tilt={-0.6} style={{ padding: 12, textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-marker), Impact, sans-serif', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: '#0A0A0A', marginBottom: 4 }}>
                    Status
                  </div>
                  <div className="flex items-center justify-center gap-1.5">
                    <TrendingUp className="w-4 h-4" style={{ color: '#0A0A0A' }} />
                    <span style={{ fontFamily: 'var(--font-marker), Impact, sans-serif', fontSize: 14, letterSpacing: 1, textTransform: 'uppercase', color: '#0A0A0A' }}>
                      {status === 'running' ? 'Simulating' : 'Paused'}
                    </span>
                  </div>
                </PaperCard>
              </div>
            </div>

            <NetWorthGraph ticks={ticks} showGhosts={false} />

            {status === 'running' && (
              <div className="flex justify-center">
                <motion.div
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{ fontFamily: 'var(--font-patrick), cursive', fontSize: 14, color: '#0A0A0A' }}
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
            <WindowCard variant="success" title="COMPLETE ⊙ ✕" showControls={true}>
              <div className="flex items-center gap-3 mb-4">
                <div
                  style={{
                    width: 36,
                    height: 36,
                    background: '#A8D5A2',
                    border: '2px solid #0A0A0A',
                    boxShadow: '2px 2px 0 #0A0A0A',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <TrendingUp className="w-4 h-4" style={{ color: '#0A0A0A' }} />
                </div>
                <div>
                  <MarkerText as="h3" size="md" color="#0A0A0A">
                    SIMULATION COMPLETE
                  </MarkerText>
                  <p style={{ fontFamily: 'var(--font-patrick), cursive', fontSize: 13, color: '#0A0A0A', opacity: 0.75, marginTop: 2 }}>
                    Redirecting to debrief...
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <PaperCard color="cobalt" hover={false} tilt={-1} style={{ padding: 12 }}>
                  <div style={{ fontFamily: 'var(--font-marker), Impact, sans-serif', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: '#F5EBD8', marginBottom: 4 }}>
                    Your Net Worth
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 20, fontWeight: 700, color: '#F5EBD8' }}>
                    {formatCurrency(ticks[ticks.length - 1]?.netWorth ?? currentNetWorth)}
                  </div>
                </PaperCard>
                <PaperCard color="cherry" hover={false} tilt={0.8} style={{ padding: 12 }}>
                  <div style={{ fontFamily: 'var(--font-marker), Impact, sans-serif', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: '#F5EBD8', marginBottom: 4 }}>
                    Panic Seller
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 20, fontWeight: 700, color: '#F5EBD8' }}>
                    {formatCurrency(ticks[ticks.length - 1]?.ghostNetWorth_panic ?? 0)}
                  </div>
                </PaperCard>
                <PaperCard color="mint" hover={false} tilt={-0.5} style={{ padding: 12 }}>
                  <div style={{ fontFamily: 'var(--font-marker), Impact, sans-serif', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: '#0A0A0A', marginBottom: 4 }}>
                    Consistent Investor
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 20, fontWeight: 700, color: '#0A0A0A' }}>
                    {formatCurrency(ticks[ticks.length - 1]?.ghostNetWorth_consistent ?? 0)}
                  </div>
                </PaperCard>
              </div>
            </WindowCard>

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
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(10,10,10,0.55)' }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 12 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="max-w-md w-full"
            >
              <WindowCard variant="info" title="DECISION ⊙ ✕" showControls={true}>
                <div style={{ marginBottom: 10 }}>
                  <StickerLabel color="cobalt" size="sm" tilt={-2}>
                    YEAR {pendingStructuredDecision.yearIndex + 1}
                  </StickerLabel>
                </div>
                <p style={{ fontFamily: 'var(--font-patrick), cursive', fontSize: 16, color: '#0A0A0A', lineHeight: 1.45, marginBottom: 16 }}>
                  {pendingStructuredDecision.prompt}
                </p>
                <div className="flex flex-col gap-3">
                  {pendingStructuredDecision.options.map((option, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ scale: 1.01, y: -2 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleStructuredDecision(idx)}
                      style={{ cursor: 'pointer' }}
                    >
                      <PaperCard color="cream" hover={false} tilt={idx % 2 === 0 ? -0.6 : 0.6} style={{ padding: 12 }}>
                        <div className="flex items-center gap-3">
                          <StickerLabel color="yellow" size="sm" tilt={-3}>
                            {idx + 1}
                          </StickerLabel>
                          <span style={{ fontFamily: 'var(--font-patrick), cursive', fontSize: 15, color: '#0A0A0A', fontWeight: 600 }}>
                            {option.label}
                          </span>
                        </div>
                      </PaperCard>
                    </motion.div>
                  ))}
                </div>
              </WindowCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
