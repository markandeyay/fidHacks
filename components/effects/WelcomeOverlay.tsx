'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WindowCard } from '@/components/paper/WindowCard';
import { PaperButton } from '@/components/paper/PaperButton';
import { ForteCat } from '@/components/mascot/ForteCat';

const STORAGE_KEY = 'forte:welcome:dismissed:v2';

export function WelcomeOverlay() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      const dismissed = localStorage.getItem(STORAGE_KEY) === '1';
      if (!dismissed) setShow(true);
    } catch {}
  }, []);

  const dismiss = () => {
    try { localStorage.setItem(STORAGE_KEY, '1'); } catch {}
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 80,
            background: 'rgba(10,10,10,0.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
          }}
        >
          <motion.div
            initial={{ scale: 0.7, rotate: -6, y: -20 }}
            animate={{ scale: 1, rotate: -2, y: 0 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 18 }}
            style={{ maxWidth: 460, width: '100%' }}
          >
            <WindowCard title="HEY! ⊙ ✕" variant="hydrating" showControls onClose={dismiss}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                <ForteCat emotion="happy" size={90} animate />
                <div>
                  <div style={{ fontFamily: 'var(--font-marker)', fontSize: 20, marginBottom: 6 }}>WELCOME TO FORTE</div>
                  <p style={{ margin: 0, fontFamily: 'var(--font-patrick)', fontSize: 17, lineHeight: 1.3 }}>
                    Pick a game and start playing. Five simulations teach the money skills nobody teaches in school.
                  </p>
                </div>
              </div>
              <div style={{ marginTop: 14, display: 'flex', justifyContent: 'flex-end' }}>
                <PaperButton color="yellow" onClick={dismiss}>LET'S GO</PaperButton>
              </div>
            </WindowCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
