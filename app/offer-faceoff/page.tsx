'use client';

import { useState } from 'react';
import { GameShell } from '@/components/shared/GameShell';
import { DifficultyPicker } from '@/components/shared/DifficultyPicker';
import { OfferFaceoffGame } from '@/components/games/offer-faceoff/OfferFaceoffGame';
import { loadScenario } from '@/lib/ai/scenarios';
import { OfferFaceoffScenario } from '@/types/offer';
import { Difficulty } from '@/types/game';
import { motion, AnimatePresence } from 'framer-motion';
import { BriefcaseBusiness, Calculator, Loader2, AlertCircle } from 'lucide-react';

export default function OfferFaceoffPage() {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [scenario, setScenario] = useState<OfferFaceoffScenario | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelect = async (d: Difficulty) => {
    setDifficulty(d);
    setLoading(true);
    setError(null);
    try {
      const s = await loadScenario<OfferFaceoffScenario>('offer-faceoff', d);
      setScenario(s);
    } catch (err) {
      setError('Failed to load scenario. Please try again.');
      console.error('Scenario load error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GameShell
      title="Offer Face-Off"
      subtitle="Compare and value job offers"
      onRestart={() => {
        setDifficulty(null);
        setScenario(null);
        setError(null);
      }}
    >
      <AnimatePresence mode="wait">
        {!difficulty || !scenario ? (
          <motion.div
            key="entry"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-3xl mx-auto"
          >
            <div className="text-center mb-10">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-fid-green-light mb-6"
              >
                <BriefcaseBusiness className="w-8 h-8 text-fid-green" />
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-2xl font-bold text-text-heading mb-2"
              >
                Offer Face-Off
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="text-text-muted max-w-md mx-auto leading-relaxed"
              >
                Two job offers. Hidden values. Calculate the true total compensation for each benefit and pick the better deal.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="text-center mb-5">
                <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Select Difficulty
                </span>
              </div>
              <DifficultyPicker selected={difficulty} onSelect={handleSelect} />
            </motion.div>

            <AnimatePresence>
              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-10 card p-6 flex flex-col items-center gap-3"
                >
                  <Loader2 className="w-6 h-6 text-fid-green animate-spin" />
                  <p className="text-sm text-text-muted">Loading scenario...</p>
                  <div className="flex gap-2 mt-2">
                    <div className="w-64 h-2 bg-bg-subtle rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-fid-green rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: '80%' }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-8 card p-5 flex items-start gap-3 border-accent-red/20 bg-red-50/50"
                >
                  <AlertCircle className="w-5 h-5 text-accent-red flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-accent-red">{error}</p>
                    <button
                      onClick={() => difficulty && handleSelect(difficulty)}
                      className="mt-2 text-xs font-medium text-fid-green hover:text-fid-green-dark transition-colors"
                    >
                      Try again
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {!loading && !error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-10 card p-5"
              >
                <div className="flex items-start gap-3">
                  <Calculator className="w-5 h-5 text-fid-green flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-text-heading mb-1">How it works</h4>
                    <p className="text-xs text-text-muted leading-relaxed">
                      Each benefit comes with a &ldquo;?&rdquo; button. Click it to open a calculator that helps you determine the dollar value.
                      Once you&apos;ve valued all benefits on both offers, pick the one you think is better.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <OfferFaceoffGame scenario={scenario} />
          </motion.div>
        )}
      </AnimatePresence>
    </GameShell>
  );
}
