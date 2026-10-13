"use client";
import { useEffect, useState } from "react";
import { config } from "@/lib/config";
export function MockProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  useEffect(() => {
    let mounted = true;
    async function initialize() {
      if (config.mocksEnabled)
        await (await import("@/mocks/browser")).startMocks();
    }
    initialize()
      .then(() => {
        if (mounted) setState("ready");
      })
      .catch((error) => {
        console.error("Mock initialization failed", error);
        if (mounted) setState("error");
      });
    return () => {
      mounted = false;
    };
  }, []);
  if (state === "error")
    return (
      <div role="alert" className="rounded-xl border p-8">
        Unable to initialize the mock API. Check the console and reload.
      </div>
    );
  if (state === "loading")
    return (
      <p role="status" className="p-8 text-muted-foreground">
        Preparing your workspace…
      </p>
    );
  return children;
}
