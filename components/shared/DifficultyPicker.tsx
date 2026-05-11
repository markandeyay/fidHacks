'use client';

import { Difficulty } from '@/types/game';
import { motion } from 'framer-motion';

interface DifficultyPickerProps {
  selected: Difficulty | null;
  onSelect: (d: Difficulty) => void;
}

const DIFFICULTIES: { value: Difficulty; label: string; desc: string; color: string; bg: string }[] = [
  { value: 'freshman', label: 'Freshman', desc: 'Just starting out', color: '#009A44', bg: '#E6F4EC' },
  { value: 'sophomore', label: 'Sophomore', desc: 'Building confidence', color: '#2563EB', bg: '#DBEAFE' },
  { value: 'junior', label: 'Junior', desc: 'Real-world scenarios', color: '#D97706', bg: '#FEF3C7' },
  { value: 'senior', label: 'Senior', desc: 'Expert complexity', color: '#7C3AED', bg: '#EDE9FE' },
];

export function DifficultyPicker({ selected, onSelect }: DifficultyPickerProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {DIFFICULTIES.map((diff, i) => (
        <motion.button
          key={diff.value}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect(diff.value)}
          className={`p-4 rounded-xl border-2 text-left transition-all ${
            selected === diff.value
              ? 'border-current shadow-md'
              : 'border-border-default hover:border-border-strong bg-white'
          }`}
          style={selected === diff.value ? { borderColor: diff.color, backgroundColor: diff.bg } : {}}
        >
          <div
            className="text-sm font-bold mb-1"
            style={{ color: selected === diff.value ? diff.color : '#0F172A' }}
          >
            {diff.label}
          </div>
          <div className="text-xs text-text-muted">{diff.desc}</div>
        </motion.button>
      ))}
    </div>
  );
}
