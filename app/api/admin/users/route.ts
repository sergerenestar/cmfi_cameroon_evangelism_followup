import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, type Role } from "@/lib/require-admin";
import { getSupabaseServerClient } from "@/lib/supabase-server";

const VALID_ROLES: Role[] = ["super_admin", "follow_up_coordinator", "viewer"];

export async function GET() {
  const admin = await requireAdmin(["super_admin"]);
  if (!admin) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Could not load admin users." }, { status: 500 });
  }

  return NextResponse.json({ users: data });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(["super_admin"]);
  if (!admin) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const email = String(body.email ?? "").trim();
  const password = String(body.password ?? "");
  const fullName = body.fullName ? String(body.fullName).trim() : null;
  const role = String(body.role ?? "");

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
  }
  if (!password || password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters." },
      { status: 400 }
    );
  }
  if (!VALID_ROLES.includes(role as Role)) {
    return NextResponse.json({ error: "Please select a valid role." }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();

  // Creates the auth account directly, pre-confirmed — this is an
  // admin-issued account, not public self-signup.
  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (createError || !created.user) {
    return NextResponse.json(
      { error: createError?.message ?? "Could not create the account." },
      { status: 500 }
    );
  }

  const { error: profileError } = await supabase.from("profiles").insert({
    id: created.user.id,
    email,
    full_name: fullName,
    role,
  });

  if (profileError) {
    // Roll back the orphaned auth user so retries don't collide on email.
    await supabase.auth.admin.deleteUser(created.user.id);
    return NextResponse.json({ error: "Could not save the account role." }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
