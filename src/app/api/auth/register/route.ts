import { NextResponse, type NextRequest } from "next/server";
import { registrationSchema, authResponseSchema } from "@/lib/types/auth";
import { backendRequest } from "@/lib/api/backend";
import { checkMutationOrigin, jsonError } from "@/lib/auth/http";
import { routeFailure } from "@/lib/auth/routes";
export async function POST(request: NextRequest) {
  const rejected = checkMutationOrigin(request);
  if (rejected) return rejected;
  try {
    const parsed = registrationSchema.safeParse(
      await request.json().catch(() => null),
    );
    if (!parsed.success)
      return jsonError(422, "VALIDATION_ERROR", parsed.error.issues[0].message);
    const upstream = await backendRequest("/auth/register", {
      method: "POST",
      body: parsed.data,
    });
    if (upstream.status === 409)
      return jsonError(
        409,
        "EMAIL_EXISTS",
        "An account with this email already exists. Sign in instead.",
      );
    if (!upstream.ok)
      return jsonError(
        503,
        "SERVICE_UNAVAILABLE",
        "Registration is unavailable. Please try again shortly.",
      );
    const result = authResponseSchema.safeParse(await upstream.json());
    if (!result.success || result.data.user.role !== "employee")
      return jsonError(
        502,
        "INVALID_RESPONSE",
        "The registration service returned an unexpected response.",
      );
    // Registration does not issue a session. The user signs in through the existing cookie flow.
    return NextResponse.json(result.data, {
      status: 201,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return routeFailure(error);
  }
}
