````markdown
# EHR Clinical Data Reconciliation Engine

A mini clinical data reconciliation engine that uses AI to determine the most likely accurate information.

## Tech Stack

- **Backend:** Node.js, Express, Jest
- **Frontend:** React (Vite)
- **AI:** Google Gemini (gemini-1.5-flash) — mock mode available without an API key
- **Testing:** Jest + Supertest

## Running Locally

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Set API_KEY to any string, leave AI_ENABLED=false
npm run dev
# → http://localhost:3001
```
````

### Frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

### Tests

```bash
cd backend && npm test
```

## LLM Choice

Used gemini-1.5-flash via the @google/generative-ai SDK for reliable structured JSON output and strong clinical reasoning. Both endpoints call the LLM once per unique request. Gemini was chosen for its free tier availability via Google AI Studio, making the app fully functional without any API costs.
With AI_ENABLED=false (default), the app runs fully in mock mode — no API key needed. To enable real AI: add GEMINI_API_KEY to .env, set AI_ENABLED=true, then npm install @google/generative-ai.

## Key Design Decisions

**Rule-based scoring first, AI second.** Source scoring (reliability × 0.6 +
recency × 0.4) runs deterministically before any LLM call. The AI layer adds
clinical reasoning on top. This means correct results with zero external dependencies.

**AI abstraction layer** (`aiService.js`). All LLM communication is isolated in
one file. Switching from Gemini to OpenAI requires changing only this file.

**Separated `app.js` / `server.js`.** `app.listen()` lives in `server.js` so
Jest can import the Express app cleanly without binding a port.

**SHA-256 cache keys.** Identical requests return cached responses, avoiding
redundant LLM calls and keeping costs predictable.

**CommonJS throughout.** Avoids Babel configuration overhead and keeps Jest
working out of the box.

## What I'd Improve With More Time

- Persistent database (PostgreSQL) for reconciliation history
- Duplicate patient record detection algorithm
- Real OAuth2 authentication
- Confidence score calibration using clinical domain knowledge
- Docker containerization for one-command setup

## Time Spent

~12 hours

```

```
