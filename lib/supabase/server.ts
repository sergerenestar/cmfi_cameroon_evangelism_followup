import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Session-aware Supabase client for Server Components and Route
 * Handlers. Reads the auth session from cookies (set by middleware),
 * so `supabase.auth.getUser()` reflects who's actually logged in.
 *
 * This respects Row Level Security — it can only read what the
 * `profiles` RLS policy allows (the caller's own row). For anything
 * broader (listing all admins, reading new_converts, sending SMS),
 * routes use this client only to identify + authorize the caller,
 * then use lib/supabase-server.ts (service role) to do the actual work.
 */
export function getSupabaseServerComponentClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set() {
          // Server Components can't set cookies; middleware handles
          // session refresh. Safe to no-op here.
        },
        remove() {
          // Same as above.
        },
      },
    }
  );
}
