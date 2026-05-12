# Forte
A financial literacy simulator with five interactive games. Built for people who never learned money skills in school.
## The Games
- **Negotiation Room** -- Chat with an AI recruiter to negotiate a higher salary. Learn what arguments actually move the number.
- **Offer Face-Off** -- Compare two job offer letters side by side. Put a dollar value on every benefit and find out which offer is really better.
- **Budget Blitz** -- Drag money tiles into budget categories against a countdown timer. Random chaos cards wreck your plan, just like real life.
- **Side Hustle Audit** -- Sort freelance receipts into tax buckets, then calculate what you actually owe. Find out your real hourly rate after taxes.
- **The Market** -- Allocate a portfolio across asset classes and watch 30 years tick forward. Life events force you to decide: stay invested or panic sell.
## How It Works
Each game pulls scenarios from Google Gemini when possible, with static JSON fallbacks if the AI is unavailable. The negotiation game runs a live chat against an AI recruiter persona with a hidden salary ceiling. Scoring is computed server-side and saved to your browser's local storage. There is no login, no database, and no tracking.
## Tech
Next.js 15 (App Router), TypeScript, Tailwind CSS v4, Framer Motion, Zustand, dnd-kit, Recharts, Zod, Google Gemini 2.0 Flash.
## Running Locally
```bash
npm install
npm run dev
Set GEMINI_API_KEY in a .env.local file to enable AI-generated scenarios. Without it, the app falls back to static data and still works.
