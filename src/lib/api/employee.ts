import { apiRequest } from "./client";
import {
  employeeSchema,
  dashboardSchema,
  payslipResponseSchema,
  contactInputSchema,
  type ContactInput,
} from "@/lib/types/employee";
export type MockScenario = "normal" | "loading" | "empty" | "error" | "expired";
const scenarioQuery = (scenario: MockScenario) =>
  scenario === "normal" ? "" : "?demoState=" + scenario;
export const getEmployeeProfile = (
  signal?: AbortSignal,
  scenario: MockScenario = "normal",
) =>
  apiRequest("/employee/profile" + scenarioQuery(scenario), employeeSchema, {
    signal,
  });
export const getEmployeeDashboard = (
  signal?: AbortSignal,
  scenario: MockScenario = "normal",
) =>
  apiRequest("/employee/dashboard" + scenarioQuery(scenario), dashboardSchema, {
    signal,
  });
export const getEmployeePayslip = (
  period: string,
  signal?: AbortSignal,
  scenario: MockScenario = "normal",
) =>
  apiRequest(
    "/employee/payslip?period=" +
      encodeURIComponent(period) +
      (scenario === "normal" ? "" : "&demoState=" + scenario),
    payslipResponseSchema,
    { signal },
  );
export const updateEmployeeContact = (input: ContactInput) =>
  apiRequest("/employee/profile", employeeSchema, {
    method: "PATCH",
    body: contactInputSchema.parse(input),
  });
