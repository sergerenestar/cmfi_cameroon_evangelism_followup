import { createClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client.
 *
 * Uses the service role key so it can write to `new_converts` even
 * though Row Level Security blocks the public/anon key. This file is
 * only ever imported from app/api routes, which run server-side —
 * the service role key is never sent to the browser.
 *
 * Supabase's connection pooler (PgBouncer, transaction mode) is what
 * lets this survive a burst of thousands of near-simultaneous
 * submissions from Vercel's serverless functions: each function
 * instance opens a short-lived pooled connection, does one INSERT,
 * and releases it, instead of holding a dedicated Postgres
 * connection per request.
 */
export function getSupabaseServerClient() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables."
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });
}
