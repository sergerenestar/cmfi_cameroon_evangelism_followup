import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(["super_admin", "follow_up_coordinator", "viewer"]);
  if (!admin) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const supabase = getSupabaseServerClient();

  const { data: record, error: recordError } = await supabase
    .from("new_converts")
    .select("*")
    .eq("id", params.id)
    .single();

  if (recordError || !record) {
    return NextResponse.json({ error: "Record not found." }, { status: 404 });
  }

  const { data: contactLog } = await supabase
    .from("contact_log")
    .select("id, created_at, channel, provider, message, status, error")
    .eq("convert_id", params.id)
    .order("created_at", { ascending: false });

  return NextResponse.json({ record, contactLog: contactLog ?? [] });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  // Viewers can look, but not touch assignments.
  const admin = await requireAdmin(["super_admin", "follow_up_coordinator"]);
  if (!admin) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const VALID_CONTACT_MODES = ["call", "home_visit", "whatsapp"];

  const update: Record<string, string | null> = {};
  if ("contactMode" in body) {
    const mode = body.contactMode ? String(body.contactMode) : null;
    if (mode && !VALID_CONTACT_MODES.includes(mode)) {
      return NextResponse.json({ error: "Invalid contact mode." }, { status: 400 });
    }
    update.contact_mode = mode;
  }
  if ("assignedChurch" in body) {
    update.assigned_church = body.assignedChurch ? String(body.assignedChurch).trim() : null;
  }
  if ("assignedDiscipleMaker" in body) {
    update.assigned_disciple_maker = body.assignedDiscipleMaker
      ? String(body.assignedDiscipleMaker).trim()
      : null;
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("new_converts").update(update).eq("id", params.id);

  if (error) {
    return NextResponse.json({ error: "Could not save changes." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
