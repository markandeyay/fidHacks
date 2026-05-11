import { Difficulty } from './game';

export interface NegotiationScenario {
  id: string;
  difficulty: Difficulty;
  role: string;                    // "Campus library assistant"
  company: string;
  initialOffer: number;            // anchor offer
  hiddenCeiling: number;           // AI will not exceed this
  context: string;                 // 1-paragraph background
  competingOffers?: number[];      // senior level only
  hasEquity: boolean;
  deadlinePressure: boolean;
}

export type MoveQuality = 'strong' | 'neutral' | 'weak';

export interface NegotiationTurn {
  turnIndex: number;
  speaker: 'player' | 'recruiter';
  text: string;
  // Player turn only:
  moveQuality?: MoveQuality;
  offerDelta?: number;             // how much it moved
  capitulated?: boolean;
  filler?: boolean;                // triggers freeze effect
  // Recruiter turn only:
  currentOffer?: number;
  emotionState?: AvatarEmotion;
}

export type AvatarEmotion =
  | 'neutral'
  | 'leaning_in'      // strong move
  | 'arms_crossed'    // vague
  | 'frozen'          // filler phrase
  | 'impressed'       // very strong
  | 'closing';        // about to walk

export interface NegotiationGameState {
  scenario: NegotiationScenario;
  turns: NegotiationTurn[];
  currentOffer: number;
  status: 'active' | 'accepted' | 'walked_away';
  startedAt: number;
}
