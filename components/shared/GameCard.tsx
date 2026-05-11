'use client';

import Link from 'next/link';
import { GameId } from '@/types/game';
import { useSessionStore } from '@/stores/sessionStore';
import { useEffect } from 'react';

interface GameCardProps {
  id: GameId;
  title: string;
  tagline: string;
  emoji: string;
  color: string;
}

export function GameCard({ id, title, tagline, emoji, color }: GameCardProps) {
  const { session, init } = useSessionStore();
  useEffect(() => init(), [init]);

  const bestScore = session?.scores
    .filter((s) => s.gameId === id)
    .sort((a, b) => b.total - a.total)[0];

  return (
    <Link href={`/${id}`}>
      <div
        className={`group relative bg-bg-card border-2 ${color} rounded-2xl p-6 hover:bg-bg-elevated transition-all duration-300 hover:scale-[1.02] cursor-pointer`}
      >
        <div className="text-4xl mb-4">{emoji}</div>
        <h2 className="text-xl font-bold mb-2 group-hover:text-accent-blue transition-colors">
          {title}
        </h2>
        <p className="text-text-muted text-sm leading-relaxed">{tagline}</p>
        {bestScore && (
          <div className="mt-4 inline-flex items-center gap-2 bg-bg-elevated px-3 py-1 rounded-full">
            <span className="text-xs text-text-muted uppercase tracking-wider">Best</span>
            <span className="text-lg font-mono font-bold text-accent-green">
              {bestScore.total}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
