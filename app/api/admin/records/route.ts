import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { getSupabaseServerClient } from "@/lib/supabase-server";

const PAGE_SIZE = 25;

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(["super_admin", "follow_up_coordinator", "viewer"]);
  if (!admin) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const url = new URL(req.url);
  const search = url.searchParams.get("search")?.trim() ?? "";
  const decisionType = url.searchParams.get("decisionType") ?? "";
  const campaignName = url.searchParams.get("campaignName") ?? "";
  const assignedStatus = url.searchParams.get("assignedStatus") ?? ""; // 'assigned' | 'unassigned'
  const page = Math.max(1, Number(url.searchParams.get("page") ?? "1"));

  const supabase = getSupabaseServerClient();
  let query = supabase
    .from("new_converts")
    .select(
      "id, created_at, full_name, phone, gender, age_range, decision_type, campaign_name, assigned_church, language",
      { count: "exact" }
    )
    .order("created_at", { ascending: false });

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,phone.ilike.%${search}%`);
  }
  if (decisionType) {
    query = query.eq("decision_type", decisionType);
  }
  if (campaignName) {
    query = query.eq("campaign_name", campaignName);
  }
  if (assignedStatus === "assigned") {
    query = query.not("assigned_church", "is", null);
  } else if (assignedStatus === "unassigned") {
    query = query.is("assigned_church", null);
  }

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: "Could not load records." }, { status: 500 });
  }

  return NextResponse.json({
    records: data,
    total: count ?? 0,
    page,
    pageSize: PAGE_SIZE,
  });
}
