"use client";
import { Button } from "@/components/ui/button";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div role="alert">
      <h1 className="text-xl font-semibold">Something went wrong</h1>
      <p className="my-4 text-muted-foreground">
        Please try loading the workspace again.
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
