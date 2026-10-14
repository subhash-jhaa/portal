import { DashboardPage } from "@/components/features/employee/employee-pages";
import { AdminDashboard } from "@/components/features/admin/admin-dashboard";
import { requireSession } from "@/lib/auth/session";
import { canViewWorkforce } from "@/lib/auth/permissions";
export default async function Page() {
  const { user } = await requireSession();
  return canViewWorkforce(user) ? <AdminDashboard /> : <DashboardPage />;
}
