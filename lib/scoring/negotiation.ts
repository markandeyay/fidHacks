import { Score } from '@/types/game';
import { NegotiationGameState } from '@/types/negotiation';

export function scoreNegotiation(state: NegotiationGameState): Score {
  const { initialOffer, hiddenCeiling } = state.scenario;
  const finalOffer = state.currentOffer;
  const playerTurns = state.turns.filter((t) => t.speaker === 'player');

  // Outcome (0-40)
  const outcomeRange = hiddenCeiling - initialOffer;
  const outcomeGain = finalOffer - initialOffer;
  const outcomePct = outcomeRange > 0 ? outcomeGain / outcomeRange : 0;
  const outcomeScore = Math.round(40 * Math.max(0, Math.min(1, outcomePct)));

  // Move quality (0-35)
  const strong = playerTurns.filter((t) => t.moveQuality === 'strong').length;
  const neutral = playerTurns.filter((t) => t.moveQuality === 'neutral').length;
  const moveScore = Math.round(
    (35 * (strong + 0.5 * neutral)) / Math.max(1, playerTurns.length)
  );

  // Composure (0-25)
  const capitulated = playerTurns.some((t) => t.capitulated);
  const fillerCount = playerTurns.filter((t) => t.filler).length;
  const composureScore = capitulated
    ? 0
    : Math.max(0, 25 - 5 * fillerCount);

  return {
    gameId: 'negotiation',
    difficulty: state.scenario.difficulty,
    total: outcomeScore + moveScore + composureScore,
    breakdown: { outcome: outcomeScore, moves: moveScore, composure: composureScore },
    playedAt: Date.now(),
    durationMs: Date.now() - state.startedAt,
    sessionId: '', // filled by caller
  };
}
