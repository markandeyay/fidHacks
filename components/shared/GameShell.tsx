'use client';

import Link from 'next/link';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { ReactNode } from 'react';

interface GameShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  onRestart?: () => void;
}

export function GameShell({ title, subtitle, children, onRestart }: GameShellProps) {
  return (
    <div className="min-h-screen bg-bg-subtle">
      {/* Header */}
      <header className="bg-white border-b border-border-default sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/" className="text-text-muted hover:text-fid-green transition-colors p-1.5 -ml-1.5">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-5 h-5 rounded bg-fid-green flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-[10px]">F</span>
              </div>
              <h1 className="font-bold text-sm text-text-heading truncate">{title}</h1>
              {subtitle && (
                <span className="text-xs text-text-muted hidden sm:inline truncate">· {subtitle}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {onRestart && (
              <button
                onClick={onRestart}
                className="text-text-muted hover:text-fid-green transition-colors p-1.5"
                title="Restart"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
