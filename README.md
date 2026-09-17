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

Next.js (App Router, TypeScript) + Prisma + SQLite + Tailwind CSS. Everything runs
locally in one process — no external database or services required.

## Getting started

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

## Keeping data current

The seeded deadlines reflect a plausible 2026–2027 application cycle at the time this
was written — schools shift dates slightly every year. Use the "Edit school" screen to
correct dates after checking each school's official admissions page; no code changes
needed.
