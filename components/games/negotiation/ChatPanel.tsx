'use client';

import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { NegotiationTurn } from '@/types/negotiation';

interface ChatPanelProps {
  turns: NegotiationTurn[];
}

function formatMoney(val: number): string {
  return val < 1000 ? `$${val.toFixed(2)}/hr` : `$${val.toLocaleString()}`;
}

export function ChatPanel({ turns }: ChatPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [turns]);

  const qualityBadge = (q?: string) => {
    if (q === 'strong') return 'badge badge-green';
    if (q === 'neutral') return 'badge badge-amber';
    if (q === 'weak') return 'badge badge-red';
    return '';
  };

  const qualityLabel = (q?: string) => {
    if (q === 'strong') return 'Strong';
    if (q === 'neutral') return 'Neutral';
    if (q === 'weak') return 'Weak';
    return '';
  };

  return (
    <div ref={scrollRef} className="h-96 overflow-y-auto card divide-y divide-border-default">
      {turns.length === 0 && (
        <div className="p-8 text-center text-text-muted text-sm">
          Waiting for the recruiter to speak...
        </div>
      )}

      {turns.map((turn, i) => {
        const isPlayer = turn.speaker === 'player';
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className={isPlayer ? 'bg-fid-green-light/30' : ''}
          >
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-sm font-bold ${isPlayer ? 'text-fid-green' : 'text-accent-blue'}`}>
                  {isPlayer ? 'You' : 'Recruiter'}
                </span>
                {isPlayer && turn.moveQuality && (
                  <span className={qualityBadge(turn.moveQuality)}>{qualityLabel(turn.moveQuality)}</span>
                )}
                {turn.currentOffer !== undefined && (
                  <span className="ml-auto text-sm font-bold text-text-heading">
                    {formatMoney(turn.currentOffer)}
                  </span>
                )}
              </div>

              <p className="text-sm text-text-body leading-relaxed">{turn.text}</p>

              {isPlayer && turn.offerDelta && turn.offerDelta !== 0 && (
                <div className={`mt-2 text-sm font-bold ${turn.offerDelta > 0 ? 'text-fid-green' : 'text-accent-red'}`}>
                  {turn.offerDelta > 0 ? '+' : ''}{formatMoney(turn.offerDelta)}
                </div>
              )}

              {turn.filler && (
                <div className="mt-2 text-xs text-accent-red font-medium">
                  Weak move — be more specific next time.
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
