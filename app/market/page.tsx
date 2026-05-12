'use client';

import { useState } from 'react';
import { GameShell } from '@/components/shared/GameShell';
import { GameIntro } from '@/components/shared/GameIntro';
import { MarketGame } from '@/components/games/market/MarketGame';
import { loadScenario } from '@/lib/ai/scenarios';
import { MarketScenario } from '@/types/market';
import { Difficulty } from '@/types/game';
import { useMarketStore } from '@/stores/marketStore';
import { TrendingUp } from 'lucide-react';

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
      <div>
        {!scenario ? (
          <GameIntro
            icon={<TrendingUp className="w-8 h-8 text-fid-green" />}
            title="The Market"
            description="Simulate up to 30 years of market returns. Outperform the panic seller and the consistent investor."
            selected={difficulty}
            onSelect={handleSelectDifficulty}
            loading={loading}
            error={error}
          />
        ) : (
          <MarketGame scenario={scenario} />
        )}
      </div>
    </GameShell>
  );
}
