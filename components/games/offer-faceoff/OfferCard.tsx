'use client';

import { OfferLetter } from '@/types/offer';
import { BenefitRow } from './BenefitRow';
import { TrueCompDisplay } from './TrueCompDisplay';
import { EquityTimeline } from './EquityTimeline';
import { motion } from 'framer-motion';
import { StickerLabel, TapeStrip } from '@/components/paper';

interface OfferCardProps {
  offer: OfferLetter;
  label: 'A' | 'B';
  playerValuations: Record<string, number>;
  onValuationChange: (benefitId: string, value: number) => void;
  isRevealed?: boolean;
}

export function OfferCard({ offer, label, playerValuations, onValuationChange, isRevealed }: OfferCardProps) {
  const correctTotal = Object.entries(playerValuations).reduce((sum, [id, val]) => {
    const benefit = offer.benefits.find((b) => b.id === id);
    if (!benefit) return sum;
    const isCorrect = Math.abs(val - benefit.trueDollarValue) <= 50;
    return isCorrect ? sum + benefit.trueDollarValue : sum;
  }, 0);

  const totalBenefits = offer.benefits.length;
  const valuedBenefits = offer.benefits.filter(
    (b) => playerValuations[b.id] !== undefined
  ).length;
  const progressPct = totalBenefits > 0 ? (valuedBenefits / totalBenefits) * 100 : 0;

  const rotation = label === 'A' ? -2 : 2;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      style={{
        position: 'relative',
        background: 'var(--paper-cream)',
        border: '3px solid var(--paper-black)',
        boxShadow: '5px 5px 0 var(--paper-black)',
        padding: 0,
        transform: `rotate(${rotation}deg)`,
      }}
    >
      <TapeStrip position="tc" color="coral" />

      {/* Cobalt header strip */}
      <div
        style={{
          background: 'var(--paper-cobalt)',
          color: 'var(--paper-cream)',
          borderBottom: '3px solid var(--paper-black)',
          padding: '14px 18px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontFamily: 'var(--font-marker), Impact, sans-serif',
                fontSize: 22,
                letterSpacing: 1,
                textTransform: 'uppercase',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {offer.company}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-patrick), cursive',
                fontSize: 16,
                marginTop: 2,
              }}
            >
              {offer.role}
            </div>
          </div>
          <StickerLabel color="yellow" size="lg" tilt={label === 'A' ? -3 : 3}>
            OFFER {label}
          </StickerLabel>
        </div>
      </div>

      {/* Benefits body */}
      <div style={{ padding: 18 }}>
        {offer.benefits.map((benefit, idx) => (
          <BenefitRow
            key={benefit.id}
            benefit={benefit}
            playerValue={playerValuations[benefit.id]}
            onChange={(val) => onValuationChange(benefit.id, val)}
            isRevealed={isRevealed}
            index={idx}
          />
        ))}

        {offer.benefits.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: '24px 0',
              fontFamily: 'var(--font-patrick), cursive',
              fontSize: 14,
              opacity: 0.7,
            }}
          >
            No benefits listed for this offer.
          </div>
        )}

        {offer.vesting && (
          <div style={{ marginTop: 14 }}>
            <EquityTimeline vesting={offer.vesting} />
          </div>
        )}
      </div>

      {/* Footer: True Comp + progress */}
      <div
        style={{
          padding: 18,
          borderTop: '3px solid var(--paper-black)',
          background: 'var(--paper-cream)',
        }}
      >
        <TrueCompDisplay total={correctTotal} label={`Offer ${label} Total`} />

        <div style={{ marginTop: 12 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 6,
              fontFamily: 'var(--font-mono), monospace',
              fontSize: 11,
            }}
          >
            <span style={{ textTransform: 'uppercase', letterSpacing: 1 }}>Progress</span>
            <span>
              {valuedBenefits}/{totalBenefits} valued
            </span>
          </div>
          <div
            style={{
              position: 'relative',
              background: 'var(--paper-cream)',
              border: '2px solid var(--paper-black)',
              height: 14,
              overflow: 'hidden',
            }}
          >
            <motion.div
              style={{ height: '100%', background: 'var(--paper-cobalt)' }}
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
        </div>

        {isRevealed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            style={{
              marginTop: 12,
              paddingTop: 12,
              borderTop: '2px dashed var(--paper-black)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-marker), Impact, sans-serif',
                fontSize: 13,
                letterSpacing: 1,
                textTransform: 'uppercase',
              }}
            >
              True Year 1 Total
            </span>
            <span style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 16, fontWeight: 700 }}>
              ${offer.trueTotalCompYear1.toLocaleString()}
            </span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
