# Sentiment Reality

Analyze when market sentiment diverges from actual market performance.

## Quick Start

```bash
# Terminal 1: Start backend
cd api
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Terminal 2: Start frontend
cd web
npm install
npm run dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- API docs: http://localhost:8000/docs

## Project Structure

```
sentiment-reality/
├── web/                  # Next.js frontend (TypeScript)
│   ├── app/              # Pages (layout, page, dashboard)
│   ├── components/       # React components
│   │   └── charts/       # PriceChart, SentimentChart, AlignmentChart
│   ├── lib/              # Utilities
│   │   ├── types.ts      # TypeScript interfaces
│   │   └── api.ts        # API client
│   └── styles/           # CSS (currently disabled)
│
├── api/                  # FastAPI backend (Python)
│   ├── main.py           # App entry + endpoints
│   ├── routers/          # Route handlers
│   ├── services/         # Business logic
│   └── requirements.txt
│
└── jobs/                 # Background jobs (Python)
    └── (sentiment scoring, data ingestion)
```

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /health` | Health check |
| `GET /dashboard/{ticker}` | Dashboard data for a ticker |

## Data Types

Sentiment scores are normalized to `[-1, +1]` with labels:
- `POSITIVE` (> 0.1)
- `NEUTRAL` (-0.1 to 0.1)
- `NEGATIVE` (< -0.1)

See `web/lib/types.ts` for full TypeScript interfaces.

## Development

### Frontend
```bash
cd web
npm run dev      # Start dev server
npm run build    # Production build
npm run lint     # Run linter
```

### Backend
```bash
cd api
uvicorn main:app --reload  # Start with hot reload
```

## Architecture Rules

1. **No ML in API** - All sentiment scoring runs in `jobs/`, API only reads precomputed data
2. **Frontend fetches only** - No computation or scraping in frontend
3. **Supabase is source of truth** - No local databases

See `CLAUDE.md` for full project guidelines.
