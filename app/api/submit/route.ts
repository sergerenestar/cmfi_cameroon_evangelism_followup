import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

const DECISION_TYPES = ["first_time", "rededication"] as const;

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const workerName = String(body.workerName ?? "").trim();
  const fullName = String(body.fullName ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const decisionType = String(body.decisionType ?? "").trim();

  // Minimal server-side validation — never trust the client
  if (!workerName || workerName.length < 2) {
    return NextResponse.json(
      { error: "Please enter the counselor / worker's name." },
      { status: 400 }
    );
  }
  if (!fullName || fullName.length < 2) {
    return NextResponse.json({ error: "Please enter the convert's full name." }, { status: 400 });
  }
  if (!phone || phone.length < 6) {
    return NextResponse.json({ error: "Please enter a valid phone number." }, { status: 400 });
  }
  if (!DECISION_TYPES.includes(decisionType as (typeof DECISION_TYPES)[number])) {
    return NextResponse.json({ error: "Please select the decision made today." }, { status: 400 });
  }

  const record = {
    worker_name: workerName,
    campaign_name: body.campaignName ? String(body.campaignName).trim() : null,
    campaign_location: body.campaignLocation ? String(body.campaignLocation).trim() : null,
    language: body.language === "fr" ? "fr" : "en",

    full_name: fullName,
    gender: body.gender ? String(body.gender) : null,
    age_range: body.ageRange ? String(body.ageRange) : null,
    phone,
    quartier: body.quartier ? String(body.quartier).trim() : null,
    profession: body.profession ? String(body.profession).trim() : null,

    decision_type: decisionType,
    has_bible: body.hasBible === "" || body.hasBible == null ? null : Boolean(body.hasBible === "yes"),
    attends_church:
      body.attendsChurch === "" || body.attendsChurch == null
        ? null
        : Boolean(body.attendsChurch === "yes"),
    home_church: body.homeChurch ? String(body.homeChurch).trim() : null,

    addictions: body.addictions ? String(body.addictions).trim() : null,
    prayer_healing: Boolean(body.prayerHealing),
    prayer_deliverance: Boolean(body.prayerDeliverance),
    prayer_peace: Boolean(body.prayerPeace),
    prayer_family: Boolean(body.prayerFamily),
    prayer_other: body.prayerOther ? String(body.prayerOther).trim() : null,

    wants_bible_study: Boolean(body.wantsBibleStudy),
    wants_church_referral: Boolean(body.wantsChurchReferral),
    notes: body.notes ? String(body.notes).trim() : null,

    user_agent: req.headers.get("user-agent") ?? null,
    source_ip:
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
  };

  try {
    const supabase = getSupabaseServerClient();
    const { error } = await supabase.from("new_converts").insert(record);

    if (error) {
      console.error("Supabase insert error:", error.message);
      return NextResponse.json(
        { error: "We could not save this record. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error("Submit route error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
