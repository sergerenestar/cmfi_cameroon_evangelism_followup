import { requireAdmin } from "@/lib/require-admin";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export default async function AdminHome() {
  const admin = await requireAdmin();
  const supabase = getSupabaseServerClient();

  const { count } = await supabase
    .from("new_converts")
    .select("*", { count: "exact", head: true });

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl text-forest">
        Welcome{admin?.fullName ? `, ${admin.fullName}` : ""}.
      </h1>
      <p className="text-forest/60 text-[15px] mt-1">
        You're signed in as {admin?.email}.
      </p>

      <div className="mt-8 rounded-lg border border-forest/10 bg-white px-6 py-5 inline-block">
        <p className="text-3xl font-display text-forest">{count ?? "—"}</p>
        <p className="text-forest/60 text-sm mt-1">Records submitted so far</p>
      </div>

      <p className="text-forest/50 text-sm mt-8">
        The full records list, filtering, stats charts, and SMS/email
        outreach actions are coming in the next phases of the admin
        portal.
      </p>
    </div>
  );
}
