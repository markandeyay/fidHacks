import { Score } from '@/types/game';
import { SideHustleGameState } from '@/types/sideHustle';

export function scoreSideHustle(state: SideHustleGameState): Score {
  const items = state.scenario.lineItems;
  const llcApplicable = state.scenario.llcDecisionApplicable;

  // Bucket placement: 50 when LLC applies, 60 otherwise
  const bucketWeight = llcApplicable ? 50 : 60;
  let correctBuckets = 0;
  for (const item of items) {
    if (state.playerSorts[item.id] === item.correctBucket) {
      correctBuckets++;
    }
  }
  const bucketScore = items.length > 0
    ? Math.round(bucketWeight * (correctBuckets / items.length))
    : 0;

  // Tax calc: 30 when LLC applies, 40 otherwise
  const taxWeight = llcApplicable ? 30 : 40;
  let taxScore = 0;
  if (state.taxOwedPlayer !== undefined && state.taxOwedCorrect !== undefined && state.taxOwedCorrect > 0) {
    const taxError = Math.abs(state.taxOwedPlayer - state.taxOwedCorrect) / state.taxOwedCorrect;
    taxScore = taxError < 0.1 ? taxWeight : Math.max(0, Math.round(taxWeight * (1 - taxError)));
  }

  // LLC decision (20, senior only)
  let llcScore = 0;
  if (llcApplicable) {
    // Simple heuristic: LLC is usually better if income > ~$10k
    const totalIncome = items
      .filter((i) => i.correctBucket === 'taxable_income')
      .reduce((sum, i) => sum + i.amount, 0);
    const optimalLLC = totalIncome > 10000;
    llcScore = state.llcChoice === optimalLLC ? 20 : 0;
  }

  const total = bucketScore + taxScore + llcScore;
  const breakdown: Record<string, number> = llcApplicable
    ? { buckets: bucketScore, tax: taxScore, llc: llcScore }
    : { buckets: bucketScore, tax: taxScore };

  return {
    gameId: 'side-hustle',
    difficulty: state.scenario.difficulty,
    total,
    breakdown,
    playedAt: Date.now(),
    durationMs: 0,
    sessionId: '',
  };
}
