import { LoginForm } from "@/components/features/auth/login-form";
import { AuthPageShell } from "@/components/features/auth/auth-page-shell";
import { mockAuthEnabled } from "@/lib/auth/token";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  return (
    <AuthPageShell>
      <LoginForm
        returnTo={typeof params.returnTo === "string" ? params.returnTo : null}
        reason={typeof params.reason === "string" ? params.reason : null}
        demo={mockAuthEnabled()}
      />
    </AuthPageShell>
  );
}
