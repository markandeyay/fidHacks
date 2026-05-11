'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { GameId } from '@/types/game';
import { useSessionStore } from '@/stores/sessionStore';
import { useEffect } from 'react';
import {
  ArrowRight, MessageSquare, FileText, Wallet, ReceiptText, TrendingUp,
  ChevronRight, Sparkles
} from 'lucide-react';

const GAMES: {
  id: GameId; title: string; tagline: string; icon: React.ReactNode;
  color: string; bg: string; badge: string;
}[] = [
  {
    id: 'negotiation', title: 'Negotiation Room',
    tagline: 'Talk salary with an AI recruiter. Win the offer.',
    icon: <MessageSquare className="w-5 h-5" />,
    color: '#009A44', bg: '#E6F4EC', badge: 'badge-green',
  },
  {
    id: 'offer-faceoff', title: 'Offer Face-Off',
    tagline: 'Decode two offer letters. Find the real value.',
    icon: <FileText className="w-5 h-5" />,
    color: '#2563EB', bg: '#DBEAFE', badge: 'badge-blue',
  },
  {
    id: 'budget-blitz', title: 'Budget Blitz',
    tagline: 'Drag tiles. Beat the timer. Survive chaos.',
    icon: <Wallet className="w-5 h-5" />,
    color: '#D97706', bg: '#FEF3C7', badge: 'badge-amber',
  },
  {
    id: 'side-hustle', title: 'Side Hustle Audit',
    tagline: 'Sort receipts. Crunch taxes. Know your rate.',
    icon: <ReceiptText className="w-5 h-5" />,
    color: '#7C3AED', bg: '#EDE9FE', badge: 'badge-purple',
  },
  {
    id: 'market', title: 'The Market',
    tagline: 'Invest 30 years. Dodge crashes. Build wealth.',
    icon: <TrendingUp className="w-5 h-5" />,
    color: '#DC2626', bg: '#FEE2E2', badge: 'badge-red',
  },
];

export default function Home() {
  const { session, init } = useSessionStore();
  useEffect(() => init(), [init]);

  return (
    <main className="min-h-screen bg-bg-primary">
      {/* Nav */}
      <header className="border-b border-border-default bg-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-fid-green flex items-center justify-center">
              <span className="text-white font-bold text-sm">F</span>
            </div>
            <span className="text-xl font-bold text-text-heading tracking-tight">Forte</span>
          </div>
          <div className="flex items-center gap-6 text-sm font-medium">
            <span className="text-text-muted">{GAMES.length} simulations</span>
            <span className="text-text-muted">
              {session?.scores.length ?? 0} scores
            </span>
          </div>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 py-16 md:py-24">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full bg-fid-green-light text-fid-green-dark text-sm font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Financial Literacy, Gamified
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-text-heading mb-4 tracking-tight leading-tight">
            Master Your<br className="md:hidden" />
            <span className="text-fid-green"> Financial Instincts</span>
          </h1>
          <p className="text-lg text-text-muted max-w-xl mx-auto leading-relaxed">
            Five interactive simulations that teach the money skills nobody teaches in school.
            Negotiate, budget, invest, and audit your way to financial confidence.
          </p>
          <div className="flex items-center justify-center gap-3 mt-8">
            <span className="text-xs text-text-muted font-medium">Scroll to explore</span>
            <ChevronRight className="w-4 h-4 text-text-muted rotate-90" />
          </div>
        </motion.div>

        {/* Game grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-stagger">
          {GAMES.map((game) => {
            const best = session?.scores
              .filter((s) => s.gameId === game.id)
              .sort((a, b) => b.total - a.total)[0];
            return (
              <Link key={game.id} href={`/${game.id}`}>
                <div className="card p-6 group transition-all duration-200 hover:border-fid-green/30">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: game.bg, color: game.color }}
                    >
                      {game.icon}
                    </div>
                    {best && (
                      <div className="flex items-center gap-1.5">
                        <span className="badge badge-green">{best.total}</span>
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-text-heading mb-2 group-hover:text-fid-green transition-colors">
                    {game.title}
                  </h3>
                  <p className="text-sm text-text-muted leading-relaxed mb-4">
                    {game.tagline}
                  </p>
                  <div className="flex items-center gap-1 text-sm font-semibold text-fid-green opacity-0 group-hover:opacity-100 transition-opacity">
                    Play now <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border-default py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm text-text-muted">
            <div className="w-6 h-6 rounded bg-fid-green flex items-center justify-center">
              <span className="text-white font-bold text-xs">F</span>
            </div>
            <span>Forte — Financial Literacy Simulator</span>
          </div>
          <span className="text-xs text-text-muted">v1.0</span>
        </div>
      </footer>
    </main>
  );
}
