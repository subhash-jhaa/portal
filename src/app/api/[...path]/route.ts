import { type NextRequest } from "next/server";
import { backendRequest } from "@/lib/api/backend";
import {
  SESSION_COOKIE,
  verifyAccessToken,
  mockAuthEnabled,
} from "@/lib/auth/token";
import { clearSession, checkMutationOrigin, jsonError } from "@/lib/auth/http";
import { routeFailure, upstreamResponse } from "@/lib/auth/routes";
import { contactInputSchema } from "@/lib/types/employee";
import { canViewWorkforce } from "@/lib/auth/permissions";
type Context = { params: Promise<{ path: string[] }> };
async function handle(request: NextRequest, context: Context) {
  try {
    const path = "/" + (await context.params).path.join("/");
    const allowed =
      request.method === "GET"
        ? /^\/(admin\/overview|employee\/(profile|dashboard|payslip|documents|directory(?:\/[a-zA-Z0-9-]+)?))$/.test(
            path,
          )
        : request.method === "PATCH"
          ? path === "/employee/profile"
          : false;
    if (!allowed) return jsonError(404, "NOT_FOUND", "Endpoint not found.");
    if (request.method !== "GET") {
      const rejected = checkMutationOrigin(request);
      if (rejected) return rejected;
    }
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
    if (path === "/admin/overview" && !canViewWorkforce(session.user))
      return jsonError(403, "FORBIDDEN", "Admin access is required.");
    let body;
    if (request.method !== "GET") {
      const parsed = contactInputSchema.safeParse(
        await request.json().catch(() => null),
      );
      if (!parsed.success)
        return jsonError(
          422,
          "VALIDATION_ERROR",
          parsed.error.issues[0].message,
        );
      body = parsed.data;
    }
    const query = new URLSearchParams();
    if (path === "/employee/directory")
      for (const key of ["q", "department", "page"]) {
        const value = request.nextUrl.searchParams.get(key);
        if (value !== null) query.set(key, value);
      }
    if (path === "/employee/payslip")
      query.set("period", request.nextUrl.searchParams.get("period") || "");
    if (mockAuthEnabled() && request.nextUrl.searchParams.has("demoState"))
      query.set("demoState", request.nextUrl.searchParams.get("demoState")!);
    const upstream = await backendRequest(
      path + (query.size ? "?" + query : ""),
      {
        method: request.method,
        token: session.token,
        body,
        signal: request.signal,
      },
    );
    const response = await upstreamResponse(upstream);
    return upstream.status === 401 ? clearSession(response) : response;
  } catch (error) {
    return routeFailure(error);
  }
}
export const GET = handle;
export const PATCH = handle;
