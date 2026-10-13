"use client";
import { useState, useSyncExternalStore } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCurrentUser } from "@/components/providers/auth-provider";
import { config } from "@/lib/config";
import type { MockScenario } from "@/lib/api/employee";
const subscribe = (callback: () => void) => {
  window.addEventListener("popstate", callback);
  return () => window.removeEventListener("popstate", callback);
};
const snapshot = () => window.location.search;
export function useResource<T>(
  loader: (signal: AbortSignal, scenario: MockScenario) => Promise<T>,
  name: string,
) {
  const { user } = useCurrentUser();
  const client = useQueryClient();
  const [reviewComplete, setReviewComplete] = useState(false);
  const search = useSyncExternalStore(subscribe, snapshot, () => null);
  const requested =
    config.mocksEnabled && !reviewComplete
      ? new URLSearchParams(search || "").get("demoState")
      : null;
  const scenario: MockScenario = [
    "loading",
    "empty",
    "error",
    "expired",
  ].includes(requested || "")
    ? (requested as MockScenario)
    : "normal";
  const queryKey = ["employee", user.id, name, scenario];
  const query = useQuery({
    queryKey,
    enabled: search !== null,
    queryFn: ({ signal }) => loader(signal, scenario),
  });
  return {
    data: query.data,
    loading: query.isPending,
    error: query.error?.message || "",
    setData: (value: T) => client.setQueryData(queryKey, value),
    retry: () => {
      if (scenario !== "normal") setReviewComplete(true);
      else void query.refetch();
    },
  };
}
