# FEETCODE — System Design Document

**Version:** 1.0
**Owner:** Markandeya Yalamanchi
**Context:** Fidelity Hackathon
**Timeline:** 48–72 hours, team of 2–4
**Target:** Web (Next.js), local-storage sessions, all 5 games fully playable

---

## 0. Document Map

1. Product North Star
2. Tech Stack Decisions (with rationale)
3. System Architecture (high level)
4. Repository Layout
5. Data Model (TypeScript types, the source of truth)
6. Shared Systems (scoring, scenario engine, AI router, persistence)
7. Game-by-Game Build Specs (1–5)
8. AI Avatar Subsystem (Negotiation Room deep dive)
9. Frontend Design System
10. API Routes & Contracts
11. Build Plan (hour-by-hour, 72 hours)
12. Team Split (assuming 3 people)
13. Demo Script
14. Risk Register & Fallbacks
15. Open Questions for Final Lock-In

---

## 1. Product North Star

FEETCODE is a financial-literacy game platform with five short, viscerally interactive games that teach the money skills nobody teaches in school: negotiating, reading offers, budgeting under chaos, side-hustle taxes, and long-horizon investing.

The pitch in one sentence: **LeetCode, but for personal finance.**

Three rules every game must obey:

1. **No lecturing.** The game itself teaches by consequence. Text instruction is a fallback, never the primary channel.
2. **Tactile feedback.** Every decision must have an immediate visual reaction (color, motion, number ticking, avatar expression). Dead clicks are forbidden.
3. **Scored 0–100, comparable.** Every game outputs the same shape of score object so a future profile page can show a single radar chart of all five skills.

The hackathon win condition: a judge can sit down, play any of the five games end-to-end in under three minutes, and walk away with a number, a debrief, and the urge to share it.

---

## 2. Tech Stack Decisions

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 15 (App Router) | Server components for AI calls, route handlers as our backend, zero infra |
| Language | TypeScript (strict) | Five games sharing one type system; runtime bugs kill demos |
| Styling | Tailwind CSS v4 + shadcn/ui | Fast, consistent, dark-mode native |
| Animation | Framer Motion + Lottie (selective) | Avatar state transitions, card flips, tile drags |
| State | Zustand (per-game stores) + React Context (session) | Redux is overkill; Zustand is 1KB and devtools work |
| Drag & Drop | dnd-kit | Budget Blitz tiles, Side Hustle bucket sorting |
| Charts | Recharts | Market cockpit, debrief replays |
| LLM | Google Gemini 2.5 Flash (free tier) | Free, fast, JSON mode, image input not needed |
| Avatar Video | D-ID Talks API (free trial) | "Talking head" only, no lip-sync required per spec |
| TTS | Web Speech API `speechSynthesis` (browser native) | Free, instant, decent quality. D-ID audio as fallback |
| STT | Web Speech API `SpeechRecognition` | Free, works in Chrome, demo on Chrome |
| Persistence | `localStorage` via custom hook | No backend needed for demo |
| Validation | Zod | LLM JSON outputs must be parsed safely |
| Deployment | Vercel | Push to deploy, free, environment vars baked in |
| Package Manager | pnpm | Faster installs, monorepo-ready if we split later |

**Explicit non-choices:**

- No auth provider. Anonymous session ID in localStorage.
- No database. JSON files for scenario fallbacks, localStorage for player state.
- No WebSockets. Everything is request/response or client-side timers.
- No native voice agent (Gemini Live, OpenAI Realtime). Web Speech API + Gemini text is simpler, cheaper, and demos fine.

---

## 3. System Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                       Browser (Next.js client)                  │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ Game Selector│  │ Game Runtime │  │ Debrief / Scorecard  │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘  │
│         │                 │                     │              │
│         └─────────┬───────┴──────────┬──────────┘              │
│                   │                  │                          │
│           Zustand stores      Session Context                   │
│           (per-game state)    (player profile, scores)          │
│                   │                  │                          │
│                   └────────┬─────────┘                          │
│                            │                                    │
│                  localStorage adapter                           │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Web Speech API (STT + TTS, used only by Negotiation Room)│  │
│  └──────────────────────────────────────────────────────────┘  │
└──────────────────────────────┬─────────────────────────────────┘
                               │ fetch
                               ▼
┌────────────────────────────────────────────────────────────────┐
│              Next.js Route Handlers (/api/*)                   │
│                                                                │
│  /api/scenario/generate    → AI router → Gemini → Zod → JSON  │
│  /api/scenario/fallback    → static JSON from /data            │
│  /api/negotiation/turn     → Gemini (recruiter persona)        │
│  /api/score/compute        → pure function, server-side guard  │
└──────────────────────────────┬─────────────────────────────────┘
                               │
                ┌──────────────┴──────────────┐
                ▼                             ▼
        ┌──────────────┐              ┌──────────────┐
        │ Gemini 2.5   │              │ D-ID Talks   │
        │ Flash (JSON) │              │ (video URL)  │
        └──────────────┘              └──────────────┘
```

**Why route handlers instead of direct client calls:**

- API keys never touch the browser
- One place to add caching, rate limiting, fallbacks
- We can swap Gemini for Claude later without touching game code

---

## 4. Repository Layout

```
fidHacks/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                       # landing + game selector
│   ├── globals.css
│   ├── (games)/
│   │   ├── negotiation/page.tsx
│   │   ├── offer-faceoff/page.tsx
│   │   ├── budget-blitz/page.tsx
│   │   ├── side-hustle/page.tsx
│   │   └── market/page.tsx
│   ├── debrief/[gameId]/page.tsx      # shared debrief route
│   └── api/
│       ├── scenario/
│       │   └── generate/route.ts
│       ├── negotiation/
│       │   └── turn/route.ts
│       ├── avatar/
│       │   └── speak/route.ts
│       └── score/
│           └── compute/route.ts
├── components/
│   ├── ui/                            # shadcn primitives
│   ├── shared/
│   │   ├── ScoreCard.tsx
│   │   ├── DifficultyPicker.tsx
│   │   ├── DebriefTimeline.tsx
│   │   └── GameShell.tsx              # consistent header/footer/back
│   └── games/
│       ├── negotiation/
│       │   ├── AvatarStage.tsx
│       │   ├── ChatPanel.tsx
│       │   ├── OfferTicker.tsx
│       │   └── WeakMoveIndicator.tsx
│       ├── offer-faceoff/
│       │   ├── OfferCard.tsx
│       │   ├── BenefitCalculator.tsx
│       │   ├── EquityTimeline.tsx
│       │   └── TrueCompDisplay.tsx
│       ├── budget-blitz/
│       │   ├── IncomeStack.tsx
│       │   ├── CategoryBucket.tsx
│       │   ├── ChaosCard.tsx
│       │   └── CountdownTimer.tsx
│       ├── side-hustle/
│       │   ├── ReceiptLine.tsx
│       │   ├── BucketTray.tsx
│       │   ├── TaxPanel.tsx
│       │   └── LLCToggle.tsx
│       └── market/
│           ├── PortfolioCockpit.tsx
│           ├── NetWorthGraph.tsx
│           ├── LifeEventCard.tsx
│           └── GhostLineOverlay.tsx
├── lib/
│   ├── ai/
│   │   ├── gemini.ts                  # client wrapper, JSON mode
│   │   ├── prompts/
│   │   │   ├── recruiter.ts
│   │   │   ├── scenarios.ts
│   │   │   └── chaos-cards.ts
│   │   └── schemas.ts                 # Zod schemas for all LLM outputs
│   ├── scoring/
│   │   ├── negotiation.ts
│   │   ├── compensation.ts
│   │   ├── budget.ts
│   │   ├── sideHustle.ts
│   │   └── market.ts
│   ├── persistence/
│   │   └── localStorage.ts            # typed wrapper, namespaced keys
│   ├── audio/
│   │   ├── tts.ts                     # speechSynthesis wrapper
│   │   └── stt.ts                     # SpeechRecognition wrapper
│   └── utils.ts
├── stores/
│   ├── sessionStore.ts                # player ID, completed games, scores
│   ├── negotiationStore.ts
│   ├── offerFaceoffStore.ts
│   ├── budgetBlitzStore.ts
│   ├── sideHustleStore.ts
│   └── marketStore.ts
├── data/
│   ├── scenarios/
│   │   ├── negotiation.json           # 5 hardcoded scenarios per difficulty
│   │   ├── offers.json
│   │   ├── budget.json
│   │   ├── sideHustle.json
│   │   └── market.json
│   └── benefits-reference.json        # benefit valuation formulas
├── types/
│   ├── game.ts                        # shared GameId, Difficulty, Score
│   ├── negotiation.ts
│   ├── offer.ts
│   ├── budget.ts
│   ├── sideHustle.ts
│   └── market.ts
├── public/
│   ├── avatars/                       # static fallback avatar images
│   └── sounds/                        # optional UI sfx
├── .env.local
├── next.config.ts
├── tailwind.config.ts
├── package.json
└── README.md
```

---

## 5. Data Model

The single most important section. If these types are right, the rest writes itself.

### 5.1 Global types (`types/game.ts`)

```typescript
export type GameId =
  | 'negotiation'
  | 'offer-faceoff'
  | 'budget-blitz'
  | 'side-hustle'
  | 'market';

export type Difficulty = 'freshman' | 'sophomore' | 'junior' | 'senior';

export interface Score {
  gameId: GameId;
  difficulty: Difficulty;
  total: number;          // 0-100
  breakdown: Record<string, number>;
  playedAt: number;       // epoch ms
  durationMs: number;
  sessionId: string;
}

export interface PlayerSession {
  sessionId: string;      // uuid, persisted in localStorage
  createdAt: number;
  displayName?: string;
  scores: Score[];
}
```

### 5.2 Negotiation (`types/negotiation.ts`)

```typescript
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
```

### 5.3 Offer Face-Off (`types/offer.ts`)

```typescript
export type BenefitType =
  | 'base_salary'
  | 'signing_bonus'
  | 'annual_bonus'
  | 'rsu_grant'
  | 'options_grant'
  | '401k_match'
  | 'health_insurance'
  | 'pto_days'
  | 'remote_stipend'
  | 'tuition_reimbursement'
  | 'commuter_benefit'
  | 'wellness_stipend';

export interface BenefitLineItem {
  id: string;
  type: BenefitType;
  label: string;                   // "20% 401k match up to 6% of salary"
  rawValue: string | number;       // what's printed on the letter
  formula: string;                 // human-readable formula
  trueDollarValue: number;         // server-computed correct answer
  hint?: string;                   // shown on '?' tap
}

export interface VestingSchedule {
  totalShares: number;
  pricePerShare: number;
  cliffMonths: number;             // typically 12
  totalMonths: number;             // typically 48
  // computed value if you leave at month N
}

export interface OfferLetter {
  id: string;
  company: string;
  role: string;
  benefits: BenefitLineItem[];
  vesting?: VestingSchedule;       // senior diff only
  trueTotalCompYear1: number;      // sum of all true values, year 1
}

export interface OfferFaceoffScenario {
  difficulty: Difficulty;
  offerA: OfferLetter;
  offerB: OfferLetter;
  optimalChoice: 'A' | 'B';
  optimalReasoning: string;
}

export interface OfferFaceoffGameState {
  scenario: OfferFaceoffScenario;
  playerValuations: Record<string, number>;  // benefit id -> player's entered value
  selectedOffer?: 'A' | 'B';
  startedAt: number;
  submittedAt?: number;
}
```

### 5.4 Budget Blitz (`types/budget.ts`)

```typescript
export type BudgetCategory =
  | 'rent'
  | 'food'
  | 'transport'
  | 'savings'
  | 'fun'
  | 'health'        // appears at higher difficulty
  | 'personal_care'; // gendered cost realities

export interface IncomeTile {
  id: string;
  value: number;       // each tile worth $50 or $100
}

export interface ChaosCard {
  id: string;
  title: string;        // "Laptop screen cracked"
  description: string;
  hit: number;          // negative number, dollars
  forcedCategory?: BudgetCategory;
  contextTag?: 'general' | 'gendered' | 'health' | 'emergency';
}

export interface BudgetAllocation {
  category: BudgetCategory;
  allocated: number;
  required: number;     // benchmark from 50/30/20
  status: 'healthy' | 'tight' | 'busted';
}

export interface BudgetBlitzScenario {
  difficulty: Difficulty;
  monthlyIncome: number;
  fixedCosts: Partial<Record<BudgetCategory, number>>;
  chaosCardPool: ChaosCard[];      // 3-5 will fire
  timerSeconds: number;            // 90
  isPersonalMode: boolean;
}

export interface BudgetBlitzGameState {
  scenario: BudgetBlitzScenario;
  allocations: Record<BudgetCategory, number>;
  triggeredChaos: ChaosCard[];
  balance: number;
  emergencyBuffer: number;
  timeRemainingMs: number;
  status: 'running' | 'finished';
}
```

### 5.5 Side Hustle Audit (`types/sideHustle.ts`)

```typescript
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
```

### 5.6 Market (`types/market.ts`)

```typescript
export type AssetClass = 'stable' | 'growth' | 'risky' | 'safe';

export interface PortfolioAllocation {
  stable: number;     // 0-1
  growth: number;
  risky: number;
  safe: number;
}

export interface MarketTick {
  yearIndex: number;          // 0-30
  netWorth: number;
  ghostNetWorth_panic: number;
  ghostNetWorth_consistent: number;
  marketReturns: Record<AssetClass, number>;
}

export type LifeEventChoice = 'hold' | 'rebalance' | 'withdraw';

export interface LifeEvent {
  id: string;
  yearIndex: number;
  title: string;              // "You got laid off"
  description: string;
  effect: {
    cashFlow: number;          // can be negative
    forcedChoice: LifeEventChoice[];   // subset of choices available
  };
}

export interface StructuredDecision {
  id: string;
  yearIndex: number;
  prompt: string;              // "401k match offered: contribute 6%?"
  options: { label: string; correctness: number }[];  // 0-1
}

export interface MarketScenario {
  difficulty: Difficulty;
  startingCash: number;        // 10000
  timelineYears: number;       // 30
  tickIntervalMs: number;      // ~6000 for 30 yrs in 3 min
  lifeEvents: LifeEvent[];
  structuredDecisions: StructuredDecision[];
  marketSeed: number;
}

export interface MarketGameState {
  scenario: MarketScenario;
  allocation: PortfolioAllocation;
  ticks: MarketTick[];
  decisions: { id: string; choice: string; correctness: number }[];
  holdRate: number;            // computed: holds / total decisions
  status: 'configuring' | 'running' | 'paused' | 'finished';
}
```

---

## 6. Shared Systems

### 6.1 Scoring engine (`lib/scoring/*`)

Every game exports one function:

```typescript
export function score{GameName}(state: {GameName}GameState): Score
```

All scoring is **pure and deterministic.** Same state in, same score out. This matters because:

- Tests are trivial
- Debrief can recompute on demand
- Cheating via local state edits doesn't change displayed scores if we ever go online

### 6.2 Scenario engine (`lib/ai/scenarios.ts`)

```typescript
async function loadScenario<T>(
  gameId: GameId,
  difficulty: Difficulty,
  schema: ZodSchema<T>
): Promise<T> {
  // 1. Try AI generation via /api/scenario/generate
  // 2. Validate against Zod schema
  // 3. If fail twice, fall back to /data/scenarios/{gameId}.json
  // 4. Pick random entry matching difficulty
}
```

Hardcoded fallbacks live in `/data/scenarios/`. **Each game needs 3 hardcoded scenarios per difficulty (12 per game, 60 total).** This is non-negotiable insurance. The demo cannot depend on Gemini being up.

### 6.3 AI router (`lib/ai/gemini.ts`)

```typescript
type GeminiCall = {
  systemPrompt: string;
  userPrompt: string;
  schema: ZodSchema;          // forces JSON mode
  temperature?: number;       // default 0.7, 0.3 for scoring, 0.9 for recruiter banter
  maxRetries?: number;        // default 2
};

async function callGemini<T>(opts: GeminiCall): Promise<T>
```

Wraps `@google/generative-ai`. JSON mode on. Two retry attempts. On final failure, throws a typed error the route handler converts to "use fallback" signal.

### 6.4 Persistence (`lib/persistence/localStorage.ts`)

Single typed wrapper. Namespace: `feetcode:v1:`.

```typescript
const storage = {
  getSession: () => PlayerSession | null,
  setSession: (s: PlayerSession) => void,
  appendScore: (s: Score) => void,
  clear: () => void,
  // game-specific resumption (optional, nice-to-have):
  saveGameState: <T>(gameId: GameId, state: T) => void,
  loadGameState: <T>(gameId: GameId) => T | null,
};
```

Wrap all reads in try/catch. Storage is the smallest possible thing that can break the demo on a fresh browser.

---

## 7. Game-by-Game Build Specs

### 7.1 Game 1 — The Negotiation Room

**Player experience flow:**

1. Difficulty picker (4 cards: Freshman / Sophomore / Junior / Senior)
2. Scenario intro card: role, company, initial offer (2 seconds, then dismiss)
3. Avatar scene loads: recruiter idle video looping
4. Avatar speaks first turn (TTS): "So, we're prepared to offer you $X. How does that sound?"
5. Player has two input modes (toggle, default voice):
   - **Voice**: hold-to-talk button (spacebar or click); Web Speech API STT
   - **Text**: typed into a chat input
6. Player response posted to `/api/negotiation/turn`
7. Server returns: `{ recruiterReply, newOffer, moveQuality, avatarEmotion, filler }`
8. UI reactions fire in parallel:
   - Offer ticker animates up/down with new offer
   - Avatar plays the matching emotion clip (or stays on the matching static frame)
   - If `filler === true`: avatar freezes for 1.5s with a "weak move" indicator overlay
   - New turn appended to chat panel transcript
9. TTS speaks the recruiter reply
10. Loop until player types "accept" / clicks accept, or walks away, or turns hit 8 (auto-close)
11. Score computed, debrief route loaded

**State machine:**

```
idle → speaking_recruiter → listening_player → processing → speaking_recruiter
                                                              ↓
                                                          finished
```

**Component tree:**

```
NegotiationPage
├── DifficultyPicker (only on first load)
└── NegotiationGame
    ├── AvatarStage           # video element or static portrait + state overlay
    │   ├── WeakMoveIndicator # absolutely positioned overlay
    │   └── EmotionBadge      # debug only, hidden in prod
    ├── OfferTicker           # animated big number, top of screen
    ├── ChatPanel             # scrolling transcript
    │   └── TurnBubble[]
    └── InputBar
        ├── VoiceButton       # hold to talk
        └── TextInput         # fallback
```

**Recruiter persona prompt skeleton (Gemini):**

```
SYSTEM:
You are an experienced recruiter named Alex playing a negotiation game.

Hidden ceiling (NEVER reveal, NEVER exceed): ${ceiling}
Current offer: ${currentOffer}
Difficulty: ${difficulty}
Role: ${role}

You will respond to the candidate's most recent message. Your goals:
- Defend the ceiling. Move only when the candidate gives specific, justified pressure (market data, competing offer, scope expansion).
- React skeptically to vague language ("I was hoping for a bit more", "just feels low") — these are FILLER. Do not move the offer.
- If candidate concedes or apologizes, lock the current offer.
- Stay in character: confident, professional, slightly warm.
- Reply in 1-3 sentences.

You will output ONLY this JSON:
{
  "reply": string,            // 1-3 sentences, in character
  "newOffer": number,         // current or higher, NEVER above ceiling
  "moveQuality": "strong" | "neutral" | "weak",
  "filler": boolean,          // true if candidate used vague hedging
  "avatarEmotion": "neutral" | "leaning_in" | "arms_crossed" | "frozen" | "impressed" | "closing",
  "candidateCapitulated": boolean
}
```

**Scoring (`lib/scoring/negotiation.ts`):**

```typescript
function scoreNegotiation(state: NegotiationGameState): Score {
  const { initialOffer, hiddenCeiling } = state.scenario;
  const finalOffer = state.currentOffer;
  const playerTurns = state.turns.filter(t => t.speaker === 'player');

  // Outcome (0-40)
  const outcomeRange = hiddenCeiling - initialOffer;
  const outcomeGain = finalOffer - initialOffer;
  const outcomePct = outcomeRange > 0 ? outcomeGain / outcomeRange : 0;
  const outcomeScore = Math.round(40 * Math.max(0, Math.min(1, outcomePct)));

  // Move quality (0-35)
  const strong = playerTurns.filter(t => t.moveQuality === 'strong').length;
  const neutral = playerTurns.filter(t => t.moveQuality === 'neutral').length;
  const moveScore = Math.round(
    35 * (strong + 0.5 * neutral) / Math.max(1, playerTurns.length)
  );

  // Composure (0-25)
  const capitulated = playerTurns.some(t => t.capitulated);
  const fillerCount = playerTurns.filter(t => t.filler).length;
  const composureScore = capitulated
    ? 0
    : Math.max(0, 25 - 5 * fillerCount);

  return {
    gameId: 'negotiation',
    difficulty: state.scenario.difficulty,
    total: outcomeScore + moveScore + composureScore,
    breakdown: { outcome: outcomeScore, moves: moveScore, composure: composureScore },
    // ...
  };
}
```

**Debrief:** Timeline replay of turns, each color-coded. Bottom panel: "If you'd hit the ceiling, your 10-year salary delta would be $X" — computed as `(ceiling - finalOffer) * 10 * 1.03^compounding`.

### 7.2 Game 2 — Offer Face-Off

**Player flow:**

1. Two stylized offer letter cards slide in side-by-side
2. Each line item has a `?` chip; tapping opens a small calculator modal
3. Calculator shows the formula (e.g. `401k match = salary * match_pct * vesting_factor`) with input fields the player fills
4. On submit, the calculator validates against `trueDollarValue` (within $50 tolerance) and unlocks the line
5. As lines unlock, the "True Compensation" running total updates with a satisfying tick
6. Equity vesting (senior only): timeline scrubber from month 0 to month 48, shows "if you left here, you'd walk with $X"
7. Submit button only enables when all line items resolved on both offers
8. Player picks A or B
9. Reveal: optimal pick, reasoning, score

**Component tree:**

```
OfferFaceoffPage
└── OfferFaceoffGame
    ├── OfferCard (×2)
    │   ├── OfferHeader
    │   ├── BenefitRow[] (each with ? trigger)
    │   ├── EquityTimeline (senior only)
    │   └── TrueCompDisplay
    ├── BenefitCalculator (modal)
    │   ├── FormulaDisplay
    │   ├── InputGroup
    │   └── ValidateButton
    └── PickOfferBar
        ├── ChooseAButton
        └── ChooseBButton
```

**Benefit valuation reference (`data/benefits-reference.json`):**

Pre-computed formulas with worked examples for: 401k match, RSU vesting, signing bonus (clawback-adjusted), health insurance premium delta, PTO valuation, remote stipend, options strike-vs-FMV. Each entry: `{ type, formula, inputs, worked_example }`.

**Scoring:**

- Conversion accuracy (50): % of line items where `|player - true| / true < 0.1`
- Final pick (30): all-or-nothing on optimal choice
- Speed (20): bonus if completed under target time (3min freshman, 5min senior)

### 7.3 Game 3 — Budget Blitz

**Player flow:**

1. Difficulty + Personal Mode toggle on entry screen
2. If Personal Mode: 30-second form for income, fixed costs, then "Run my month"
3. Game canvas loads: income tiles stacked at top, 5-7 category buckets along bottom, 90s timer
4. Player drags tiles into buckets (dnd-kit)
5. Every 15-25s, a chaos card slides in from the right with a "Resolve" button — clicking it auto-deducts and locks the affected category
6. Buckets glow green/yellow/red against benchmark thresholds
7. At 0s or when all tiles placed: round ends, scorecard reveal

**Chaos card pool:**

- General: laptop break ($400), medical copay ($150), parking ticket ($75), roommate ghost ($300 short)
- Gendered (higher diff): menstrual products surge cost ($30 unexpected), safety rideshare premium ($45), insurance premium delta ($60/mo)
- Health (higher diff): therapy session cost, prescription refill
- Emergency (senior): car repair $1200, emergency vet bill

Pool is pre-defined in JSON but Gemini can extend with new cards in the same shape, fallback if generation fails.

**Scoring:**

- Allocation vs 50/30/20 (40 pts): compares player's needs/wants/savings ratio to benchmark
- Chaos response (35 pts): did they pull from `fun` not `rent`? penalize hits to `savings`
- Buffer maintained (25 pts): did `savings + emergency_buffer` stay positive throughout?

### 7.4 Game 4 — Side Hustle Audit

**Player flow:**

1. Receipt slides in showing 8-12 line items with descriptions and amounts
2. Three bucket trays at the bottom: Taxable Income / Deductible Expense / Non-Deductible
3. Drag each line into a bucket
4. Instant feedback: green check or red X, plus the 1-sentence ruling
5. After all sorted: tax calculator panel opens, player computes owed tax (income - deductions, then applied to bracket from a table)
6. Senior only: LLC toggle with side-by-side projection of tax owed as sole prop vs LLC (S-corp election)
7. Hourly rate panel reveals: gross / hours, then post-tax / hours, then vs campus job

**Tax tables (hardcoded, 2025 federal brackets):**

Only single-filer brackets needed for the demo. Self-employment tax (15.3% on net earnings) included.

**Scoring:**

- Bucket placement (50): per-item correct
- Tax calc (30): within $50 of correct
- LLC decision correctness (20, senior): right call given the numbers shown

### 7.5 Game 5 — The Market

**Player flow:**

1. Allocation screen: four sliders (Stable, Growth, Risky, Safe) summing to 100%
2. Press "Begin 30 years" — timeline starts
3. Net worth graph draws live; ghost lines (panic seller, consistent investor) draw in parallel but stay hidden until debrief
4. Every ~6 seconds (one simulated year), a Life Event card may fire: pause timeline, present Hold/Rebalance/Withdraw, accept choice, resume
5. Structured decisions (senior only): "Your employer offers a 401k match" → multiple choice with hidden correctness
6. Final tick at year 30: graph stops, debrief auto-loads

**Market simulation (`lib/scoring/market.ts` and a sim module):**

Pre-computed returns per asset class per year using seeded PRNG so all three lines (player, panic, consistent) share the same market reality. Returns approximated as:

- Stable (bonds): mean 3%, sd 4%
- Growth (broad equity): mean 8%, sd 16%
- Risky (single stock/crypto): mean 12%, sd 35%
- Safe (cash/HYSA): mean 2%, sd 0.5%

Panic seller: any year with >15% drawdown, sells 80% into Safe.
Consistent investor: never rebalances, target weights enforced annually.

**Scoring:**

- Final value vs consistent benchmark (45): clipped 0-100% of benchmark = 0-45
- Hold rate (30): % of life events answered "hold" through volatility
- Structured decision correctness (25, senior; redistribute lower diffs)

---

## 8. AI Avatar Subsystem (deep dive)

Confirmed constraint: **talking head only, lip-sync NOT required.** This simplifies hugely.

### 8.1 Approach: pre-rendered emotion clips + synchronized TTS

We do **not** call D-ID per turn. That's slow (8-15s per video) and costs money. Instead:

**One-time at session start:**

- A set of ~6 short looping video clips already exists in `/public/avatars/`, one per `AvatarEmotion`:
  - `neutral.mp4` — slight head movement, blinking, idle (looped)
  - `leaning_in.mp4` — leaning forward, engaged
  - `arms_crossed.mp4` — skeptical, arms folded
  - `frozen.mp4` — single still frame with a subtle overlay vignette
  - `impressed.mp4` — small nod, smile
  - `closing.mp4` — checking watch, packing up

These are generated **once during the build phase** using D-ID Talks with throwaway audio (or scraped/licensed stock with permission). We commit the resulting MP4s to the repo. ~3 seconds each, looped. Total asset cost: ~2 hours of one developer's time during build.

**At runtime:**

- An `<video>` element plays the matching clip based on current `avatarEmotion`
- When recruiter speaks, `speechSynthesis.speak(...)` runs in parallel
- Audio and video are decoupled — the user perceives a talking head; their brain fills in the lip-sync (this is the "uncanny gap" we exploit)
- On emotion change, crossfade between clips (200ms Framer Motion opacity)

### 8.2 Why this works for the demo

1. **Latency:** TTS starts in <100ms. No waiting for D-ID. Conversation feels live.
2. **Cost:** ~$0 at runtime (Web Speech is free; Gemini Flash free tier).
3. **Reliability:** No network call for video means no spinner ever blocks the conversation.
4. **Production-defensible:** This is also how most chatbot avatars are actually built. The judges will not penalize this.

### 8.3 Fallback if video clips fail to generate

Animated SVG portrait with state-driven CSS (eyes, mouth, eyebrows, arm position). Higher polish than emoji, lower than video. ~3 hours of Tailwind + SVG work. Live this in `components/games/negotiation/AvatarStage.tsx` as the inner component swap.

### 8.4 Voice pipeline

**Player → recruiter:**

```
[mic button held]
    ↓
SpeechRecognition.start() (continuous: false, interimResults: true)
    ↓
interim transcript shown in input bar (greyed)
    ↓
[mic released] → final transcript
    ↓
POST /api/negotiation/turn { transcript, gameState }
    ↓
{ reply, newOffer, moveQuality, ... }
    ↓
speechSynthesis.speak(reply) + AvatarStage emotion swap + offer ticker update
```

**Web Speech API gotchas:**

- Chrome only (Safari is partial, Firefox unreliable). Demo on Chrome.
- Must be triggered by user gesture (button click), not on mount.
- Permission must be granted; first-load prompt. Add a "Tap to talk" wake screen.
- `SpeechRecognition` does NOT work over `file://`; needs `https://` or `localhost`. Vercel covers this.
- Voices for `speechSynthesis` are async-loaded; await `voiceschanged` before first speak, otherwise default voice will be platform-dependent.

---

## 9. Frontend Design System

**Visual direction:** dark mode, neon-on-graphite, slightly arcade. Think Synthwave-meets-Bloomberg-terminal.

**Palette (Tailwind config):**

```
bg-base:      #0A0E1A   (near-black blue)
bg-elevated:  #131826
bg-card:      #1A2033
accent-green: #00D67E   (healthy, strong move, gain)
accent-yellow:#FFB800   (warning, neutral, tight)
accent-red:   #FF4D6D   (busted, weak move, loss)
accent-blue:  #4DA3FF   (info, action)
accent-purple:#A855F7   (premium, senior difficulty)
text-primary: #F5F7FA
text-muted:   #8B95A7
```

**Typography:**

- Headlines: Geist Sans (Vercel-native, already in Next.js 15 starter), tracking-tight
- Numbers/money: Geist Mono or JetBrains Mono. Money values ALWAYS in mono. This sells the "terminal" feel.
- Body: Geist Sans 15px regular

**Motion principles:**

- Every number change uses `framer-motion` `animate` with `type: 'spring', stiffness: 200, damping: 20`
- Cards entering: `y: 20 → 0`, `opacity: 0 → 1`, 300ms ease-out
- Status changes (healthy → busted): background color transitions over 400ms
- Avatar emotion crossfades: 200ms opacity

**Component conventions:**

- Every game wraps in `<GameShell>` which provides: back button, difficulty badge, score-so-far chip, settings (mute, restart)
- Every game ends with the same `<DebriefTimeline>` component receiving a normalized props shape

---

## 10. API Routes & Contracts

### `POST /api/scenario/generate`

```
Request:  { gameId: GameId, difficulty: Difficulty }
Response: { scenario: T } | { fallback: true, scenario: T }
```

Server attempts Gemini, validates Zod, falls back to `/data/scenarios/{gameId}.json`. Always returns a usable scenario.

### `POST /api/negotiation/turn`

```
Request:  {
  scenarioId: string,
  history: NegotiationTurn[],
  playerMessage: string
}
Response: {
  reply: string,
  newOffer: number,
  moveQuality: MoveQuality,
  filler: boolean,
  avatarEmotion: AvatarEmotion,
  capitulated: boolean
}
```

Calls Gemini with recruiter persona prompt. Validates response with Zod. On Gemini failure: returns a canned response that holds the offer steady ("Tell me more about why that number works for you?") and emotion `neutral` so the game can continue.

### `POST /api/score/compute`

```
Request:  { gameId: GameId, state: GameState }
Response: { score: Score }
```

Server-side pure function. Optional belt-and-suspenders — we also score on the client for instant debrief, but the server response is what gets persisted. (For demo we can skip this and score client-side only; documented here for completeness.)

---

## 11. Build Plan (72-hour, hour by hour)

Assumes a team of 3 starting at hour 0 with a kicked-off Next.js project.

### Hours 0-4 — Foundation (whole team)

- Repo init, Next.js 15, Tailwind v4, shadcn/ui, pnpm
- Commit type definitions from Section 5 verbatim
- `GameShell`, `DebriefTimeline`, `ScoreCard`, `DifficultyPicker` stubs
- Zustand stores skeletons for all 5 games
- `lib/persistence/localStorage.ts` complete and tested
- `lib/ai/gemini.ts` complete with Zod, one smoke-test scenario generated
- 12 hardcoded fallback scenarios per game (60 total) — split among team
- Tailwind theme committed (colors, fonts)
- Landing page with 5 game cards (links only, no game logic yet)

**End of block:** every game route loads a placeholder, types are locked, fallbacks exist.

### Hours 4-16 — Negotiation Room (Dev A)

- Avatar emotion clip generation via D-ID (or fallback SVG portrait)
- `AvatarStage` component with emotion-driven video swap
- `ChatPanel` with TTS playback
- `InputBar` with Web Speech STT (voice button) + text fallback
- `/api/negotiation/turn` with recruiter prompt + Zod
- `OfferTicker` with spring animation
- `WeakMoveIndicator` overlay
- Scoring function + tests
- Debrief view with color-coded timeline

### Hours 4-16 — Offer Face-Off (Dev B)

- Static offer letter visual
- Benefit reference JSON with 12 benefit types and formulas
- `BenefitCalculator` modal with formula display and validation
- `TrueCompDisplay` running total
- `EquityTimeline` scrubber (senior)
- Pick-A-or-B reveal flow
- Scoring + debrief

### Hours 4-16 — Budget Blitz (Dev C)

- dnd-kit setup, tile dragging from stack into buckets
- Countdown timer
- Chaos card system with pool + fire schedule
- Bucket status colors (green/yellow/red)
- Personal Mode entry form
- Scoring + debrief
- Gendered/health chaos cards at higher difficulty

### Hours 16-24 — Side Hustle Audit + Market (split: A on Side Hustle, B+C on Market)

**Side Hustle:**

- Receipt visual
- Drag-into-bucket interaction (reuse dnd-kit setup)
- Tax calculator panel
- LLC toggle with live before/after
- Scoring + debrief

**Market:**

- Allocation slider screen
- Market simulator (seeded PRNG, 30-year run)
- Live `NetWorthGraph` with Recharts
- Life Event modal interruptions
- Ghost line overlay (revealed in debrief)
- Structured decisions
- Scoring + debrief

### Hours 24-32 — Integration & polish

- Make sure every game flows: select → play → debrief → score persists → back to landing with score chip showing on the game card
- Sound effects (optional): money tick, card flip, success/fail chimes
- Polish animations and transitions
- Mobile-responsive sanity check (web-only target but judges might pull out a phone)
- Empty states, loading states, error toasts

### Hours 32-40 — Avatar quality pass + AI prompt tuning

- Tune recruiter prompt against 20 test conversations across difficulties
- Tune scenario generation prompts so output variety is high
- Make sure fallbacks are seamless (test with no network)
- Avatar emotion timing feels right
- TTS voice selection (pick a confident, warm voice; Microsoft Aria or Google Wavenet-equivalent)

### Hours 40-56 — Buffer / catch-up / depth

Reserved for whatever isn't done. Realistically one of the 5 games will be behind. This block exists to finish it.

### Hours 56-64 — Polish, demo prep

- Landing page: name, tagline, 5 game cards with hover previews
- Profile page (optional): radar chart showing scores across 5 games
- About / how-it-works page (1 paragraph each, judge-facing)
- Loom video walkthrough as fallback if demo machine fails
- README with screenshots and quickstart

### Hours 64-72 — Final demo rehearsal

- Run the demo script 5+ times
- Stage seed data (a sessionId with sample scores already in localStorage so the profile page looks lived-in)
- Make a "judge mode" URL param that pre-seeds nice scores in case anyone clicks profile cold
- Sleep 4 hours
- Deploy final build to Vercel
- Submit

---

## 12. Team Split (3 people)

**Dev A (Markandeya — game architecture lead):**

- Negotiation Room (most complex)
- Side Hustle Audit
- AI router and prompt engineering across games
- Final integration

**Dev B (frontend/design):**

- Offer Face-Off
- Design system, shared components
- Landing page, debrief views
- Mobile responsive pass

**Dev C (game logic):**

- Budget Blitz
- Market (with Dev B helping on charts)
- Scoring engines across all games
- Hardcoded scenario data

If team is 4, the 4th person owns: scenario generation prompts, the fallback JSON library, the QA pass, and the demo script.

---

## 13. Demo Script (3 minutes)

```
0:00  "Personal finance is taught nowhere. We made LeetCode for money."
0:10  Land on home, 5 game cards visible
0:15  Click Negotiation Room → Junior difficulty
0:25  Avatar speaks: "We're offering $75k. How does that sound?"
0:30  Hold mic, say: "I appreciate that, but based on similar SWE roles in Raleigh-Durham, market for new grads is closer to $90k."
0:40  Avatar leans in, offer ticks to $82k
0:45  Say: "I have a competing offer at $88k that I'm leaning toward."
0:55  Avatar nods, offer ticks to $87k. Type "accept".
1:00  Debrief: score 84/100. 10-year delta: $124,000.
1:05  Click back. Open Budget Blitz.
1:10  Race the timer, place tiles, chaos card hits (laptop break), pull from fun.
1:50  Done. Score 78/100.
1:55  Click The Market. Set 60% growth, 20% stable, 10% risky, 10% safe. Hit start.
2:05  30 years play in fast-forward. Two life events fire, we hold both times.
2:35  Debrief reveals ghost lines — consistent investor finishes at $87k, we finish at $82k, panic seller at $39k.
2:50  Back to home. Score chips on all 3 played games.
3:00  "Five games, all generated by AI, all teaching something real. Submit."
```

---

## 14. Risk Register & Fallbacks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Gemini free tier rate-limits us during demo | Medium | High | Hardcoded scenarios + canned recruiter responses; always behind a server route that owns the fallback |
| Web Speech STT misfires on accent/noise | High | Medium | Text input always visible as fallback; "couldn't hear you" prompt re-tries |
| D-ID free trial runs out before clips are generated | Medium | Medium | SVG portrait fallback already designed; switch is one env var |
| One game falls behind, doesn't ship | High | High | Buffer block (hours 40-56) + game stub renderer that says "coming soon" with the score breakdown placeholder |
| Demo Wi-Fi fails | Medium | Catastrophic | Local build pre-cached, mobile hotspot, Loom video as last resort |
| TTS voice sounds robotic | High | Low | Ship anyway; everyone knows how TTS sounds. Pick the warmest available voice. |
| Mobile judge tries to play | Low | Medium | At minimum: home page and one game (Budget Blitz, lowest-touch) responsive |
| Scoring feels arbitrary | Medium | Medium | Every score shows the breakdown; debrief explains each component plainly |
| Avatar uncanny valley | Medium | Low | Crossfades, slight desaturation, subtle vignette on `frozen` state to lean into stylization |

---

## 15. Open Questions for Final Lock-In

These should be answered before hour 0.

1. **Domain & branding.** Is "FEETCODE" final? It's a pun on LeetCode/feet (footing?). If we want a Fidelity-friendlier name, "FootHold" or "Compound" both work. Sticking with FEETCODE for now.
2. **Avatar visual identity.** Are we using a single generated headshot for the recruiter across all difficulties, or rotating (campus recruiter → corporate recruiter → exec)? Recommend single recruiter for the demo, rotation is a stretch goal.
3. **Difficulty defaults.** Should the player pick difficulty for each game, or have a "session difficulty" set once at start? Recommend per-game pick.
4. **Profile page scope.** Is a radar chart of 5 scores in scope, or a stretch goal? I'd ship the chart if hour 60+ is available, otherwise skip.
5. **Multiplayer / leaderboards.** Explicitly out of scope for the hackathon. (Mentioned here so it's clear.)
6. **Specific Fidelity hooks.** No track preference confirmed. Recommend leaning hardest on The Market (Roth vs Traditional decisions, employer match) since that's Fidelity's bread and butter, and making sure the debrief there name-checks "this is the kind of decision a real Fidelity 401k account is for."
7. **Personal Mode privacy disclaimer.** If a user enters real income, do we display a "your data never leaves this browser" line? Recommend yes, it's true and it's a trust signal.

---

## Appendix A — Environment Variables

```
GEMINI_API_KEY=
D_ID_API_KEY=                    # build-time only
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_DEMO_MODE=false      # if true, force hardcoded scenarios
```

## Appendix B — Acceptance Checklist (Pre-Submit)

- [ ] All 5 games load from landing
- [ ] Each game has at least 3 fallback scenarios per difficulty
- [ ] AI scenario generation works AND fails gracefully
- [ ] Web Speech STT works on Chrome on demo machine
- [ ] TTS voice is warm and audible
- [ ] Avatar emotion clips load and crossfade
- [ ] Score persists to localStorage and shows on landing
- [ ] Debrief view renders for every game
- [ ] Demo flow runs end-to-end in under 3 minutes
- [ ] README has setup instructions
- [ ] Deployed to Vercel with custom domain (if available)
- [ ] Loom video uploaded as demo backup

---

*End of document.*
