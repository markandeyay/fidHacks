'use client';

import { useEffect, useRef } from 'react';
import { Score } from '@/types/game';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { PaperCard, MarkerText, StickerLabel, LightningStar, PaperButton } from '@/components/paper';
import { ForteCat, ForteCatEmotion } from '@/components/mascot/ForteCat';

interface DebriefTimelineProps {
  score: Score;
  children?: React.ReactNode;
}

function mascotForScore(total: number): ForteCatEmotion {
  if (total >= 91) return 'money';
  if (total >= 71) return 'happy';
  if (total >= 41) return 'idle';
  return 'alert';
}

function reactionForScore(total: number): { color: 'yellow' | 'mint' | 'coral' | 'cream'; label: string } {
  if (total >= 91) return { color: 'yellow', label: 'STRONG MOVE!' };
  if (total >= 71) return { color: 'mint', label: 'NICELY DONE' };
  if (total >= 41) return { color: 'cream', label: 'DECENT' };
  return { color: 'coral', label: 'EMBARRASSING ✕' };
}

export function DebriefTimeline({ score, children }: DebriefTimelineProps) {
  const maxBreakdown = Math.max(...Object.values(score.breakdown), 1);
  const reaction = reactionForScore(score.total);
  const containerRef = useRef<HTMLDivElement>(null);

  const breakdownEntries = Object.entries(score.breakdown);
  const maxKey = breakdownEntries.reduce(
    (acc, [k, v]) => (v > acc.v ? { k, v } : acc),
    { k: breakdownEntries[0]?.[0] ?? '', v: -Infinity }
  ).k;

  useEffect(() => {
    let cancelled = false;
    let group: any = null;
    (async () => {
      try {
        const { annotate, annotationGroup } = await import('rough-notation');
        if (cancelled || !containerRef.current) return;
        const labels = containerRef.current.querySelectorAll('[data-rn-underline]');
        const annotations: any[] = [];
        labels.forEach((el) => {
          annotations.push(annotate(el as HTMLElement, { type: 'underline', color: '#0A0A0A', strokeWidth: 3, padding: 4 }));
        });
        const best = containerRef.current.querySelector('[data-rn-circle]');
        if (best) annotations.push(annotate(best as HTMLElement, { type: 'circle', color: '#D9344B', strokeWidth: 3, padding: 6 }));
        group = annotationGroup(annotations);
        setTimeout(() => { if (!cancelled) group.show(); }, 600);
      } catch {}
    })();
    return () => { cancelled = true; try { group?.hide?.(); } catch {} };
  }, [score]);

  useEffect(() => {
    if (score.total >= 80) {
      (async () => {
        try {
          const { fireStarConfetti } = await import('@/lib/effects/starConfetti');
          setTimeout(() => fireStarConfetti({ count: 18, duration: 2200 }), 300);
        } catch {}
      })();
    }
  }, [score.total]);

  return (
    <div ref={containerRef} style={{ maxWidth: 720, margin: '0 auto' }}>
      {/* Big score star */}
      <motion.div
        initial={{ opacity: 0, scale: 0.6, rotate: -8 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 180, damping: 14 }}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 28, position: 'relative' }}
      >
        <div style={{ position: 'relative', width: 340, height: 340, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <LightningStar size={340} variant={1} animate />
          <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontFamily: 'var(--font-marker)', fontSize: 96, color: 'var(--paper-black)', lineHeight: 1 }}>{score.total}</div>
            <div style={{ fontFamily: 'var(--font-patrick)', fontSize: 18, marginTop: -8 }}>out of 100</div>
          </div>
        </div>
        <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 16 }}>
          <ForteCat emotion={mascotForScore(score.total)} size={92} animate />
          <StickerLabel color={reaction.color} size="lg" tilt={-2}>{reaction.label}</StickerLabel>
        </div>
      </motion.div>

      {/* Breakdown bars */}
      <PaperCard color="cream" tilt={-1} style={{ padding: 24, marginBottom: 28 }}>
        <MarkerText as="h3" size="md" style={{ marginBottom: 18 }}>SCORE BREAKDOWN</MarkerText>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {breakdownEntries.map(([key, value], i) => (
            <div key={key}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontFamily: 'var(--font-patrick)' }}>
                <span data-rn-underline style={{ textTransform: 'capitalize', fontSize: 18 }}>{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                {maxKey === key ? (
                  <span data-rn-circle style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{value}</span>
                ) : (
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{value}</span>
                )}
              </div>
              <div className="progress-bar">
                <motion.div
                  className="progress-bar-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${(value / maxBreakdown) * 100}%` }}
                  transition={{ delay: 0.4 + i * 0.12, duration: 0.7, ease: 'easeOut' }}
                />
              </div>
            </div>
          ))}
        </div>
      </PaperCard>

      {children && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          style={{ marginBottom: 28 }}
        >
          {children}
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}
      >
        <Link href="/" style={{ textDecoration: 'none' }}>
          <PaperButton color="cream">BACK HOME</PaperButton>
        </Link>
        <Link href={`/${score.gameId}`} style={{ textDecoration: 'none' }}>
          <PaperButton color="yellow">PLAY AGAIN</PaperButton>
        </Link>
      </motion.div>
    </div>
  );
}
