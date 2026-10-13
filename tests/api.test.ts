import { describe, it, expect } from "vitest";
import { setupMockBackend } from "./helpers/mock-backend";
import { http, HttpResponse } from "msw";
import { apiRequest } from "../src/lib/api/client";
import { projectSchema } from "../src/lib/types/project";
import {
  getProjects,
  getProject,
  createProject,
} from "../src/lib/api/projects";
const server = setupMockBackend();
describe("typed API boundary", () => {
  it("receives contract validation errors for malformed create requests", async () => {
    await expect(
      apiRequest("/projects", projectSchema, {
        method: "POST",
        body: { name: "x" },
      }),
    ).rejects.toMatchObject({ status: 422, code: "VALIDATION_ERROR" });
  });
  it("preserves caller cancellation", async () => {
    const controller = new AbortController();
    controller.abort();
    await expect(getProjects(controller.signal)).rejects.toMatchObject({
      name: "AbortError",
    });
  });
  it("reads contract-shaped data and persists a created mock project", async () => {
    const before = await getProjects();
    const created = await createProject({
      name: "New initiative",
      owner: "Platform",
      description: "Test project",
    });
    expect(created.status).toBe("planning");
    expect((await getProject(created.id)).name).toBe("New initiative");
    expect((await getProjects()).total).toBe(before.total + 1);
  });
  it("exposes contract errors with status and code", async () => {
    await expect(getProject("missing")).rejects.toMatchObject({
      status: 404,
      code: "NOT_FOUND",
    });
  });
  it("rejects malformed success responses", async () => {
    server.use(
      http.get("http://localhost:3000/api/projects", () =>
        HttpResponse.json({ items: [{ id: 7 }], total: 1 }),
      ),
    );
    await expect(getProjects()).rejects.toMatchObject({
      code: "INVALID_RESPONSE",
    });
  });
  it("normalizes network failures", async () => {
    server.use(
      http.get("http://localhost:3000/api/projects", () =>
        HttpResponse.error(),
      ),
    );
    await expect(getProjects()).rejects.toMatchObject({
      code: "NETWORK_ERROR",
      status: 0,
    });
  });
});
