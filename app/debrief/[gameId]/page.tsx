'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { GameShell } from '@/components/shared/GameShell';
import { DebriefTimeline } from '@/components/shared/DebriefTimeline';
import { useSessionStore } from '@/stores/sessionStore';
import { WindowCard, PaperButton, StickerLabel, MarkerText } from '@/components/paper';
import { Copy, Check, Lightbulb } from 'lucide-react';

const GAME_LABELS: Record<string, string> = {
  negotiation: 'NEGOTIATION ROOM',
  'offer-faceoff': 'OFFER FACE-OFF',
  'budget-blitz': 'BUDGET BLITZ',
  'side-hustle': 'SIDE HUSTLE AUDIT',
  market: 'THE MARKET',
};

// Didactic tips keyed by gameId + lowest-scoring breakdown dim.
const TIPS: Record<string, Record<string, string>> = {
  negotiation: {
    outcome: 'Anchor higher with specific market data — recruiters expect a counter, and a justified ask usually moves the offer.',
    moves: 'Strong moves cite numbers (competing offers, market benchmarks, scope). Vague hedging gets you nothing.',
    composure: 'Filler phrases like "I was hoping for more" cost you. Stay direct.',
  },
  'offer-faceoff': {
    conversion: 'Always recompute benefit values — base salary alone is misleading. 401k match and equity vesting change everything.',
    pick: 'The "bigger base" offer often loses to the one with serious equity or match. Trust the math, not the headline number.',
    speed: 'Speed bonuses reward decisive players — but never at the cost of accuracy on the dollar conversions.',
  },
  'budget-blitz': {
    allocation: 'Aim for 50% needs / 30% wants / 20% savings. Drift even 10 points off-target hurts your score.',
    chaos: 'When chaos hits, raid your "fun" category — never savings or rent. Buffer first, fun next, essentials last.',
    buffer: 'An emergency buffer is non-negotiable. Even $200 changes how chaos events feel.',
  },
  'side-hustle': {
    buckets: 'Revenue is always taxable. Business expenses (supplies, mileage) are deductible. Personal stuff is not.',
    tax: 'Don\'t forget self-employment tax (15.3%) on top of income tax. Quarterly estimates exist for a reason.',
    llc: 'LLC + S-Corp election usually wins above ~$10k of net income. Below that, sole prop is simpler.',
  },
  market: {
    finalValue: 'Holding through downturns almost always beats panic selling. Time in market > timing the market.',
    holdRate: 'Every "rebalance" or "withdraw" during a crash costs you. Hold unless your scenario truly requires cash.',
    decisions: 'Always take the full 401k match. Roth IRA usually wins over Traditional when you\'re young.',
  },
};

function findLowestBreakdown(score: { breakdown: Record<string, number> }): string | null {
  const entries = Object.entries(score.breakdown);
  if (entries.length === 0) return null;
  let min = entries[0];
  for (const e of entries) if (e[1] < min[1]) min = e;
  return min[0];
}

export default function DebriefPage() {
  const { gameId } = useParams() as { gameId: string };
  const { session, init } = useSessionStore();
  const [copied, setCopied] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => { init(); }, [init]);

  const latestScore = session?.scores
    .filter((s) => s.gameId === gameId)
    .sort((a, b) => b.playedAt - a.playedAt)[0];

  const handleShare = async () => {
    if (!latestScore) return;
    const text = `I scored ${latestScore.total}/100 on ${GAME_LABELS[gameId] || gameId} on Forte. Try it!`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setShowToast(true);
      setTimeout(() => { setCopied(false); setShowToast(false); }, 2400);
    } catch {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2400);
    }
  };

  const lowestDim = latestScore ? findLowestBreakdown(latestScore) : null;
  const tipText = lowestDim ? TIPS[gameId]?.[lowestDim] : undefined;

  return (
    <GameShell title={GAME_LABELS[gameId] || 'DEBRIEF'} subtitle="DEBRIEF">
      {latestScore ? (
        <>
          <DebriefTimeline score={latestScore}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {tipText && (
                <WindowCard variant="warning" title="TIP ⊙ ✕" showControls>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <Lightbulb size={22} color="#0A0A0A" />
                    <p style={{ margin: 0, fontFamily: 'var(--font-patrick), cursive', fontSize: 17, lineHeight: 1.3 }}>{tipText}</p>
                  </div>
                </WindowCard>
              )}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <PaperButton color="coral" onClick={handleShare}>
                  {copied ? <Check size={16} strokeWidth={3} /> : <Copy size={16} strokeWidth={3} />}
                  {copied ? 'COPIED!' : 'SHARE YOUR SCORE'}
                </PaperButton>
              </div>
            </div>
          </DebriefTimeline>

          {showToast && (
            <div
              style={{
                position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)',
                zIndex: 100,
              }}
            >
              <WindowCard variant="info" title="COPIED ⊙ ✕" showControls>
                <span style={{ fontFamily: 'var(--font-patrick)', fontSize: 16 }}>
                  Score copied to clipboard.
                </span>
              </WindowCard>
            </div>
          )}
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <MarkerText as="div" size="lg">NO SCORE FOUND</MarkerText>
          <p style={{ marginTop: 10, fontFamily: 'var(--font-patrick)', fontSize: 18, color: 'var(--paper-cream)' }}>
            Play a game to see your debrief.
          </p>
          <div style={{ marginTop: 18, display: 'inline-flex' }}>
            <StickerLabel color="yellow" size="md" tilt={-2}>$ no_score_found_</StickerLabel>
          </div>
        </div>
      )}
    </GameShell>
  );
}
