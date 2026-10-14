import { apiRequest } from "./client";
import type { MockScenario } from "./employee";
import { workforceOverviewSchema } from "@/lib/types/admin";

export const getWorkforceOverview = (
  signal?: AbortSignal,
  scenario: MockScenario = "normal",
) =>
  apiRequest(
    "/admin/overview" + (scenario === "normal" ? "" : "?demoState=" + scenario),
    workforceOverviewSchema,
    { signal },
  );
