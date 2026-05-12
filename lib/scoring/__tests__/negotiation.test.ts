import { describe, it, expect } from 'vitest';
import { scoreNegotiation } from '../negotiation';
import { NegotiationGameState } from '@/types/negotiation';

function makeState(partial: Partial<NegotiationGameState> & { scenario: NegotiationGameState['scenario']; turns: NegotiationGameState['turns']; currentOffer: number }): NegotiationGameState {
  return {
    status: 'accepted',
    startedAt: 0,
    ...partial,
  } as NegotiationGameState;
}

describe('scoreNegotiation', () => {
  it('full ceiling: 100 total with perfect outcome, moves, and composure', () => {
    const state = makeState({
      scenario: { initialOffer: 50000, hiddenCeiling: 60000, difficulty: 'junior' } as NegotiationGameState['scenario'],
      currentOffer: 60000,
      turns: [
        { speaker: 'player', moveQuality: 'strong', capitulated: false, filler: false } as any,
        { speaker: 'player', moveQuality: 'strong', capitulated: false, filler: false } as any,
        { speaker: 'player', moveQuality: 'strong', capitulated: false, filler: false } as any,
        { speaker: 'player', moveQuality: 'strong', capitulated: false, filler: false } as any,
      ],
    });

    const score = scoreNegotiation(state);
    expect(score.total).toBe(100);
    expect(score.breakdown).toEqual({ outcome: 40, moves: 35, composure: 25 });
  });

  it('zero progress: total=0 when no gain, weak moves, and capitulated', () => {
    const state = makeState({
      scenario: { initialOffer: 50000, hiddenCeiling: 60000, difficulty: 'junior' } as NegotiationGameState['scenario'],
      currentOffer: 50000,
      turns: [
        { speaker: 'player', moveQuality: 'weak', capitulated: true, filler: false } as any,
        { speaker: 'player', moveQuality: 'weak', capitulated: true, filler: false } as any,
      ],
    });

    const score = scoreNegotiation(state);
    expect(score.total).toBe(0);
    expect(score.breakdown.outcome).toBe(0);
    expect(score.breakdown.moves).toBe(0);
    expect(score.breakdown.composure).toBe(0);
  });

  it('mid performance: 50% ceiling gain, mixed moves, 1 filler', () => {
    const state = makeState({
      scenario: { initialOffer: 50000, hiddenCeiling: 60000, difficulty: 'junior' } as NegotiationGameState['scenario'],
      currentOffer: 55000,
      turns: [
        { speaker: 'player', moveQuality: 'strong', capitulated: false, filler: false } as any,
        { speaker: 'player', moveQuality: 'strong', capitulated: false, filler: false } as any,
        { speaker: 'player', moveQuality: 'neutral', capitulated: false, filler: false } as any,
        { speaker: 'player', moveQuality: 'neutral', capitulated: false, filler: true } as any,
      ],
    });

    const score = scoreNegotiation(state);
    // outcome: 50% of 40 = 20
    expect(score.breakdown.outcome).toBe(20);
    // moves: (2 + 0.5*2) / 4 = 0.75 => 35 * 0.75 = 26.25 => Math.round = 26
    expect(score.breakdown.moves).toBe(26);
    // composure: 25 - 5*1 = 20
    expect(score.breakdown.composure).toBe(20);
    expect(score.total).toBe(66);
  });

  it('empty player turns: moveScore=0, composure=25, outcome from offer math', () => {
    const state = makeState({
      scenario: { initialOffer: 40000, hiddenCeiling: 60000, difficulty: 'junior' } as NegotiationGameState['scenario'],
      currentOffer: 50000,
      turns: [],
    });

    const score = scoreNegotiation(state);
    // outcome: gain=10000, range=20000, pct=0.5 => 20
    expect(score.breakdown.outcome).toBe(20);
    expect(score.breakdown.moves).toBe(0);
    expect(score.breakdown.composure).toBe(25);
    expect(score.total).toBe(45);
  });

  it('zero range: initialOffer === hiddenCeiling → outcomeScore=0, not NaN', () => {
    const state = makeState({
      scenario: { initialOffer: 50000, hiddenCeiling: 50000, difficulty: 'junior' } as NegotiationGameState['scenario'],
      currentOffer: 50000,
      turns: [
        { speaker: 'player', moveQuality: 'strong', capitulated: false, filler: false } as any,
      ],
    });

    const score = scoreNegotiation(state);
    expect(Number.isNaN(score.total)).toBe(false);
    expect(score.breakdown.outcome).toBe(0);
    expect(score.breakdown.moves).toBe(35);
    expect(score.breakdown.composure).toBe(25);
    expect(score.total).toBe(60);
  });
});
