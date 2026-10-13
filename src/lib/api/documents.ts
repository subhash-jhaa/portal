import { apiRequest } from "./client";
import { documentsSchema } from "@/lib/types/document";
import type { MockScenario } from "./employee";
export function getEmployeeDocuments(
  signal?: AbortSignal,
  scenario: MockScenario = "normal",
) {
  return apiRequest(
    "/employee/documents" +
      (scenario === "normal" ? "" : "?demoState=" + scenario),
    documentsSchema,
    { signal },
  );
}
