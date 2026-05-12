'use client';

import { useState } from 'react';
import { GameShell } from '@/components/shared/GameShell';
import { GameIntro } from '@/components/shared/GameIntro';
import { OfferFaceoffGame } from '@/components/games/offer-faceoff/OfferFaceoffGame';
import { loadScenario } from '@/lib/ai/scenarios';
import { OfferFaceoffScenario } from '@/types/offer';
import { Difficulty } from '@/types/game';
import { motion, AnimatePresence } from 'framer-motion';
import { BriefcaseBusiness } from 'lucide-react';

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
        {!scenario ? (
          <GameIntro
            key="entry"
            icon={<BriefcaseBusiness className="w-8 h-8 text-fid-green" />}
            title="Offer Face-Off"
            description="Two job offers. Hidden values. Calculate the true total compensation for each benefit and pick the better deal."
            selected={difficulty}
            onSelect={handleSelect}
            loading={loading}
            error={error}
            onRetry={() => difficulty && handleSelect(difficulty)}
            helperTitle="How it works"
            helperBody="Each benefit comes with a &ldquo;?&rdquo; button. Click it to open a calculator that helps you determine the dollar value. Once you&rsquo;ve valued all benefits on both offers, pick the one you think is better."
          />
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
