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
    <QueryProvider key={session.user.id + ":" + session.user.role}>
      <AuthProvider
        key={session.user.id + ":" + session.user.role}
        user={session.user}
      >
        <AppShell>{children}</AppShell>
      </AuthProvider>
    </QueryProvider>
  );
}
