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

  if (onEnd) utterance.onend = onEnd;
  speechSynthesis.speak(utterance);
}

export function cancelSpeech(): void {
  if (typeof window === 'undefined') return;
  speechSynthesis.cancel();
}

export async function speakWithGemini(text: string): Promise<void> {
  // Try the Gemini audio endpoint first
  try {
    const res = await fetch('/api/negotiation/audio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    const data = await res.json();

    if (data.audio) {
      const audio = new Audio(`data:${data.mimeType || 'audio/mp3'};base64,${data.audio}`);
      await audio.play();
      return;
    }
  } catch {
    // Will fall through to Web Speech below
  }

  // Reliable fallback: Web Speech API (instant, free, works offline)
  await ensureVoiceLoaded();
  speak(text);
}
