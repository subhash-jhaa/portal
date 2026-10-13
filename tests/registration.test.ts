import { beforeAll, afterAll, it, expect } from "vitest";
import { mkdtemp, readFile, unlink, rmdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { NextRequest } from "next/server";
import { setupMockBackend } from "./helpers/mock-backend";
import { backendRequest } from "@/lib/api/backend";
import { registrationFormSchema } from "@/lib/types/auth";
import { verifyAccessToken } from "@/lib/auth/token";
import { POST as registerRoute } from "@/app/api/auth/register/route";
setupMockBackend();
let directory: string;
beforeAll(async () => {
  directory = await mkdtemp(join(tmpdir(), "growmer-registration-"));
  process.env.MOCK_AUTH_DATA_DIR = directory;
});
afterAll(async () => {
  // Only remove this test's own explicitly created file and empty directory; never recursively delete.
  await unlink(join(directory, "accounts.json")).catch(() => {});
  await rmdir(directory);
  delete process.env.MOCK_AUTH_DATA_DIR;
});
function input() {
  return {
    name: "Samira Patel",
    email: "samira-" + randomUUID() + "@example.com",
    password: "My demo passphrase 123!",
  };
}
async function register(data: ReturnType<typeof input>) {
  return backendRequest("/auth/register", { method: "POST", body: data });
}
it("validates matching confirmation and password length", () => {
  const data = input();
  expect(
    registrationFormSchema.safeParse({
      ...data,
      confirmPassword: data.password,
    }).success,
  ).toBe(true);
  expect(
    registrationFormSchema.safeParse({ ...data, confirmPassword: "different" })
      .success,
  ).toBe(false);
  expect(
    registrationFormSchema.safeParse({
      ...data,
      password: "short",
      confirmPassword: "short",
    }).success,
  ).toBe(false);
});
it("registers an employee and lets that account sign in with its own identity", async () => {
  const data = input(),
    response = await register(data);
  expect(response.status).toBe(201);
  const payload = await response.json();
  expect(payload.user).toMatchObject({
    name: data.name,
    email: data.email,
    role: "employee",
  });
  expect(Object.keys(payload)).toEqual(["user"]);
  const signedIn = await backendRequest("/auth/login", {
    method: "POST",
    body: { email: data.email, password: data.password },
  });
  expect(signedIn.status).toBe(200);
  const token = (await signedIn.json()).access_token;
  expect((await verifyAccessToken(token))?.user.id).toBe(payload.user.id);
  const profile = await (
    await backendRequest("/employee/profile", { token })
  ).json();
  expect(profile).toMatchObject({
    name: data.name,
    email: data.email,
    department: "Not assigned",
    phone: "",
  });
  expect(profile.accountEnd).toBeUndefined();
  const dashboard = await (
    await backendRequest("/employee/dashboard", { token })
  ).json();
  expect(dashboard.latestPayslip).toBeNull();
});
it("rejects duplicate emails including case and whitespace variants and demo accounts", async () => {
  const data = input();
  await register(data);
  expect(
    (await register({ ...data, email: " " + data.email.toUpperCase() + " " }))
      .status,
  ).toBe(409);
  expect(
    (await register({ ...data, email: "aarav.mehta@example.com" })).status,
  ).toBe(409);
});
it("cannot register an administrator through extra input fields", async () => {
  const response = await backendRequest("/auth/register", {
    method: "POST",
    body: { ...input(), role: "admin" },
  });
  expect(response.status).toBe(422);
});
it("stores salted password hashes without plaintext and reads accounts from persistent storage", async () => {
  const data = input();
  await register(data);
  const stored = await readFile(join(directory, "accounts.json"), "utf8");
  expect(stored.includes(data.password)).toBe(false);
  const account = JSON.parse(stored).find(
    (record: { email: string }) => record.email === data.email,
  );
  expect(account.passwordHash).toMatch(/^[a-f0-9]{128}$/);
  expect(account.salt).toMatch(/^[a-f0-9]{32}$/);
  // A fresh module instance must read the same disk-backed identity.
  const { vi } = await import("vitest");
  vi.resetModules();
  const { authenticateRegisteredAccount } = await import("@/mocks/accounts");
  expect(
    (await authenticateRegisteredAccount(data.email, data.password))?.id,
  ).toBe(account.id);
  expect(
    await authenticateRegisteredAccount(data.email, "wrong-password"),
  ).toBeNull();
});
it("serializes concurrent duplicate registration attempts", async () => {
  const data = input();
  const responses = await Promise.all([register(data), register(data)]);
  expect(responses.map((response) => response.status).sort()).toEqual([
    201, 409,
  ]);
});
it("BFF registration returns safe identity without setting a session cookie", async () => {
  const response = await registerRoute(
    new NextRequest("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: {
        Host: "localhost:3000",
        Origin: "http://localhost:3000",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input()),
    }),
  );
  expect(response.status).toBe(201);
  expect(response.headers.get("set-cookie")).toBeNull();
  const payload = await response.json();
  expect(Object.keys(payload)).toEqual(["user"]);
  expect(Object.keys(payload.user).sort()).toEqual([
    "email",
    "id",
    "name",
    "role",
  ]);
});
it("BFF registration rejects cross-origin requests and attempted role selection", async () => {
  const request = (origin: string, extra = {}) =>
    new NextRequest("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: {
        Host: "localhost:3000",
        Origin: origin,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...input(), ...extra }),
    });
  expect((await registerRoute(request("https://evil.example"))).status).toBe(
    403,
  );
  expect(
    (await registerRoute(request("http://localhost:3000", { role: "admin" })))
      .status,
  ).toBe(422);
});

it("discovers persisted registered colleagues without requiring their login or cached profile", async () => {
  const data = input();
  const response = await register(data);
  const { user } = await response.json();
  const { resetAuthMocks } = await import("@/mocks/handlers/auth-backend");
  resetAuthMocks();
  const { getColleague, getDirectory } = await import("@/lib/api/directory");
  const colleague = await getColleague(user.id);
  expect(colleague.email).toBe(data.email);
  expect(colleague).not.toHaveProperty("passwordHash");
  expect(colleague).not.toHaveProperty("emergencyContact");
  resetAuthMocks();
  const results = await getDirectory({
    q: data.email,
    department: "",
    page: 1,
  });
  expect(results.items.map((item) => item.id)).toEqual([user.id]);
  const { listRegisteredAccounts } = await import("@/mocks/accounts");
  const safe = (await listRegisteredAccounts()).find(
    (record) => record.user.id === user.id,
  )!;
  expect(Object.keys(safe).sort()).toEqual(["createdAt", "user"]);
  expect(Object.keys(safe.user).sort()).toEqual([
    "email",
    "id",
    "name",
    "role",
  ]);
});
