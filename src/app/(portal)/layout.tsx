import { QueryProvider } from "@/components/providers/query-provider";
import { AppShell } from "@/components/layout/app-shell";
import { AuthProvider } from "@/components/providers/auth-provider";
import { requireSession } from "@/lib/auth/session";
export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();
  return (
    <AuthProvider user={session.user}>
      <QueryProvider key={session.user.id}>
        <AppShell>{children}</AppShell>
      </QueryProvider>
    </AuthProvider>
  );
}
