import { requireAdmin } from "@/lib/require-admin";
import { getSupabaseServerComponentClient } from "@/lib/supabase/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import SignOutButton from "./sign-out-button";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();

  // Middleware is the only thing that redirects unauthenticated
  // visitors to /admin/login. If this layout's own session check ever
  // disagreed with middleware's (e.g. a signed-in user with no
  // profiles row, or a race between the two), redirecting again here
  // could ping-pong the two auth checks against each other forever.
  // So this renders an inline message instead of redirecting.
  if (!admin) {
    // TEMPORARY diagnostics — re-checks the same two steps requireAdmin()
    // does, just to show which one is failing. Safe to remove once
    // admin access is confirmed working.
    const sessionClient = getSupabaseServerComponentClient();
    const {
      data: { user },
    } = await sessionClient.auth.getUser();

    let profileDebug = "no session — the login cookie isn't reaching this page.";
    if (user) {
      const adminClient = getSupabaseServerClient();
      const { data: profile, error } = await adminClient
        .from("profiles")
        .select("id, email, role")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        profileDebug = `session OK (${user.email}, id ${user.id}), but the profiles lookup errored: ${error.message}`;
      } else if (!profile) {
        profileDebug = `session OK (${user.email}, id ${user.id}), but no profiles row has that id.`;
      } else {
        profileDebug = `session OK (${user.email}), profiles row found with role "${profile.role}" — role must be exactly super_admin/follow_up_coordinator/viewer.`;
      }
    }

    return (
      <div className="min-h-dvh flex items-center justify-center bg-cream px-6 text-center">
        <div>
          <h1 className="font-display text-xl text-forest">Access denied</h1>
          <p className="text-forest/60 text-[15px] mt-2 max-w-sm">
            Your account isn&apos;t set up as an admin yet, or your session
            expired.
          </p>
          <p className="text-forest/40 text-xs mt-3 max-w-md font-mono break-all">
            Debug: {profileDebug}
          </p>
          <a
            href="/admin/login"
            className="inline-block mt-4 text-orange underline underline-offset-4"
          >
            Back to sign in
          </a>
        </div>
      </div>
    );
  }

  const roleLabel: Record<string, string> = {
    super_admin: "Super Admin",
    follow_up_coordinator: "Follow-up Coordinator",
    viewer: "Viewer",
  };

  return (
    <div className="min-h-dvh flex flex-col md:flex-row bg-cream">
      <aside className="md:w-60 shrink-0 bg-forest text-cream px-5 py-6 flex flex-col">
        <p className="text-xs tracking-wide text-gold">CMFI Cameroon Evangelism Follow-up</p>
        <p className="font-display text-lg mt-1">Admin Portal</p>

        <nav className="mt-8 space-y-1 flex-1">
          <NavLink href="/admin" label="Dashboard" />
          <NavLink href="/admin/records" label="Records" />
          <NavLink href="/admin/stats" label="Stats" comingSoon />
          {admin.role === "super_admin" && (
            <NavLink href="/admin/users" label="Admin users" />
          )}
        </nav>

        <div className="pt-5 border-t border-cream/15 text-sm">
          <p className="text-cream/90">{admin.fullName ?? admin.email}</p>
          <p className="text-cream/50 text-xs mt-0.5">{roleLabel[admin.role]}</p>
          <div className="mt-3">
            <SignOutButton />
          </div>
        </div>
      </aside>

      <main className="flex-1 px-6 py-8 md:px-10">{children}</main>
    </div>
  );
}

function NavLink({
  href,
  label,
  comingSoon,
}: {
  href: string;
  label: string;
  comingSoon?: boolean;
}) {
  return (
    <a
      href={comingSoon ? undefined : href}
      className={`block rounded-lg px-3 py-2 text-[14px] ${
        comingSoon
          ? "text-cream/35 cursor-default"
          : "text-cream/90 hover:bg-cream/10"
      }`}
    >
      {label}
      {comingSoon && <span className="text-[11px] ml-1.5">(coming soon)</span>}
    </a>
  );
}
