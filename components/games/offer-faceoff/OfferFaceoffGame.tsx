'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { OfferFaceoffScenario, OfferFaceoffGameState } from '@/types/offer';
import { useSessionStore } from '@/stores/sessionStore';
import { scoreOfferFaceoff } from '@/lib/scoring/compensation';
import { OfferCard } from './OfferCard';
import { PickOfferBar } from './PickOfferBar';
import { Trophy, X, ArrowRight, Loader2 } from 'lucide-react';

interface OfferFaceoffGameProps {
  scenario: OfferFaceoffScenario;
}

export function OfferFaceoffGame({ scenario }: OfferFaceoffGameProps) {
  const router = useRouter();
  const { addScore, init } = useSessionStore();
  const [playerValuations, setPlayerValuations] = useState<Record<string, number>>({});
  const [selectedOffer, setSelectedOffer] = useState<'A' | 'B' | null>(null);
  const [startedAt] = useState(Date.now());
  const [submittedAt, setSubmittedAt] = useState<number | null>(null);
  const [phase, setPhase] = useState<'playing' | 'revealed'>('playing');
  const [navigating, setNavigating] = useState(false);

  useEffect(() => {
    init();
  }, [init]);

  const allBenefitIds = useMemo(() => {
    return [...scenario.offerA.benefits, ...scenario.offerB.benefits].map((b) => b.id);
  }, [scenario]);

  const allValued = useMemo(() => {
    return allBenefitIds.every((id) => playerValuations[id] !== undefined);
  }, [allBenefitIds, playerValuations]);

  const handleValuationChange = useCallback((benefitId: string, value: number) => {
    setPlayerValuations((prev) => ({ ...prev, [benefitId]: value }));
  }, []);

  const handlePick = (offer: 'A' | 'B') => {
    setSelectedOffer(offer);
    const now = Date.now();
    setSubmittedAt(now);
    setPhase('revealed');

    const gameState: OfferFaceoffGameState = {
      scenario,
      playerValuations,
      selectedOffer: offer,
      startedAt,
      submittedAt: now,
    };

    const score = scoreOfferFaceoff(gameState);
    addScore(score);
  };

  const handleGoToDebrief = () => {
    setNavigating(true);
    router.push('/debrief/offer-faceoff');
  };

  const score = useMemo(() => {
    if (phase !== 'revealed' || !selectedOffer || !submittedAt) return null;
    const gameState: OfferFaceoffGameState = {
      scenario,
      playerValuations,
      selectedOffer,
      startedAt,
      submittedAt,
    };
    return scoreOfferFaceoff(gameState);
  }, [phase, selectedOffer, submittedAt, scenario, playerValuations, startedAt]);

  const isCorrectPick = selectedOffer === scenario.optimalChoice;

  const totalValuations = allBenefitIds.filter((id) => playerValuations[id] !== undefined).length;
  const progressPct = allBenefitIds.length > 0 ? (totalValuations / allBenefitIds.length) * 100 : 0;

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="badge badge-green text-[11px]">
            {scenario.difficulty.charAt(0).toUpperCase() + scenario.difficulty.slice(1)}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-text-muted">
            {totalValuations}/{allBenefitIds.length} valued
          </span>
          <div className="w-32 progress-bar">
            <motion.div
              className="progress-bar-fill"
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-28">
        <OfferCard
          offer={scenario.offerA}
          label="A"
          playerValuations={playerValuations}
          onValuationChange={handleValuationChange}
          isRevealed={phase === 'revealed'}
        />
        <OfferCard
          offer={scenario.offerB}
          label="B"
          playerValuations={playerValuations}
          onValuationChange={handleValuationChange}
          isRevealed={phase === 'revealed'}
        />
      </div>

      {phase === 'playing' && <PickOfferBar onPick={handlePick} disabled={!allValued} />}

      <AnimatePresence>
        {phase === 'revealed' && score && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-fid-navy/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              <div className="bg-fid-green px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-white" />
                  <span className="text-white font-semibold text-sm tracking-tight">Results</span>
                </div>
                <button
                  onClick={handleGoToDebrief}
                  className="text-white/70 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="px-6 py-5">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isCorrectPick ? 'bg-fid-green-light' : 'bg-red-50'
                    }`}
                  >
                    {isCorrectPick ? (
                      <Trophy className="w-5 h-5 text-fid-green" />
                    ) : (
                      <X className="w-5 h-5 text-accent-red" />
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-text-heading">
                      {isCorrectPick ? 'Correct choice!' : 'Not the optimal choice'}
                    </div>
                    <div className="text-xs text-text-muted">
                      {isCorrectPick
                        ? 'You picked the better offer.'
                        : `Offer ${scenario.optimalChoice} would have been the better deal.`}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mb-5">
                  <div className="flex-1 bg-bg-subtle rounded-lg p-3 text-center">
                    <div className="text-[10px] uppercase tracking-wider text-text-muted mb-0.5">Your Pick</div>
                    <div className="text-lg font-bold text-text-heading">Offer {selectedOffer}</div>
                    <div className="text-xs text-text-muted mt-0.5">
                      {selectedOffer === 'A' ? scenario.offerA.company : scenario.offerB.company}
                    </div>
                  </div>
                  <div className="flex-1 bg-fid-green-light rounded-lg p-3 text-center">
                    <div className="text-[10px] uppercase tracking-wider text-fid-green-dark mb-0.5">Optimal</div>
                    <div className="text-lg font-bold text-fid-green-dark">Offer {scenario.optimalChoice}</div>
                    <div className="text-xs text-fid-green mt-0.5">
                      {scenario.optimalChoice === 'A' ? scenario.offerA.company : scenario.offerB.company}
                    </div>
                  </div>
                </div>

                {scenario.optimalReasoning && (
                  <div className="bg-fid-green-light/50 rounded-lg p-3 mb-5">
                    <div className="text-[10px] uppercase tracking-wider text-fid-green-dark font-semibold mb-1">
                      Analysis
                    </div>
                    <p className="text-xs text-text-body leading-relaxed">
                      {scenario.optimalReasoning}
                    </p>
                  </div>
                )}

                <div className="mb-5">
                  <div className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3">
                    Score Breakdown
                  </div>
                  <div className="space-y-2.5">
                    {Object.entries(score.breakdown).map(([key, value]) => (
                      <div key={key}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-medium text-text-body capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                          <span className="text-xs font-bold text-text-heading">{value}</span>
                        </div>
                        <div className="progress-bar">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(value / 50) * 100}%` }}
                            transition={{ delay: 0.2, duration: 0.6, ease: 'easeOut' }}
                            className="progress-bar-fill"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border-default">
                  <span className="text-sm font-semibold text-text-heading">Total Score</span>
                  <motion.span
                    className="text-3xl font-extrabold text-fid-green"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3, type: 'spring', damping: 20, stiffness: 300 }}
                  >
                    {score.total}
                  </motion.span>
                </div>
              </div>

              <div className="px-6 py-4 bg-bg-subtle border-t border-border-default flex justify-end">
                <button
                  onClick={handleGoToDebrief}
                  disabled={navigating}
                  className="btn-primary text-sm flex items-center gap-2"
                >
                  {navigating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ArrowRight className="w-4 h-4" />
                  )}
                  View Debrief
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
