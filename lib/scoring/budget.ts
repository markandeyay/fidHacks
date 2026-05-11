import { Score } from '@/types/game';
import { BudgetBlitzGameState } from '@/types/budget';

export function scoreBudgetBlitz(state: BudgetBlitzGameState): Score {
  const allocations = state.allocations;
  const total = Object.values(allocations).reduce((a, b) => a + b, 0);

  // 50/30/20 benchmark: needs (rent+food+transport+health+personal_care) ~50%, wants (fun) ~30%, savings ~20%
  const needs = (allocations.rent || 0) + (allocations.food || 0) + (allocations.transport || 0) + (allocations.health || 0) + (allocations.personal_care || 0);
  const wants = allocations.fun || 0;
  const savings = allocations.savings || 0;

  const needsRatio = total > 0 ? needs / total : 0;
  const wantsRatio = total > 0 ? wants / total : 0;
  const savingsRatio = total > 0 ? savings / total : 0;

  // Allocation vs 50/30/20 (40 pts)
  const needsScore = Math.max(0, 1 - Math.abs(needsRatio - 0.5) / 0.5);
  const wantsScore = Math.max(0, 1 - Math.abs(wantsRatio - 0.3) / 0.3);
  const savingsScore = Math.max(0, 1 - Math.abs(savingsRatio - 0.2) / 0.2);
  const allocationScore = Math.round(40 * (needsScore + wantsScore + savingsScore) / 3);

  // Chaos response (35 pts)
  let chaosScore = 35;
  for (const chaos of state.triggeredChaos) {
    if (chaos.forcedCategory === 'savings') chaosScore -= 10;
    else if (chaos.forcedCategory === 'rent') chaosScore -= 5;
  }
  chaosScore = Math.max(0, chaosScore);

  // Buffer maintained (25 pts)
  const bufferScore = state.emergencyBuffer > 0 ? 25 : Math.max(0, Math.round(25 * (1 + state.emergencyBuffer / 500)));

  return {
    gameId: 'budget-blitz',
    difficulty: state.scenario.difficulty,
    total: allocationScore + chaosScore + bufferScore,
    breakdown: { allocation: allocationScore, chaos: chaosScore, buffer: bufferScore },
    playedAt: Date.now(),
    durationMs: (state.scenario.timerSeconds * 1000) - state.timeRemainingMs,
    sessionId: '',
  };
}
