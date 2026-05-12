'use client';

import { motion } from 'framer-motion';
import { PaperCard, StickerLabel, MarkerText } from '@/components/paper';

interface HourlyRatePanelProps {
  grossIncome: number;
  taxOwed: number;
  hoursWorked: number;
  campusJobHourlyEquivalent: number;
}

export function HourlyRatePanel({
  grossIncome,
  taxOwed,
  hoursWorked,
  campusJobHourlyEquivalent,
}: HourlyRatePanelProps) {
  const postTaxHourly = hoursWorked > 0 ? (grossIncome - taxOwed) / hoursWorked : 0;
  const delta = postTaxHourly - campusJobHourlyEquivalent;
  const hustleWins = delta >= 0;
  const percentDiff =
    campusJobHourlyEquivalent > 0
      ? ((postTaxHourly / campusJobHourlyEquivalent - 1) * 100)
      : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between flex-wrap gap-2">
        <MarkerText size="md">HOURLY RATE COMPARISON</MarkerText>
        <StickerLabel color={hustleWins ? 'mint' : 'coral'} size="sm" tilt={-2}>
          {hustleWins
            ? `Hustle wins +${percentDiff.toFixed(0)}%`
            : `Campus wins ${percentDiff.toFixed(0)}%`}
        </StickerLabel>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <PaperCard color="cream" seed="rate-yours" tilt={-1.5} tape="tl" tapeColor="yellow">
          <div style={{ padding: 16 }}>
            <p
              style={{
                fontFamily: 'var(--font-marker), Impact, sans-serif',
                fontSize: 14,
                letterSpacing: 1,
                marginBottom: 8,
                color: 'var(--paper-black)',
              }}
            >
              YOUR RATE
            </p>
            <p
              className="font-mono tabular-nums"
              style={{
                fontSize: 36,
                fontWeight: 700,
                color: 'var(--paper-black)',
                lineHeight: 1.1,
              }}
            >
              ${postTaxHourly.toFixed(2)}
            </p>
            <p
              className="font-patrick"
              style={{ fontSize: 14, color: 'var(--paper-black)', marginTop: 6 }}
            >
              per hour, after tax ({hoursWorked} hrs)
            </p>
          </div>
        </PaperCard>

        <PaperCard color="cream" seed="rate-campus" tilt={1.5} tape="tr" tapeColor="coral">
          <div style={{ padding: 16 }}>
            <p
              style={{
                fontFamily: 'var(--font-marker), Impact, sans-serif',
                fontSize: 14,
                letterSpacing: 1,
                marginBottom: 8,
                color: 'var(--paper-black)',
              }}
            >
              CAMPUS JOB
            </p>
            <p
              className="font-mono tabular-nums"
              style={{
                fontSize: 36,
                fontWeight: 700,
                color: 'var(--paper-black)',
                lineHeight: 1.1,
              }}
            >
              ${campusJobHourlyEquivalent.toFixed(2)}
            </p>
            <p
              className="font-patrick"
              style={{ fontSize: 14, color: 'var(--paper-black)', marginTop: 6 }}
            >
              per hour, campus rate
            </p>
          </div>
        </PaperCard>
      </div>

      <p
        className="font-patrick"
        style={{ fontSize: 15, color: 'var(--paper-black)', lineHeight: 1.4 }}
      >
        {hustleWins ? (
          <>
            Side hustle pays approximately {percentDiff.toFixed(0)}% more per hour after taxes
            compared to a campus job. Consider flexibility, experience, and scalability.
          </>
        ) : (
          <>
            Effective rate is about {Math.abs(percentDiff).toFixed(0)}% below a campus job after
            taxes. Consider flexibility, experience, and scalability when evaluating the trade-off.
          </>
        )}
      </p>
    </motion.div>
  );
}
