'use client';

import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  timeRemainingMs: number;
  totalMs: number;
}

function formatTime(ms: number): string {
  const totalSecs = Math.max(0, ms / 1000);
  const mins = Math.floor(totalSecs / 60);
  const secs = Math.floor(totalSecs % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function CountdownTimer({ timeRemainingMs, totalMs }: CountdownTimerProps) {
  const totalSecs = Math.max(0, timeRemainingMs / 1000);
  const isDanger = totalSecs <= 10;

  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, timeRemainingMs / totalMs);
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 38 38">
        {/* Track */}
        <circle
          cx="19"
          cy="19"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          className="text-border-default"
        />
        {/* Progress */}
        <circle
          cx="19"
          cy="19"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className={`transition-[stroke-dashoffset] duration-100 ease-linear ${
            isDanger ? 'text-accent-red' : 'text-fid-green'
          }`}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {isDanger ? (
          <span className="text-xs font-bold text-accent-red animate-pulse-ring">
            {formatTime(timeRemainingMs)}
          </span>
        ) : (
          <span className="text-xs font-bold text-text-heading">
            {formatTime(timeRemainingMs)}
          </span>
        )}
      </div>
    </div>
  );
}
