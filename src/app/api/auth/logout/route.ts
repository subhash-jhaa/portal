import { NextResponse, type NextRequest } from "next/server";
import { backendRequest } from "@/lib/api/backend";
import { SESSION_COOKIE } from "@/lib/auth/token";
import { clearSession, checkMutationOrigin } from "@/lib/auth/http";
export async function POST(request: NextRequest) {
  const rejected = checkMutationOrigin(request);
  if (rejected) return rejected;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (token) {
    try {
      await backendRequest("/auth/logout", { method: "POST", token, body: {} });
    } catch {
      console.warn("Backend logout unavailable; clearing local session");
    }
  }
  return clearSession(
    NextResponse.json(
      { ok: true },
      { headers: { "Cache-Control": "no-store" } },
    ),
  );
}
