# Task 3 — authentication implementation

The selected Task 2 emerald split-panel login is now an actual form with React Hook Form and Zod. The gallery remains a public, fake-data design preview. Login uses a generic incorrect-credentials message and keeps form entries for retry; pending requests disable submission. Persistent login and password recovery are omitted from the live form because those backend flows are outside this task.

## Request flow

Browser form → lib/api/auth.ts → same-origin Next POST /api/auth/login → lib/api/backend.ts → Python (or MSW/node mock) → verified JWT → httpOnly cookie. Only a validated user identity is returned to the browser. No token goes into React context, localStorage, sessionStorage, or a JSON login response.

Next 16 calls middleware **proxy.ts**. It verifies JWT signature, expiry, issuer, audience, required claims, and allowed role before portal navigation. The protected layout independently requires a verified session. API handlers independently verify the cookie and forward its token to the backend; upstream endpoints enforce identity too. Hiding UI is never authorization. The public design gallery has fabricated data only. /health is public liveness.

The cookie is httpOnly, SameSite=Lax, Path=/, expires no later than the JWT, and defaults to Secure. Local HTTP examples explicitly set AUTH_COOKIE_SECURE=false; HTTPS deployments must use true. Unsafe requests require matching Origin and JSON content type. Return redirects only permit known portal paths. API/session responses are no-store. Server logs exclude passwords and tokens.

## Session lifecycle

useCurrentUser() is the single client helper for user, role, logout and logout status. The layout seeds AuthProvider with a verified identity; it rechecks /api/auth/me on mount, focus/visibility, and every minute while visible. Every protected API 401 clears the cookie and triggers a friendly login redirect. Missing/expired/tampered cookies redirect before rendering the protected page. There is no refresh-token flow: expiration requires sign-in again.

POST /api/auth/logout requests backend revocation, then clears the local cookie even if the backend is unavailable. MSW records revoked JWT IDs until expiry. Mock revocations and edited profiles are process memory: they reset on restart and are not shared across replicas. The real backend must own durable revocation, rate limiting, password hashing, refresh policy and role authorization. Both roles retain personal profile, documents, payslip and directory access. Admins additionally receive a workforce overview at /dashboard. GET /api/admin/overview enforces the verified admin role in the BFF and GET /admin/overview repeats the check in the mock backend. UI visibility alone is never authorization.

## Provisional Python contract

No Python Task 5 contract was supplied. contracts/auth.openapi.json is explicitly provisional. The backend base URL is server-only. Required endpoints: POST /auth/login → access_token, token_type=Bearer, expires_in; GET /auth/me → user; POST /auth/logout → ok. Authenticated domain requests carry Authorization: Bearer upstream. JWT claims: sub, name, email, role(employee/admin), exp, iat, jti, iss and aud. Python must derive the current employee from verified sub and implement revocation if immediate logout invalidation is required.

Mock mode uses HS256 and an independently generated ignored AUTH_JWT_SECRET, issuer growmer-mock and audience growmer-portal. Real mode deliberately accepts RS256 from an HTTPS AUTH_JWKS_URL, plus configured AUTH_JWT_ISSUER/AUDIENCE. Reconcile these requirements with Python before integration. Never disable verification to accept a different contract; change schema/key configuration and tests together.

## Accounts and configuration

Employee: aarav.mehta@example.com / Employee123! (Aarav Mehta, GR-1042).
Admin: neha.kapoor@example.com / Admin123! (Neha Kapoor, GR-1001).
These passwords are published mock credentials, not real account passwords.

Run npm run setup:env to generate an ignored .env key. AUTH_MOCKS_ENABLED=true enables the server mock; it defaults to disabled if absent. NEXT_PUBLIC_ENABLE_MOCKS controls client demo-state queries only. NEXT_PUBLIC_API_BASE_URL must remain /api for the same-origin cookie flow. For real mode set both mock flags false, BACKEND_API_URL, AUTH_JWKS_URL, AUTH_JWT_ISSUER, AUTH_JWT_AUDIENCE, AUTH_COOKIE_SECURE=true and APP_ORIGIN=https://your-portal-origin, then rebuild public settings. Compose remains in the growmer-assignment project on port 3006.

## Verification

Automated checks cover form validation, invalid credentials, both identities/roles, signature/expiry/issuer checks, protected pages/APIs, httpOnly behavior, no token JSON/storage exposure, cookie deletion/tampering, friendly upstream 401, logout/revocation, CSRF origin checks, safe return paths and integrated Task 1/2 regression checks.

Manual check: sign in, delete growmer_session in browser DevTools, refresh /profile: login must appear. Open /dashboard?demoState=expired while signed in: the cookie is cleared and the friendly session-ended message appears. Inspect the cookie attributes without copying the token into logs.

## Self-registration extension

/register uses the shared login frame, React Hook Form and Zod with name/email/password/confirmation validation. Public POST /api/auth/register checks origin and strict input, forwards only name/email/password upstream, validates an employee-only safe user response, and returns HTTP 201 without a cookie or token. Users then sign in through the existing JWT/httpOnly-cookie flow. Signed-in visits to /register redirect to the portal.

MSW implements POST /auth/register and checks duplicate emails including reserved demo identities. Registration ignores no role field: the strict schema rejects extra fields and the account store assigns employee. New accounts use UUID IDs, salted scrypt hashes and atomic serialized writes to the mock account file. Accounts survive restarts through MOCK_AUTH_DATA_DIR and Docker's auth-data volume. Stored hashes/salts are never exposed to the browser. The two published fake demo passwords remain fixed fixtures. Real Python registration must implement durable user storage and the agreed policy; this endpoint is provisional. No email-verification or recovery flow is claimed.

Demo personal data is keyed by the verified employee ID. Aarav has a ₹65,000 net payslip (account ending 4821); Neha has a ₹1,00,000 net payslip (7396) and distinct contact and employment details. Dashboard and payslip endpoints use the same employee-specific record. These are illustrative fixtures, not salary rules based on role. Directory listings and company announcements remain shared. Newly registered employees have no payroll until assigned by the backend.

Session refresh is single-flight and ignores results after unmount or sign-out. The query provider surrounds authentication so ending a session cancels and clears cached employee data immediately. Identity/role changes detected on focus refresh the server-rendered workspace, with a brief transition screen; cache instances are keyed by both identity and role.
