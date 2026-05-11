'use client';

import { useState, useEffect } from 'react';
import { useSessionStore } from '@/stores/sessionStore';
import { loadScenario } from '@/lib/ai/scenarios';
import { Difficulty } from '@/types/game';
import { SideHustleScenario } from '@/types/sideHustle';
import { GameShell } from '@/components/shared/GameShell';
import { DifficultyPicker } from '@/components/shared/DifficultyPicker';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, AlertTriangle } from 'lucide-react';
import SideHustleGame from '@/components/games/side-hustle/SideHustleGame';

export default function SideHustlePage() {
  const { init } = useSessionStore();
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [scenario, setScenario] = useState<SideHustleScenario | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    if (!difficulty) return;
    setLoading(true);
    setError(null);
    loadScenario<SideHustleScenario>('side-hustle', difficulty)
      .then((s) => {
        setScenario(s);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load scenario. Please check your connection and try again.');
        setLoading(false);
      });
  }, [difficulty]);

  return (
    <GameShell title="Side Hustle Audit" subtitle="Sort receipts, calculate taxes, evaluate profitability">
      <AnimatePresence mode="wait">
        {!difficulty && (
          <motion.div
            key="picker"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6 animate-fade-in"
          >
            <div className="space-y-3">
              <h2 className="text-xl">Side Hustle Tax Audit</h2>
              <p className="text-text-muted text-sm max-w-lg">
                Review receipt line items from a campus side hustle, sort them into the correct
                tax categories, calculate the total tax owed, and evaluate whether the hustle
                is worth your time versus a traditional campus job.
              </p>
              <div className="pt-2">
                <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Select Difficulty
                </span>
              </div>
            </div>
            <DifficultyPicker selected={difficulty} onSelect={setDifficulty} />
          </motion.div>
        )}

        {difficulty && loading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20 gap-4"
          >
            <Loader2 className="w-6 h-6 text-fid-green animate-spin" />
            <p className="text-text-muted text-sm">Loading scenario...</p>
            <div className="w-48 progress-bar">
              <motion.div
                className="progress-bar-fill"
                animate={{ width: ['0%', '100%'] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
          </motion.div>
        )}

        {difficulty && error && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-20 space-y-4 animate-fade-in"
          >
            <div className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-fid-green-light text-fid-green-dark">
              <AlertTriangle className="w-5 h-5" />
              <span className="text-sm font-medium">{error}</span>
            </div>
            <div>
              <button
                onClick={() => {
                  setDifficulty(null);
                  setError(null);
                }}
                className="btn-primary"
              >
                Try Again
              </button>
            </div>
          </motion.div>
        )}

        {difficulty && scenario && !loading && !error && (
          <motion.div
            key="game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <SideHustleGame scenario={scenario} />
          </motion.div>
        )}
      </AnimatePresence>
    </GameShell>
  );
}
