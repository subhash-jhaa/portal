import { AppShell } from "@/components/layout/app-shell";
import { MockProvider } from "@/components/providers/mock-provider";
export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell>
      <MockProvider>{children}</MockProvider>
    </AppShell>
  );
}
