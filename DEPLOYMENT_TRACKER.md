# Deployment tracker — CMFI Cameroon Evangelism Follow-up

Live site: https://cmfi-cameroon-evangelism-followup.vercel.app
Repo: https://github.com/sergerenestar/cmfi_cameroon_evangelism_followup

## Status as of 2026-09-02

- ✅ Public form (`/`) — deployed, working.
- ✅ GitHub + Vercel connected, auto-deploy on push to `main` working.
- ✅ `/admin/login` — no longer crashes or redirect-loops. Login itself succeeds.
- 🔴 **Blocked:** after login, `/admin` shows "Access denied" with debug detail:
  > session OK (renes03e@gmail.com, id `67b38f1b-6825-4330-a601-f88c0e6b005e`),
  > but the profiles lookup errored: **permission denied for table profiles**

## Next step (do this first)

That error is a Postgres grants issue, not an app bug. In Supabase → **SQL Editor**, run:

```sql
grant usage on schema public to anon, authenticated, service_role;
grant all on public.profiles to service_role;
grant select on public.profiles to authenticated;
grant all on public.new_converts to service_role;
grant all on public.contact_log to service_role;
```

Then reload `/admin` (fresh login if needed). If the debug line changes to
something else (e.g. "no profiles row" or a role-name issue), that's next
to fix — the debug block on the access-denied screen will say exactly what.

## Cleanup once admin access works

Two temporary things were added purely for debugging and should be removed
once you're in:

- `app/admin/(dashboard)/error.tsx` — shows raw errors instead of a blank
  page. Fine to keep long-term (nicer than a blank page) or delete.
- The debug block inside `app/admin/(dashboard)/layout.tsx`'s `if (!admin)`
  branch — re-checks the session/profile and prints why it failed. Should
  be removed (or trimmed to a generic message) before real admins use this,
  since it currently reveals internal error text.

## Also still to do

- **Rotate the Supabase database password** — an earlier password was
  pasted into this chat session and should be treated as compromised.
  Supabase → Settings → Database → Reset database password.
- Run `supabase/schema.sql` fully if you haven't (creates `new_converts`,
  `contact_log`, `profiles` with RLS). Already done if the form works and
  the `profiles` row exists.
- SMS sending (`lib/sms/*`) is scaffolded but not wired up — the
  "log contact" admin action just logs, it doesn't send yet.

## Commits made this session (already pushed to `main`)

1. `b0f681e` — migrate middleware/session cookie handling to
   `@supabase/ssr`'s current `getAll`/`setAll` API (old `get`/`set`/`remove`
   API silently broke session persistence).
2. `d403fe8` — move authenticated admin pages into an
   `app/admin/(dashboard)` route group so `/admin/login` no longer inherits
   the gated layout (was causing an infinite self-redirect).
3. `901f352` — fix a TypeScript build error (implicit `any` on
   `cookiesToSet`).
4. `9b5c889` — add `error.tsx` boundary under `/admin` (diagnostic).
5. `5bf1415` — layout no longer calls its own `redirect()` to
   `/admin/login`; only middleware does. Two independent redirectors were
   able to ping-pong against each other (the `history.replaceState`
   throttling / blank page symptom).
6. `f0248ef` — added the debug detail line to the access-denied screen
   (see "Cleanup" above — remove later).
