import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/require-admin";
import AdminUsersClient from "./users-client";

export default async function AdminUsersPage() {
  const admin = await requireAdmin(["super_admin"]);
  if (!admin) {
    redirect("/admin");
  }
  return <AdminUsersClient />;
}
