'use client';

import { Score } from '@/types/game';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface DebriefTimelineProps {
  score: Score;
  children?: React.ReactNode;
}

export function DebriefTimeline({ score, children }: DebriefTimelineProps) {
  const maxBreakdown = Math.max(...Object.values(score.breakdown), 1);

  return (
    <div className="max-w-xl mx-auto">
      {/* Score */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center mb-10"
      >
        <div className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-4">
          Your Score
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-6xl font-extrabold text-fid-green mb-2"
        >
          {score.total}
        </motion.div>
        <div className="text-sm text-text-muted">out of 100</div>
      </motion.div>

      {/* Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card p-6 mb-8"
      >
        <h3 className="text-sm font-semibold text-text-heading uppercase tracking-wide mb-5">
          Score Breakdown
        </h3>
        <div className="space-y-4">
          {Object.entries(score.breakdown).map(([key, value], i) => (
            <div key={key}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-text-body capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <span className="text-sm font-bold text-text-heading">{value}</span>
              </div>
              <div className="progress-bar">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(value / maxBreakdown) * 100}%` }}
                  transition={{ delay: 0.6 + i * 0.1, duration: 0.8, ease: 'easeOut' }}
                  className="progress-bar-fill"
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {children && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mb-8"
        >
          {children}
        </motion.div>
      )}

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="flex justify-center gap-3"
      >
        <Link href="/" className="btn-outline text-sm">
          Back to Home
        </Link>
        <Link href={`/${score.gameId}`} className="btn-primary text-sm">
          Play Again
        </Link>
      </motion.div>
    </div>
  );
}
