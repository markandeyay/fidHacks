'use client';

import { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, Mic } from 'lucide-react';
import { startListening, stopListening } from '@/lib/audio/stt';

interface InputBarProps {
  onSend: (message: string) => void;
  onAccept: () => void;
  onWalkAway: () => void;
  disabled: boolean;
  isLoading: boolean;
}

export function InputBar({ onSend, onAccept, onWalkAway, disabled, isLoading }: InputBarProps) {
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (!text.trim() || disabled) return;
    onSend(text.trim());
    setText('');
    setInterimText('');
    inputRef.current?.focus();
  };

  const startSTT = useCallback(() => {
    if (disabled) return;
    setIsListening(true);
    setInterimText('');
    startListening({
      onInterim: (t) => setInterimText(t),
      onFinal: (t) => { setText((p) => (p + ' ' + t).trim()); setInterimText(''); setIsListening(false); },
      onError: () => { setIsListening(false); setInterimText(''); },
    });
  }, [disabled]);

  const stopSTT = useCallback(() => {
    stopListening();
    setIsListening(false);
    setInterimText('');
  }, []);

  return (
    <div className="card p-4 space-y-3">
      {/* Text input row */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isListening ? 'Listening...' : 'Type your response...'}
            disabled={disabled}
            className="input-field pr-16"
          />
          <button
            onClick={handleSend}
            disabled={disabled || !text.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-fid-green hover:bg-fid-green-light rounded-lg transition-colors disabled:opacity-30"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        {/* Voice button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onMouseDown={startSTT}
          onMouseUp={stopSTT}
          onTouchStart={startSTT}
          onTouchEnd={stopSTT}
          disabled={disabled}
          className={`p-2.5 rounded-lg border-2 transition-colors ${
            isListening
              ? 'border-accent-red bg-red-50 text-accent-red'
              : 'border-border-default text-text-muted hover:border-fid-green hover:text-fid-green'
          } disabled:opacity-30`}
          title="Hold to talk"
        >
          <Mic className="w-5 h-5" />
        </motion.button>
      </div>

      {isListening && interimText && (
        <div className="text-xs text-text-muted italic">{interimText}</div>
      )}

      {isLoading && (
        <div className="text-sm text-fid-green font-medium">Recruiter is thinking...</div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onAccept}
          disabled={disabled}
          className="flex-1 btn-primary text-sm"
        >
          Accept Offer
        </button>
        <button
          onClick={onWalkAway}
          disabled={disabled}
          className="flex-1 px-4 py-2.5 border-2 border-accent-red text-accent-red rounded-lg font-semibold text-sm hover:bg-red-50 transition-colors disabled:opacity-30"
        >
          Walk Away
        </button>
      </div>
    </div>
  );
}
