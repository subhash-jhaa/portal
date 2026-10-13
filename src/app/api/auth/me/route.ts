import { NextResponse, type NextRequest } from "next/server";
import { backendRequest } from "@/lib/api/backend";
import { SESSION_COOKIE, verifyAccessToken } from "@/lib/auth/token";
import { clearSession, jsonError } from "@/lib/auth/http";
import { routeFailure, upstreamResponse } from "@/lib/auth/routes";
import { authResponseSchema } from "@/lib/types/auth";
export async function GET(request: NextRequest) {
  try {
    const session = await verifyAccessToken(
      request.cookies.get(SESSION_COOKIE)?.value,
    );
    if (!session)
      return clearSession(
        jsonError(
          401,
          "SESSION_EXPIRED",
          "Your session has ended. Please sign in again.",
        ),
      );
    const upstream = await backendRequest("/auth/me", { token: session.token });
    if (upstream.ok) {
      const parsed = authResponseSchema.safeParse(await upstream.json());
      if (!parsed.success)
        return jsonError(
          502,
          "INVALID_RESPONSE",
          "The current-user service returned an unexpected response.",
        );
      if (
        parsed.data.user.id !== session.user.id ||
        parsed.data.user.role !== session.user.role
      )
        return clearSession(
          jsonError(
            401,
            "SESSION_EXPIRED",
            "Your session has changed. Please sign in again.",
          ),
        );
      return NextResponse.json(parsed.data, {
        headers: { "Cache-Control": "no-store" },
      });
    }
    const response = await upstreamResponse(upstream);
    return upstream.status === 401 ? clearSession(response) : response;
  } catch (error) {
    return routeFailure(error);
  }
}
