'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BudgetBlitzScenario,
  BudgetCategory,
  BudgetBlitzGameState,
  IncomeTile as IncomeTileType,
  ChaosCard as ChaosCardType,
} from '@/types/budget';
import { scoreBudgetBlitz } from '@/lib/scoring/budget';
import { useSessionStore } from '@/stores/sessionStore';
import { IncomeStack } from './IncomeStack';
import { CategoryBucket } from './CategoryBucket';
import { ChaosCardOverlay } from './ChaosCard';
import { CountdownTimer } from './CountdownTimer';
import { Shield, Wallet, Layers } from 'lucide-react';

const ALL_CATEGORIES: BudgetCategory[] = [
  'rent',
  'food',
  'transport',
  'savings',
  'fun',
  'health',
  'personal_care',
];

function generateIncomeTiles(income: number): IncomeTileType[] {
  const tiles: IncomeTileType[] = [];
  let remaining = income;
  const denominations =
    income > 4000 ? [200, 500] : income > 2000 ? [100, 200] : [50, 100];

  while (remaining > 0) {
    const d = denominations[Math.floor(Math.random() * denominations.length)];
    const value = Math.min(d, remaining);
    tiles.push({ id: `tile-${tiles.length}`, value });
    remaining -= value;
  }

  while (tiles.length > 20) {
    tiles.sort((a, b) => a.value - b.value);
    const a = tiles.shift()!;
    const b = tiles.shift()!;
    tiles.push({ id: `merged-${tiles.length}`, value: a.value + b.value });
  }

  return tiles.map((t, i) => ({ ...t, id: `tile-${i}` }));
}

function getCategoryBenchmark(category: BudgetCategory, income: number): number {
  const ratios: Record<BudgetCategory, number> = {
    rent: 0.30,
    food: 0.15,
    transport: 0.10,
    savings: 0.20,
    fun: 0.15,
    health: 0.05,
    personal_care: 0.05,
  };
  return Math.round(income * ratios[category]);
}

function getCategoryColor(
  category: BudgetCategory,
  allocated: number,
  income: number
): 'green' | 'amber' | 'red' {
  const benchmark = getCategoryBenchmark(category, income);
  if (allocated >= benchmark * 0.8 && allocated <= benchmark * 1.5) return 'green';
  if (allocated >= benchmark * 0.4 && allocated < benchmark * 0.8) return 'amber';
  if (allocated > benchmark * 1.5) return 'red';
  return 'red';
}

function getCategoryLabel(cat: BudgetCategory): string {
  const labels: Record<BudgetCategory, string> = {
    rent: 'Rent',
    food: 'Food',
    transport: 'Transport',
    savings: 'Savings',
    fun: 'Fun',
    health: 'Health',
    personal_care: 'Personal Care',
  };
  return labels[cat];
}

interface BudgetBlitzGameProps {
  scenario: BudgetBlitzScenario;
  onRestart: () => void;
}

export function BudgetBlitzGame({ scenario, onRestart }: BudgetBlitzGameProps) {
  const router = useRouter();
  const initSession = useSessionStore((s) => s.init);
  const addScore = useSessionStore((s) => s.addScore);

  const fixedTotal = Object.values(scenario.fixedCosts).reduce(
    (sum, val) => sum + (val || 0),
    0
  );
  const discretionaryIncome = Math.max(0, scenario.monthlyIncome - fixedTotal);

  const [incomeTiles, setIncomeTiles] = useState<IncomeTileType[]>(() =>
    generateIncomeTiles(discretionaryIncome)
  );

  const [allocations, setAllocations] = useState<Record<BudgetCategory, number>>(
    () => ({
      rent: scenario.fixedCosts.rent || 0,
      food: scenario.fixedCosts.food || 0,
      transport: scenario.fixedCosts.transport || 0,
      savings: 0,
      fun: 0,
      health: scenario.fixedCosts.health || 0,
      personal_care: scenario.fixedCosts.personal_care || 0,
    })
  );

  const [emergencyBuffer, setEmergencyBuffer] = useState(0);
  const [triggeredChaos, setTriggeredChaos] = useState<ChaosCardType[]>([]);
  const [activeChaos, setActiveChaos] = useState<ChaosCardType | null>(null);
  const [timeRemainingMs, setTimeRemainingMs] = useState(
    scenario.timerSeconds * 1000
  );
  const [status, setStatus] = useState<'running' | 'finished'>('running');
  const [lockedCategories, setLockedCategories] = useState<
    Set<BudgetCategory>
  >(new Set());
  const [activeDragTile, setActiveDragTile] = useState<IncomeTileType | null>(null);

  const chaosTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stateRef = useRef({
    scenario,
    allocations,
    triggeredChaos,
    activeChaos,
    emergencyBuffer,
    timeRemainingMs,
    status,
    incomeTiles,
  });

  stateRef.current = {
    scenario,
    allocations,
    triggeredChaos,
    activeChaos,
    emergencyBuffer,
    timeRemainingMs,
    status,
    incomeTiles,
  };

  const endGame = useCallback(() => {
    if (stateRef.current.status === 'finished') return;
    setStatus('finished');
    if (chaosTimeoutRef.current) clearTimeout(chaosTimeoutRef.current);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    const {
      scenario: sc,
      allocations: al,
      triggeredChaos: tc,
      emergencyBuffer: eb,
      timeRemainingMs: tr,
    } = stateRef.current;

    const state: BudgetBlitzGameState = {
      scenario: sc,
      allocations: al,
      triggeredChaos: tc,
      balance:
        sc.monthlyIncome -
        Object.values(al).reduce((a, b) => a + b, 0) -
        eb,
      emergencyBuffer: eb,
      timeRemainingMs: tr,
      status: 'finished',
    };

    const score = scoreBudgetBlitz(state);
    score.sessionId = useSessionStore.getState().session?.sessionId || '';
    addScore(score);

    setTimeout(() => {
      router.push('/debrief/budget-blitz');
    }, 1500);
  }, [addScore, router]);

  useEffect(() => {
    initSession();
    timerIntervalRef.current = setInterval(() => {
      setTimeRemainingMs((prev) => {
        if (prev <= 100) return 0;
        return prev - 100;
      });
    }, 100);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [initSession]);

  useEffect(() => {
    if (timeRemainingMs <= 0 && status === 'running') {
      endGame();
    }
  }, [timeRemainingMs, status, endGame]);

  useEffect(() => {
    if (incomeTiles.length === 0 && status === 'running') {
      endGame();
    }
  }, [incomeTiles.length, status, endGame]);

  useEffect(() => {
    if (status !== 'running' || activeChaos) return;

    const delay = 15000 + Math.random() * 10000;
    const timeout = setTimeout(() => {
      const available = scenario.chaosCardPool.filter(
        (c) =>
          !stateRef.current.triggeredChaos.some((t) => t.id === c.id) &&
          c.id !== stateRef.current.activeChaos?.id
      );
      if (available.length > 0) {
        const card =
          available[Math.floor(Math.random() * available.length)];
        setActiveChaos(card);
      }
    }, delay);

    chaosTimeoutRef.current = timeout;

    return () => clearTimeout(timeout);
  }, [status, activeChaos, scenario.chaosCardPool]);

  const resolveChaos = useCallback(() => {
    if (!activeChaos) return;

    const category = activeChaos.forcedCategory || 'fun';
    setAllocations((prev) => ({
      ...prev,
      [category]: (prev[category] || 0) + activeChaos.hit,
    }));
    setTriggeredChaos((prev) => [...prev, activeChaos]);
    setLockedCategories((prev) => new Set(prev).add(category));
    setActiveChaos(null);
  }, [activeChaos]);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const tile = incomeTiles.find((t) => t.id === event.active.id);
    if (tile) setActiveDragTile(tile);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragTile(null);
    const { active, over } = event;
    if (!over) return;

    const tile = incomeTiles.find((t) => t.id === active.id);
    if (!tile) return;

    const overId = over.id as string;

    if (overId === 'emergency-buffer') {
      setEmergencyBuffer((prev) => prev + tile.value);
      setIncomeTiles((prev) => prev.filter((t) => t.id !== tile.id));
      return;
    }

    if (ALL_CATEGORIES.includes(overId as BudgetCategory)) {
      const category = overId as BudgetCategory;
      if (lockedCategories.has(category)) return;

      setAllocations((prev) => ({
        ...prev,
        [category]: (prev[category] || 0) + tile.value,
      }));
      setIncomeTiles((prev) => prev.filter((t) => t.id !== tile.id));
    }
  };

  const totalAllocated =
    Object.values(allocations).reduce((a, b) => a + b, 0) + emergencyBuffer;
  const percentAllocated = Math.min(
    100,
    Math.round((totalAllocated / scenario.monthlyIncome) * 100)
  );

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-4">
        {/* Header Bar */}
        <div className="card p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-5">
            <CountdownTimer
              timeRemainingMs={timeRemainingMs}
              totalMs={scenario.timerSeconds * 1000}
            />

            <div className="w-px h-8 bg-border-default" />

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-text-muted font-medium">Allocated</span>
                <span className="text-sm font-bold text-text-heading">
                  ${totalAllocated.toLocaleString()}
                </span>
                <span className="text-xs text-text-muted">/</span>
                <span className="text-sm text-text-heading">
                  ${scenario.monthlyIncome.toLocaleString()}
                </span>
              </div>
              <div className="progress-bar mt-1.5 w-40">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${percentAllocated}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-fid-green" />
              <span className="text-xs text-text-muted font-medium">Buffer</span>
              <span className="text-sm font-bold text-fid-green-dark">
                ${emergencyBuffer.toLocaleString()}
              </span>
            </div>
            <div className="w-px h-6 bg-border-default" />
            <div className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-text-muted" />
              <span className="text-xs text-text-muted font-medium">Tiles</span>
              <span className="text-sm font-bold text-text-heading">
                {incomeTiles.length}
              </span>
            </div>
          </div>
        </div>

        {/* Income Stack */}
        <IncomeStack tiles={incomeTiles} />

        {/* Category Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {ALL_CATEGORIES.map((category) => (
            <CategoryBucket
              key={category}
              category={category}
              label={getCategoryLabel(category)}
              allocated={allocations[category] || 0}
              benchmark={getCategoryBenchmark(
                category,
                scenario.monthlyIncome
              )}
              color={getCategoryColor(
                category,
                allocations[category] || 0,
                scenario.monthlyIncome
              )}
              locked={lockedCategories.has(category)}
            />
          ))}
          <CategoryBucket
            category="emergency-buffer"
            label="Emergency Buffer"
            allocated={emergencyBuffer}
            benchmark={scenario.monthlyIncome * 0.1}
            color={emergencyBuffer > 0 ? 'green' : 'amber'}
            locked={false}
          />
        </div>

        {/* Chaos Card Overlay */}
        <AnimatePresence>
          {activeChaos && (
            <ChaosCardOverlay card={activeChaos} onResolve={resolveChaos} />
          )}
        </AnimatePresence>

        {/* Game Over Overlay */}
        <AnimatePresence>
          {status === 'finished' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="card p-8 max-w-sm mx-4 text-center"
              >
                <div className="w-12 h-12 rounded-full bg-fid-green-light flex items-center justify-center mx-auto mb-4">
                  <Wallet className="w-6 h-6 text-fid-green" />
                </div>
                <h3 className="text-lg font-bold text-text-heading mb-1">
                  Month Complete
                </h3>
                <p className="text-sm text-text-muted mb-4">
                  Calculating your score...
                </p>
                <div className="progress-bar">
                  <div className="progress-bar-fill animate-pulse-ring" style={{ width: '100%' }} />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <DragOverlay>
        {activeDragTile ? (
           <div className="px-4 py-2.5 bg-white border-2 border-fid-green rounded-lg shadow-sm text-sm font-semibold text-fid-green-dark">
            ${activeDragTile.value}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
