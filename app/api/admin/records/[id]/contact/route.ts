import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { getSupabaseServerClient } from "@/lib/supabase-server";

const VALID_CHANNELS = ["call", "home_visit", "sms", "email"];

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(["super_admin", "follow_up_coordinator"]);
  if (!admin) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const channel = String(body.channel ?? "");
  const message = body.message ? String(body.message).trim() : null;

  if (!VALID_CHANNELS.includes(channel)) {
    return NextResponse.json({ error: "Please select a valid channel." }, { status: 400 });
  }

  // NOTE: this endpoint currently logs an outreach attempt (e.g. a
  // call or visit an admin made outside the system). Actually sending
  // SMS/email from here — via lib/sms and an email provider — is the
  // next phase; at that point this route will also trigger the send
  // before logging the result.
  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("contact_log").insert({
    convert_id: params.id,
    channel,
    message,
    status: "logged",
    sent_by: admin.id,
  });

  if (error) {
    return NextResponse.json({ error: "Could not log this contact." }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
