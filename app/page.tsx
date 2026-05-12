'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { GameId } from '@/types/game';
import { useSessionStore } from '@/stores/sessionStore';
import { JUDGE_SEED_SCORES } from '@/lib/demo/judgeSeed';
import { SkillRadar } from '@/components/shared/SkillRadar';
import { ForteCat } from '@/components/mascot/ForteCat';
import { WelcomeOverlay } from '@/components/effects/WelcomeOverlay';
import { StarConfettiHost } from '@/lib/effects/starConfetti';
import {
  WindowCard,
  PaperCard,
  TornBanner,
  StickerLabel,
  MarkerText,
  LightningStar,
  PaperButton,
} from '@/components/paper';
import {
  MessageSquare,
  FileText,
  Wallet,
  ReceiptText,
  TrendingUp,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

type Variant = 'warning' | 'error' | 'info' | 'hydrating' | 'cost' | 'success';

const GAMES: {
  id: GameId;
  title: string;
  windowTitle: string;
  tagline: string;
  variant: Variant;
  icon: React.ReactNode;
  tilt: number;
}[] = [
  {
    id: 'negotiation',
    title: 'Negotiation Room',
    windowTitle: 'NEGOTIATE ⊙',
    tagline: 'Talk salary with an AI recruiter. Win the offer.',
    variant: 'hydrating',
    icon: <MessageSquare size={28} strokeWidth={3} />,
    tilt: -2.5,
  },
  {
    id: 'offer-faceoff',
    title: 'Offer Face-Off',
    windowTitle: 'OFFERS ⊙',
    tagline: 'Decode two offer letters. Find the real value.',
    variant: 'info',
    icon: <FileText size={28} strokeWidth={3} />,
    tilt: 2,
  },
  {
    id: 'budget-blitz',
    title: 'Budget Blitz',
    windowTitle: 'COSTS TOO MUCH! ⊙',
    tagline: 'Drag tiles. Beat the timer. Survive chaos.',
    variant: 'cost',
    icon: <Wallet size={28} strokeWidth={3} />,
    tilt: -1.5,
  },
  {
    id: 'side-hustle',
    title: 'Side Hustle Audit',
    windowTitle: 'RECEIPTS ⊙',
    tagline: 'Sort receipts. Crunch taxes. Know your rate.',
    variant: 'warning',
    icon: <ReceiptText size={28} strokeWidth={3} />,
    tilt: 3,
  },
  {
    id: 'market',
    title: 'The Market',
    windowTitle: 'MARKET ⊙',
    tagline: 'Invest 30 years. Dodge crashes. Build wealth.',
    variant: 'error',
    icon: <TrendingUp size={28} strokeWidth={3} />,
    tilt: -3,
  },
];

// Decorative star positions (deterministic so SSR-safe)
const DECOR_STARS: { top: string; left?: string; right?: string; size: number; variant: 1 | 2 | 3; rotate: number }[] = [
  { top: '8%', left: '4%', size: 70, variant: 2, rotate: -8 },
  { top: '14%', right: '6%', size: 56, variant: 3, rotate: 12 },
  { top: '30%', left: '10%', size: 44, variant: 1, rotate: 20 },
  { top: '42%', right: '8%', size: 68, variant: 2, rotate: -15 },
  { top: '58%', left: '5%', size: 52, variant: 3, rotate: 30 },
  { top: '68%', right: '12%', size: 60, variant: 1, rotate: -22 },
  { top: '80%', left: '14%', size: 40, variant: 2, rotate: 8 },
  { top: '88%', right: '4%', size: 50, variant: 3, rotate: -10 },
];

export default function Home() {
  const session = useSessionStore((s) => s.session);
  const init = useSessionStore((s) => s.init);

  useEffect(() => {
    init();
  }, [init]);

  // Judge mode seed
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    if (url.searchParams.get('judge') === 'true') {
      const s = useSessionStore.getState().session;
      const addScore = useSessionStore.getState().addScore;
      if (s && s.scores.length === 0) {
        for (const score of JUDGE_SEED_SCORES) {
          addScore({ ...score, sessionId: s.sessionId });
        }
      }
    }
  }, []);

  return (
    <main style={{ minHeight: '100vh', background: 'var(--paper-teal)', position: 'relative', overflow: 'hidden' }}>
      {/* Decorative lightning stars */}
      {DECOR_STARS.map((s, i) => (
        <div
          key={i}
          aria-hidden
          className="hidden sm:block"
          style={{
            position: 'absolute',
            top: s.top,
            left: s.left,
            right: s.right,
            zIndex: 1,
            pointerEvents: 'none',
            transform: `rotate(${s.rotate}deg)`,
            opacity: 0.85,
          }}
        >
          <LightningStar size={s.size} variant={s.variant} animate />
        </div>
      ))}

      {/* Header torn banner */}
      <TornBanner color="cream" style={{ paddingTop: 14, paddingBottom: 14, position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 4px 0 rgba(10,10,10,0.4)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <ForteCat emotion="idle" size={44} animate />
            <MarkerText as="span" size="lg">Forte</MarkerText>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <StickerLabel color="yellow" size="sm" tilt={-3}>{GAMES.length} simulations</StickerLabel>
            <StickerLabel color="coral" size="sm" tilt={3}>{session?.scores.length ?? 0} scores</StickerLabel>
          </div>
        </div>
      </TornBanner>

      {/* Hero */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '60px 20px 40px', position: 'relative', zIndex: 2 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative' }}
        >
          {/* Black starburst frame + mascot */}
          <div style={{ position: 'relative', width: 340, height: 340, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src="/textures/star-burst-black.svg" alt="" width={340} height={340} style={{ position: 'absolute', inset: 0 }} />
            <ForteCat emotion="idle" size={210} animate style={{ position: 'relative', zIndex: 2, transform: 'rotate(-2deg)' }} />
            {/* Yellow stars near hero */}
            <div style={{ position: 'absolute', top: -30, right: -10, zIndex: 3 }}>
              <LightningStar size={86} variant={1} />
            </div>
            <div style={{ position: 'absolute', bottom: -20, left: 10, zIndex: 3 }}>
              <LightningStar size={58} variant={2} />
            </div>
          </div>

          <div style={{ marginTop: 6 }}>
            <StickerLabel color="yellow" size="md" tilt={-3}>
              <Sparkles size={12} style={{ marginRight: 6 }} /> Financial literacy — gamified
            </StickerLabel>
          </div>

          <div style={{ marginTop: 22 }}>
            <MarkerText as="h1" size="3xl" color="#0A0A0A" style={{ textAlign: 'center', lineHeight: 0.95 }}>
              MASTER YOUR<br/>
              <span style={{ color: 'var(--paper-yellow)', WebkitTextStroke: '2px #0A0A0A' }}>FINANCIAL</span><br/>
              INSTINCTS
            </MarkerText>
          </div>
          <p style={{ marginTop: 18, maxWidth: 560, fontFamily: 'var(--font-patrick), cursive', fontSize: 20, color: 'var(--paper-cream)', lineHeight: 1.35 }}>
            Five interactive simulations that teach the money skills nobody teaches in school.
            Negotiate, budget, invest, and audit your way to financial confidence.
          </p>
        </motion.div>
      </section>

      {/* Game grid */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '20px 20px 60px', position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 28 }}>
          {GAMES.map((g, idx) => {
            const best = session?.scores
              .filter((s) => s.gameId === g.id)
              .sort((a, b) => b.total - a.total)[0];
            return (
              <motion.div
                key={g.id}
                initial={{ opacity: 0, y: -40, rotate: 0 }}
                animate={{ opacity: 1, y: 0, rotate: g.tilt }}
                transition={{ type: 'spring', stiffness: 180, damping: 16, delay: idx * 0.08 }}
                whileHover={{ y: -6, rotate: g.tilt + 0.5, boxShadow: '8px 8px 0 #0A0A0A' as any }}
              >
                <Link href={`/${g.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                  <WindowCard
                    title={`${g.windowTitle} ✕`}
                    variant={g.variant}
                    showControls
                    tilt={0}
                    seed={g.id}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 10 }}>
                      <div style={{ width: 52, height: 52, background: 'var(--paper-yellow)', border: '3px solid var(--paper-black)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '3px 3px 0 var(--paper-black)' }}>
                        {g.icon}
                      </div>
                      <div>
                        <MarkerText as="h3" size="md">{g.title}</MarkerText>
                      </div>
                    </div>
                    <p style={{ fontFamily: 'var(--font-patrick), cursive', fontSize: 17, lineHeight: 1.3, color: 'var(--paper-black)', marginBottom: 14 }}>
                      {g.tagline}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      {best ? (
                        <StickerLabel color="mint" size="sm" tilt={-2}>BEST: {best.total}</StickerLabel>
                      ) : (
                        <StickerLabel color="cream" size="sm" tilt={-2}>NOT PLAYED</StickerLabel>
                      )}
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-marker)', fontSize: 14 }}>
                        PLAY <ArrowRight size={16} strokeWidth={3} />
                      </span>
                    </div>
                  </WindowCard>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Skill profile */}
      <section style={{ maxWidth: 760, margin: '0 auto', padding: '32px 20px 60px', position: 'relative', zIndex: 2 }}>
        <div style={{ textAlign: 'center', marginBottom: 18 }}>
          <MarkerText as="h2" size="xl" color="#F5EBD8">YOUR SKILL PROFILE</MarkerText>
        </div>
        <PaperCard color="cream" tilt={-1} tape="tc" tapeColor="coral" style={{ padding: 24 }}>
          <SkillRadar scores={session?.scores ?? []} />
        </PaperCard>
      </section>

      {/* Footer */}
      <TornBanner color="cobalt" style={{ paddingTop: 16, paddingBottom: 16, marginTop: 20 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--paper-cream)' }}>
            <img src="/mascot/forte-cat-sleepy.svg" alt="" width={36} height={36} style={{ transform: 'rotate(-6deg)' }} />
            <span style={{ fontFamily: 'var(--font-patrick)', fontSize: 18 }}>Forte — Financial Literacy Simulator</span>
          </div>
          <StickerLabel color="yellow" size="sm" tilt={3}>v1.0 / handmade</StickerLabel>
        </div>
      </TornBanner>

      <WelcomeOverlay />
      <StarConfettiHost />
    </main>
  );
}
