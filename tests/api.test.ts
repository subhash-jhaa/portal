import { describe, it, expect } from "vitest";
import { setupMockBackend } from "./helpers/mock-backend";
import { http, HttpResponse } from "msw";
import { apiRequest } from "../src/lib/api/client";
import { employeeSchema } from "../src/lib/types/employee";
import {
  getEmployeeProfile,
  updateEmployeeContact,
} from "../src/lib/api/employee";
import { getColleague } from "../src/lib/api/directory";
const server = setupMockBackend();
describe("typed API boundary", () => {
  it("receives contract validation errors for malformed contact requests", async () => {
    await expect(
      apiRequest("/employee/profile", employeeSchema, {
        method: "PATCH",
        body: { email: "invalid", phone: "invalid" },
      }),
    ).rejects.toMatchObject({ status: 422, code: "VALIDATION_ERROR" });
  });
  it("preserves caller cancellation", async () => {
    const controller = new AbortController();
    controller.abort();
    await expect(getEmployeeProfile(controller.signal)).rejects.toMatchObject({
      name: "AbortError",
    });
  });
  it("reads contract-shaped data and persists an own-profile update", async () => {
    const before = await getEmployeeProfile();
    const updated = await updateEmployeeContact({
      email: "contact@example.com",
      phone: "+91 90000 07777",
    });
    expect(updated.id).toBe(before.id);
    expect(await getEmployeeProfile()).toEqual(updated);
  });
  it("exposes contract errors with status and code", async () => {
    await expect(getColleague("missing")).rejects.toMatchObject({
      status: 404,
      code: "NOT_FOUND",
    });
  });
  it("rejects malformed success responses", async () => {
    server.use(
      http.get("http://localhost:3000/api/employee/profile", () =>
        HttpResponse.json({ id: 7 }),
      ),
    );
    await expect(getEmployeeProfile()).rejects.toMatchObject({
      code: "INVALID_RESPONSE",
    });
  });
  it("normalizes network failures", async () => {
    server.use(
      http.get("http://localhost:3000/api/employee/profile", () =>
        HttpResponse.error(),
      ),
    );
    await expect(getEmployeeProfile()).rejects.toMatchObject({
      code: "NETWORK_ERROR",
      status: 0,
    });
  });
});
