# GrowEasy — AI-Powered CSV Importer for CRM

Intelligently imports leads from any CSV format (Facebook Lead Ads, Google Ads, Excel exports, real-estate CRMs, agency sheets, manual spreadsheets) into GrowEasy CRM. Gemini AI maps arbitrary column names to the fixed CRM schema — no hardcoded header matching.

## Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui, TanStack Table/Virtual, React Hook Form + Zod, React Dropzone
- **Backend**: Node.js, Express, TypeScript, Mongoose, Multer, Papa Parse
- **Database**: MongoDB (Atlas in production, works with any MongoDB 6+ instance locally)
- **AI**: Gemini API (`@google/genai`)

## Project layout

```
backend/    Express API — CSV parsing, Gemini field mapping, MongoDB persistence
frontend/   Next.js dashboard — upload wizard, preview, results, import history
```

## Prerequisites

- Node.js 20+
- A MongoDB connection string (MongoDB Atlas, or any reachable MongoDB 6+ instance)
- A Gemini API key from https://aistudio.google.com/apikey

## 1. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env`:

```
MONGODB_URI=<your MongoDB Atlas connection string>
GEMINI_API_KEY=<your Gemini API key>
```

Run it:

```bash
npm run dev       # starts on http://localhost:5000 with hot reload
```

Other scripts: `npm run build` (compile to `dist/`), `npm start` (run compiled build), `npm run typecheck`.

## 2. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env.local
```

`frontend/.env.local` already defaults to `NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api`, matching the backend above.

Run it:

```bash
npm run dev        # starts on http://localhost:3000
```

Other scripts: `npm run build`, `npm start`, `npm run lint`.

## 3. Using the app

1. Open http://localhost:3000 — dashboard with overview stats and recent imports.
2. Go to **Import Leads**, drop in a `.csv` file. It's parsed and previewed entirely in the browser — no backend/AI call yet.
3. Optionally set a default data source / lead owner fallback, then **Confirm & Import**.
4. Only now is the file sent to the backend, which batches rows and sends them to Gemini for field mapping, then persists `Import`, `Lead`, and `SkippedRecord` documents in MongoDB.
5. Review the imported vs. skipped breakdown, or revisit any run later from **Import History**.

## AI mapping rules

- `crm_status` is restricted to `GOOD_LEAD_FOLLOW_UP`, `DID_NOT_CONNECT`, `BAD_LEAD`, `SALE_DONE` (or `null`).
- `data_source` is restricted to `leads_on_demand`, `meridian_tower`, `eden_park`, `varah_swamy`, `sarjapur_plots` (or `null`).
- Only the first email/phone found per row is stored on the lead; any additional ones are appended to `crm_note`.
- A row is skipped when it has neither an email nor a phone number — never hallucinated.
- If a Gemini batch call fails after retries, that batch's rows are marked skipped (not silently dropped and not a hard failure) so one bad batch never crashes an import.

## Notes

- CSV files are capped at 10MB / 20,000 rows (configurable via backend env vars `MAX_UPLOAD_SIZE_MB`, and the row cap in `src/services/csv.service.ts` / `src/hooks/use-csv-parser.ts`).
- `GEMINI_BATCH_SIZE` and `GEMINI_CONCURRENCY` control how rows are chunked and how many batches run in parallel against Gemini.
