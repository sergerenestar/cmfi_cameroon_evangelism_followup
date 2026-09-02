import { getSupabaseServerComponentClient } from "@/lib/supabase/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export type Role = "super_admin" | "follow_up_coordinator" | "viewer";

export interface AuthorizedAdmin {
  id: string;
  email: string;
  fullName: string | null;
  role: Role;
}

/**
 * The single chokepoint every /api/admin/* route calls first.
 *
 * 1. Reads the session from cookies (via the anon-key, RLS-respecting
 *    client) to find out who's logged in.
 * 2. Looks up their role using the service-role client (bypasses RLS —
 *    this is the one place allowed to do that, specifically to answer
 *    "what role does this authenticated user have").
 * 3. If `allowedRoles` is given, rejects anyone whose role isn't in it.
 *
 * Returns null if the caller isn't logged in or isn't authorized —
 * callers should respond 401/403 in that case.
 */
export async function requireAdmin(allowedRoles?: Role[]): Promise<AuthorizedAdmin | null> {
  const sessionClient = getSupabaseServerComponentClient();
  const {
    data: { user },
  } = await sessionClient.auth.getUser();

  if (!user) return null;

  const adminClient = getSupabaseServerClient();
  const { data: profile, error } = await adminClient
    .from("profiles")
    .select("id, email, full_name, role")
    .eq("id", user.id)
    .single();

  if (error || !profile) return null;

  if (allowedRoles && !allowedRoles.includes(profile.role as Role)) {
    return null;
  }

  return {
    id: profile.id,
    email: profile.email,
    fullName: profile.full_name,
    role: profile.role as Role,
  };
}
