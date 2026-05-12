import { GameId, Difficulty } from '@/types/game';
import { buildPrompt as negotiation } from './negotiation';
import { buildPrompt as offerFaceoff } from './offerFaceoff';
import { buildPrompt as budgetBlitz } from './budgetBlitz';
import { buildPrompt as sideHustle } from './sideHustle';
import { buildPrompt as market } from './market';

export const PROMPT_BUILDERS: Record<
  GameId,
  (input: { difficulty: Difficulty; hints?: Record<string, unknown> }) => {
    systemPrompt: string;
    userPrompt: string;
    exampleOutput: string;
  }
> = {
  negotiation,
  'offer-faceoff': offerFaceoff,
  'budget-blitz': budgetBlitz,
  'side-hustle': sideHustle,
  market,
};
