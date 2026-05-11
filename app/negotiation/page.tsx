'use client';

import { useState, useEffect } from 'react';
import { GameShell } from '@/components/shared/GameShell';
import { DifficultyPicker } from '@/components/shared/DifficultyPicker';
import { NegotiationGame } from '@/components/games/negotiation/NegotiationGame';
import { loadScenario } from '@/lib/ai/scenarios';
import { NegotiationScenario } from '@/types/negotiation';
import { Difficulty } from '@/types/game';
import { motion, AnimatePresence } from 'framer-motion';

export default function NegotiationPage() {
  const [phase, setPhase] = useState<'picking' | 'loading' | 'intro' | 'playing'>('picking');
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [scenario, setScenario] = useState<NegotiationScenario | null>(null);

  const handleSelect = async (d: Difficulty) => {
    setDifficulty(d);
    setPhase('loading');
    try {
      const s = await loadScenario<NegotiationScenario>('negotiation', d);
      setScenario(s);
      setPhase('intro');
    } catch { setPhase('picking'); }
  };

  useEffect(() => {
    if (phase === 'intro') {
      const t = setTimeout(() => setPhase('playing'), 2500);
      return () => clearTimeout(t);
    }
  }, [phase]);

  return (
    <GameShell title="Negotiation Room">
      <AnimatePresence mode="wait">
        {phase === 'picking' && (
          <motion.div key="picker" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="max-w-2xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-text-heading">Choose Your Level</h2>
              <p className="text-text-muted">Select a difficulty to begin the salary negotiation simulation.</p>
            </div>
            <DifficultyPicker selected={difficulty} onSelect={handleSelect} />
          </motion.div>
        )}

        {phase === 'loading' && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex items-center justify-center py-20">
            <div className="text-center space-y-3">
              <div className="w-8 h-8 border-2 border-fid-green border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-text-muted">Loading scenario...</p>
            </div>
          </motion.div>
        )}

        {phase === 'intro' && scenario && (
          <motion.div key="intro" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="max-w-xl mx-auto">
            <div className="card p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-fid-green-light mx-auto flex items-center justify-center">
                <span className="text-3xl">💼</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-text-heading">{scenario.role}</h2>
                <p className="text-text-muted text-sm">{scenario.company}</p>
              </div>
              <div className="divider" />
              <p className="text-text-body text-sm leading-relaxed">{scenario.context}</p>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-fid-green-light">
                <span className="text-sm text-fid-green-dark font-semibold">Initial offer: </span>
                <span className="text-sm font-bold text-fid-green">
                  {scenario.initialOffer < 1000
                    ? `$${scenario.initialOffer.toFixed(2)}/hr`
                    : `$${scenario.initialOffer.toLocaleString()}`}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {phase === 'playing' && scenario && (
          <motion.div key="game" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <NegotiationGame scenario={scenario} />
          </motion.div>
        )}
      </AnimatePresence>
    </GameShell>
  );
}
