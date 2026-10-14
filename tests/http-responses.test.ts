import { it, expect } from "vitest";
import { NextRequest } from "next/server";
import { upstreamResponse } from "../src/lib/auth/routes";
import { checkMutationOrigin } from "../src/lib/auth/http";
it.each([204, 205, 304])(
  "preserves bodyless HTTP %i without constructing invalid JSON",
  async (status) => {
    const response = await upstreamResponse(new Response(null, { status }));
    expect(response.status).toBe(status);
    expect(await response.text()).toBe("");
    expect(response.headers.get("cache-control")).toBe("no-store");
  },
);
it("rejects malformed successful upstream responses and normalizes non-JSON failures", async () => {
  expect((await upstreamResponse(new Response("not json"))).status).toBe(502);
  const failure = await upstreamResponse(
    new Response("unavailable", { status: 503 }),
  );
  expect(failure.status).toBe(503);
  expect((await failure.json()).error.code).toBe("UPSTREAM_ERROR");
});
it("accepts JSON parameters but rejects content types that only share its prefix", () => {
  const request = (type: string) =>
    new NextRequest("http://localhost:3006/api/employee/profile", {
      method: "PATCH",
      headers: {
        Host: "localhost:3006",
        Origin: "http://localhost:3006",
        "Content-Type": type,
      },
    });
  expect(
    checkMutationOrigin(request("application/json; charset=utf-8")),
  ).toBeNull();
  expect(checkMutationOrigin(request("application/jsonp"))?.status).toBe(415);
});
