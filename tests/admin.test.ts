import { it, expect } from "vitest";
import { NextRequest } from "next/server";
import { setupMockBackend } from "./helpers/mock-backend";
import { backendRequest } from "../src/lib/api/backend";
import { workforceOverviewSchema } from "../src/lib/types/admin";
import { GET } from "../src/app/api/[...path]/route";
setupMockBackend();

async function login(role: "employee" | "admin") {
  const response = await backendRequest("/auth/login", {
    method: "POST",
    body:
      role === "admin"
        ? { email: "neha.kapoor@example.com", password: "Admin123!" }
        : { email: "aarav.mehta@example.com", password: "Employee123!" },
  });
  return (await response.json()).access_token as string;
}

it("requires an admin at both the BFF and backend, including with a forged role hint", async () => {
  const context = { params: Promise.resolve({ path: ["admin", "overview"] }) };
  for (const role of [null, "employee", "admin"] as const) {
    const token = role ? await login(role) : undefined;
    const request = new NextRequest(
      "http://localhost:3000/api/admin/overview?role=admin",
      {
        headers: token
          ? { Cookie: "growmer_session=" + token, "X-Role": "admin" }
          : {},
      },
    );
    const expected = role === "admin" ? 200 : role ? 403 : 401;
    expect((await GET(request, context)).status).toBe(expected);
    expect(
      (await backendRequest("/admin/overview?role=admin", { token })).status,
    ).toBe(expected);
  }
});

it("builds admin totals from the same full directory and omits private profile fields", async () => {
  const token = await login("admin");
  const payload = await (
    await backendRequest("/admin/overview", { token })
  ).json();
  const data = workforceOverviewSchema.parse(payload);
  const directory = await (
    await backendRequest("/employee/directory", { token })
  ).json();
  expect(data.totalEmployees).toBe(directory.total);
  expect(data.totalEmployees).toBeGreaterThanOrEqual(42);
  expect(
    data.departments.reduce((total, item) => total + item.count, 0) +
      data.unassignedEmployees,
  ).toBe(data.totalEmployees);
  expect(data.recentJoiners.length).toBeGreaterThan(0);
  for (const person of payload.recentJoiners) {
    expect(person).not.toHaveProperty("accountEnd");
    expect(person).not.toHaveProperty("emergencyContact");
  }
  const empty = await backendRequest("/admin/overview?demoState=empty", {
    token,
  });
  expect(await empty.json()).toEqual({
    totalEmployees: 0,
    unassignedEmployees: 0,
    departments: [],
    recentJoiners: [],
  });
  expect(
    (await backendRequest("/admin/overview?demoState=error", { token })).status,
  ).toBe(503);
  expect(
    (await backendRequest("/admin/overview?demoState=expired", { token }))
      .status,
  ).toBe(401);
});

it("rejects removed and unknown API paths before forwarding or session lookup", async () => {
  for (const route of [
    ["projects"],
    ["unknown"],
    ["employee", "unknown"],
    ["admin", "unknown"],
  ]) {
    const request = new NextRequest(
      "http://localhost:3000/api/" + route.join("/"),
    );
    const response = await GET(request, {
      params: Promise.resolve({ path: route }),
    });
    expect(response.status).toBe(404);
    expect((await response.json()).error.code).toBe("NOT_FOUND");
  }
});
