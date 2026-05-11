import { Score } from '@/types/game';
import { OfferFaceoffGameState } from '@/types/offer';

export function scoreOfferFaceoff(state: OfferFaceoffGameState): Score {
  const { offerA, offerB } = state.scenario;
  const allBenefits = [...offerA.benefits, ...offerB.benefits];

  // Conversion accuracy (50)
  let correctConversions = 0;
  for (const benefit of allBenefits) {
    const playerVal = state.playerValuations[benefit.id];
    if (playerVal !== undefined) {
      const error = Math.abs(playerVal - benefit.trueDollarValue) / benefit.trueDollarValue;
      if (error < 0.1) correctConversions++;
    }
  }
  const conversionScore = allBenefits.length > 0
    ? Math.round(50 * (correctConversions / allBenefits.length))
    : 0;

  // Final pick (30)
  const pickScore = state.selectedOffer === state.scenario.optimalChoice ? 30 : 0;

  // Speed (20)
  const targetTimeMs = state.scenario.difficulty === 'senior' ? 300000 : 180000;
  const elapsed = state.submittedAt ? state.submittedAt - state.startedAt : targetTimeMs;
  const speedScore = elapsed < targetTimeMs ? 20 : Math.max(0, Math.round(20 * (1 - (elapsed - targetTimeMs) / targetTimeMs)));

  return {
    gameId: 'offer-faceoff',
    difficulty: state.scenario.difficulty,
    total: conversionScore + pickScore + speedScore,
    breakdown: { conversion: conversionScore, pick: pickScore, speed: speedScore },
    playedAt: Date.now(),
    durationMs: elapsed,
    sessionId: '',
  };
}
