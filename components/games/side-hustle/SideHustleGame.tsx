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
import { SideHustleAvatar } from '@/components/avatars';
import { ReceiptLine } from './ReceiptLine';
import { DraggableReceiptLine } from './DraggableReceiptLine';
import { BucketTray } from './BucketTray';
import { DroppableBucketTray } from './DroppableBucketTray';
import { TaxPanel, calculateTaxOwed } from './TaxPanel';
import { HourlyRatePanel } from './HourlyRatePanel';
import { LLCToggle } from './LLCToggle';
import { PaperCard, PaperButton, StickerLabel, MarkerText } from '@/components/paper';

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
    addScore({ ...score, sessionId: session?.sessionId ?? '' });
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
      <div
        style={{
          background: 'var(--paper-cream)',
          border: '3px solid var(--paper-black)',
          boxShadow: '4px 4px 0 var(--paper-black)',
          padding: 16,
        }}
        className="flex items-center justify-between flex-wrap gap-3"
      >
        <div className="flex items-center gap-4 flex-wrap">
          <SideHustleAvatar size={48} />
          <div className="flex items-center gap-2">
            <span
              className="font-marker"
              style={{
                fontFamily: 'var(--font-marker), Impact, sans-serif',
                fontSize: 13,
                letterSpacing: 1,
                color: 'var(--paper-black)',
              }}
            >
              HUSTLE:
            </span>
            <span
              className="font-mono"
              style={{ fontSize: 14, fontWeight: 600, color: 'var(--paper-black)' }}
            >
              {scenario.hustleType}
            </span>
          </div>
          <span style={{ color: 'var(--paper-black)' }} className="hidden sm:inline">
            |
          </span>
          <div className="flex items-center gap-2">
            <span
              className="font-marker"
              style={{
                fontFamily: 'var(--font-marker), Impact, sans-serif',
                fontSize: 13,
                letterSpacing: 1,
                color: 'var(--paper-black)',
              }}
            >
              SEMESTER:
            </span>
            <span
              className="font-mono"
              style={{ fontSize: 14, color: 'var(--paper-black)' }}
            >
              {scenario.semester}
            </span>
          </div>
          <span style={{ color: 'var(--paper-black)' }} className="hidden sm:inline">
            |
          </span>
          <div className="flex items-center gap-2">
            <span
              className="font-marker"
              style={{
                fontFamily: 'var(--font-marker), Impact, sans-serif',
                fontSize: 13,
                letterSpacing: 1,
                color: 'var(--paper-black)',
              }}
            >
              PROGRESS:
            </span>
            <div
              style={{
                width: 96,
                height: 12,
                border: '2px solid var(--paper-black)',
                background: 'var(--paper-cream)',
                position: 'relative',
              }}
            >
              <div
                style={{
                  width: `${sortedPercent}%`,
                  height: '100%',
                  background: 'var(--paper-mint)',
                  transition: 'width 0.2s',
                }}
              />
            </div>
            <span
              className="font-mono tabular-nums"
              style={{ fontSize: 12, fontWeight: 700, color: 'var(--paper-black)' }}
            >
              {sortedCount}/{scenario.lineItems.length}
            </span>
          </div>
        </div>
        <button
          onClick={handleRestart}
          style={{
            color: 'var(--paper-black)',
            padding: 6,
            border: '2px solid var(--paper-black)',
            background: 'var(--paper-yellow)',
            boxShadow: '2px 2px 0 var(--paper-black)',
          }}
          title="Restart"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Phase 1: Sorting */}
      {status === 'sorting' && (
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <StickerLabel color="mint" size="md" tilt={-2}>
              Phase 1
            </StickerLabel>
            <MarkerText size="md">SORT RECEIPTS</MarkerText>
          </div>

          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
              {/* Unassigned stack */}
              <div className="lg:col-span-1 space-y-3">
                <div
                  style={{
                    background: 'var(--paper-cream)',
                    border: '3px solid var(--paper-black)',
                    boxShadow: '3px 3px 0 var(--paper-black)',
                    padding: '8px 12px',
                  }}
                  className="flex items-center justify-between"
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-marker), Impact, sans-serif',
                      fontSize: 14,
                      letterSpacing: 1,
                      color: 'var(--paper-black)',
                    }}
                  >
                    UNASSIGNED
                  </span>
                  <StickerLabel color="yellow" size="sm" tilt={2}>
                    {unassigned.length} items
                  </StickerLabel>
                </div>
                <div className="space-y-2 min-h-[120px]">
                  <AnimatePresence mode="popLayout">
                    {unassigned.map((item) => (
                      <DraggableReceiptLine key={item.id} item={item} />
                    ))}
                  </AnimatePresence>
                  {unassigned.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      style={{
                        background: 'var(--paper-mint)',
                        border: '3px solid var(--paper-black)',
                        boxShadow: '3px 3px 0 var(--paper-black)',
                        padding: 16,
                        textAlign: 'center',
                      }}
                    >
                      <p
                        style={{
                          fontFamily: 'var(--font-marker), Impact, sans-serif',
                          fontSize: 16,
                          letterSpacing: 1,
                          color: 'var(--paper-black)',
                        }}
                      >
                        ALL ITEMS SORTED
                      </p>
                      <p
                        className="font-patrick"
                        style={{ fontSize: 13, color: 'var(--paper-black)', marginTop: 4 }}
                      >
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
                <div
                  style={{
                    background: 'var(--paper-cream)',
                    border: '2px dashed var(--paper-black)',
                    boxShadow: '4px 4px 0 var(--paper-black)',
                    padding: '8px 12px',
                    transform: 'rotate(2deg)',
                    maxWidth: 260,
                    opacity: 0.95,
                  }}
                >
                  <div className="flex items-center gap-2 font-mono" style={{ fontSize: 13 }}>
                    <span
                      className="truncate"
                      style={{ color: 'var(--paper-black)' }}
                    >
                      {activeItem.description}
                    </span>
                    <span
                      className="tabular-nums font-semibold ml-auto flex-shrink-0"
                      style={{ color: 'var(--paper-black)' }}
                    >
                      ${activeItem.amount.toLocaleString()}
                    </span>
                  </div>
                </div>
              ) : null}
            </DragOverlay>

            <div className="flex items-center justify-end pt-4">
              <PaperButton
                color="yellow"
                onClick={() => setStatus('reviewing')}
                disabled={!allSorted}
              >
                Continue to Review
                <ArrowRight className="w-4 h-4" />
              </PaperButton>
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
          <div className="flex items-center gap-3">
            <StickerLabel color="cobalt" size="md" tilt={-2}>
              Phase 2
            </StickerLabel>
            <MarkerText size="md">REVIEW SORTED</MarkerText>
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

          <div className="flex items-center gap-3 pt-4">
            <StickerLabel color="cherry" size="md" tilt={-2}>
              Phase 3
            </StickerLabel>
            <MarkerText size="md">TAX ANALYSIS</MarkerText>
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
              className="space-y-4"
            >
              <MarkerText size="md">QUARTERLY ESTIMATES</MarkerText>
              <p
                className="font-patrick"
                style={{ fontSize: 15, color: 'var(--paper-black)' }}
              >
                The IRS requires quarterly estimated tax payments. Estimated annual tax: $
                {calculateTaxOwed(correctTotals.taxable, correctTotals.deductions).toLocaleString()}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Q1', sub: 'Apr 15' },
                  { label: 'Q2', sub: 'Jun 15' },
                  { label: 'Q3', sub: 'Sep 15' },
                  { label: 'Q4', sub: 'Jan 15' },
                ].map((q, idx) => {
                  const tilts = [-2, 1.5, -1, 2];
                  const quarterly = Math.round(
                    calculateTaxOwed(correctTotals.taxable, correctTotals.deductions) / 4
                  );
                  return (
                    <PaperCard
                      key={q.label}
                      color="cream"
                      tilt={tilts[idx]}
                      tape={idx % 2 === 0 ? 'tl' : 'tr'}
                      tapeColor={idx % 2 === 0 ? 'yellow' : 'coral'}
                      hover={false}
                    >
                      <div style={{ padding: 12, textAlign: 'center' }}>
                        <p
                          style={{
                            fontFamily: 'var(--font-marker), Impact, sans-serif',
                            fontSize: 14,
                            letterSpacing: 1,
                            color: 'var(--paper-black)',
                          }}
                        >
                          {q.label}
                        </p>
                        <p
                          className="font-patrick"
                          style={{ fontSize: 11, color: 'var(--paper-black)', marginBottom: 6 }}
                        >
                          {q.sub}
                        </p>
                        <p
                          className="font-mono tabular-nums"
                          style={{
                            fontSize: 20,
                            fontWeight: 700,
                            color: 'var(--paper-black)',
                          }}
                        >
                          ${quarterly.toLocaleString()}
                        </p>
                      </div>
                    </PaperCard>
                  );
                })}
              </div>
            </motion.div>
          )}

          <div className="flex justify-end pt-4">
            <PaperButton color="yellow" onClick={handleFinish}>
              Finish &amp; See Score
            </PaperButton>
          </div>
        </motion.div>
      )}
    </div>
  );
}
