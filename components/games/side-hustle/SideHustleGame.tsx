'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
} from '@dnd-kit/core';
import { SideHustleScenario, LineItemBucket, SideHustleGameState } from '@/types/sideHustle';
import { useSessionStore } from '@/stores/sessionStore';
import { scoreSideHustle } from '@/lib/scoring/sideHustle';
import { ArrowRight, RotateCcw } from 'lucide-react';
import { ReceiptLine } from './ReceiptLine';
import { DraggableReceiptLine } from './DraggableReceiptLine';
import { BucketTray } from './BucketTray';
import { DroppableBucketTray } from './DroppableBucketTray';
import { TaxPanel, calculateTaxOwed } from './TaxPanel';
import { HourlyRatePanel } from './HourlyRatePanel';
import { LLCToggle } from './LLCToggle';

interface SideHustleGameProps {
  scenario: SideHustleScenario;
}

export default function SideHustleGame({ scenario }: SideHustleGameProps) {
  const router = useRouter();
  const { session, addScore } = useSessionStore();

  const [playerSorts, setPlayerSorts] = useState<Record<string, LineItemBucket>>({});
  const [activeId, setActiveId] = useState<string | null>(null);
  const [status, setStatus] = useState<'sorting' | 'reviewing' | 'finished'>('sorting');
  const [taxOwedPlayer, setTaxOwedPlayer] = useState<number | undefined>();
  const [taxOwedCorrect, setTaxOwedCorrect] = useState<number | undefined>();
  const [llcChoice, setLlcChoice] = useState<boolean>(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const allSorted = useMemo(
    () => scenario.lineItems.every((item) => playerSorts[item.id]),
    [scenario.lineItems, playerSorts]
  );

  const counts = useMemo(() => {
    const c = { taxable_income: 0, deductible_expense: 0, non_deductible: 0 };
    for (const bucket of Object.values(playerSorts)) {
      c[bucket]++;
    }
    return c;
  }, [playerSorts]);

  const correctTotals = useMemo(() => {
    let taxable = 0;
    let deductions = 0;
    for (const item of scenario.lineItems) {
      if (item.correctBucket === 'taxable_income') taxable += item.amount;
      if (item.correctBucket === 'deductible_expense') deductions += item.amount;
    }
    return { taxable, deductions };
  }, [scenario.lineItems]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveId(null);
      const { active, over } = event;
      if (!over) return;
      const bucket = over.id as LineItemBucket;
      if (['taxable_income', 'deductible_expense', 'non_deductible'].includes(bucket)) {
        setPlayerSorts((prev) => ({ ...prev, [active.id]: bucket }));
      }
    },
    []
  );

  const handleRestart = useCallback(() => {
    setPlayerSorts({});
    setStatus('sorting');
    setTaxOwedPlayer(undefined);
    setTaxOwedCorrect(undefined);
    setLlcChoice(false);
  }, []);

  const handleTaxSubmit = useCallback((player: number, correct: number) => {
    setTaxOwedPlayer(player);
    setTaxOwedCorrect(correct);
  }, []);

  const handleFinish = useCallback(() => {
    const state: SideHustleGameState = {
      scenario,
      playerSorts,
      taxOwedPlayer,
      taxOwedCorrect,
      llcChoice: scenario.llcDecisionApplicable ? llcChoice : undefined,
      status: 'finished',
    };
    const score = scoreSideHustle(state);
    if (session) {
      addScore({ ...score, sessionId: session.sessionId });
    }
    router.push('/debrief/side-hustle');
  }, [scenario, playerSorts, taxOwedPlayer, taxOwedCorrect, llcChoice, session, addScore, router]);

  const activeItem = activeId ? scenario.lineItems.find((i) => i.id === activeId) : null;
  const unassigned = scenario.lineItems.filter((item) => !playerSorts[item.id]);
  const sortedCount = Object.keys(playerSorts).length;
  const sortedPercent = scenario.lineItems.length > 0
    ? Math.round((sortedCount / scenario.lineItems.length) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Scenario Header */}
      <div className="card p-4 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted">Hustle:</span>
            <span className="text-sm font-semibold text-text-heading">{scenario.hustleType}</span>
          </div>
          <span className="text-border-strong hidden sm:inline">|</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted">Semester:</span>
            <span className="text-sm text-text-heading">{scenario.semester}</span>
          </div>
          <span className="text-border-strong hidden sm:inline">|</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted">Progress:</span>
            <div className="flex items-center gap-2">
              <div className="w-24 progress-bar">
                <div className="progress-bar-fill" style={{ width: `${sortedPercent}%` }} />
              </div>
              <span className="text-xs font-semibold text-text-heading tabular-nums">
                {sortedCount}/{scenario.lineItems.length}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={handleRestart}
          className="text-text-muted hover:text-fid-green transition-colors p-1.5"
          title="Restart"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Phase 1: Sorting */}
      {status === 'sorting' && (
        <div className="space-y-5">
          <div className="flex items-center gap-2">
            <span className="badge badge-green">Phase 1</span>
            <span className="text-sm font-semibold text-text-heading">Sort Receipts</span>
          </div>

          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
              {/* Unassigned stack */}
              <div className="lg:col-span-1 space-y-3">
                <div className="card px-3 py-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-text-heading">Unassigned</span>
                  <span className="badge badge-amber">{unassigned.length} items</span>
                </div>
                <div className="space-y-1.5 min-h-[120px]">
                  <AnimatePresence mode="popLayout">
                    {unassigned.map((item) => (
                      <DraggableReceiptLine key={item.id} item={item} />
                    ))}
                  </AnimatePresence>
                  {unassigned.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="card px-4 py-6 text-center bg-fid-green-light border-fid-green/30"
                    >
                      <p className="text-fid-green-dark text-sm font-semibold">All items sorted</p>
                      <p className="text-text-muted text-xs mt-1">
                        All {scenario.lineItems.length} items assigned to buckets
                      </p>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Buckets */}
              <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {(['taxable_income', 'deductible_expense', 'non_deductible'] as LineItemBucket[]).map(
                  (bucket) => (
                    <DroppableBucketTray key={bucket} bucket={bucket} count={counts[bucket]}>
                      <AnimatePresence mode="popLayout">
                        {scenario.lineItems
                          .filter((item) => playerSorts[item.id] === bucket)
                          .map((item) => (
                            <ReceiptLine
                              key={item.id}
                              item={item}
                              assignedBucket={bucket}
                            />
                          ))}
                      </AnimatePresence>
                    </DroppableBucketTray>
                  )
                )}
              </div>
            </div>

            <DragOverlay dropAnimation={null}>
              {activeItem ? (
                <div className="card px-3 py-2 shadow-sm opacity-90 rotate-1 max-w-[260px]">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-text-heading truncate">{activeItem.description}</span>
                    <span className="text-text-heading font-semibold tabular-nums ml-auto flex-shrink-0">
                      ${activeItem.amount.toLocaleString()}
                    </span>
                  </div>
                </div>
              ) : null}
            </DragOverlay>

            <div className="flex items-center justify-end pt-4">
              <button
                onClick={() => setStatus('reviewing')}
                disabled={!allSorted}
                className="btn-primary inline-flex items-center gap-2"
              >
                Continue to Review
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </DndContext>
        </div>
      )}

      {/* Phase 2: Reviewing */}
      {status === 'reviewing' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-8"
        >
          <div className="flex items-center gap-2">
            <span className="badge badge-blue">Phase 2</span>
            <span className="text-sm font-semibold text-text-heading">Review Sorted</span>
          </div>

          {/* Sorted review buckets */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(['taxable_income', 'deductible_expense', 'non_deductible'] as LineItemBucket[]).map(
              (bucket) => (
                <BucketTray key={bucket} bucket={bucket} count={counts[bucket]}>
                  {scenario.lineItems
                    .filter((item) => playerSorts[item.id] === bucket)
                    .map((item) => (
                      <ReceiptLine
                        key={item.id}
                        item={item}
                        assignedBucket={bucket}
                        showRuling
                      />
                    ))}
                </BucketTray>
              )
            )}
          </div>

          <div className="flex items-center gap-2 pt-4">
            <span className="badge badge-purple">Phase 3</span>
            <span className="text-sm font-semibold text-text-heading">Tax Analysis</span>
          </div>

          <TaxPanel
            taxableIncome={correctTotals.taxable}
            deductions={correctTotals.deductions}
            onSubmit={handleTaxSubmit}
          />

          <HourlyRatePanel
            grossIncome={correctTotals.taxable}
            taxOwed={taxOwedCorrect ?? calculateTaxOwed(correctTotals.taxable, correctTotals.deductions)}
            hoursWorked={scenario.hoursWorked}
            campusJobHourlyEquivalent={scenario.campusJobHourlyEquivalent}
          />

          {scenario.llcDecisionApplicable && (
            <LLCToggle
              taxableIncome={correctTotals.taxable}
              deductions={correctTotals.deductions}
              onChange={setLlcChoice}
            />
          )}

          {scenario.showsQuarterlyEstimates && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card"
            >
              <div className="px-4 py-3 border-b border-border-default">
                <span className="text-sm font-semibold text-text-heading">Quarterly Estimates</span>
              </div>
              <div className="p-4">
                <p className="text-sm text-text-muted mb-4">
                  The IRS requires quarterly estimated tax payments. Estimated annual tax: $
                  {calculateTaxOwed(correctTotals.taxable, correctTotals.deductions).toLocaleString()}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: 'Q1', sub: 'Apr 15' },
                    { label: 'Q2', sub: 'Jun 15' },
                    { label: 'Q3', sub: 'Sep 15' },
                    { label: 'Q4', sub: 'Jan 15' },
                  ].map((q) => {
                    const quarterly = Math.round(
                      calculateTaxOwed(correctTotals.taxable, correctTotals.deductions) / 4
                    );
                    return (
                      <div key={q.label} className="card p-3 text-center">
                        <p className="text-xs text-text-muted mb-1">
                          {q.label} <span className="text-text-muted/50">{q.sub}</span>
                        </p>
                        <p className="tabular-nums text-base font-bold text-fid-green-dark">
                          ${quarterly.toLocaleString()}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          <div className="flex justify-end pt-4">
            <button onClick={handleFinish} className="btn-primary">
              Finish &amp; See Score
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
