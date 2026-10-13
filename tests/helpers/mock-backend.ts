import { beforeAll, beforeEach, afterEach, afterAll } from "vitest";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import {
  authBackendHandlers,
  resetAuthMocks,
} from "@/mocks/handlers/auth-backend";
import { backendRequest } from "@/lib/api/backend";
import { config } from "@/lib/config";
export function setupMockBackend() {
  let token: string;
  const bridge = http.all(
    config.apiBaseUrl.replace(/\/$/, "") + "/*",
    async ({ request }) => {
      const url = new URL(request.url);
      const prefix = new URL(config.apiBaseUrl).pathname;
      const path = url.pathname.slice(prefix.length) + url.search;
      const body = ["GET", "HEAD"].includes(request.method)
        ? undefined
        : await request.json();
      const response = await backendRequest(path, {
        method: request.method,
        token,
        body,
        signal: request.signal,
      });
      return new HttpResponse(await response.text(), {
        status: response.status,
        headers: response.headers,
      });
    },
  );
  const server = setupServer(bridge, ...authBackendHandlers);
  const state = globalThis as typeof globalThis & {
    growmerMockServer?: typeof server;
  };
  beforeAll(() => {
    server.listen({ onUnhandledFrame: "error" });
    state.growmerMockServer = server;
  });
  beforeEach(async () => {
    resetAuthMocks();
    const response = await backendRequest("/auth/login", {
      method: "POST",
      body: { email: "aarav.mehta@example.com", password: "Employee123!" },
    });
    if (!response.ok)
      throw new Error("Unable to authenticate the unit-test fixture");
    token = (await response.json()).access_token;
  });
  afterEach(() => {
    server.resetHandlers();
    resetAuthMocks();
  });
  afterAll(() => {
    server.close();
    delete state.growmerMockServer;
  });
  return server;
}
