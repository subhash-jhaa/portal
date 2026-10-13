import { Sparkles } from "lucide-react";
export function LoginFrame({
  children,
  variant = "split",
  mode = "login",
}: {
  children: React.ReactNode;
  variant?: "split" | "centered";
  mode?: "login" | "register";
}) {
  return (
    <div
      className={
        "mx-auto grid overflow-hidden rounded-2xl border bg-card " +
        (variant === "split" ? "max-w-5xl lg:grid-cols-2" : "max-w-md")
      }
    >
      {variant === "split" && (
        <section className="hidden flex-col justify-between bg-primary p-10 text-primary-foreground lg:flex">
          <div>
            <Sparkles className="mb-8 size-8" aria-hidden="true" />
            <p className="text-sm font-medium">
              Employee self-service, made clear.
            </p>
            <h2 className="mt-6 text-4xl font-semibold leading-tight tracking-tight">
              Everything you need to grow at work.
            </h2>
            <p className="mt-5 text-sm leading-7">
              Your work essentials, salary details, and personal profile — all
              in one calm place.
            </p>
          </div>
          <p className="mt-12 text-xs">Growmer · People portal</p>
        </section>
      )}
      <section className="p-6 sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          {mode === "register" ? "Get started" : "Welcome back"}
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">
          {mode === "register"
            ? "Create your Growmer account"
            : "Sign in to Growmer"}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {mode === "register"
            ? "Register with your work email to access your portal."
            : "Use your work email to continue."}
        </p>
        {children}
      </section>
    </div>
  );
}
