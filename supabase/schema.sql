-- CMFI Cameroon Evangelism Follow-up — New Convert Campaign Supabase schema
-- Mirrors the organizers' official "Fiche de Suivi - Nouveaux Convertis"
-- Run this once in the Supabase SQL editor (Project > SQL Editor > New query)

-- ─────────────────────────────────────────────────────────────────
-- Admin accounts & roles
-- ─────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'viewer'
    check (role in ('super_admin', 'follow_up_coordinator', 'viewer')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Each admin can read their own profile (needed so the admin shell
-- can show "signed in as ___, role: ___"). Nothing else is exposed by
-- RLS — listing all admins and creating/editing accounts happens
-- through /api/admin/users, which checks the caller's role server-side
-- and then uses the service role key. This keeps one authorization
-- chokepoint instead of duplicating role logic into RLS policies.
create policy "Admins can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- ─────────────────────────────────────────────────────────────────

create table if not exists public.new_converts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),  -- serves as "Date" from the fiche

  -- Interview / intake context
  worker_name text not null,        -- "Nom de l'ouvrier / Conseiller"
  campaign_name text,                -- "Nom de l'événement"
  campaign_location text,            -- "Lieu de la croisade"
  language text default 'en',        -- 'en' | 'fr' — which version of the form was used

  -- 1. Informations Personnelles
  full_name text not null,
  gender text,                       -- 'M' | 'F'
  age_range text,                    -- '12-17' | '18-25' | '26-35' | '36+'
  phone text not null,
  quartier text,                     -- "Quartier / Adresse précise"
  profession text,                   -- "Profession / École"

  -- 2. Situation Spirituelle
  decision_type text not null,       -- 'first_time' | 'rededication'
  has_bible boolean,                 -- "Possède-t-il/Elle une Bible ?"
  attends_church boolean,            -- "Fréquente-t-il/Elle déjà une église ?"
  home_church text,                  -- name of that church, if attends_church = true

  -- Prayer topics
  addictions text,                   -- free text
  prayer_healing boolean default false,
  prayer_deliverance boolean default false,
  prayer_peace boolean default false,
  prayer_family boolean default false,
  prayer_other text,

  -- Additional follow-up interest (beyond the fiche, kept for convenience)
  wants_bible_study boolean default false,
  wants_church_referral boolean default false,
  notes text,

  -- 3. Plan d'Action pour le Suivi — RESERVED FOR TEAMS.
  -- Left null at submission time; filled in later by the follow-up team
  -- directly in this table (Table Editor) once each convert is assigned.
  contact_mode text,                 -- 'call' | 'home_visit' | 'whatsapp'
  assigned_church text,              -- "Affecté à l'église locale"
  assigned_disciple_maker text,      -- "Nom du faiseur de disciple assigné"

  -- basic anti-spam / audit fields
  user_agent text,
  source_ip text
);

-- Index for fast campaign-level reporting
create index if not exists idx_new_converts_campaign on public.new_converts (campaign_name, created_at);

-- ─────────────────────────────────────────────────────────────────
-- Outreach log — every SMS, email, or call attempt made toward a
-- convert, regardless of channel or provider. This is what an admin
-- "send SMS" / "send email" / "log a call" action writes to.
-- ─────────────────────────────────────────────────────────────────
create table if not exists public.contact_log (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  convert_id uuid not null references public.new_converts(id) on delete cascade,

  channel text not null,             -- 'sms' | 'email' | 'call' | 'home_visit'
  provider text,                     -- e.g. 'orange_cm', 'mtn_cm', 'resend'
  message text,                      -- body sent, or a note for calls/visits
  status text not null default 'sent', -- 'sent' | 'failed' | 'logged'
  error text,                        -- set when status = 'failed'

  sent_by uuid references auth.users(id)  -- which admin took this action
);

create index if not exists idx_contact_log_convert on public.contact_log (convert_id, created_at);

alter table public.contact_log enable row level security;
-- No public policies here either — only accessed via the service role
-- key from admin API routes once the admin portal is built.

-- ─────────────────────────────────────────────────────────────────
-- BOOTSTRAPPING THE FIRST SUPER ADMIN
-- The admin portal lets a super_admin create further accounts, but
-- the very first one has to be created manually (there's no super_admin
-- yet to do it from the UI):
--
-- 1. Supabase Dashboard → Authentication → Users → Add user
--    (enter email + password, check "Auto confirm user")
-- 2. Copy that user's UUID from the Users list
-- 3. Table Editor → profiles → Insert row:
--      id = the UUID from step 2
--      email = same email
--      role = 'super_admin'
-- 4. Log into /admin/login with that email/password.
-- ─────────────────────────────────────────────────────────────────

-- Row Level Security: lock the table down. Only the service role
-- (used server-side by the API route) can read/write. The public
-- anon key used by the browser never touches this table directly.
alter table public.new_converts enable row level security;

-- No policies are created for the anon/public role, so RLS denies
-- all access by default unless you explicitly add a policy. All
-- writes happen through the Next.js API route using the service
-- role key, which bypasses RLS by design.

-- ─────────────────────────────────────────────────────────────────
-- MIGRATION: if you already ran an earlier version of this schema,
-- run this block instead of the CREATE TABLE above to add the new
-- fiche-aligned columns without losing existing data.
-- ─────────────────────────────────────────────────────────────────
-- alter table public.new_converts add column if not exists worker_name text;
-- alter table public.new_converts add column if not exists quartier text;
-- alter table public.new_converts add column if not exists profession text;
-- alter table public.new_converts add column if not exists has_bible boolean;
-- alter table public.new_converts add column if not exists attends_church boolean;
-- alter table public.new_converts add column if not exists addictions text;
-- alter table public.new_converts add column if not exists prayer_healing boolean default false;
-- alter table public.new_converts add column if not exists prayer_deliverance boolean default false;
-- alter table public.new_converts add column if not exists prayer_peace boolean default false;
-- alter table public.new_converts add column if not exists prayer_family boolean default false;
-- alter table public.new_converts add column if not exists prayer_other text;
-- alter table public.new_converts add column if not exists contact_mode text;
-- alter table public.new_converts add column if not exists assigned_church text;
-- alter table public.new_converts add column if not exists assigned_disciple_maker text;
-- alter table public.new_converts add column if not exists language text default 'en';
