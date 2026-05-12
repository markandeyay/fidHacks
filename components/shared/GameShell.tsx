'use client';

import Link from 'next/link';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { ReactNode } from 'react';
import { TornBanner, MarkerText, StickerLabel, LightningStar } from '@/components/paper';
import { ForteCat } from '@/components/mascot/ForteCat';

interface GameShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  onRestart?: () => void;
}

export function GameShell({ title, subtitle, children, onRestart }: GameShellProps) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper-teal)', position: 'relative' }}>
      {/* Decorative scattered stars */}
      <div aria-hidden style={{ position: 'absolute', top: 80, left: 40, opacity: 0.55, pointerEvents: 'none' }}>
        <LightningStar size={48} variant={2} />
      </div>
      <div aria-hidden style={{ position: 'absolute', top: 200, right: 60, opacity: 0.5, pointerEvents: 'none' }}>
        <LightningStar size={64} variant={3} />
      </div>

      {/* Header torn banner */}
      <TornBanner color="cream" style={{ position: 'sticky', top: 0, zIndex: 50, paddingTop: 14, paddingBottom: 14, boxShadow: '0 4px 0 rgba(10,10,10,0.4)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Link href="/" aria-label="back" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 38, height: 38, background: 'var(--paper-yellow)', border: '3px solid var(--paper-black)', boxShadow: '3px 3px 0 var(--paper-black)', color: 'var(--paper-black)', transform: 'rotate(-3deg)' }}>
              <ArrowLeft size={18} strokeWidth={3} />
            </Link>
            <ForteCat emotion="idle" size={42} animate />
            <MarkerText as="h1" size="lg">{title}</MarkerText>
            {subtitle && (
              <StickerLabel color="coral" size="sm" tilt={2}>{subtitle}</StickerLabel>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {onRestart && (
              <button
                onClick={onRestart}
                title="Restart"
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 38, height: 38, background: 'var(--paper-coral)', border: '3px solid var(--paper-black)', boxShadow: '3px 3px 0 var(--paper-black)', color: 'var(--paper-black)', cursor: 'pointer', transform: 'rotate(3deg)' }}
              >
                <RotateCcw size={18} strokeWidth={3} />
              </button>
            )}
          </div>
        </div>
      </TornBanner>

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 20px 80px', position: 'relative', zIndex: 2 }}>
        {children}
      </main>
    </div>
  );
}
