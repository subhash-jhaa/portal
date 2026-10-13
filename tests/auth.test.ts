import { beforeAll, afterAll, afterEach, it, expect } from "vitest";
import { setupServer } from "msw/node";
import { SignJWT } from "jose";
import {
  authBackendHandlers,
  resetAuthMocks,
} from "@/mocks/handlers/auth-backend";
import { mockSigningKey, verifyAccessToken } from "@/lib/auth/token";
import { safeReturnTo } from "@/lib/auth/redirect";
import { NextRequest } from "next/server";
import { proxy } from "@/proxy";
import { backendRequest } from "@/lib/api/backend";
import { cookieOptions, checkMutationOrigin } from "@/lib/auth/http";
import { loginSchema } from "@/lib/types/auth";
const server = setupServer(...authBackendHandlers);
const base = "http://growmer.mock.internal/api";
beforeAll(() => {
  server.listen({ onUnhandledFrame: "error" });
  (
    globalThis as typeof globalThis & { growmerMockServer?: typeof server }
  ).growmerMockServer = server;
});
afterEach(() => {
  server.resetHandlers();
  resetAuthMocks();
});
afterAll(() => {
  server.close();
  delete (
    globalThis as typeof globalThis & { growmerMockServer?: typeof server }
  ).growmerMockServer;
});
async function sign(
  extra: Record<string, unknown> = {},
  expiration = Math.floor(Date.now() / 1000) + 600,
  issuer = "growmer-mock",
) {
  return new SignJWT({
    name: "Aarav Mehta",
    email: "aarav.mehta@example.com",
    role: "employee",
    ...extra,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject("GR-1042")
    .setIssuer(issuer)
    .setAudience("growmer-portal")
    .setIssuedAt()
    .setJti("test-token")
    .setExpirationTime(expiration)
    .sign(mockSigningKey());
}
it("validates credentials without modifying passwords", () => {
  expect(
    loginSchema.parse({
      email: " AARAV.MEHTA@example.com ",
      password: " Employee123! ",
    }),
  ).toEqual({ email: "aarav.mehta@example.com", password: " Employee123! " });
  expect(loginSchema.safeParse({ email: "bad", password: "" }).success).toBe(
    false,
  );
});
it("rejects expired, tampered, wrong-issuer, and unsupported-role tokens", async () => {
  expect((await verifyAccessToken(await sign()))?.user.role).toBe("employee");
  expect(await verifyAccessToken(await sign({}, 1))).toBeNull();
  const segments = (await sign()).split(".");
  segments[2] = (segments[2][0] === "A" ? "B" : "A") + segments[2].slice(1);
  expect(await verifyAccessToken(segments.join("."))).toBeNull();
  expect(
    await verifyAccessToken(await sign({}, undefined, "another-service")),
  ).toBeNull();
  expect(await verifyAccessToken(await sign({ role: "superuser" }))).toBeNull();
  expect(await verifyAccessToken(undefined)).toBeNull();
});
it("only allows return redirects to known portal paths", () => {
  for (const url of [
    "https://evil.example",
    "//evil.example",
    "/login",
    "/dashboard/../../login",
    "/dashboard\\evil",
  ])
    expect(safeReturnTo(url)).toBe("/dashboard");
  expect(safeReturnTo("/payslip?period=September")).toBe(
    "/payslip?period=September",
  );
});
it("authenticates both roles and rejects bad credentials", async () => {
  for (const [email, password, role] of [
    ["aarav.mehta@example.com", "Employee123!", "employee"],
    ["neha.kapoor@example.com", "Admin123!", "admin"],
  ]) {
    const response = await fetch(base + "/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    expect(response.status).toBe(200);
    const token = (await response.json()).access_token;
    expect((await verifyAccessToken(token))?.user.role).toBe(role);
    const me = await fetch(base + "/auth/me", {
      headers: { Authorization: "Bearer " + token },
    });
    expect((await me.json()).user.role).toBe(role);
  }
  const bad = await fetch(base + "/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: "aarav.mehta@example.com",
      password: "wrong",
    }),
  });
  expect(bad.status).toBe(401);
});
it("keeps employee/admin profile edits separate and revokes mocked logout tokens", async () => {
  const token = await sign();
  const headers = { Authorization: "Bearer " + token };
  expect((await fetch(base + "/employee/profile")).status).toBe(401);
  const adminLogin = await backendRequest("/auth/login", {
    method: "POST",
    body: { email: "neha.kapoor@example.com", password: "Admin123!" },
  });
  const admin = (await adminLogin.json()).access_token;
  // Role is not a profile lookup key: verified subject identifies the employee.
  await fetch(base + "/employee/profile", {
    method: "PATCH",
    headers,
    body: JSON.stringify({ email: "edited@example.com", phone: "9000012345" }),
  });
  expect(
    (await (await fetch(base + "/employee/profile", { headers })).json()).email,
  ).toBe("edited@example.com");
  expect((await verifyAccessToken(admin))?.user.id).toBe("GR-1001");
  const adminProfile = await backendRequest("/employee/profile", {
    token: admin,
  });
  expect((await adminProfile.json()).email).toBe("neha.kapoor@example.com");
  await fetch(base + "/auth/logout", { method: "POST", headers });
  expect((await fetch(base + "/auth/me", { headers })).status).toBe(401);
});

it("server transport preserves backend 401 responses instead of hiding them as network errors", async () => {
  const response = await backendRequest("/auth/login", {
    method: "POST",
    body: { email: "aarav.mehta@example.com", password: "wrong" },
  });
  expect(response.status).toBe(401);
  expect((await response.json()).error.code).toBe("INVALID_CREDENTIALS");
});
it("redirects genuinely signed but expired cookies before protected pages render", async () => {
  const expired = await sign({}, 1);
  const request = new NextRequest("http://localhost:3000/profile", {
    headers: { Cookie: "growmer_session=" + expired },
  });
  const response = await proxy(request);
  expect(response.status).toBe(307);
  expect(response.headers.get("location")).toContain(
    "/login?returnTo=%2Fprofile&reason=session-expired",
  );
  expect(response.cookies.get("growmer_session")?.value).toBe("");
});
it("defaults cookies to Secure/httpOnly and rejects missing or cross-site origins", () => {
  expect(cookieOptions()).toMatchObject({
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
  });
  const request = (origin?: string) =>
    new NextRequest("http://0.0.0.0:3000/api/auth/login", {
      method: "POST",
      headers: {
        Host: "localhost:3006",
        "Content-Type": "application/json",
        ...(origin ? { Origin: origin } : {}),
      },
    });
  expect(checkMutationOrigin(request())?.status).toBe(403);
  expect(checkMutationOrigin(request("http://evil.example"))?.status).toBe(403);
  expect(checkMutationOrigin(request("http://localhost:3006"))).toBeNull();
});
