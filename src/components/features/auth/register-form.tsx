"use client";
import Link from "next/link";
import { useState } from "react";
import { useHydrated } from "./use-hydrated";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoginFrame } from "./login-frame";
import { PasswordInput } from "./password-input";
import { registerAccount } from "@/lib/api/auth";
import {
  registrationFormSchema,
  type RegistrationFormInput,
} from "@/lib/types/auth";
import { safeReturnTo } from "@/lib/auth/redirect";
export function RegisterForm({
  returnTo,
  demo,
}: {
  returnTo: string | null;
  demo: boolean;
}) {
  const router = useRouter();
  const hydrated = useHydrated();
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegistrationFormInput>({
    resolver: zodResolver(registrationFormSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });
  const loginURL =
    "/login" +
    (returnTo ? "?returnTo=" + encodeURIComponent(safeReturnTo(returnTo)) : "");
  const submit = handleSubmit(async (data) => {
    setError("");
    try {
      await registerAccount({
        name: data.name,
        email: data.email,
        password: data.password,
      });
      router.replace(
        "/login?reason=registered" +
          (returnTo
            ? "&returnTo=" + encodeURIComponent(safeReturnTo(returnTo))
            : ""),
      );
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to create your account. Please retry.",
      );
    }
  });
  return (
    <LoginFrame mode="register">
      <form className="mt-8 space-y-5" onSubmit={submit} noValidate>
        {error && (
          <div
            role="alert"
            id="register-error"
            className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
          >
            {error}
          </div>
        )}
        <div>
          <label
            htmlFor="register-name"
            className="mb-2 block text-sm font-medium"
          >
            Full name
          </label>
          <Input
            id="register-name"
            autoComplete="name"
            {...register("name")}
            disabled={!hydrated || isSubmitting}
            aria-invalid={!!errors.name}
            aria-describedby={
              errors.name ? "name-error" : error ? "register-error" : undefined
            }
          />
          {errors.name && (
            <p
              role="alert"
              id="name-error"
              className="mt-2 text-sm text-destructive"
            >
              {errors.name.message}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="register-email"
            className="mb-2 block text-sm font-medium"
          >
            Work email
          </label>
          <Input
            id="register-email"
            type="email"
            autoComplete="username"
            placeholder="you@example.com"
            {...register("email")}
            disabled={!hydrated || isSubmitting}
            aria-invalid={!!errors.email}
            aria-describedby={
              errors.email
                ? "email-error"
                : error
                  ? "register-error"
                  : undefined
            }
          />
          {errors.email && (
            <p
              role="alert"
              id="email-error"
              className="mt-2 text-sm text-destructive"
            >
              {errors.email.message}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="register-password"
            className="mb-2 block text-sm font-medium"
          >
            Password
          </label>
          <PasswordInput
            id="register-password"
            autoComplete="new-password"
            {...register("password")}
            disabled={!hydrated || isSubmitting}
            aria-invalid={!!errors.password}
            aria-describedby={
              errors.password ? "password-error password-help" : "password-help"
            }
          />
          <p id="password-help" className="mt-2 text-xs text-muted-foreground">
            Use at least 8 characters.
          </p>
          {errors.password && (
            <p
              role="alert"
              id="password-error"
              className="mt-2 text-sm text-destructive"
            >
              {errors.password.message}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="register-confirm"
            className="mb-2 block text-sm font-medium"
          >
            Confirm password
          </label>
          <PasswordInput
            id="register-confirm"
            autoComplete="new-password"
            {...register("confirmPassword")}
            disabled={!hydrated || isSubmitting}
            aria-invalid={!!errors.confirmPassword}
            aria-describedby={
              errors.confirmPassword ? "confirm-error" : undefined
            }
          />
          {errors.confirmPassword && (
            <p
              role="alert"
              id="confirm-error"
              className="mt-2 text-sm text-destructive"
            >
              {errors.confirmPassword.message}
            </p>
          )}
        </div>
        <Button
          type="submit"
          className="w-full"
          disabled={!hydrated || isSubmitting}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? "Creating account…" : "Create account"}
        </Button>
        {isSubmitting && (
          <p role="status" className="text-sm text-muted-foreground">
            Creating your account…
          </p>
        )}
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            aria-disabled={!hydrated}
            tabIndex={hydrated ? undefined : -1}
            href={loginURL}
            className="font-medium text-primary underline"
          >
            Sign in
          </Link>
        </p>
      </form>
      {demo && (
        <p className="mt-6 rounded-xl border bg-muted p-4 text-xs leading-6 text-muted-foreground">
          Demo registration: use test credentials. Accounts are saved locally
          and receive the employee role.
        </p>
      )}
    </LoginFrame>
  );
}
