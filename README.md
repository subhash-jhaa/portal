# Growmer — integrated Phase 1 portal (Tasks 1–4)

One Next.js employee portal: Task 1 architecture and typed API boundary, Task 2 reviewed v0 screens/theme, Task 3 server-managed authentication, Task 4 profile/directory, and the My Documents exercise. The public /designs gallery preserves all screen alternatives and states. Real login uses the selected design with React Hook Form + Zod.

## Run locally

Requires Node.js 22.12+. Run npm ci, npm run setup:env, then npm run dev. Open http://localhost:3000/login. If occupied use npm run dev -- --port 3005. setup:env creates an ignored .env with a random mock signing key; preserve it and never commit it. Existing .env.local settings take precedence over .env.

## Docker

Run `npm run docker:up` from the project folder. This single command creates the ignored mock environment if absent and runs `docker compose up --build -d --wait`. Open http://localhost:3006/login. Compose project growmer-assignment and container growmer-assignment-portal-1 remain separate from ai-sales-workforce. The standalone image runs as UID 1001. Check docker compose ps, docker compose exec portal id, and docker compose logs -f. Stop with docker compose down.

## Demo sign-in

| Role     | Work email              | Password     |
| -------- | ----------------------- | ------------ |
| Employee | aarav.mehta@example.com | Employee123! |
| Admin    | neha.kapoor@example.com | Admin123!    |

Mock credentials only. Login sets an httpOnly session cookie; the browser receives user identity only. Protected routes and APIs verify the JWT. Sessions expire after 30 minutes; expired/revoked sessions redirect with a friendly message. Sign out clears the cookie and requests backend revocation. No token is stored in browser localStorage/sessionStorage. useCurrentUser() provides identity and role to all protected components. See docs/AUTHENTICATION.md for security boundaries and the provisional Python contract.

## Routes

| Route                                                               | Purpose                                                                  |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| /login                                                              | Public validated sign-in; signed-in users redirect to dashboard          |
| /register                                                           | Public self-registration; employee role; sign in after creation          |
| /, /dashboard                                                       | Protected current employee summary and latest payroll                    |
| /directory, /directory/[id]                                         | Protected searchable employee directory and read-only colleague profiles |
| /documents                                                          | Protected My Documents list with normal/loading/empty/error states       |
| /profile                                                            | Protected profile and API-backed contact updates                         |
| /payslip                                                            | Protected period statement, including empty records                      |
| /projects                                                           | Protected retained Task 1 API example                                    |
| /designs, /designs/source                                           | Public fake-data design review and archived v0 composition               |
| /health                                                             | Public frontend liveness JSON, HTTP 200                                  |
| /api/auth/login, /api/auth/me, /api/auth/logout, /api/auth/register | Server authentication endpoints                                          |

## Architecture

App Router → feature/hook → lib/api domain functions → typed browser client → same-origin Next API → server backend client → Python or MSW/node → validated response → shared reviewed UI. All fetch calls stay in lib/api; ESLint enforces this.

- src/app: thin routes, protected layout, authentication routes and allowlisted BFF API.
- src/proxy.ts: Next 16's middleware convention; verified session redirects.
- src/components/layout: responsive shell and theme switch.
- src/components/features: reviewed employee UI, API page controllers, live login and public design gallery.
- src/components/providers/auth-provider.tsx: app-wide useCurrentUser helper.
- src/components/ui: eight shared shadcn controls.
- src/lib/api, src/lib/types, src/lib/auth: HTTP, schemas and server session/token helpers.
- src/mocks: upstream auth/domain handlers and fixtures. Server MSW answers upstream requests after BFF session checks. Unit tests reuse these same protected domain handlers.

Server mock contact edits persist across browser reloads, per employee, until the server restarts. There is no database, real payroll persistence or PDF download. Fake data and roles are examples. Profile job title and auth role are distinct fields.

## Configuration

| Variable                           | Purpose                                                                     |
| ---------------------------------- | --------------------------------------------------------------------------- |
| NEXT_PUBLIC_API_BASE_URL           | /api: same-origin browser BFF; rebuild when changed                         |
| NEXT_PUBLIC_ENABLE_MOCKS           | Enables client demo-state queries; public build-time flag                   |
| AUTH_MOCKS_ENABLED                 | Runtime server MSW backend; true only for demos                             |
| MOCK_AUTH_DATA_DIR                 | Server-only persistent mock account directory; Docker uses auth-data volume |
| AUTH_JWT_SECRET                    | Server-only random mock signing key, at least 32 bytes                      |
| AUTH_COOKIE_SECURE                 | true for HTTPS; false only for localhost HTTP                               |
| BACKEND_API_URL                    | Server-only Python API base when mocks disabled                             |
| AUTH_JWKS_URL                      | HTTPS RS256 verification key set in real mode                               |
| AUTH_JWT_ISSUER, AUTH_JWT_AUDIENCE | Required trusted issuer/audience in real mode                               |
| APP_ORIGIN                         | Optional explicit trusted portal origin for unsafe requests                 |
| PORT                               | Host port 3006 in Compose, container port 3000                              |

Public variables are Docker build arguments; all authentication settings are runtime server variables. Never put secrets in NEXT_PUBLIC variables. The backend URL is hidden from the browser. API errors and invalid sessions have consistent handling. Logs go to stdout/stderr without tokens or credentials. /health checks frontend liveness only.

Demo scenarios: /dashboard?demoState=error, /profile?demoState=empty, /payslip?demoState=loading, /dashboard?demoState=expired. Retry clears the current page scenario. Query scenarios are ignored in real backend mode.

## Design and contracts

DESIGN_GUIDE.md defines typography, spacing, colors and component rules. docs/designs records prompts, reviews, original v0 source and review notes. src/lib/design/palette.json generates tokens.css (npm run sync:tokens); npm run check:tokens verifies consistency. Employee and auth contracts under contracts are PROVISIONAL until Python team approval. Original project examples remain regression tested.

## Checks

Run npm run lint, npm run typecheck, npm run check:tokens, npm test, npm run build, npm run test:e2e. Install Chromium using npx playwright install chromium if needed. For Docker tests in PowerShell set $env:E2E_BASE_URL = 'http://localhost:3006' then npm run test:e2e. For an isolated local production run set PORT=3005 and E2E_BASE_URL=http://localhost:3005; the browser runner starts npm start.

Tests cover token verification/expiry, both roles, validation, cookie attributes, logout/revocation, protected pages/API, expired-session redirects, CSRF origin and return URL checks, plus Task 1/2 API, gallery, themes and mobile regression coverage.

## Connect Python

Agree contracts/auth.openapi.json and employee.openapi.json first. Set AUTH_MOCKS_ENABLED=false and NEXT_PUBLIC_ENABLE_MOCKS=false, configure the backend and RS256/JWKS issuer/audience, use HTTPS with AUTH_COOKIE_SECURE=true, set APP_ORIGIN, and rebuild public settings. The portal keeps same-origin API calls and requires no browser-to-Python CORS. Python owns durable users, passwords, rate limiting, JWT issuance/revocation and future role authorization. Do not bypass signature verification to accommodate a different contract.

## Self-registration

Open /register or choose Create an account on /login. Enter full name, work email, password (at least 8 characters), and matching confirmation. After creation, sign in on /login. Duplicate emails show an error; public registration always assigns the employee role. Newly registered profiles start with their own identity and unassigned employment details; they have no payroll record.

Mock accounts persist with salted scrypt password hashes in .mock-data/accounts.json locally and the auth-data named volume in Docker. The local start script resolves this directory outside the generated build. Neither the store nor credentials are committed or copied into images. docker compose down preserves accounts; removing the volume removes them. Profile contact edits and token revocations still use process memory. This file store supports one mock server process and is not a production database. Real account persistence and registration policy belong to the Python backend; POST /auth/register is added to the provisional contract.

## Task 4 — Employee profile and directory

Open **Directory** after signing in to search forty-two sample employees, filter departments, paginate and open read-only colleague profiles. Edit your own contact details from **My profile**. Implementation and provisional API details: [Task 4](docs/TASK_4.md).

## Phase 1 handoff and My Documents

Run `npm run docker:up` for environment setup and Docker startup in one command. Open **My Documents** after login to inspect fictional file metadata. No upload or download exists. All four states and both reviewed v0 options are available in `/designs`; live mock scenarios use `/documents?demoState=loading`, `empty` or `error`. Registered employees are discoverable in Directory even before their first login and after server restarts.

Review package: [Phase 1 review](docs/PHASE_1_REVIEW.md). Pending backend agreement: [Python handoff](docs/PYTHON_HANDOFF.md). Learner reference notes: [Self-assessment](docs/PHASE_1_REVIEW.md#self-assessment-reference-notes). AI evidence: [Original v0 prompt](docs/designs/ORIGINAL_PROMPT.md), [My Documents design review](docs/designs/DOCUMENTS.md).

## Files for review and GitHub

Commit source, tests, scripts, contracts, package manifests and lockfile, build configuration, .env.example, DESIGN_GUIDE.md and the review documentation. Local dependencies, generated builds/types/test reports, environment files and mock account storage are excluded by .gitignore. Keep your local .env files and .mock-data; they preserve configuration and mock registrations and must not be sent for review.

The empty public directory is preserved with public/.gitkeep because the Dockerfile copies it. npm ci restores dependencies; npm run build restores build output; npm run typecheck regenerates Next.js declarations. Historical integration/validation notes and the separate worksheet were consolidated into the current review package and design review.

Design screenshots are optional local artifacts and are excluded from Git. Review screens and states through `/designs` or regenerate images with `npm run test:e2e`.
