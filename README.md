# CMFI Cameroon Evangelism Follow-up

A mobile-first form for new converts to submit their information during
CMFI Cameroon evangelist campaigns. Built to handle high-concurrency submission
bursts (e.g. an altar call with thousands of people submitting within
minutes) without a self-hosted server.

## Architecture

```
Phone browser (form)
      │  POST /api/submit
      ▼
Vercel Serverless Function  ── auto-scales per request, no server to manage
      │  pooled connection (PgBouncer, transaction mode)
      ▼
Supabase Postgres  ── single INSERT per submission, RLS-locked table
```

- **Why not a CSV + batch script:** Vercel functions have no shared
  persistent disk, so concurrent writers can't safely share one file.
  Postgres is built for concurrent writes; a shared file is not.
- **Why Supabase specifically:** its connection pooler is the standard
  fix for "many short-lived serverless functions, one database" —
  it queues and multiplexes connections so the database is never
  overwhelmed, even under a sudden spike.
- **Security:** the `new_converts` table has Row Level Security
  enabled with no public policies, so only the server-side service
  role key (used in the API route) can read or write. The browser
  never talks to Supabase directly.

## 1. Set up Supabase (5 minutes)

1. Create a free project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor** → paste the contents of `supabase/schema.sql` → **Run**.
   (Already ran an earlier version of this schema? Just run the one-line
   `alter table ... add column if not exists language ...` at the bottom
   of the file instead of the full `create table`.)
3. Go to **Project Settings → API** and copy:
   - **Project URL** → `SUPABASE_URL`
   - **service_role secret key** → `SUPABASE_SERVICE_ROLE_KEY`

## 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in the two values above:

```bash
cp .env.example .env.local
```

## 3. Run locally

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`.

## 4. Deploy to Vercel (free tier)

```bash
npm install -g vercel
vercel
```

Or connect the GitHub repo at [vercel.com/new](https://vercel.com/new) for
automatic deploys on every push. Either way, add the two environment
variables (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`) in the Vercel
project's **Settings → Environment Variables**, then redeploy.

## 5. Load-test before the campaign (recommended)

With 100k expected respondents, run a quick burst test against your
deployed `/api/submit` endpoint (e.g. with `k6` or `autocannon`) a few
days ahead of the event so you can confirm response times under load
and, if needed, add a queue (Upstash Redis/QStash) in front of the
insert for extra buffering. The current direct-to-Postgres design
should comfortably handle campaign-scale bursts on its own.

## 6. Set up the admin portal

The admin portal (`/admin`) uses Supabase Auth for login and a
`profiles` table for roles (`super_admin`, `follow_up_coordinator`,
`viewer`). Every admin API route checks the caller's role server-side
before touching data — Row Level Security is a backstop, not the
primary gate.

1. Add two more env vars (public — safe to expose to the browser):
   ```
   NEXT_PUBLIC_SUPABASE_URL=<same as SUPABASE_URL>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<Project Settings → API → anon public>
   ```
2. Create the first super admin manually (there's no super_admin yet
   to create one from the UI):
   - Supabase Dashboard → **Authentication → Users → Add user** (check
     "Auto confirm user")
   - Copy that user's UUID
   - **Table Editor → profiles → Insert row**: `id` = the UUID, `email`
     = same email, `role` = `super_admin`
3. Deploy (or run locally) and visit `/admin/login`. From there, a
   super admin can create further accounts at `/admin/users` — no more
   manual steps needed after the first one.

**Roles, for now:**
- `super_admin` — full access, manages other admin accounts
- `follow_up_coordinator` — intended for updating records and sending
  outreach (records list and outreach actions are the next phases)
- `viewer` — read-only (enforced once the records/stats pages exist)

## Viewing submissions

Supabase's **Table Editor → new_converts** gives you a live, filterable
view. For exports, use **Table Editor → Export CSV**, or connect a BI
tool (Metabase/Grafana) directly to the Postgres connection string in
**Project Settings → Database**.

### Filling in the "reserved for teams" fields

Three columns on the fiche — `contact_mode`, `assigned_church`, and
`assigned_disciple_maker` — are intentionally **not** on the public
form. The organizers' paper fiche marks this section "Réservé aux
Équipes": it's decided by the follow-up team *after* the event, not by
the convert at the point of contact.

To fill these in: open **Table Editor → new_converts** in Supabase,
click into a row, and edit those three cells directly. For a team
processing hundreds of records, filtering the table by `assigned_church
is null` first will show only the ones still needing an assignment.
