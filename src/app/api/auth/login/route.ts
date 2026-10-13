import { NextResponse, type NextRequest } from "next/server";
import { loginSchema, tokenResponseSchema } from "@/lib/types/auth";
import { backendRequest } from "@/lib/api/backend";
import { SESSION_COOKIE, verifyAccessToken } from "@/lib/auth/token";
import { checkMutationOrigin, cookieOptions, jsonError } from "@/lib/auth/http";
import { routeFailure } from "@/lib/auth/routes";
export async function POST(request: NextRequest) {
  const rejected = checkMutationOrigin(request);
  if (rejected) return rejected;
  try {
    const parsed = loginSchema.safeParse(
      await request.json().catch(() => null),
    );
    if (!parsed.success)
      return jsonError(422, "VALIDATION_ERROR", parsed.error.issues[0].message);
    const upstream = await backendRequest("/auth/login", {
      method: "POST",
      body: parsed.data,
    });
    if (upstream.status === 401)
      return jsonError(
        401,
        "INVALID_CREDENTIALS",
        "Email or password is incorrect. Please try again.",
      );
    if (!upstream.ok)
      return jsonError(
        503,
        "SERVICE_UNAVAILABLE",
        "Sign-in is unavailable. Please try again shortly.",
      );
    const result = tokenResponseSchema.safeParse(await upstream.json());
    if (!result.success)
      return jsonError(
        502,
        "INVALID_RESPONSE",
        "The sign-in service returned an unexpected response.",
      );
    const session = await verifyAccessToken(result.data.access_token);
    if (!session)
      return jsonError(
        502,
        "INVALID_TOKEN",
        "The sign-in service returned an invalid session.",
      );
    const ttl = Math.min(
      result.data.expires_in,
      session.expiresAt - Math.floor(Date.now() / 1000),
    );
    if (ttl <= 0)
      return jsonError(502, "INVALID_TOKEN", "Please try signing in again.");
    const response = NextResponse.json(
      { user: session.user },
      { headers: { "Cache-Control": "no-store" } },
    );
    response.cookies.set(SESSION_COOKIE, session.token, {
      ...cookieOptions(),
      maxAge: ttl,
    });
    return response;
  } catch (error) {
    return routeFailure(error);
  }
}
