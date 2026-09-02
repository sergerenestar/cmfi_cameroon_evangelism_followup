import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/require-admin";
import RecordDetailClient from "./detail-client";

export default async function RecordDetailPage({ params }: { params: { id: string } }) {
  const admin = await requireAdmin(["super_admin", "follow_up_coordinator", "viewer"]);
  if (!admin) {
    redirect("/admin/login");
  }
  return <RecordDetailClient id={params.id} canEdit={admin.role !== "viewer"} />;
}
