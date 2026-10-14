import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "./token";
export function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.AUTH_COOKIE_SECURE !== "false",
    sameSite: "lax" as const,
    path: "/",
  };
}
export function jsonError(status: number, code: string, message: string) {
  return NextResponse.json(
    { error: { code, message } },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}
export function clearSession(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE, "", { ...cookieOptions(), maxAge: 0 });
  return response;
}
export function checkMutationOrigin(request: NextRequest) {
  // Unsafe requests must originate from this portal. CORS is not CSRF protection.
  const origin = request.headers.get("origin");
  // Standalone Next may use its internal bind address in request.url.
  // Use the actual Host for localhost; deployments should pin APP_ORIGIN.
  const url = new URL(request.url);
  const expected =
    process.env.APP_ORIGIN || url.protocol + "//" + request.headers.get("host");
  if (
    !origin ||
    origin !== expected ||
    request.headers.get("sec-fetch-site") === "cross-site"
  )
    return jsonError(
      403,
      "INVALID_ORIGIN",
      "Please submit this request from the Growmer portal.",
    );
  const contentType = request.headers
    .get("content-type")
    ?.split(";", 1)[0]
    .trim()
    .toLowerCase();
  if (contentType !== "application/json")
    return jsonError(415, "INVALID_CONTENT_TYPE", "Send a JSON request.");
  return null;
}
