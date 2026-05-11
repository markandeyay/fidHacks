export interface STTCallbacks {
  onInterim?: (text: string) => void;
  onFinal?: (text: string) => void;
  onError?: (err: string) => void;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: { transcript: string };
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionType {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  start(): void;
  stop(): void;
}

let recognition: SpeechRecognitionType | null = null;

export function startListening(callbacks: STTCallbacks): void {
  if (typeof window === 'undefined') return;
  const SpeechRecognitionCtor =
    (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionType }).SpeechRecognition ||
    (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionType }).webkitSpeechRecognition;
  if (!SpeechRecognitionCtor) {
    callbacks.onError?.('Speech recognition not supported in this browser.');
    return;
  }

  recognition = new SpeechRecognitionCtor();
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = 'en-US';

  recognition.onresult = (event: SpeechRecognitionEvent) => {
    let interim = '';
    let final = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        final += transcript;
      } else {
        interim += transcript;
      }
    }
    if (interim) callbacks.onInterim?.(interim);
    if (final) callbacks.onFinal?.(final);
  };

  recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
    callbacks.onError?.(event.error);
  };

  recognition.start();
}

export function stopListening(): void {
  recognition?.stop();
  recognition = null;
}
