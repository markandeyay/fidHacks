'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { NegotiationScenario, NegotiationTurn, AvatarEmotion, NegotiationGameState } from '@/types/negotiation';
import { scoreNegotiation } from '@/lib/scoring/negotiation';
import { useSessionStore } from '@/stores/sessionStore';
import { speakWithGemini, cancelSpeech, ensureVoiceLoaded } from '@/lib/audio/tts';
import { NegotiationAvatar } from '@/components/avatars';
import { OfferTicker } from './OfferTicker';
import { ChatPanel } from './ChatPanel';
import { InputBar } from './InputBar';
import { WeakMoveIndicator } from './WeakMoveIndicator';

interface NegotiationGameProps {
  scenario: NegotiationScenario;
}

const MAX_PLAYER_TURNS = 8;

export function NegotiationGame({ scenario }: NegotiationGameProps) {
  const router = useRouter();
  const addScore = useSessionStore((s) => s.addScore);
  const session = useSessionStore((s) => s.session);
  const initSession = useSessionStore((s) => s.init);

  const [gamePhase, setGamePhase] = useState<'intro' | 'playing' | 'finished'>('intro');
  const [turns, setTurns] = useState<NegotiationTurn[]>([]);
  const [currentOffer, setCurrentOffer] = useState(scenario.initialOffer);
  const [status, setStatus] = useState<NegotiationGameState['status']>('active');
  const [startedAt] = useState(Date.now());
  const [emotion, setEmotion] = useState<AvatarEmotion>('neutral');
  const [isLoading, setIsLoading] = useState(false);
  const [weakMoveVisible, setWeakMoveVisible] = useState(false);
  const [ttsReady, setTtsReady] = useState(false);

  // Refs for latest values without stale closures
  const turnsRef = useRef(turns);
  turnsRef.current = turns;
  const currentOfferRef = useRef(currentOffer);
  currentOfferRef.current = currentOffer;
  const statusRef = useRef(status);
  statusRef.current = status;
  const finishInitiatedRef = useRef(false);

  // Init session + pre-load voice
  useEffect(() => { initSession(); }, [initSession]);
  useEffect(() => {
    ensureVoiceLoaded().then(() => setTtsReady(true));
  }, []);

  // Opening move: recruiter speaks first
  useEffect(() => {
    if (gamePhase === 'intro' && ttsReady) {
      const openingText = scenario.initialOffer < 1000
        ? `We're prepared to offer you $${scenario.initialOffer.toFixed(2)} per hour for the ${scenario.role} position. How does that sound?`
        : `We're prepared to offer you $${scenario.initialOffer.toLocaleString()} for the ${scenario.role} position. How does that sound?`;

      const openingTurn: NegotiationTurn = {
        turnIndex: 0,
        speaker: 'recruiter',
        text: openingText,
        currentOffer: scenario.initialOffer,
        emotionState: 'neutral',
      };
      setTurns([openingTurn]);

      speakWithGemini(openingText);
      const timer = setTimeout(() => setGamePhase('playing'), 600);
      return () => { clearTimeout(timer); cancelSpeech(); };
    }
  }, [gamePhase, ttsReady, scenario]);

  // Finish game — trigger once when status becomes non-active
  useEffect(() => {
    if (status !== 'active' && !finishInitiatedRef.current) {
      finishInitiatedRef.current = true;
      setGamePhase('finished');
      // Small delay so the user sees the "Computing your score..." screen
      const timer = setTimeout(() => {
        cancelSpeech();
        const state: NegotiationGameState = {
          scenario,
          turns: turnsRef.current,
          currentOffer: currentOfferRef.current,
          status: statusRef.current,
          startedAt,
        };
        const score = scoreNegotiation(state);
        addScore({ ...score, sessionId: session?.sessionId ?? '' });
        router.push('/debrief/negotiation');
      }, 1800);
      // Do NOT return a cleanup that clears this timer — it must fire.
      // Only cleanup on actual unmount is handled by React's default behavior.
      // We suppress the lint warning by not returning anything.
      void timer;
    }
  }, [status, scenario, startedAt, session, addScore, router]);

  const playerTurnCount = turns.filter((t) => t.speaker === 'player').length;

  // Send message
  const handleSend = useCallback(
    async (playerMessage: string) => {
      const msg = playerMessage.trim();
      if (!msg || isLoading || playerTurnCount >= MAX_PLAYER_TURNS) return;
      setIsLoading(true);

      const playerTurn: NegotiationTurn = {
        turnIndex: turnsRef.current.length,
        speaker: 'player',
        text: msg,
      };
      setTurns((prev) => [...prev, playerTurn]);

      try {
        const res = await fetch('/api/negotiation/turn', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ scenario, history: turnsRef.current, playerMessage: msg }),
        });
        const data = await res.json();

        // Safety clamp: never go below current offer, never above ceiling
        const newOfferValue = Math.max(
          currentOfferRef.current,
          Math.min(data.newOffer ?? currentOfferRef.current, scenario.hiddenCeiling)
        );
        const delta = newOfferValue - currentOfferRef.current;

        const updatedPlayerTurn: NegotiationTurn = {
          ...playerTurn,
          moveQuality: data.moveQuality,
          filler: data.filler,
          capitulated: data.capitulated,
          offerDelta: delta,
        };

        const recruiterTurn: NegotiationTurn = {
          turnIndex: playerTurn.turnIndex + 1,
          speaker: 'recruiter',
          text: data.reply,
          currentOffer: newOfferValue,
          emotionState: data.avatarEmotion,
        };

        setTurns((prev) => { const n = [...prev]; n[n.length - 1] = updatedPlayerTurn; n.push(recruiterTurn); return n; });
        setCurrentOffer(newOfferValue);
        setEmotion(data.avatarEmotion);

        if (data.filler) {
          setWeakMoveVisible(true);
          setTimeout(() => setWeakMoveVisible(false), 2500);
        }

        speakWithGemini(data.reply);
      } catch {
        const fb: NegotiationTurn = {
          turnIndex: playerTurn.turnIndex + 1, speaker: 'recruiter',
          text: 'Tell me more about why that number works for you?',
          currentOffer: currentOfferRef.current, emotionState: 'neutral',
        };
        const up: NegotiationTurn = { ...playerTurn, moveQuality: 'neutral', filler: false, capitulated: false, offerDelta: 0 };
        setTurns((prev) => { const n = [...prev]; n[n.length - 1] = up; n.push(fb); return n; });
        speakWithGemini(fb.text);
      } finally {
        setIsLoading(false);
      }
    },
    [scenario, isLoading, playerTurnCount]
  );

  // Auto-end at max turns
  useEffect(() => {
    if (playerTurnCount >= MAX_PLAYER_TURNS && gamePhase === 'playing') {
      setStatus('walked_away');
    }
  }, [playerTurnCount, gamePhase]);

  const handleAccept = useCallback(() => {
    if (isLoading) return;
    setEmotion('impressed');
    speakWithGemini("Great, I'll send the paperwork over.");
    setStatus('accepted');
    setTurns((prev) => [...prev, { turnIndex: prev.length, speaker: 'player', text: 'I accept the offer.', moveQuality: 'strong', capitulated: false }]);
  }, [isLoading]);

  const handleWalkAway = useCallback(() => {
    if (isLoading) return;
    setEmotion('closing');
    speakWithGemini('Understood. Best of luck.');
    setStatus('walked_away');
    setTurns((prev) => [...prev, { turnIndex: prev.length, speaker: 'player', text: 'I respectfully walk away from this offer.', moveQuality: 'strong' }]);
  }, [isLoading]);

  return (
    <div className="relative">
      <WeakMoveIndicator visible={weakMoveVisible} />

      <AnimatePresence mode="wait">
        {gamePhase === 'intro' && (
          <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 0' }}>
            <div style={{ textAlign: 'center', fontFamily: 'var(--font-marker)', fontSize: 22, color: 'var(--paper-cream)' }}>
              {ttsReady ? 'CONNECTING TO RECRUITER...' : 'LOADING VOICE ENGINE...'}
            </div>
          </motion.div>
        )}

        {gamePhase === 'playing' && (
          <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              {/* Sidebar */}
              <div className="md:col-span-1 space-y-4">
                <div style={{ background: 'var(--paper-cream)', border: '3px solid var(--paper-black)', boxShadow: '4px 4px 0 var(--paper-black)', padding: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: 'rotate(-1.5deg)' }}>
                  <NegotiationAvatar emotion={emotion} size={180} />
                </div>
                <div style={{ background: 'var(--paper-yellow)', border: '3px solid var(--paper-black)', boxShadow: '4px 4px 0 var(--paper-black)', padding: 4, transform: 'rotate(2deg)' }}>
                  <OfferTicker value={currentOffer} />
                </div>
                <div style={{ background: 'var(--paper-cream)', border: '3px solid var(--paper-black)', boxShadow: '4px 4px 0 var(--paper-black)', padding: 12, transform: 'rotate(-1deg)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: 12, marginBottom: 6 }}>
                    <span>TURN</span><span><strong>{playerTurnCount}</strong>/{MAX_PLAYER_TURNS}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-bar-fill" style={{ width: `${(playerTurnCount / MAX_PLAYER_TURNS) * 100}%` }} />
                  </div>
                  <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {scenario.hasEquity && (
                      <span className="badge badge-green">EQUITY</span>
                    )}
                    {emotion !== 'neutral' && (
                      <span className="badge badge-blue">{emotion.replace('_', ' ').toUpperCase()}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Main */}
              <div className="md:col-span-3 space-y-4 flex flex-col">
                {playerTurnCount >= MAX_PLAYER_TURNS - 1 && playerTurnCount < MAX_PLAYER_TURNS && gamePhase === 'playing' && (
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <span className="badge badge-amber" style={{ fontSize: 13 }}>⚠ FINAL ROUND</span>
                  </div>
                )}
                <ChatPanel turns={turns} />
                <InputBar
                  onSend={handleSend}
                  onAccept={handleAccept}
                  onWalkAway={handleWalkAway}
                  disabled={isLoading || playerTurnCount >= MAX_PLAYER_TURNS}
                  isLoading={isLoading}
                />
              </div>
            </div>
          </motion.div>
        )}

        {gamePhase === 'finished' && (
          <motion.div key="finished" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 0' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-marker)', fontSize: 36, color: 'var(--paper-yellow)' }}>
                {status === 'accepted' ? 'OFFER ACCEPTED!' : 'NEGOTIATION ENDED'}
              </div>
              <div style={{ marginTop: 8, fontFamily: 'var(--font-patrick)', fontSize: 18, color: 'var(--paper-cream)' }}>Computing your score...</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
