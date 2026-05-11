'use client';

import { useParams } from 'next/navigation';
import { GameShell } from '@/components/shared/GameShell';
import { DebriefTimeline } from '@/components/shared/DebriefTimeline';
import { useSessionStore } from '@/stores/sessionStore';
import { useEffect } from 'react';

export default function DebriefPage() {
  const { gameId } = useParams() as { gameId: string };
  const { session, init } = useSessionStore();
  useEffect(() => init(), [init]);

  const latestScore = session?.scores
    .filter((s) => s.gameId === gameId)
    .sort((a, b) => b.playedAt - a.playedAt)[0];

  const gameLabel: Record<string, string> = {
    negotiation: 'NEGOTIATION ROOM',
    'offer-faceoff': 'OFFER FACE-OFF',
    'budget-blitz': 'BUDGET BLITZ',
    'side-hustle': 'SIDE HUSTLE AUDIT',
    market: 'THE MARKET',
  };

  return (
    <GameShell title={gameLabel[gameId] || 'DEBRIEF'} subtitle="DEBRIEF">
      {latestScore ? (
        <DebriefTimeline score={latestScore} />
      ) : (
        <div className="text-center py-20 font-mono text-xs text-text-muted">
          $ no_score_found<span className="animate-pulse">_</span>
        </div>
      )}
    </GameShell>
  );
}
