"use client";
import Link from "next/link";
import { useState } from "react";
import { useHydrated } from "./use-hydrated";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoginFrame } from "@/components/features/auth/login-frame";
import { PasswordInput } from "@/components/features/auth/password-input";
import { Input } from "@/components/ui/input";
import { loginSchema, type LoginInput } from "@/lib/types/auth";
import { login } from "@/lib/api/auth";
import { safeReturnTo } from "@/lib/auth/redirect";
export function LoginForm({
  returnTo,
  reason,
  demo,
}: {
  returnTo: string | null;
  reason: string | null;
  demo: boolean;
}) {
  const router = useRouter();
  const hydrated = useHydrated();
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });
  const submit = handleSubmit(async (input) => {
    setError("");
    try {
      await login(input);
      router.replace(safeReturnTo(returnTo));
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to sign in. Please retry.",
      );
    }
  });
  return (
    <LoginFrame>
      {reason === "session-expired" && (
        <p
          role="status"
          className="mt-5 rounded-xl border bg-accent p-4 text-sm text-accent-foreground"
        >
          Your session has ended. Please sign in again to continue.
        </p>
      )}
      {reason === "registered" && (
        <p
          role="status"
          className="mt-5 rounded-xl border bg-accent p-4 text-sm text-accent-foreground"
        >
          Account created successfully. Sign in with your email and password.
        </p>
      )}
      {reason === "logged-out" && (
        <p role="status" className="mt-5 text-sm text-muted-foreground">
          You have signed out successfully.
        </p>
      )}
      <form className="mt-8 space-y-5" onSubmit={submit} noValidate>
        {error && (
          <div
            role="alert"
            id="login-error"
            className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
          >
            {error}
          </div>
        )}
        <div>
          <label className="mb-2 block text-sm font-medium" htmlFor="email">
            Work email
          </label>
          <Input
            id="email"
            type="email"
            autoComplete="username"
            placeholder="you@example.com"
            {...register("email")}
            disabled={!hydrated || isSubmitting}
            aria-invalid={!!errors.email}
            aria-describedby={
              errors.email ? "email-error" : error ? "login-error" : undefined
            }
          />
          {errors.email && (
            <p
              id="email-error"
              role="alert"
              className="mt-2 text-sm text-destructive"
            >
              {errors.email.message}
            </p>
          )}
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium" htmlFor="password">
            Password
          </label>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            {...register("password")}
            disabled={!hydrated || isSubmitting}
            aria-invalid={!!errors.password}
            aria-describedby={
              errors.password
                ? "password-error"
                : error
                  ? "login-error"
                  : undefined
            }
          />
          {errors.password && (
            <p
              id="password-error"
              role="alert"
              className="mt-2 text-sm text-destructive"
            >
              {errors.password.message}
            </p>
          )}
        </div>
        <Button
          type="submit"
          className="w-full"
          disabled={!hydrated || isSubmitting}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? "Signing in…" : "Sign in"}
          {!isSubmitting && (
            <ArrowRight className="size-4" aria-hidden="true" />
          )}
        </Button>
        {isSubmitting && (
          <p role="status" className="text-sm text-muted-foreground">
            Checking your details…
          </p>
        )}
        <p className="text-center text-xs leading-5 text-muted-foreground">
          Sessions last up to 30 minutes in the demo. Sign in again when your
          session ends.
        </p>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        New to Growmer?{" "}
        <Link
          aria-disabled={!hydrated}
          tabIndex={hydrated ? undefined : -1}
          href={
            "/register" +
            (returnTo
              ? "?returnTo=" + encodeURIComponent(safeReturnTo(returnTo))
              : "")
          }
          className="font-medium text-primary underline"
        >
          Create an account
        </Link>
      </p>
      {demo && (
        <details className="mt-6 rounded-xl border bg-muted p-4 text-xs leading-6">
          <summary className="cursor-pointer font-medium">
            Demo accounts
          </summary>
          <p className="mt-3">
            Employee: aarav.mehta@example.com / Employee123!
          </p>
          <p>Admin: neha.kapoor@example.com / Admin123!</p>
          <p className="mt-2 text-muted-foreground">
            Mock backend only. Use these fake credentials.
          </p>
        </details>
      )}
    </LoginFrame>
  );
}
