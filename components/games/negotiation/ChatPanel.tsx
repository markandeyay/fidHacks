'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NegotiationTurn } from '@/types/negotiation';
import { PaperCard, MarkerText, StickerLabel } from '@/components/paper';
import { seededTilt } from '@/lib/design/tilt';

interface Props {
  turns: NegotiationTurn[];
}

export function ChatPanel({ turns }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [turns]);

  return (
    <div
      ref={ref}
      style={{
        background: 'var(--paper-cream)',
        border: '3px solid var(--paper-black)',
        boxShadow: '4px 4px 0 var(--paper-black)',
        padding: 18,
        minHeight: 360,
        maxHeight: 460,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <AnimatePresence initial={false}>
        {turns.map((turn, idx) => {
          const isPlayer = turn.speaker === 'player';
          const tilt = seededTilt(`${turn.speaker}-${idx}-${turn.text.slice(0, 8)}`, 2);
          return (
            <motion.div
              key={`${idx}-${turn.speaker}`}
              initial={{ opacity: 0, y: -20, rotate: 0 }}
              animate={{ opacity: 1, y: 0, rotate: tilt }}
              transition={{ type: 'spring', stiffness: 200, damping: 18 }}
              style={{ display: 'flex', justifyContent: isPlayer ? 'flex-end' : 'flex-start' }}
            >
              <div style={{ maxWidth: '85%' }}>
                <div style={{ display: 'flex', justifyContent: isPlayer ? 'flex-end' : 'flex-start', marginBottom: 4 }}>
                  <StickerLabel
                    color={isPlayer ? 'yellow' : 'cobalt'}
                    size="sm"
                    tilt={isPlayer ? 3 : -3}
                  >
                    {isPlayer ? 'YOU' : 'ALEX (RECRUITER)'}
                  </StickerLabel>
                </div>
                <PaperCard
                  color={isPlayer ? 'yellow' : 'cream'}
                  tilt={0}
                  hover={false}
                  tape={idx % 3 === 0 ? (isPlayer ? 'tr' : 'tl') : 'none'}
                  tapeColor={isPlayer ? 'cream' : 'coral'}
                  style={{ padding: '14px 16px' }}
                >
                  <p style={{ margin: 0, fontFamily: 'var(--font-patrick), cursive', fontSize: 18, lineHeight: 1.35, color: 'var(--paper-black)' }}>
                    {turn.text}
                  </p>
                  {turn.speaker === 'recruiter' && turn.currentOffer !== undefined && (
                    <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <StickerLabel color="mint" size="sm" tilt={-2}>
                        OFFER: ${turn.currentOffer < 1000 ? turn.currentOffer.toFixed(2) + '/hr' : turn.currentOffer.toLocaleString()}
                      </StickerLabel>
                    </div>
                  )}
                  {turn.speaker === 'player' && turn.moveQuality && (
                    <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
                      <StickerLabel
                        color={turn.moveQuality === 'strong' ? 'mint' : turn.moveQuality === 'weak' ? 'cherry' : 'cream'}
                        size="sm"
                        tilt={2}
                      >
                        {turn.moveQuality.toUpperCase()} MOVE
                      </StickerLabel>
                      {turn.offerDelta !== undefined && turn.offerDelta > 0 && (
                        <StickerLabel color="yellow" size="sm" tilt={-2}>
                          +${turn.offerDelta.toLocaleString()}
                        </StickerLabel>
                      )}
                    </div>
                  )}
                </PaperCard>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
