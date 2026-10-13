"use client";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoginFrame } from "@/components/features/auth/login-frame";
import { PasswordInput } from "@/components/features/auth/password-input";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { employee } from "@/lib/design/fixtures";
import type { DisplayState, Option } from "@/lib/design/types";
export function LoginScreen({
  state,
  option,
  onState,
}: {
  state: DisplayState;
  option: Option;
  onState: (state: DisplayState) => void;
}) {
  const [email, setEmail] = useState(state === "empty" ? "" : employee.email);
  const [password, setPassword] = useState(
    state === "empty" ? "" : "demo-only",
  );
  const loading = state === "loading";
  return (
    <LoginFrame variant={option === "selected" ? "split" : "centered"}>
      <form
        className="mt-8 space-y-5"
        onSubmit={(event) => {
          event.preventDefault();
          toast.info(
            "Design preview only. Use the portal login page to sign in.",
          );
        }}
      >
        {state === "error" && (
          <div
            role="alert"
            id="login-error"
            className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
          >
            We couldn’t sign you in. Check your email and password, then try
            again. Your entries remain available.
          </div>
        )}
        <div>
          <label
            className="mb-2 block text-sm font-medium"
            htmlFor="demo-email"
          >
            Work email
          </label>
          <Input
            id="demo-email"
            type="email"
            autoComplete="off"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            aria-describedby={state === "error" ? "login-error" : undefined}
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label
            className="mb-2 block text-sm font-medium"
            htmlFor="demo-password"
          >
            Password
          </label>
          <PasswordInput
            id="demo-password"
            autoComplete="off"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            aria-describedby={state === "error" ? "login-error" : undefined}
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <label className="flex items-center gap-2">
            <input type="checkbox" disabled={loading} />
            Remember me
          </label>
          <button
            type="button"
            className="text-primary underline-offset-4 hover:underline"
            onClick={() => toast.info("Password recovery is a Task 3 flow.")}
          >
            Forgot password?
          </button>
        </div>
        <Button
          type="submit"
          className="w-full"
          disabled={loading}
          aria-busy={loading}
        >
          {loading ? "Signing in…" : "Sign in"}
          {!loading && <ArrowRight className="size-4" aria-hidden="true" />}
        </Button>
        {loading && (
          <p role="status" className="text-sm text-muted-foreground">
            Checking your details…
          </p>
        )}
        {state === "error" && (
          <Button
            type="button"
            variant="outline"
            onClick={() => onState("normal")}
          >
            Reset error preview
          </Button>
        )}
        <p className="text-center text-xs leading-5 text-muted-foreground">
          Design preview · Do not enter real credentials.
          <br />
          Authentication is not connected.
        </p>
      </form>
    </LoginFrame>
  );
}
