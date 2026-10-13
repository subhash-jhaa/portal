import { RegisterForm } from "@/components/features/auth/register-form";
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
      <RegisterForm
        returnTo={typeof params.returnTo === "string" ? params.returnTo : null}
        demo={mockAuthEnabled()}
      />
    </AuthPageShell>
  );
}
