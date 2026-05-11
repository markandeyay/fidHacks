import { Difficulty } from './game';

export type LineItemBucket =
  | 'taxable_income'
  | 'deductible_expense'
  | 'non_deductible';

export interface ReceiptLineItem {
  id: string;
  description: string;        // "Etsy gross revenue Sept-Dec"
  amount: number;
  correctBucket: LineItemBucket;
  ruling: string;             // 1-sentence explanation, shown after sort
}

export interface SideHustleScenario {
  difficulty: Difficulty;
  hustleType: string;         // "Etsy print shop", "Tutoring", "DoorDash"
  semester: string;
  lineItems: ReceiptLineItem[];
  hoursWorked: number;
  campusJobHourlyEquivalent: number;
  showsQuarterlyEstimates: boolean;   // senior
  llcDecisionApplicable: boolean;     // senior
}

export interface SideHustleGameState {
  scenario: SideHustleScenario;
  playerSorts: Record<string, LineItemBucket>;  // line id -> bucket
  taxOwedPlayer?: number;
  taxOwedCorrect?: number;
  llcChoice?: boolean;
  status: 'sorting' | 'reviewing' | 'finished';
}
