import { NextResponse } from "next/server";
import { ApiError } from "@/lib/api/errors";
import { jsonError } from "./http";
export function routeFailure(error: unknown) {
  if (error instanceof ApiError)
    return jsonError(error.status, error.code, error.message);
  // Do not log credentials, upstream bodies, tokens, or environment secrets.
  console.error(
    "Authentication/API request failed",
    error instanceof Error ? error.name : "UnknownError",
  );
  return jsonError(
    503,
    "SERVICE_UNAVAILABLE",
    "The service is unavailable. Please try again shortly.",
  );
}
export async function upstreamResponse(response: Response) {
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const { z } = await import("zod");
    const parsed = z
      .object({ error: z.object({ code: z.string(), message: z.string() }) })
      .safeParse(payload);
    return jsonError(
      response.status,
      parsed.success ? parsed.data.error.code : "UPSTREAM_ERROR",
      parsed.success
        ? parsed.data.error.message
        : "The service could not complete this request.",
    );
  }
  return NextResponse.json(payload, {
    status: response.status,
    headers: { "Cache-Control": "no-store" },
  });
}
