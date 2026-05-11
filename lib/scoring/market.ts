import { Score } from '@/types/game';
import { MarketGameState } from '@/types/market';

export function scoreMarket(state: MarketGameState): Score {
  const ticks = state.ticks;
  if (ticks.length === 0) {
    return {
      gameId: 'market',
      difficulty: state.scenario.difficulty,
      total: 0,
      breakdown: { finalValue: 0, holdRate: 0, decisions: 0 },
      playedAt: Date.now(),
      durationMs: 0,
      sessionId: '',
    };
  }

  const finalTick = ticks[ticks.length - 1];
  const consistentFinal = finalTick.ghostNetWorth_consistent;
  const playerFinal = finalTick.netWorth;

  // Final value vs consistent benchmark (45)
  const valueRatio = consistentFinal > 0 ? playerFinal / consistentFinal : 0;
  const valueScore = Math.round(45 * Math.max(0, Math.min(1, valueRatio)));

  // Hold rate (30)
  const totalDecisions = state.decisions.length;
  const holds = state.decisions.filter((d) => d.choice === 'hold').length;
  const holdRate = totalDecisions > 0 ? holds / totalDecisions : 0;
  const holdScore = Math.round(30 * holdRate);

  // Structured decision correctness (25)
  const decisionScore = totalDecisions > 0
    ? Math.round(
        (25 * state.decisions.reduce((sum, d) => sum + d.correctness, 0)) /
          totalDecisions
      )
    : 0;

  return {
    gameId: 'market',
    difficulty: state.scenario.difficulty,
    total: valueScore + holdScore + decisionScore,
    breakdown: { finalValue: valueScore, holdRate: holdScore, decisions: decisionScore },
    playedAt: Date.now(),
    durationMs: state.scenario.timelineYears * state.scenario.tickIntervalMs,
    sessionId: '',
  };
}
