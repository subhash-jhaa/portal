import { createRemoteJWKSet, jwtVerify } from "jose";
import { currentUserSchema } from "@/lib/types/auth";
export const SESSION_COOKIE = "growmer_session";
let remoteKey: ReturnType<typeof createRemoteJWKSet> | undefined;
export function mockAuthEnabled() {
  return process.env.AUTH_MOCKS_ENABLED === "true";
}
export function mockSigningKey() {
  const secret = process.env.AUTH_JWT_SECRET;
  if (!secret || new TextEncoder().encode(secret).length < 32)
    throw new Error(
      "AUTH_JWT_SECRET must contain at least 32 bytes for mock authentication",
    );
  return new TextEncoder().encode(secret);
}
export async function verifyAccessToken(token: string | undefined) {
  if (!token) return null;
  // Missing configuration is a deployment error, not an invalid user session.
  const mock = mockAuthEnabled();
  const issuer = mock ? "growmer-mock" : process.env.AUTH_JWT_ISSUER;
  const audience = mock ? "growmer-portal" : process.env.AUTH_JWT_AUDIENCE;
  if (!issuer || !audience)
    throw new Error("Configure AUTH_JWT_ISSUER and AUTH_JWT_AUDIENCE");
  let key;
  if (mock) key = mockSigningKey();
  else {
    const url = process.env.AUTH_JWKS_URL;
    if (!url || new URL(url).protocol !== "https:")
      throw new Error("AUTH_JWKS_URL must be an HTTPS URL");
    remoteKey ??= createRemoteJWKSet(new URL(url));
    key = remoteKey;
  }
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: [mock ? "HS256" : "RS256"],
      issuer,
      audience,
      requiredClaims: ["sub", "exp", "iat", "jti"],
    });
    const user = currentUserSchema.safeParse({
      id: payload.sub,
      name: payload.name,
      email: payload.email,
      role: payload.role,
    });
    if (!user.success || !payload.exp) return null;
    return {
      user: user.data,
      expiresAt: payload.exp,
      token,
      id: String(payload.jti),
    };
  } catch {
    return null;
  }
}
