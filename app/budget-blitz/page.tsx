'use client';

import { useState } from 'react';
import { GameShell } from '@/components/shared/GameShell';
import { DifficultyPicker } from '@/components/shared/DifficultyPicker';
import { BudgetBlitzGame } from '@/components/games/budget-blitz/BudgetBlitzGame';
import { loadScenario } from '@/lib/ai/scenarios';
import { BudgetBlitzScenario, ChaosCard } from '@/types/budget';
import { Difficulty } from '@/types/game';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, Loader2 } from 'lucide-react';

function buildPersonalScenario(
  difficulty: Difficulty,
  income: number,
  rent: number,
  transport: number
): BudgetBlitzScenario {
  const pool: ChaosCard[] = [
    {
      id: 'p1',
      title: 'Unexpected Expense',
      description: 'A surprise bill showed up. You need to cover it.',
      hit: -100,
      forcedCategory: 'fun',
      contextTag: 'general',
    },
    {
      id: 'p2',
      title: 'Medical Copay',
      description: 'Doctor visit copay hit your wallet.',
      hit: -75,
      forcedCategory: 'health',
      contextTag: 'health',
    },
    {
      id: 'p3',
      title: 'Car Repair',
      description: 'Your ride needs a quick fix.',
      hit: -150,
      forcedCategory: 'transport',
      contextTag: 'general',
    },
    {
      id: 'p4',
      title: 'Friend Birthday',
      description: 'You forgot to budget for a gift.',
      hit: -60,
      forcedCategory: 'fun',
      contextTag: 'general',
    },
  ];

  const count =
    difficulty === 'freshman'
      ? 2
      : difficulty === 'sophomore'
      ? 2
      : difficulty === 'junior'
      ? 3
      : 4;

  return {
    difficulty,
    monthlyIncome: income,
    fixedCosts: { rent, transport },
    chaosCardPool: pool.slice(0, count),
    timerSeconds: 90,
    isPersonalMode: true,
  };
}

export default function BudgetBlitzPage() {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [personalMode, setPersonalMode] = useState(false);
  const [personalIncome, setPersonalIncome] = useState('');
  const [personalRent, setPersonalRent] = useState('');
  const [personalTransport, setPersonalTransport] = useState('');
  const [scenario, setScenario] = useState<BudgetBlitzScenario | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startGame = async () => {
    if (!difficulty) return;
    setLoading(true);
    setError(null);

    try {
      let loadedScenario: BudgetBlitzScenario;

      if (personalMode) {
        const income = Number(personalIncome) || 2000;
        const rent = Number(personalRent) || 0;
        const transport = Number(personalTransport) || 0;
        loadedScenario = buildPersonalScenario(difficulty, income, rent, transport);
      } else {
        loadedScenario = await loadScenario<BudgetBlitzScenario>(
          'budget-blitz',
          difficulty
        );
      }

      setScenario(loadedScenario);
    } catch {
      setError('Failed to load scenario. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const restart = () => {
    setScenario(null);
    setDifficulty(null);
    setPersonalMode(false);
    setPersonalIncome('');
    setPersonalRent('');
    setPersonalTransport('');
    setError(null);
  };

  return (
    <GameShell
      title="Budget Blitz"
      subtitle="Allocate your income. Survive the month."
      onRestart={scenario ? restart : undefined}
    >
      <AnimatePresence mode="wait">
        {!scenario ? (
          <motion.div
            key="setup"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="max-w-2xl mx-auto space-y-8"
          >
            <div className="card p-6 space-y-8 animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-fid-green-light flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-fid-green" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-text-heading">
                    Budget Blitz
                  </h2>
                  <p className="text-sm text-text-muted">
                    Allocate your monthly income across categories before the
                    timer expires. Drag income tiles into buckets. Chaos events
                    will test your buffer. Survive the month.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-heading mb-3">
                  Select Difficulty
                </label>
                <DifficultyPicker
                  selected={difficulty}
                  onSelect={setDifficulty}
                />
              </div>

              <div className="border-t border-border-default pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-text-heading">
                      Personal Mode
                    </h3>
                    <p className="text-xs text-text-muted mt-0.5">
                      Use your own income and expenses
                    </p>
                  </div>
                  <button
                    onClick={() => setPersonalMode(!personalMode)}
                    className={`toggle-track ${personalMode ? 'active' : ''}`}
                    role="switch"
                    aria-checked={personalMode}
                  >
                    <div
                      className={`toggle-thumb ${personalMode ? 'active' : ''}`}
                    />
                  </button>
                </div>

                <AnimatePresence>
                  {personalMode && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                        <div>
                          <label className="block text-xs font-medium text-text-body mb-1.5">
                            Monthly Income
                          </label>
                          <input
                            type="number"
                            min={0}
                            value={personalIncome}
                            onChange={(e) =>
                              setPersonalIncome(e.target.value)
                            }
                            className="input-field"
                            placeholder="2000"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-text-body mb-1.5">
                            Rent
                          </label>
                          <input
                            type="number"
                            min={0}
                            value={personalRent}
                            onChange={(e) => setPersonalRent(e.target.value)}
                            className="input-field"
                            placeholder="800"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-text-body mb-1.5">
                            Transport
                          </label>
                          <input
                            type="number"
                            min={0}
                            value={personalTransport}
                            onChange={(e) =>
                              setPersonalTransport(e.target.value)
                            }
                            className="input-field"
                            placeholder="100"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {error && (
                <div className="badge badge-red text-xs p-3 rounded-lg">
                  {error}
                </div>
              )}

              <button
                onClick={startGame}
                disabled={!difficulty || loading}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Run My Month'
                )}
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <BudgetBlitzGame scenario={scenario} onRestart={restart} />
          </motion.div>
        )}
      </AnimatePresence>
    </GameShell>
  );
}
