import { startTalkingIndicator, stopTalkingIndicator } from '@/components/avatars';

let selectedVoice: SpeechSynthesisVoice | null = null;
let voicesLoaded = false;

export async function ensureVoiceLoaded(): Promise<SpeechSynthesisVoice | null> {
  if (typeof window === 'undefined') return null;
  if (selectedVoice) return selectedVoice;

  return new Promise((resolve) => {
    const voices = speechSynthesis.getVoices();
    if (voices.length > 0) {
      selectedVoice = pickBestVoice(voices);
      voicesLoaded = true;
      resolve(selectedVoice);
    } else {
      const handler = () => {
        const voices = speechSynthesis.getVoices();
        selectedVoice = pickBestVoice(voices);
        voicesLoaded = true;
        speechSynthesis.onvoiceschanged = null;
        resolve(selectedVoice);
      };
      speechSynthesis.onvoiceschanged = handler;
      // Timeout fallback
      setTimeout(() => {
        if (!selectedVoice) {
          const voices = speechSynthesis.getVoices();
          selectedVoice = voices.length > 0 ? voices[0] : null;
          voicesLoaded = true;
          speechSynthesis.onvoiceschanged = null;
          resolve(selectedVoice);
        }
      }, 3000);
    }
  });
}

function pickBestVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const preferred = voices.find(
    (v) =>
      v.lang.startsWith('en-US') &&
      (v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Microsoft'))
  );
  return preferred || voices.find((v) => v.lang.startsWith('en')) || voices[0] || null;
}

export function speak(text: string, onEnd?: () => void): void {
  if (typeof window === 'undefined') return;

  // Cancel any currently playing speech
  speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.0;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;

  if (selectedVoice) {
    utterance.voice = selectedVoice;
  }

  utterance.onstart = () => startTalkingIndicator();
  utterance.onend = () => {
    stopTalkingIndicator();
    onEnd?.();
  };
  utterance.onerror = () => stopTalkingIndicator();

  speechSynthesis.speak(utterance);
}

export function cancelSpeech(): void {
  if (typeof window === 'undefined') return;
  speechSynthesis.cancel();
  stopTalkingIndicator();
}

export async function speakWithGemini(text: string): Promise<void> {
  await ensureVoiceLoaded();
  speak(text);
}
