# GrowEasy — AI-Powered CSV Importer for CRM

Imports leads from **any** CSV format — Facebook Lead Ads, Google Ads, Excel exports, real-estate CRM exports, marketing agency sheets, manually created spreadsheets — into the fixed GrowEasy CRM schema. Column names are never fixed or predictable; an LLM semantically maps whatever it finds to the CRM fields, with a deterministic rules layer enforcing the hard business constraints (allowed enums, first-email/phone-only, skip conditions) so the output is always safe even if a model has an off day.

**Live app:** https://groweasy-csv-importer-seven.vercel.app
**Live API:** https://groweasy-csv-importer-backend-4hve.onrender.com/api/health
**Repository:** https://github.com/namanjalikumari-bit/AI-powered-CSV-Importer-for-GrowEasy-CRM

## Table of contents

- [Overview](#overview)
- [Architecture](#architecture)
- [AI architecture — provider abstraction](#ai-architecture--provider-abstraction)
- [Tech stack](#tech-stack)
- [Folder structure](#folder-structure)
- [Features](#features)
- [Installation (local development)](#installation-local-development)
- [Environment variables](#environment-variables)
- [Deployment](#deployment)
- [CRM fields & AI rules](#crm-fields--ai-rules)
- [Testing performed](#testing-performed)
- [Future improvements](#future-improvements)

## Overview

The product has exactly four steps, and only one of them touches the network beyond the initial page load:

1. **Upload** — drag-and-drop or file picker, client-side validated (`.csv`, size cap).
2. **Preview** — the CSV is parsed entirely in the browser (Papa Parse) and rendered in a virtualized, sticky-header table. **No AI call happens here.**
3. **Confirm** — only on explicit confirmation is the file uploaded to the backend.
4. **Result** — the backend batches rows, sends them to an AI provider for field mapping, applies deterministic business rules, persists everything to MongoDB, and returns imported/skipped counts plus the full records for review. Every run is kept in **Import History** indefinitely.

## Architecture

```
┌────────────────┐        multipart/form-data        ┌──────────────────────┐
│  Next.js 15    │ ─────────────────────────────────▶ │  Express API         │
│  (Vercel)      │                                     │  (Render)            │
│                │ ◀───────────────────────────────── │                      │
│  client-side   │        JSON { imported, skipped }   │  Papa Parse (server) │
│  CSV preview   │                                     │  → batches of rows   │
└────────────────┘                                     │  → AIService         │
                                                        │     ├─ DeepSeek (1st)│
                                                        │     └─ Gemini  (2nd) │
                                                        │  → business rules    │
                                                        │  → MongoDB Atlas     │
                                                        └──────────────────────┘
```

- The frontend never talks to the AI providers directly — the backend is the only place that holds API keys.
- The backend never trusts the AI blindly — `crm_status`/`data_source` enum membership, the "first email/phone only" rule, and the skip condition (no email **and** no phone) are re-validated in code after the AI responds, in [`import.service.ts`](backend/src/services/import.service.ts).

## AI architecture — provider abstraction

```
AIService (backend/src/services/ai/ai.service.ts)
   │
   │  chunk rows into batches → run with bounded concurrency
   │
   ▼
for each batch: try providers in order until one succeeds
   ├─ DeepSeekProvider   (backend/src/services/ai/deepseek.provider.ts)  ← primary
   └─ GeminiProvider     (backend/src/services/ai/gemini.provider.ts)   ← fallback
```

- Both providers implement the same `AIProvider` interface (`mapBatch(rows, options): Promise<AiRowResult[]>`) — `import.service.ts` and the rest of the business logic have **zero knowledge** of which provider is active. Swapping, reordering, or adding a third provider (OpenAI, Claude, ...) is a one-line change to the `providers` array in `ai.service.ts`.
- Each provider retries transient failures internally (2 retries, exponential backoff) before the batch is handed to the next provider in the chain.
- If **every** provider fails for a batch (bad keys, provider outage, malformed responses after retries), those rows are marked `SKIPPED` with reason `"AI processing failed across all providers"` rather than crashing the import — one bad batch never takes down the rest of a large file.
- DeepSeek is called via its OpenAI-compatible `chat/completions` endpoint with `response_format: { type: "json_object" }`; Gemini is called via `@google/genai` with a strict `responseSchema` (structured output) — both are steered by the same shared prompt in `ai/prompt.ts`, so behavior stays consistent across providers.
- Verified locally: with a valid DeepSeek key, batches are mapped by DeepSeek. With an intentionally invalid DeepSeek key, the same batch correctly falls through to Gemini and produces identical results — see [Testing performed](#testing-performed).

## Tech stack

| Layer | Choice |
|---|---|
| Frontend framework | Next.js 15 (App Router), TypeScript |
| UI | Tailwind CSS v4, shadcn/ui (Base UI primitives), Lucide icons |
| Data & forms | TanStack Table + TanStack Virtual, React Hook Form + Zod, React Dropzone |
| Backend | Node.js, Express, TypeScript |
| CSV parsing | Papa Parse (client for preview, server for the authoritative parse) |
| Uploads | Multer (in-memory, size/type validated) |
| Database | MongoDB Atlas via Mongoose |
| AI | DeepSeek (primary) + Gemini (fallback), provider-abstracted |
| Frontend hosting | Vercel |
| Backend hosting | Render |

## Folder structure

```
GrowEasy/
├── render.yaml                     # Render Blueprint (backend web service)
├── backend/
│   ├── src/
│   │   ├── config/                 # env validation (zod), logger, MongoDB connection
│   │   ├── middleware/             # multer upload, centralized error handler
│   │   ├── models/                 # Import, Lead, SkippedRecord (Mongoose)
│   │   ├── services/
│   │   │   ├── ai/                 # provider abstraction (see above)
│   │   │   ├── csv.service.ts      # server-side CSV parsing
│   │   │   └── import.service.ts   # orchestration + business rules
│   │   ├── controllers/, routes/   # REST API
│   │   ├── types/crm.ts            # shared CRM schema/enums
│   │   └── app.ts, server.ts
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── app/                    # routes: /, /import, /history, /history/[id]
    │   ├── components/
    │   │   ├── csv-importer/       # upload wizard: dropzone, preview, options, progress
    │   │   ├── crm/                # status/source badges, leads & skipped tables
    │   │   ├── history/            # history list + detail views
    │   │   ├── dashboard/           # overview stats
    │   │   ├── layout/              # sidebar, app shell, theming
    │   │   └── ui/                  # shadcn primitives
    │   ├── hooks/                   # CSV parsing, data fetching hooks
    │   ├── lib/api-client.ts        # typed API client
    │   └── types/crm.ts
    └── .env.example
```

## Features

- Drag & drop **and** file-picker upload, with client-side type/size validation.
- Fully client-side CSV preview (virtualized, sticky header, horizontal + vertical scroll) — genuinely zero backend/AI cost until the user confirms.
- Batched, concurrent AI field mapping with a DeepSeek → Gemini fallback chain.
- Deterministic post-processing: enum validation, first-email/phone extraction with overflow into `crm_note`, and the "no email and no phone → skip" rule enforced in code, not just prompted.
- Import history with per-run detail pages (imported vs. skipped, full record view).
- Dark mode / light mode (`next-themes`), fully responsive, virtualized results tables for large files.
- Skeleton loading states, toast notifications, empty states, and dedicated error/not-found pages.
- Centralized API error handling, request logging (pino), rate limiting, Helmet security headers.

## Installation (local development)

Prerequisites: Node.js 20+, a MongoDB connection string, a DeepSeek API key, a Gemini API key.

```bash
# Backend
cd backend
npm install
cp .env.example .env   # fill in MONGODB_URI, DEEPSEEK_API_KEY, GEMINI_API_KEY
npm run dev             # http://localhost:5000

# Frontend (separate terminal)
cd frontend
npm install
cp .env.example .env.local   # defaults to http://localhost:5000/api
npm run dev             # http://localhost:3000
```

Other scripts — backend: `npm run build`, `npm start`, `npm run typecheck`. Frontend: `npm run build`, `npm start`, `npm run lint`.

> If MongoDB Atlas SRV lookups fail locally with `ECONNREFUSED` on some Windows/corporate networks, `backend/src/config/db.ts` already forces public DNS resolvers (`8.8.8.8`, `1.1.1.1`) as a fallback before connecting — no action needed.

## Environment variables

**`backend/.env`** (see `backend/.env.example`):

| Variable | Required | Notes |
|---|---|---|
| `MONGODB_URI` | yes | MongoDB Atlas (or any MongoDB 6+) connection string |
| `DEEPSEEK_API_KEY` | yes* | Primary AI provider |
| `DEEPSEEK_MODEL` | no | Default `deepseek-chat` |
| `GEMINI_API_KEY` | yes | Fallback AI provider |
| `GEMINI_MODEL` | no | Default `gemini-2.5-flash` |
| `CORS_ORIGIN` | no | Comma-separated allowed frontend origins |
| `MAX_UPLOAD_SIZE_MB` | no | Default `10` |
| `AI_BATCH_SIZE` | no | Rows per AI request, default `25` |
| `AI_CONCURRENCY` | no | Parallel batches in flight, default `3` |

\* If omitted or invalid, every batch automatically falls back to Gemini — the app still works with only `GEMINI_API_KEY` set.

**`frontend/.env.local`** (see `frontend/.env.example`):

| Variable | Notes |
|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | Backend API base, e.g. `http://localhost:5000/api` locally or the Render URL in production |

## Deployment

### Frontend — Vercel (live)

Deployed from `frontend/` via the Vercel CLI, linked to project `groweasy-csv-importer` under the `namanjalikumari-6861s-projects` team:

```bash
cd frontend
vercel link --project groweasy-csv-importer
vercel env add NEXT_PUBLIC_API_BASE_URL production   # → backend URL
vercel --prod
```

Live at **https://groweasy-csv-importer-seven.vercel.app**.

### Backend — Render (live)

Deployed as service `groweasy-csv-importer-backend` at **https://groweasy-csv-importer-backend-4hve.onrender.com** on Render's free tier, region Oregon, auto-deploying from `main`. `render.yaml` at the repo root documents the same configuration as a Blueprint for reproducibility:

```yaml
buildCommand: npm install --include=dev && npm run build   # --include=dev matters: NODE_ENV=production
startCommand: npm start                                     # otherwise prunes typescript/@types/* before tsc runs
healthCheckPath: /api/health
```

To redeploy from scratch elsewhere: **New → Blueprint** in the Render dashboard, connect this repository (Render auto-detects `render.yaml`), and fill in the secret values (`MONGODB_URI`, `DEEPSEEK_API_KEY`, `GEMINI_API_KEY`, `CORS_ORIGIN`) when prompted.

If you redeploy to a different URL, update the Vercel env var and redeploy the frontend:

```bash
cd frontend
vercel env rm NEXT_PUBLIC_API_BASE_URL production
printf "https://<your-render-service>.onrender.com/api" | vercel env add NEXT_PUBLIC_API_BASE_URL production
vercel --prod
```

## CRM fields & AI rules

Target schema (`backend/src/types/crm.ts`, mirrored in `frontend/src/types/crm.ts`):

`created_at, name, email, country_code, mobile_without_country_code, company, city, state, country, lead_owner, crm_status, crm_note, data_source, possession_time, description`

- `crm_status` ∈ `{GOOD_LEAD_FOLLOW_UP, DID_NOT_CONNECT, BAD_LEAD, SALE_DONE}` or `null` — never invented if there's no signal.
- `data_source` ∈ `{leads_on_demand, meridian_tower, eden_park, varah_swamy, sarjapur_plots}` or `null`.
- Only the **first** email/phone per row becomes `email`/`mobile_without_country_code`; every additional one is appended into `crm_note`.
- A row is skipped **only** when it has neither an email nor a phone number, anywhere in the row — this is enforced in code after the AI responds, not just requested in the prompt.
- `created_at` is normalized by the AI to an ISO 8601 string so `new Date(created_at)` is always valid in JS; unparseable dates become `null` rather than a guess.
- Multiple/duplicate columns for the same concept (two phone columns, first/last name split, etc.) are treated as one field with rule 2/3 applied, not as separate CRM attributes.

## Testing performed

All of the following were run against the **real** Atlas cluster and **real** DeepSeek/Gemini keys, not mocks:

- **Happy path**: Facebook/Google-Ads-style messy CSV with mismatched headers (`Lead Name`, `Alt Email`, `Phone Number`, `Disposition`, `Campaign Source`, mixed date formats) → correctly mapped names, first-email/phone-only with overflow into `crm_note`, semantically correct `crm_status`/`data_source` classification, and all four date formats normalized to valid ISO dates.
- **Skip rule**: rows with no email and no phone were skipped with a clear reason, even when they had rich unrelated data (company, notes, etc.).
- **Provider fallback**: with an intentionally invalid `DEEPSEEK_API_KEY`, the batch failed over to Gemini automatically and produced the same correct mapping — confirmed via server logs (`deepseek failed for this batch, trying next provider` → `AI batch mapped successfully, provider: gemini`).
- **Malformed input**: non-CSV file with a `.txt` extension, a CSV with a header row but zero data rows, a completely empty file, a binary file with a spoofed extension, and a request with no file attached — every case returned a clear `400` with a specific message, never a `500` or a hang.
- **Not found**: a random/garbage import ID returns `404`; an unknown route returns `404`.
- **Build/type safety**: `tsc --noEmit` and `next build` (including ESLint) both pass clean on the final code for both apps.
- **UI**: dark mode and light mode, responsive layout down to mobile widths, virtualized tables confirmed to render correctly for the imported/skipped result sets, loading skeletons and empty/error states all exercised.
- **Production smoke test**: after deploying, ran a real import against the live Render URL from the command line with the exact CORS origin the deployed Vercel frontend uses — CORS preflight returned `204`, the import completed with the same correct 4-imported/2-skipped result as local testing, and the record was verified in Atlas before being cleaned up.
- **Deployment failure loop**: the first two Render deploy attempts failed — first on a TypeScript 5.9 deprecation (`moduleResolution` defaulting to the legacy `node10` resolver), then on `NODE_ENV=production` silently pruning `devDependencies` (including `typescript` and `@types/*`) before the build step ran. Both were root-caused from Render's build logs (not guessed) and fixed at the source (`nodenext` module resolution; `npm install --include=dev`) rather than papered over.

## Future improvements

- Move AI processing to a background job queue (e.g. BullMQ) so very large imports don't hold an HTTP request open; poll for status from the frontend instead of awaiting the response inline.
- Streaming/incremental CSV parsing for multi-hundred-thousand-row files instead of parsing the whole file into memory.
- Per-column confidence scores from the AI so low-confidence mappings can be flagged for manual review before import.
- Unit/integration test suite (Vitest/Jest) around `import.service.ts`'s business-rule enforcement and the AI provider fallback chain.
- Dockerfiles for both apps for container-based deployment as an alternative to Vercel/Render.
