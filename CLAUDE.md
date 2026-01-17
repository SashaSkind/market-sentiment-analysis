# Claude Instructions — Sentiment Reality Project

This file defines how Claude should work in this repository.
Follow these rules strictly.

---

## Project Overview

This project analyzes when **market sentiment and public narratives diverge from actual market performance**.

Core idea:
- Measure sentiment from financial news and social sources
- Compare historical sentiment with historical stock returns
- Compute alignment / misalignment metrics (e.g. 7-day window)
- Surface when narratives are confidently wrong

This is a **hackathon project**. Speed, clarity, and demo reliability matter more than over-engineering.

---

## Tech Stack (Locked)

- Frontend: **Next.js (TypeScript)** in `web/`
- Backend API: **FastAPI (Python)** in `api/`
- Background jobs / ML: **Python** in `jobs/`
- Database: **Supabase Postgres (hosted)**
- ML:
  - Hugging Face transformers for sentiment (financial model)
  - Gemini ONLY for explanation / topic tagging (not core sentiment)
- Deployment:
  - Frontend: Vercel
  - Backend: Render / Fly.io
  - Jobs: GitHub Actions (cron)

❌ Docker is intentionally NOT used.

---

## Architecture Rules (Very Important)

1. **NO ML inference in API request handlers**
   - All sentiment scoring and heavy computation runs in `jobs/`
   - API endpoints only read precomputed data from the database

2. **Frontend never scrapes or computes**
   - Frontend only fetches from API (or read-only Supabase views)

3. **Supabase is the single source of truth**
   - No local databases
   - No in-memory state relied on for correctness

4. **Historical data = Hugging Face sentiment**
   - Gemini is NOT used to label historical sentiment
   - Gemini is allowed only for:
     - explanations
     - topic clustering
     - relevance filtering

---

## Repository Structure (Do Not Change Lightly)

- `web/` → frontend only (TypeScript, React)
- `api/` → FastAPI backend (Python)
- `jobs/` → ingestion, sentiment scoring, aggregation, metrics
- `.github/workflows/` → cron jobs only

Claude should never mix responsibilities across these boundaries.

---

## Coding Guidelines

### General
- Prefer **simple, explicit code**
- Avoid premature abstractions
- Avoid cleverness
- Favor readability over optimization

### Python
- Use type hints when reasonable
- Use Pydantic models for API schemas
- Keep functions small and single-purpose
- Pandas is allowed for batch jobs, not API requests

### TypeScript
- Use strict typing
- Define shared API response types in `web/lib/types.ts`
- Do not inline large fetch logic inside components

---

## Data & Schema Rules

- Sentiment must be normalized to a numeric score in range **[-1, +1]**
- Labels must be one of: `POSITIVE`, `NEUTRAL`, `NEGATIVE`
- Rolling metrics (7d, 14d, etc.) should be **precomputed**, not computed on the fly
- Database tables are append-only where possible (items, item_scores)

Claude should not redesign the schema unless explicitly asked.

---

## What Claude SHOULD Do

- Create files and folders when asked
- Fill in boilerplate code
- Generate API endpoints
- Write batch jobs for ingestion and metrics
- Produce clean, minimal SQL for Supabase
- Help debug Python or TypeScript errors
- Follow existing patterns in the repo

---

## What Claude MUST NOT Do

- Introduce Docker or container tooling
- Add ML inference inside FastAPI routes
- Change the tech stack without permission
- Rename existing files or folders arbitrarily
- Add secrets or environment values
- Over-engineer (no microservices, no message queues)

---

## Hackathon Priorities (Order Matters)

1. App runs reliably
2. Demo is fast (no loading delays)
3. Metrics are interpretable
4. Visuals clearly tell a story
5. Code is understandable

Claude should optimize for **demo success**, not theoretical perfection.

---

## When Unsure

If unclear about a decision:
- Ask a clarifying question
- Or choose the **simplest reasonable option** and explain why

Do not assume enterprise-scale requirements.

---

End of instructions.
