'use client';

import { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, Mic } from 'lucide-react';
import { startListening, stopListening } from '@/lib/audio/stt';
import { PaperButton, StickerLabel } from '@/components/paper';

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
    <div
      style={{
        background: 'var(--paper-cream)',
        border: '3px solid var(--paper-black)',
        boxShadow: '4px 4px 0 var(--paper-black)',
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isListening ? 'Listening...' : 'Type your response...'}
            disabled={disabled}
            className="input-field"
            style={{ paddingRight: 48 }}
          />
          <button
            onClick={handleSend}
            disabled={disabled || !text.trim()}
            aria-label="send"
            style={{
              position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)',
              width: 36, height: 36, background: 'var(--paper-yellow)',
              border: '2px solid var(--paper-black)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: disabled || !text.trim() ? 'not-allowed' : 'pointer', opacity: disabled || !text.trim() ? 0.4 : 1,
            }}
          >
            <Send size={16} strokeWidth={3} />
          </button>
        </div>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onMouseDown={startSTT}
          onMouseUp={stopSTT}
          onTouchStart={startSTT}
          onTouchEnd={stopSTT}
          disabled={disabled}
          aria-label="hold to talk"
          style={{
            width: 48, height: 48,
            background: isListening ? 'var(--paper-cherry)' : 'var(--paper-coral)',
            color: isListening ? 'var(--paper-cream)' : 'var(--paper-black)',
            border: '3px solid var(--paper-black)',
            boxShadow: '3px 3px 0 var(--paper-black)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.4 : 1,
          }}
        >
          <Mic size={20} strokeWidth={3} />
        </motion.button>
      </div>

      {isListening && interimText && (
        <div style={{ fontFamily: 'var(--font-patrick)', fontSize: 14, fontStyle: 'italic', color: 'var(--paper-teal-dk)' }}>
          {interimText}
        </div>
      )}

      {isLoading && (
        <div>
          <StickerLabel color="mint" size="sm" tilt={-2}>RECRUITER IS THINKING...</StickerLabel>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10 }}>
        <PaperButton color="mint" onClick={onAccept} disabled={disabled} style={{ flex: 1 }}>
          ACCEPT OFFER
        </PaperButton>
        <PaperButton color="cherry" onClick={onWalkAway} disabled={disabled} style={{ flex: 1 }}>
          WALK AWAY
        </PaperButton>
      </div>
    </div>
  );
}
