import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifyAccessToken } from "@/lib/auth/token";
import { clearSession } from "@/lib/auth/http";
import { safeReturnTo } from "@/lib/auth/redirect";
export async function proxy(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifyAccessToken(token);
  if (["/login", "/register"].includes(request.nextUrl.pathname)) {
    if (session)
      return NextResponse.redirect(
        new URL(
          safeReturnTo(request.nextUrl.searchParams.get("returnTo")),
          request.url,
        ),
      );
    return token ? clearSession(NextResponse.next()) : NextResponse.next();
  }
  if (!session) {
    const url = new URL("/login", request.url);
    url.searchParams.set(
      "returnTo",
      request.nextUrl.pathname + request.nextUrl.search,
    );
    if (token) url.searchParams.set("reason", "session-expired");
    return clearSession(NextResponse.redirect(url));
  }
  return NextResponse.next();
}
export const config = {
  matcher: [
    "/",
    "/login",
    "/register",
    "/dashboard/:path*",
    "/profile/:path*",
    "/directory/:path*",
    "/documents/:path*",
    "/payslip/:path*",
  ],
};
