Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

Tradeoff: These guidelines bias toward caution over speed. For trivial tasks, use judgment.

1. Think Before Coding
Don't assume. Don't hide confusion. Surface tradeoffs.

Before implementing:

State your assumptions explicitly. If uncertain, ask.
If multiple interpretations exist, present them - don't pick silently.
If a simpler approach exists, say so. Push back when warranted.
If something is unclear, stop. Name what's confusing. Ask.
2. Simplicity First
Minimum code that solves the problem. Nothing speculative.

No features beyond what was asked.
No abstractions for single-use code.
No "flexibility" or "configurability" that wasn't requested.
No error handling for impossible scenarios.
If you write 200 lines and it could be 50, rewrite it.
Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

3. Surgical Changes
Touch only what you must. Clean up only your own mess.

When editing existing code:

Don't "improve" adjacent code, comments, or formatting.
Don't refactor things that aren't broken.
Match existing style, even if you'd do it differently.
If you notice unrelated dead code, mention it - don't delete it.
When your changes create orphans:

Remove imports/variables/functions that YOUR changes made unused.
Don't remove pre-existing dead code unless asked.
The test: Every changed line should trace directly to the user's request.

4. Goal-Driven Execution
Define success criteria. Loop until verified.

Transform tasks into verifiable goals:

"Add validation" → "Write tests for invalid inputs, then make them pass"
"Fix the bug" → "Write a test that reproduces it, then make it pass"
"Refactor X" → "Ensure tests pass before and after"
For multi-step tasks, state a brief plan:

1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

These guidelines are working if: fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

---

# Project: Forte (Financial Literacy Game Platform)

## Overview
Forte (codename FEETCODE) is a Next.js 15 web application delivering five interactive financial-literacy games. It uses Google Gemini for AI-generated scenarios and negotiation opponents, with static JSON fallbacks when AI is unavailable. The project is built for rapid iteration and demo readiness.

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 + custom design tokens (`bg-bg-primary`, `text-text-body`, `fid-green`, etc.)
- **Animation**: Framer Motion
- **State**: Zustand (per-game stores + session store)
- **Drag & Drop**: dnd-kit
- **Charts**: Recharts
- **Validation**: Zod
- **Persistence**: localStorage (custom namespaced adapter at `lib/persistence/localStorage.ts`)
- **AI**: Google Gemini 2.0 Flash via `@google/generative-ai`
- **Package Manager**: npm (lockfile present)

## Architecture
- **App Router**: All pages under `app/`. Game pages at `app/{gameId}/page.tsx`. API routes at `app/api/{domain}/route.ts`.
- **Client Components**: Mark with `'use client'` when using hooks, browser APIs, or Zustand.
- **Server Components**: Default for layout and page shells.
- **No Auth**: Anonymous sessions via `crypto.randomUUID` stored in localStorage.
- **No Database**: Static JSON files in `data/scenarios/` serve as AI fallbacks.

## Directory Conventions
```
app/                    # Next.js App Router pages + API routes
app/api/scenario/generate/route.ts   # AI scenario generation
app/api/negotiation/turn/route.ts      # AI negotiation opponent
app/api/score/compute/route.ts         # Server-side scoring
components/
  shared/               # GameShell, GameCard, DifficultyPicker, DebriefTimeline
  games/{gameId}/       # Per-game components
lib/
  ai/                   # Gemini client, Zod schemas, scenario loaders
  scoring/              # Pure functions: (gameState) => Score
  persistence/          # localStorage adapter
  market/               # Market simulator logic
  audio/                # TTS/STT wrappers
stores/
  sessionStore.ts       # Player session + score history
types/
  game.ts               # GameId, Difficulty, Score, PlayerSession
  {game}.ts             # Per-game state types
data/
  scenarios/            # Static JSON fallback pools
```

## AI / System Prompt Context
The project relies on structured AI outputs. When modifying AI-related code, preserve these constraints:

### Scenario Generation (`app/api/scenario/generate/route.ts`)
- Calls `callGemini()` with a lightweight system prompt and a Zod schema.
- Schema map lives in `lib/ai/schemas.ts`.
- If AI fails, falls back to static JSON from `data/scenarios/`.
- Keep `responseMimeType: 'application/json'` and validate with Zod.

### Negotiation Turn (`app/api/negotiation/turn/route.ts`)
- Uses a detailed system prompt defining recruiter persona "Alex" with a hidden ceiling.
- Returns strict JSON with fields: `reply`, `newOffer`, `moveQuality`, `filler`, `avatarEmotion`, `candidateCapitulated`.
- Never let `newOffer` exceed `hiddenCeiling` (server clamps it).
- If Gemini fails, returns a canned fallback response.

## Code Style
- **Imports**: Use `@/` path aliases (e.g., `@/lib/ai/gemini`).
- **Types**: Prefer explicit types over `any`. The project uses strict TypeScript.
- **Components**: Keep UI components small and game-agnostic pieces in `components/shared/`.
- **Scoring**: All scoring is deterministic, pure, and server-side via `app/api/score/compute`.
- **Motion**: Use `framer-motion` for entrances/transitions. Prefer `initial={{ opacity: 0, y: 20 }}` patterns.
- **Colors**: Reference Tailwind custom tokens (e.g., `text-fid-green`, `bg-bg-subtle`) rather than hardcoding hex values when possible.

## Testing / Verification
- There is no test suite yet. Follow the behavioral guidelines: for fixes, verify manually by running `npm run dev` and exercising the game flow.
- Always check that `next build` compiles cleanly after changes.
- Prefer `try/catch` with fallbacks over unhandled async errors, especially around AI calls and localStorage.

## Environment
- `GEMINI_API_KEY` is required for AI generation. Without it, the app falls back to static JSON.
- `npm run dev` starts the dev server on `localhost:3000`.
- `npm run build` must pass before considering a change complete.
