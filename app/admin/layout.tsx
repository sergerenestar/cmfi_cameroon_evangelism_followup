import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/require-admin";
import SignOutButton from "./sign-out-button";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();

  // Middleware already redirects unauthenticated visitors, but a
  // signed-in user with no profiles row (e.g. deleted mid-session)
  // should still be bounced rather than see a broken shell.
  if (!admin) {
    redirect("/admin/login");
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
