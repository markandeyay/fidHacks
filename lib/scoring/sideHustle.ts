import { Score } from '@/types/game';
import { SideHustleGameState } from '@/types/sideHustle';

export function scoreSideHustle(state: SideHustleGameState): Score {
  const items = state.scenario.lineItems;

  // Bucket placement (50)
  let correctBuckets = 0;
  for (const item of items) {
    if (state.playerSorts[item.id] === item.correctBucket) {
      correctBuckets++;
    }
  }
  const bucketScore = items.length > 0
    ? Math.round(50 * (correctBuckets / items.length))
    : 0;

  // Tax calc (30)
  let taxScore = 0;
  if (state.taxOwedPlayer !== undefined && state.taxOwedCorrect !== undefined && state.taxOwedCorrect > 0) {
    const taxError = Math.abs(state.taxOwedPlayer - state.taxOwedCorrect) / state.taxOwedCorrect;
    taxScore = taxError < 0.1 ? 30 : Math.max(0, Math.round(30 * (1 - taxError)));
  }

  // LLC decision (20, senior only)
  let llcScore = 0;
  if (state.scenario.llcDecisionApplicable) {
    // Simple heuristic: LLC is usually better if income > ~$10k
    const totalIncome = items
      .filter((i) => i.correctBucket === 'taxable_income')
      .reduce((sum, i) => sum + i.amount, 0);
    const optimalLLC = totalIncome > 10000;
    llcScore = state.llcChoice === optimalLLC ? 20 : 0;
  } else {
    llcScore = 20; // not applicable, give full credit
  }

  return {
    gameId: 'side-hustle',
    difficulty: state.scenario.difficulty,
    total: bucketScore + taxScore + llcScore,
    breakdown: { buckets: bucketScore, tax: taxScore, llc: llcScore },
    playedAt: Date.now(),
    durationMs: 0,
    sessionId: '',
  };
}
