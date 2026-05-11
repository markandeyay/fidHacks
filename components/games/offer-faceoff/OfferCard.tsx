'use client';

import { OfferLetter } from '@/types/offer';
import { BenefitRow } from './BenefitRow';
import { TrueCompDisplay } from './TrueCompDisplay';
import { EquityTimeline } from './EquityTimeline';
import { motion } from 'framer-motion';
import { Building2, BriefcaseBusiness } from 'lucide-react';

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

  const accentBorder = label === 'A' ? 'border-fid-green' : 'border-accent-blue';
  const accentBg = label === 'A' ? 'bg-fid-green' : 'bg-accent-blue';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="card overflow-hidden"
    >
      <div className={`h-1 ${accentBg}`} />

      <div className="px-5 py-4 border-b border-border-default">
        <div className="flex items-center gap-2 mb-3">
          <div className={`w-7 h-7 rounded-lg ${accentBg} flex items-center justify-center flex-shrink-0`}>
            <span className="text-white font-bold text-xs">Offer {label}</span>
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
            Offer {label}
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-text-muted flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-wider text-text-muted">Company</div>
              <div className="text-sm font-semibold text-text-heading truncate">{offer.company}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <BriefcaseBusiness className="w-4 h-4 text-text-muted flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-wider text-text-muted">Role</div>
              <div className="text-sm font-semibold text-text-heading truncate">{offer.role}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 py-4 space-y-2">
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
          <div className="text-center py-6 text-xs text-text-muted">
            No benefits listed for this offer.
          </div>
        )}
      </div>

      {offer.vesting && (
        <div className="px-5 py-4 border-t border-border-default">
          <EquityTimeline vesting={offer.vesting} />
        </div>
      )}

      <div className="px-5 py-4 border-t border-border-default bg-bg-subtle">
        <TrueCompDisplay total={correctTotal} label={`Offer ${label} Total`} />

        <div className="mt-3">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[10px] uppercase tracking-wider text-text-muted font-medium">
              Progress
            </span>
            <span className="text-[10px] font-medium text-text-muted">
              {valuedBenefits}/{totalBenefits} valued
            </span>
          </div>
          <div className="progress-bar">
            <motion.div
              className={`progress-bar-fill ${label === 'B' ? '!bg-accent-blue' : ''}`}
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
            className="mt-3 pt-3 border-t border-border-default"
          >
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-text-muted">True Year 1 Total</span>
              <span className="text-sm font-bold text-fid-green">
                ${offer.trueTotalCompYear1.toLocaleString()}
              </span>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
