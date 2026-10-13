import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, verifyAccessToken } from "./token";
export async function getSession() {
  return verifyAccessToken((await cookies()).get(SESSION_COOKIE)?.value);
}
export async function requireSession() {
  const session = await getSession();
  if (!session) redirect("/login?reason=session-expired");
  return session;
}
