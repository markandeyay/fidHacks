'use client';

import { motion } from 'framer-motion';
import { Difficulty } from '@/types/game';
import { PaperCard, MarkerText, LightningStar } from '@/components/paper';

const DIFFICULTIES: { value: Difficulty; label: string; color: 'mint' | 'cream' | 'yellow' | 'coral'; tilt: number; emoji: string }[] = [
  { value: 'freshman', label: 'Freshman', color: 'mint', tilt: -3, emoji: '🌱' },
  { value: 'sophomore', label: 'Sophomore', color: 'cream', tilt: 2, emoji: '📘' },
  { value: 'junior', label: 'Junior', color: 'yellow', tilt: -1, emoji: '⚡' },
  { value: 'senior', label: 'Senior', color: 'coral', tilt: 4, emoji: '🔥' },
];

interface Props {
  selected: Difficulty | null;
  onSelect: (d: Difficulty) => void;
}

export function DifficultyPicker({ selected, onSelect }: Props) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 18 }}>
      {DIFFICULTIES.map((d) => {
        const isSelected = selected === d.value;
        return (
          <motion.button
            key={d.value}
            onClick={() => onSelect(d.value)}
            whileTap={{ scale: 0.97 }}
            style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}
          >
            <PaperCard
              color={d.color}
              tilt={isSelected ? d.tilt - 1 : d.tilt}
              tape={d.value === 'junior' ? 'tc' : 'tl'}
              tapeColor={d.color === 'yellow' ? 'cream' : 'yellow'}
              hover={!isSelected}
              style={{ padding: '24px 18px', minHeight: 140, position: 'relative', transform: `rotate(${isSelected ? d.tilt - 1 : d.tilt}deg) scale(${isSelected ? 1.05 : 1})` }}
            >
              <div style={{ fontSize: 36 }}>{d.emoji}</div>
              <MarkerText as="div" size="lg">{d.label}</MarkerText>
              {isSelected && (
                <div style={{ position: 'absolute', top: -22, right: -22 }}>
                  <LightningStar size={56} variant={1} animate />
                </div>
              )}
            </PaperCard>
          </motion.button>
        );
      })}
    </div>
  );
}
