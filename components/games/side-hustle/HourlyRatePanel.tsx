'use client';

import { motion } from 'framer-motion';
import { Clock, TrendingUp, TrendingDown, Minus } from 'lucide-react';

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
  const grossHourly = hoursWorked > 0 ? grossIncome / hoursWorked : 0;
  const postTaxHourly = hoursWorked > 0 ? (grossIncome - taxOwed) / hoursWorked : 0;
  const delta = postTaxHourly - campusJobHourlyEquivalent;
  const percentDiff =
    campusJobHourlyEquivalent > 0
      ? ((postTaxHourly / campusJobHourlyEquivalent - 1) * 100)
      : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
    >
      <div className="px-4 py-3 border-b border-border-default flex items-center gap-2">
        <Clock className="w-4 h-4 text-fid-green" />
        <span className="text-sm font-semibold text-text-heading">Hourly Rate Comparison</span>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-center gap-3 text-sm">
          <span className="text-text-muted w-28 shrink-0">Gross hourly:</span>
          <span className="text-text-heading tabular-nums font-bold text-base">
            ${grossHourly.toFixed(2)}
          </span>
          <span className="text-text-muted text-xs">(before taxes)</span>
        </div>

        <div className="flex items-center gap-3 text-sm">
          <span className="text-text-muted w-28 shrink-0">Net hourly:</span>
          <span className="text-accent-blue tabular-nums font-bold text-base">
            ${postTaxHourly.toFixed(2)}
          </span>
          <span className="text-text-muted text-xs">(after tax / {hoursWorked} hrs)</span>
        </div>

        <div className="flex items-center gap-3 text-sm">
          <span className="text-text-muted w-28 shrink-0">Campus equivalent:</span>
          <span className="text-text-heading tabular-nums font-bold text-base">
            ${campusJobHourlyEquivalent.toFixed(2)}
          </span>
          <span className="text-text-muted text-xs">(campus rate)</span>
        </div>

        <div className="border-t border-border-default pt-3 flex items-center gap-3 text-sm">
          <span className="text-text-muted w-28 shrink-0 font-semibold">Delta:</span>
          <span
            className={`tabular-nums font-bold text-base inline-flex items-center gap-1 ${
              delta > 0 ? 'text-fid-green' : delta < 0 ? 'text-accent-red' : 'text-text-muted'
            }`}
          >
            {delta > 0 ? (
              <TrendingUp className="w-4 h-4" />
            ) : delta < 0 ? (
              <TrendingDown className="w-4 h-4" />
            ) : (
              <Minus className="w-4 h-4" />
            )}
            {delta >= 0 ? '+' : ''}${delta.toFixed(2)}/hr
          </span>
        </div>

        <div className="pt-3 border-t border-border-default text-xs text-text-muted leading-relaxed">
          {postTaxHourly >= campusJobHourlyEquivalent ? (
            <p>
              Side hustle pays approximately {percentDiff.toFixed(0)}% more per hour
              after taxes compared to a campus job. Consider flexibility, experience,
              and scalability.
            </p>
          ) : (
            <p>
              Effective rate is about {Math.abs(percentDiff).toFixed(0)}% below a campus
              job after taxes. Consider flexibility, experience, and scalability when
              evaluating the trade-off.
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
