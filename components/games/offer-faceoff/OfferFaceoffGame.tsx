'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { OfferFaceoffScenario, OfferFaceoffGameState } from '@/types/offer';
import { useSessionStore } from '@/stores/sessionStore';
import { scoreOfferFaceoff } from '@/lib/scoring/compensation';
import { OfferCard } from './OfferCard';
import { PickOfferBar } from './PickOfferBar';
import { Trophy, X, Loader2 } from 'lucide-react';
import { OfferFaceoffAvatar } from '@/components/avatars';
import { WindowCard, PaperButton, StickerLabel } from '@/components/paper';

interface OfferFaceoffGameProps {
  scenario: OfferFaceoffScenario;
}

export function OfferFaceoffGame({ scenario }: OfferFaceoffGameProps) {
  const router = useRouter();
  const { addScore, init, session } = useSessionStore();
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
    addScore({ ...score, sessionId: session?.sessionId ?? '' });
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
      {/* Header progress bar — paper styled */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          marginBottom: 24,
          background: 'var(--paper-cream)',
          border: '3px solid var(--paper-black)',
          boxShadow: '4px 4px 0 var(--paper-black)',
          padding: '12px 16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <OfferFaceoffAvatar size={56} />
          <StickerLabel color="mint" size="sm" tilt={-2}>
            {scenario.difficulty.charAt(0).toUpperCase() + scenario.difficulty.slice(1)}
          </StickerLabel>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 12 }}>
            {totalValuations}/{allBenefitIds.length} valued
          </span>
          <div
            style={{
              width: 140,
              position: 'relative',
              background: 'var(--paper-cream)',
              border: '2px solid var(--paper-black)',
              height: 14,
              overflow: 'hidden',
            }}
          >
            <motion.div
              style={{ height: '100%', background: 'var(--paper-yellow)' }}
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
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 50,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(10,10,10,0.55)',
              backdropFilter: 'blur(4px)',
              padding: 16,
            }}
          >
            <div style={{ maxWidth: 480, width: '100%' }}>
              <WindowCard variant="success" title="RESULTS ⊙ ✕" onClose={handleGoToDebrief} tilt={-1}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      border: '3px solid var(--paper-black)',
                      background: isCorrectPick ? 'var(--paper-yellow)' : 'var(--paper-coral, #F4A0A0)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      boxShadow: '3px 3px 0 var(--paper-black)',
                    }}
                  >
                    {isCorrectPick ? (
                      <Trophy className="w-5 h-5" />
                    ) : (
                      <X className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <div
                      style={{
                        fontFamily: 'var(--font-marker), Impact, sans-serif',
                        fontSize: 18,
                        letterSpacing: 1,
                        textTransform: 'uppercase',
                      }}
                    >
                      {isCorrectPick ? 'Correct choice!' : 'Not the optimal choice'}
                    </div>
                    <div style={{ fontFamily: 'var(--font-patrick), cursive', fontSize: 14, opacity: 0.85 }}>
                      {isCorrectPick
                        ? 'You picked the better offer.'
                        : `Offer ${scenario.optimalChoice} would have been the better deal.`}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                  <div
                    style={{
                      flex: 1,
                      background: 'var(--paper-cream)',
                      border: '2px solid var(--paper-black)',
                      padding: 10,
                      textAlign: 'center',
                    }}
                  >
                    <div
                      style={{
                        fontFamily: 'var(--font-marker), Impact, sans-serif',
                        fontSize: 11,
                        letterSpacing: 1,
                        textTransform: 'uppercase',
                        marginBottom: 4,
                      }}
                    >
                      Your Pick
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 18, fontWeight: 700 }}>
                      Offer {selectedOffer}
                    </div>
                    <div style={{ fontFamily: 'var(--font-patrick), cursive', fontSize: 12, marginTop: 2, opacity: 0.8 }}>
                      {selectedOffer === 'A' ? scenario.offerA.company : scenario.offerB.company}
                    </div>
                  </div>
                  <div
                    style={{
                      flex: 1,
                      background: 'var(--paper-yellow)',
                      border: '2px solid var(--paper-black)',
                      padding: 10,
                      textAlign: 'center',
                    }}
                  >
                    <div
                      style={{
                        fontFamily: 'var(--font-marker), Impact, sans-serif',
                        fontSize: 11,
                        letterSpacing: 1,
                        textTransform: 'uppercase',
                        marginBottom: 4,
                      }}
                    >
                      Optimal
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 18, fontWeight: 700 }}>
                      Offer {scenario.optimalChoice}
                    </div>
                    <div style={{ fontFamily: 'var(--font-patrick), cursive', fontSize: 12, marginTop: 2 }}>
                      {scenario.optimalChoice === 'A' ? scenario.offerA.company : scenario.offerB.company}
                    </div>
                  </div>
                </div>

                {scenario.optimalReasoning && (
                  <div
                    style={{
                      background: 'var(--paper-cream)',
                      border: '2px solid var(--paper-black)',
                      padding: 10,
                      marginBottom: 16,
                    }}
                  >
                    <div
                      style={{
                        fontFamily: 'var(--font-marker), Impact, sans-serif',
                        fontSize: 12,
                        letterSpacing: 1,
                        textTransform: 'uppercase',
                        marginBottom: 4,
                      }}
                    >
                      Analysis
                    </div>
                    <p style={{ fontFamily: 'var(--font-patrick), cursive', fontSize: 14, lineHeight: 1.5 }}>
                      {scenario.optimalReasoning}
                    </p>
                  </div>
                )}

                <div style={{ marginBottom: 16 }}>
                  <div
                    style={{
                      fontFamily: 'var(--font-marker), Impact, sans-serif',
                      fontSize: 13,
                      letterSpacing: 1,
                      textTransform: 'uppercase',
                      marginBottom: 10,
                    }}
                  >
                    Score Breakdown
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {Object.entries(score.breakdown).map(([key, value]) => (
                      <div key={key}>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 4,
                            fontFamily: 'var(--font-mono), monospace',
                            fontSize: 12,
                          }}
                        >
                          <span style={{ textTransform: 'capitalize' }}>
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                          <span style={{ fontWeight: 700 }}>{value}</span>
                        </div>
                        <div
                          style={{
                            position: 'relative',
                            background: 'var(--paper-cream)',
                            border: '2px solid var(--paper-black)',
                            height: 10,
                            overflow: 'hidden',
                          }}
                        >
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(value / 50) * 100}%` }}
                            transition={{ delay: 0.2, duration: 0.6, ease: 'easeOut' }}
                            style={{ height: '100%', background: 'var(--paper-cobalt)' }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: 12,
                    borderTop: '2px dashed var(--paper-black)',
                    marginBottom: 16,
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-marker), Impact, sans-serif',
                      fontSize: 16,
                      letterSpacing: 1,
                      textTransform: 'uppercase',
                    }}
                  >
                    Total Score
                  </span>
                  <motion.span
                    style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 32, fontWeight: 800 }}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3, type: 'spring', damping: 20, stiffness: 300 }}
                  >
                    {score.total}
                  </motion.span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <PaperButton color="yellow" onClick={handleGoToDebrief} disabled={navigating}>
                    {navigating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : null}
                    View Debrief
                  </PaperButton>
                </div>
              </WindowCard>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
