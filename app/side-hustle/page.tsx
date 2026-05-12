'use client';

import { useState, useEffect } from 'react';
import { useSessionStore } from '@/stores/sessionStore';
import { loadScenario } from '@/lib/ai/scenarios';
import { Difficulty } from '@/types/game';
import { SideHustleScenario } from '@/types/sideHustle';
import { GameShell } from '@/components/shared/GameShell';
import { GameIntro } from '@/components/shared/GameIntro';
import { motion, AnimatePresence } from 'framer-motion';
import { ReceiptText } from 'lucide-react';
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

  const handleSelect = async (d: Difficulty) => {
    setDifficulty(d);
    setLoading(true);
    setError(null);
    try {
      const s = await loadScenario<SideHustleScenario>('side-hustle', d);
      setScenario(s);
    } catch {
      setError('Failed to load scenario. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <GameShell title="Side Hustle Audit" subtitle="Sort receipts, calculate taxes, evaluate profitability">
      <AnimatePresence mode="wait">
        {!scenario ? (
          <GameIntro
            key="picker"
            icon={<ReceiptText className="w-8 h-8 text-fid-green" />}
            title="Side Hustle Audit"
            description="Sort receipts, calculate taxes, evaluate profitability."
            selected={difficulty}
            onSelect={handleSelect}
            loading={loading}
            error={error}
            onRetry={() => difficulty && handleSelect(difficulty)}
          />
        ) : (
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
