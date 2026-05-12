import { describe, it, expect } from 'vitest';
import { scoreOfferFaceoff } from '../compensation';
import { OfferFaceoffGameState } from '@/types/offer';

function makeState(partial: Partial<OfferFaceoffGameState> & { scenario: OfferFaceoffGameState['scenario']; playerValuations: OfferFaceoffGameState['playerValuations'] }): OfferFaceoffGameState {
  return {
    selectedOffer: undefined,
    startedAt: 0,
    submittedAt: undefined,
    ...partial,
  } as OfferFaceoffGameState;
}

describe('scoreOfferFaceoff', () => {
  const benefitsA = [
    { id: 'b1', trueDollarValue: 100 },
    { id: 'b2', trueDollarValue: 200 },
  ];
  const benefitsB = [
    { id: 'b3', trueDollarValue: 150 },
  ];

  it('perfect: exact valuations, correct pick, fast completion', () => {
    const state = makeState({
      scenario: {
        difficulty: 'junior',
        offerA: { benefits: benefitsA as any },
        offerB: { benefits: benefitsB as any },
        optimalChoice: 'A',
      } as OfferFaceoffGameState['scenario'],
      playerValuations: {
        b1: 100,
        b2: 200,
        b3: 150,
      },
      selectedOffer: 'A',
      startedAt: 0,
      submittedAt: 60000, // 1 minute
    });

    const score = scoreOfferFaceoff(state);
    expect(score.total).toBe(100);
    expect(score.breakdown).toEqual({ conversion: 50, pick: 30, speed: 20 });
  });

  it('all wrong: valuations off by >10%, wrong pick, slow', () => {
    const state = makeState({
      scenario: {
        difficulty: 'junior',
        offerA: { benefits: benefitsA as any },
        offerB: { benefits: benefitsB as any },
        optimalChoice: 'A',
      } as OfferFaceoffGameState['scenario'],
      playerValuations: {
        b1: 1000, // 900% error
        b2: 1000,
        b3: 1000,
      },
      selectedOffer: 'B',
      startedAt: 0,
      submittedAt: 600000, // 10 minutes
    });

    const score = scoreOfferFaceoff(state);
    expect(score.total).toBe(0);
    expect(score.breakdown.conversion).toBe(0);
    expect(score.breakdown.pick).toBe(0);
    expect(score.breakdown.speed).toBe(0);
  });

  it('partial valuations: unset benefits do not count toward correct conversions', () => {
    const state = makeState({
      scenario: {
        difficulty: 'junior',
        offerA: { benefits: benefitsA as any },
        offerB: { benefits: benefitsB as any },
        optimalChoice: 'A',
      } as OfferFaceoffGameState['scenario'],
      playerValuations: {
        b1: 100, // exact
        // b2 omitted
        // b3 omitted
      },
      selectedOffer: 'A',
      startedAt: 0,
      submittedAt: 60000,
    });

    const score = scoreOfferFaceoff(state);
    // 1 correct out of 3 total benefits
    expect(score.breakdown.conversion).toBe(Math.round(50 * (1 / 3)));
    expect(Number.isNaN(score.breakdown.conversion)).toBe(false);
  });

  it('speed boundary: exactly at targetTimeMs for non-senior returns full speed score', () => {
    const state = makeState({
      scenario: {
        difficulty: 'junior',
        offerA: { benefits: benefitsA as any },
        offerB: { benefits: benefitsB as any },
        optimalChoice: 'A',
      } as OfferFaceoffGameState['scenario'],
      playerValuations: {
        b1: 100,
        b2: 200,
        b3: 150,
      },
      selectedOffer: 'A',
      startedAt: 0,
      submittedAt: 180000, // exactly 3 minutes
    });

    const score = scoreOfferFaceoff(state);
    // elapsed (180000) is not < targetTimeMs (180000), so else branch
    // Math.max(0, Math.round(20 * (1 - (180000 - 180000) / 180000))) = Math.round(20) = 20
    expect(score.breakdown.speed).toBe(20);
  });

  it('empty benefits: conversionScore=0', () => {
    const state = makeState({
      scenario: {
        difficulty: 'junior',
        offerA: { benefits: [] as any },
        offerB: { benefits: [] as any },
        optimalChoice: 'A',
      } as OfferFaceoffGameState['scenario'],
      playerValuations: {},
      selectedOffer: 'A',
      startedAt: 0,
      submittedAt: 60000,
    });

    const score = scoreOfferFaceoff(state);
    expect(score.breakdown.conversion).toBe(0);
    expect(score.breakdown.pick).toBe(30);
    expect(score.breakdown.speed).toBe(20);
  });
});
