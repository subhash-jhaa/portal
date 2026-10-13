import { apiRequest } from "./client";
import {
  colleagueSchema,
  directorySchema,
  type DirectoryParams,
} from "@/lib/types/directory";
import type { MockScenario } from "./employee";
export function getDirectory(
  params: DirectoryParams,
  signal?: AbortSignal,
  scenario: MockScenario = "normal",
) {
  const query = new URLSearchParams({
    q: params.q,
    department: params.department,
    page: String(params.page),
  });
  if (scenario !== "normal") query.set("demoState", scenario);
  return apiRequest("/employee/directory?" + query, directorySchema, {
    signal,
  });
}
export function getColleague(id: string, signal?: AbortSignal) {
  return apiRequest(
    "/employee/directory/" + encodeURIComponent(id),
    colleagueSchema,
    { signal },
  );
}
