# B-School Radar

A single-user tracker for MBA/PGP applications: deadlines, requirements, scholarships,
and a per-school checklist — so you don't have to keep it all in a spreadsheet.

## What it does

- **Dashboard** — every open application round and scholarship deadline across all
  schools, sorted by how soon it closes and color-coded by urgency.
- **Schools** — a table of every school you're tracking with its next deadline, test
  requirements, and next scholarship deadline at a glance.
- **School detail** — full breakdown per school: program info, requirements
  (GMAT/GRE/IELTS/TOEFL/ieGAT, with waiver notes), scholarships, and every round with
  an editable status + checklist.
- **Checklist** — the same tasks (test scores, essays, LORs, transcripts, fees) grouped
  across every in-progress school, so checking "GMAT submitted" once shows you every
  school it still needs it for.
- **Add / edit school** — a form for entering a school's current-cycle data yourself;
  there's no reliable API for this, so the intended workflow is a manual seed that you
  re-verify against each school's official admissions page every cycle.

## Tech stack

Next.js (App Router, TypeScript) + Prisma + SQLite (via the libSQL driver adapter) +
Tailwind CSS.

## Getting started (local)

```bash
npm install
cp .env.example .env
npx prisma migrate dev   # creates prisma/dev.db and applies the schema
npm run db:seed          # seeds ~10 schools (INSEAD, HEC, IE, IMD, ISB, LBS,
                          # Judge, Saïd, MIT Sloan, Kellogg) as a starting point
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

To wipe and reseed the database: `npm run db:reset`.

Locally, `src/lib/db.ts` connects straight to `prisma/dev.db` — no Turso account
needed for local dev.

## Deploying to Vercel

Vercel's serverless functions don't have a persistent writable filesystem, so the
local SQLite file (`prisma/dev.db`) can't be the production database — it would
reset or fail to write between invocations. This app instead talks to SQLite through
the [libSQL](https://turso.tech/libsql) driver adapter, which can point at a real
**Turso** database in production while still using a local file in dev (same code
path, see `src/lib/db.ts`).

**1. Create a Turso database**

```bash
# one-time: install the Turso CLI and sign in — see https://docs.turso.tech/cli/installation
turso db create b-school-radar
turso db show b-school-radar --url          # → TURSO_DATABASE_URL
turso db tokens create b-school-radar       # → TURSO_AUTH_TOKEN
```

**2. Apply the schema to it** (Prisma Migrate doesn't speak the libSQL wire protocol
directly, so push the existing migration SQL with the Turso CLI instead):

```bash
turso db shell b-school-radar < prisma/migrations/20260917175639_init/migration.sql
```

**3. Seed it** (optional, run from your machine — points the same seed script at Turso
instead of the local file):

```bash
TURSO_DATABASE_URL="libsql://<your-db>.turso.io" \
TURSO_AUTH_TOKEN="<token from step 1>" \
npm run db:seed
```

**4. Set environment variables in the Vercel project** (Project → Settings →
Environment Variables):

| Name                 | Value                                  |
|----------------------|-----------------------------------------|
| `TURSO_DATABASE_URL` | `libsql://<your-db>.turso.io` from step 1 |
| `TURSO_AUTH_TOKEN`   | the token from step 1                   |

You do **not** need to set `DATABASE_URL` on Vercel — it's only read by the Prisma
CLI for local migrations, never by the deployed app.

**5. Deploy.** `npm run build` already runs `prisma generate` via the `postinstall`
script, so no extra Vercel build settings are needed.

Whenever you add a new Prisma migration locally, re-run step 2 against Turso with the
new migration file before/after deploying.

## Keeping data current

The seeded deadlines reflect a plausible 2026–2027 application cycle at the time this
was written — schools shift dates slightly every year. Use the "Edit school" screen to
correct dates after checking each school's official admissions page; no code changes
needed.
