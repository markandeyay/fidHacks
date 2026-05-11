'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { GameShell } from '@/components/shared/GameShell';
import { DifficultyPicker } from '@/components/shared/DifficultyPicker';
import { MarketGame } from '@/components/games/market/MarketGame';
import { loadScenario } from '@/lib/ai/scenarios';
import { MarketScenario } from '@/types/market';
import { Difficulty } from '@/types/game';
import { useMarketStore } from '@/stores/marketStore';

export default function MarketPage() {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [scenario, setScenario] = useState<MarketScenario | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { reset } = useMarketStore();

  const handleSelectDifficulty = async (d: Difficulty) => {
    setDifficulty(d);
    setLoading(true);
    setError(null);
    try {
      const s = await loadScenario<MarketScenario>('market', d);
      setScenario(s);
    } catch {
      setError('Failed to load scenario. Please try again.');
      setScenario(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRestart = () => {
    reset();
    setDifficulty(null);
    setScenario(null);
    setError(null);
  };

  return (
    <GameShell title="The Market" subtitle="Portfolio Simulator" onRestart={scenario ? handleRestart : undefined}>
      <div className="max-w-3xl mx-auto">
        {!scenario ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-2xl font-bold text-text-heading mb-2">The Market</h2>
              <p className="text-text-muted leading-relaxed">
                Simulate up to 30 years of market returns. Allocate your portfolio across four asset classes.
                Life events will test your discipline. Outperform the panic seller and the consistent investor.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-text-heading uppercase tracking-wide">
                Select Difficulty
              </h3>
              <DifficultyPicker selected={difficulty} onSelect={handleSelectDifficulty} />
            </div>

            {loading && (
              <div className="space-y-3">
                <div className="shimmer h-4 w-48 rounded" />
                <div className="shimmer h-2 w-64 rounded" />
              </div>
            )}

            {error && (
              <div className="card p-4 border-accent-red/30 bg-red-50">
                <p className="text-sm text-accent-red">{error}</p>
              </div>
            )}
          </motion.div>
        ) : (
          <MarketGame scenario={scenario} />
        )}
      </div>
    </GameShell>
  );
}
