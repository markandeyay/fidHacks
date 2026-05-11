'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { NegotiationScenario, NegotiationTurn, AvatarEmotion, NegotiationGameState } from '@/types/negotiation';
import { scoreNegotiation } from '@/lib/scoring/negotiation';
import { useSessionStore } from '@/stores/sessionStore';
import { speakWithGemini, cancelSpeech, ensureVoiceLoaded } from '@/lib/audio/tts';
import { AvatarStage } from './AvatarStage';
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

  const turnsRef = useRef(turns);
  turnsRef.current = turns;
  const currentOfferRef = useRef(currentOffer);
  currentOfferRef.current = currentOffer;
  const statusRef = useRef(status);
  statusRef.current = status;

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

  // Finish game
  const finishGame = useCallback(() => {
    cancelSpeech();
    const state: NegotiationGameState = {
      scenario,
      turns: turnsRef.current,
      currentOffer: currentOfferRef.current,
      status: statusRef.current,
      startedAt,
    };
    const score = scoreNegotiation(state);
    score.sessionId = session?.sessionId || '';
    addScore(score);
    router.push('/debrief/negotiation');
  }, [scenario, startedAt, session, addScore, router]);

  useEffect(() => {
    if (status !== 'active' && gamePhase !== 'finished') {
      setGamePhase('finished');
      const timer = setTimeout(() => finishGame(), 1000);
      return () => clearTimeout(timer);
    }
  }, [status, gamePhase, finishGame]);

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

        const newOfferValue = data.newOffer > 0 ? Math.min(data.newOffer, scenario.hiddenCeiling) : currentOfferRef.current;
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
    if (playerTurnCount >= MAX_PLAYER_TURNS && gamePhase === 'playing') setStatus('walked_away');
  }, [playerTurnCount, gamePhase]);

  const handleAccept = useCallback(() => {
    if (isLoading) return;
    setStatus('accepted');
    setTurns((prev) => [...prev, { turnIndex: prev.length, speaker: 'player', text: 'I accept the offer.', moveQuality: 'strong', capitulated: false }]);
  }, [isLoading]);

  const handleWalkAway = useCallback(() => {
    if (isLoading) return;
    setStatus('walked_away');
    setTurns((prev) => [...prev, { turnIndex: prev.length, speaker: 'player', text: 'I respectfully walk away from this offer.', moveQuality: 'strong' }]);
  }, [isLoading]);

  return (
    <div className="relative">
      <WeakMoveIndicator visible={weakMoveVisible} />

      <AnimatePresence mode="wait">
        {gamePhase === 'intro' && (
          <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex items-center justify-center py-16">
            <div className="text-center space-y-4">
              <div className="text-sm font-medium text-text-muted">
                {ttsReady ? 'Connecting to recruiter...' : 'Loading voice engine...'}
              </div>
            </div>
          </motion.div>
        )}

        {gamePhase === 'playing' && (
          <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Sidebar */}
              <div className="md:col-span-1 space-y-4">
                <div className="card p-4 text-center">
                  <AvatarStage emotion={emotion} size={140} />
                </div>
                <div className="card p-4">
                  <OfferTicker value={currentOffer} />
                </div>
                <div className="card p-3">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-text-muted">Turn</span>
                    <span className="font-bold text-text-heading">{playerTurnCount}/{MAX_PLAYER_TURNS}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-bar-fill" style={{ width: `${(playerTurnCount / MAX_PLAYER_TURNS) * 100}%` }} />
                  </div>
                  {scenario.hasEquity && (
                    <div className="mt-2 badge badge-green text-[10px]">Equity on table</div>
                  )}
                  {emotion !== 'neutral' && (
                    <div className="mt-1 badge badge-blue text-[10px] capitalize">
                      {emotion.replace('_', ' ')}
                    </div>
                  )}
                </div>
              </div>

              {/* Main */}
              <div className="md:col-span-3 space-y-4 flex flex-col">
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
          <motion.div key="finished" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex items-center justify-center py-16">
            <div className="text-center space-y-3">
              <div className="text-lg font-bold text-fid-green">
                {status === 'accepted' ? 'Offer Accepted' : 'Negotiation Ended'}
              </div>
              <div className="text-sm text-text-muted">Computing your score...</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
