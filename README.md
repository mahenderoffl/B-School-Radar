# B-School Radar

A single-user tracker for MBA/PGP applications: deadlines, requirements, scholarships,
and a per-school checklist — so you don't have to keep it all in a spreadsheet.

## What it does

- **Landing page** (`/`) — a static overview of what the app does, with a link into
  the app. Everything below lives under `/dashboard`, `/schools`, `/checklist`, and
  `/data`, sharing one navigation shell.
- **Dashboard** — every open application round and scholarship deadline across all
  schools, sorted by how soon it closes and color-coded by urgency. The summary cards
  are clickable filters.
- **Schools** — a searchable table of every school you're tracking with its next
  deadline, test requirements, and next scholarship deadline at a glance.
- **School detail** — full breakdown per school: program info, requirements
  (GMAT/GRE/IELTS/TOEFL/ieGAT, with waiver notes), scholarships, and every round with
  an editable status + checklist.
- **Checklist** — the same tasks (test scores, essays, LORs, transcripts, fees) grouped
  across every in-progress school, so checking "GMAT submitted" once shows you every
  school it still needs it for.
- **Add / edit school** — a form for entering a school's current-cycle data yourself,
  or import one from a file instead (see below); there's no reliable API for this, so
  the intended workflow is a manual seed that you re-verify against each school's
  official admissions page every cycle.
- **Import / export** — export everything as one JSON file (`/data`, or per-school from
  its detail page) for backup or moving to a different deployment. Import accepts that
  same JSON, or a `.csv`/`.xlsx`/`.xls` spreadsheet of deadlines, requirements, and
  scholarships (one row per round) for bulk entry — from the Data page (merge or
  replace-all) or the Add School page (always merges), by file upload or pasted text.
  A CSV template and a copy-ready research prompt (paste into any LLM, paste its CSV
  output back in) are both one click away from either.
- **Auto-detected logos** — every school gets a small logo next to its name wherever it
  appears, derived from its website's domain with no lookup or upload needed. It reads
  the school's own site for its real high-resolution icon (apple-touch-icon or the
  largest `<link rel="icon">`) rather than a blurry 16px favicon, with a low-res favicon
  fallback and then a colored initials badge if nothing can be found.

## Tech stack

Next.js (App Router, TypeScript) + Prisma + Postgres (Prisma Postgres) + Tailwind CSS.

## Getting started (local)

```bash
npm install
cp .env.example .env   # then paste your Prisma Postgres DATABASE_URL into .env
npx prisma migrate deploy   # applies the schema to your database
npm run db:seed             # seeds ~10 schools (INSEAD, HEC, IE, IMD, ISB, LBS,
                             # Judge, Saïd, MIT Sloan, Kellogg) as a starting point
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

This app uses one Postgres database for both local dev and production — there's no
separate local file to manage. See below for how to create it.

## Deploying to Vercel

This app uses **Prisma Postgres**, provisioned from the Vercel dashboard's Storage
tab (Storage → Create Database → Prisma Postgres, Marketplace integration). It's
free for a single-user app (500MB storage / 100K operations per month is far more
than tracking a handful of schools will ever use).

**1. Create the database** in your Vercel project (Storage tab → Create Database →
Prisma Postgres → Free plan). Connect it to this project when prompted — Vercel then
auto-injects a `DATABASE_URL` environment variable into the project. You don't need
to copy any secret into Vercel by hand.

**2. Copy that same `DATABASE_URL`** into your local `.env` (find it under the
database's "Quickstart" tab in the Vercel dashboard, or Project → Settings →
Environment Variables). Local dev and production point at the same database.

**3. Apply the schema and seed it:**

```bash
npx prisma migrate deploy
npm run db:seed
```

**4. Deploy.** The `build` script (`prisma migrate deploy && next build`) applies
any pending migrations automatically on every deploy, and `postinstall` runs
`prisma generate` — no extra Vercel build configuration needed.

Whenever you add a new Prisma migration, it's applied automatically the next time
you deploy (or run `npx prisma migrate deploy` locally).

**Optional: sharper logos.** School logos default to reading each school's own site for
its real icon (apple-touch-icon or the largest declared `<link rel="icon">`, typically
180–512px), falling back to Google's public favicon service if that fails — both free,
no signup, work immediately. For guaranteed high-res logos regardless of what a school's
site declares, create a free account at [logo.dev](https://logo.dev), grab a publishable
key, and set it as `NEXT_PUBLIC_LOGO_DEV_KEY` in Vercel's environment variables. Nothing
else changes.

## Keeping data current

The seeded deadlines reflect a plausible 2026–2027 application cycle at the time this
was written — schools shift dates slightly every year. Use the "Edit school" screen to
correct dates after checking each school's official admissions page; no code changes
needed.
