import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/require-admin";
import RecordsListClient from "./records-list-client";

export default async function RecordsPage() {
  const admin = await requireAdmin(["super_admin", "follow_up_coordinator", "viewer"]);
  if (!admin) {
    redirect("/admin/login");
  }
  return <RecordsListClient />;
}
