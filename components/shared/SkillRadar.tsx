'use client';

import { Score, GameId } from '@/types/game';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

const AXES: { gameId: GameId; label: string }[] = [
  { gameId: 'negotiation', label: 'Negotiation' },
  { gameId: 'offer-faceoff', label: 'Offers' },
  { gameId: 'budget-blitz', label: 'Budgeting' },
  { gameId: 'side-hustle', label: 'Side Hustles' },
  { gameId: 'market', label: 'Investing' },
];

export function SkillRadar({ scores }: { scores: Score[] }) {
  const data = AXES.map(({ gameId, label }) => {
    const best = scores
      .filter((s) => s.gameId === gameId)
      .reduce((max, s) => (s.total > max ? s.total : max), 0);
    return { axis: label, value: best, fullMark: 100 };
  });

  const hasAnyScore = data.some((d) => d.value > 0);

  if (!hasAnyScore) {
    return (
      <div className="card p-8 text-center">
        <p className="text-sm text-text-muted">Play any game to start building your skill profile.</p>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <h3 className="text-sm font-semibold text-text-heading uppercase tracking-wide mb-4">Your Skill Profile</h3>
      <div style={{ width: '100%', height: 320 }}>
        <ResponsiveContainer>
          <RadarChart data={data}>
            <PolarGrid stroke="#E2E8F0" />
            <PolarAngleAxis dataKey="axis" tick={{ fontSize: 12, fill: '#334155' }} />
            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
            <Radar name="Best Score" dataKey="value" stroke="#009A44" fill="#009A44" fillOpacity={0.35} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
