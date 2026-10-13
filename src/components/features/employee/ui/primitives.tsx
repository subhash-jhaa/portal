import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CircleAlert, FileText, Sparkles } from "lucide-react";
import type { DisplayState } from "@/lib/design/types";
export function Brand() {
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground">
        <Sparkles className="size-5" aria-hidden="true" />
      </span>
      <div>
        <p className="font-semibold tracking-tight">growmer</p>
        <p className="text-xs text-muted-foreground">People portal</p>
      </div>
    </div>
  );
}
export function Panel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={"border shadow-none ring-0 " + className}>
      <CardContent className="space-y-5 px-6">{children}</CardContent>
    </Card>
  );
}
export function Heading({
  eyebrow,
  title,
  copy,
}: {
  eyebrow: string;
  title: string;
  copy: string;
}) {
  return (
    <div className="mb-8">
      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">
        {eyebrow}
      </p>
      <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
        {copy}
      </p>
    </div>
  );
}
export function DataState({
  state,
  title,
  empty,
  onRetry,
  retryLabel = "Retry preview",
}: {
  state: DisplayState;
  title: string;
  empty: string;
  onRetry: () => void;
  retryLabel?: string;
}) {
  if (state === "loading")
    return (
      <div role="status" aria-label={"Loading " + title} className="space-y-6">
        {title === "profile" ? (
          <div className="grid gap-6 lg:grid-cols-[.65fr_1.35fr]">
            <Skeleton className="h-96" />
            <div className="space-y-5">
              <Skeleton className="h-10 w-2/3" />
              <Skeleton className="h-64" />
              <Skeleton className="h-20" />
            </div>
          </div>
        ) : title === "payslip" ? (
          <div className="space-y-6">
            <Skeleton className="h-24" />
            <div className="grid gap-6 md:grid-cols-2">
              <Skeleton className="h-48" />
              <Skeleton className="h-48" />
            </div>
            <Skeleton className="h-20" />
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-3">
              {[1, 2, 3].map((n) => (
                <Skeleton key={n} className="h-32" />
              ))}
            </div>
            <div className="grid gap-6 lg:grid-cols-[1.4fr_.8fr]">
              <Skeleton className="h-64" />
              <Skeleton className="h-64" />
            </div>
          </>
        )}
        <p className="text-sm text-muted-foreground">
          Loading {title.toLowerCase()}…
        </p>
      </div>
    );

  return (
    <Panel className="min-h-80">
      <div
        className="flex flex-col items-center py-10 text-center"
        role={state === "error" ? "alert" : "status"}
      >
        {state === "error" ? (
          <CircleAlert className="size-9 text-destructive" aria-hidden="true" />
        ) : (
          <FileText
            className="size-9 text-muted-foreground"
            aria-hidden="true"
          />
        )}
        <h2 className="mt-5 text-xl font-semibold">
          {state === "error" ? "Unable to load " + title.toLowerCase() : empty}
        </h2>
        <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
          {state === "error"
            ? "Your information is unavailable right now. Retry the preview or contact HR if the problem continues."
            : "Contact your HR team if you expected information here. Missing records are not shown as zero values."}
        </p>
        {state === "error" && (
          <Button className="mt-5" variant="outline" onClick={onRetry}>
            {retryLabel}
          </Button>
        )}
      </div>
    </Panel>
  );
}
