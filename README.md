# Growmer — integrated Phase 1 portal (Tasks 1–4)

One Next.js employee portal: Task 1 architecture and typed API boundary, Task 2 reviewed v0 screens/theme, Task 3 server-managed authentication, Task 4 profile/directory, and the My Documents exercise. The public /designs gallery preserves all screen alternatives and states. Real login uses the selected design with React Hook Form + Zod.

## Teammate quick start

You need Node.js 22.12 or newer and Docker Desktop with Docker Compose v2. Start Docker Desktop and wait until its engine is running. Use Linux containers. Download or clone this project, then open a terminal in the folder containing `package.json` and `compose.yaml`.

Run this one command:

```bash
npm run docker:up
```

You do not need to install the project's npm dependencies on your computer for this Docker walkthrough. The command creates a local `.env` with a random mock signing key, then Docker installs the dependencies, builds the app and waits for it to become healthy. The first run needs an internet connection to download images and packages and can take several minutes. Existing `.env` settings are preserved.

When the command finishes successfully, open [Growmer sign-in](http://localhost:3006/login). No Python backend or real employee data is needed for this demo.

| Step                 | What to do                                                                                                                                                | What you should see                                                                                                                                                                 |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Sign in           | Use `aarav.mehta@example.com` and `Employee123!`.                                                                                                         | Aarav's employee dashboard and personal information.                                                                                                                                |
| 2. Find a colleague  | Open **Directory**, leave Department on **All departments**, and search for `Aditi Sharma`. Pause briefly for the search to finish, then select the name. | Aditi's public profile. Colleague profiles are read-only. Search and filters stay in the URL.                                                                                       |
| 3. Edit your profile | Open **My profile**, choose **Edit contact details**, change Phone to `+91 98765 43210`, and choose **Save changes**.                                     | A success message and the updated phone number. Refresh the page to confirm it is still there.                                                                                      |
| 4. Check the design  | Compare the screens with [DESIGN_GUIDE.md](DESIGN_GUIDE.md), then use the theme switch.                                                                   | Green brand accents in both themes, pale light surfaces, charcoal dark surfaces, and consistent fonts, spacing and controls. `/designs` shows the reviewed alternatives and states. |
| 5. Check documents   | Open **My Documents**.                                                                                                                                    | Fictional file records. Preview buttons are disabled with an explanation because file viewing and downloads are not connected.                                                      |
| 6. Sign out          | Choose **Sign out**, then open `/profile` again.                                                                                                          | The sign-in page; a signed-out user cannot open the protected profile.                                                                                                              |

Use fictional values when trying the form. You can edit your own contact details; employment details are managed by HR. Changing the profile's contact email does not change the email used to sign in. Contact edits survive browser refreshes but reset when the mock server restarts. Self-registered accounts are stored separately and persist in the Docker volume.

After completing the steps, tell the project owner whether anything failed and which step it happened on. A successful automated test run is recorded separately from a teammate completing this walkthrough.

## Run locally

Requires Node.js 22.12+. Run npm ci, npm run setup:env, then npm run dev. Open http://localhost:3000/login. If occupied use npm run dev -- --port 3005. setup:env creates an ignored .env with a random mock signing key; preserve it and never commit it. Existing .env.local settings take precedence over .env.

## Docker

Run `npm run docker:up` from the project folder. This single command creates the ignored mock environment if absent and runs `docker compose up --build -d --wait`. Open http://localhost:3006/login. Compose project growmer-assignment and container growmer-assignment-portal-1 remain separate from ai-sales-workforce. The standalone image runs as UID 1001. Check docker compose ps, docker compose exec portal id, and docker compose logs -f. Stop with docker compose down.

## Help with the Docker walkthrough

- **Docker cannot connect:** Open Docker Desktop, wait for the engine to start, then run `npm run docker:up` again. `docker compose version` should show Compose v2.
- **Port 3006 is already in use:** Choose another free port. In PowerShell, run `$env:PORT = '3007'`, then `npm run docker:up` and open `http://localhost:3007/login`. In Command Prompt, use `set PORT=3007` before the startup command. Use the chosen port for all links in this guide; the container still uses port 3000.
- **The build fails while downloading:** Check your internet connection and Docker's registry access, then run the startup command again. Keep the error output if you need help.
- **The page does not open after startup:** Run `docker compose ps` to check the container status and `docker compose logs --tail 100 portal` to see recent errors. When healthy, `/health` should return HTTP 200. Share the error message with the project owner, without sharing `.env` or signing keys.
- **The demo account does not work:** Copy the employee credentials above exactly. If you reused an old project folder, check that its `.env` still enables mock mode. The setup command preserves existing settings rather than replacing them.

To stop the app, run `docker compose down` from the same project folder. This preserves registered demo accounts in the named volume.

## Demo sign-in

| Role     | Work email              | Password     |
| -------- | ----------------------- | ------------ |
| Employee | aarav.mehta@example.com | Employee123! |
| Admin    | neha.kapoor@example.com | Admin123!    |

Mock credentials only. Login sets an httpOnly session cookie; the browser receives user identity only. Protected routes and APIs verify the JWT. Sessions expire after 30 minutes; expired/revoked sessions redirect with a friendly message. Sign out clears the cookie and requests backend revocation. No token is stored in browser localStorage/sessionStorage. useCurrentUser() provides identity and role to all protected components. See docs/AUTHENTICATION.md for security boundaries and the provisional Python contract.

## Routes

| Route                                                               | Purpose                                                                                  |
| ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| /login                                                              | Public validated sign-in; signed-in users redirect to dashboard                          |
| /register                                                           | Public self-registration; employee role; sign in after creation                          |
| /, /dashboard                                                       | Protected role-based dashboard: own summary for employees, workforce overview for admins |
| /directory, /directory/[id]                                         | Protected searchable employee directory and read-only colleague profiles                 |
| /documents                                                          | Protected My Documents list with normal/loading/empty/error states                       |
| /profile                                                            | Protected profile and API-backed contact updates                                         |
| /payslip                                                            | Protected period statement, including empty records                                      |
| /designs                                                            | Public reviewed design alternatives and all four states                                  |
| /health                                                             | Public frontend liveness JSON, HTTP 200                                                  |
| /api/auth/login, /api/auth/me, /api/auth/logout, /api/auth/register | Server authentication endpoints                                                          |

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

DESIGN_GUIDE.md defines typography, spacing, colors and component rules. docs/designs records prompts, reviews, v0 provenance and review notes. src/lib/design/palette.json generates tokens.css (npm run sync:tokens); npm run check:tokens verifies consistency. Employee and auth contracts under contracts are PROVISIONAL until Python team approval. The API boundary is regression tested against employee endpoints.

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

Review package: [Phase 1 review](docs/PHASE_1_REVIEW.md). Pending backend agreement: [Python handoff](docs/PYTHON_HANDOFF.md). Self-assessment: [Self-assessment](docs/PHASE_1_REVIEW.md#self-assessment). AI evidence: [Original v0 prompt](docs/designs/ORIGINAL_PROMPT.md), [My Documents design review](docs/designs/DOCUMENTS.md).

## Files for review and GitHub

Commit source, tests, scripts, contracts, package manifests and lockfile, build configuration, .env.example, DESIGN_GUIDE.md and the review documentation. Local dependencies, generated builds/types/test reports, environment files and mock account storage are excluded by .gitignore. Keep your local .env files and .mock-data; they preserve configuration and mock registrations and must not be sent for review.

The empty public directory is preserved with public/.gitkeep because the Dockerfile copies it. npm ci restores dependencies; npm run build restores build output; npm run typecheck regenerates Next.js declarations. Historical integration/validation notes and the separate worksheet were consolidated into the current review package and design review.

Design screenshots are optional local artifacts and are excluded from Git. Review screens and states through `/designs` or regenerate images with `npm run test:e2e`.

## Role-based workspaces

Employees land on their personal salary/action dashboard. Admins land on a distinct People operations overview with workforce totals, department counts, awaiting-assignment counts and recent joiners. Admin navigation separates people operations from My workspace. Both roles keep their own editable contact profile, documents and payslip; colleague profiles remain read-only. Admin access does not grant payroll access to other employees or allow self-registration as admin.

The admin overview endpoint is server-authorized (403 for employee sessions, 401 when signed out). Counts reuse the full directory source, including registered accounts. Its provisional backend contract is contracts/admin.openapi.json. All requests go through lib/api, with user-specific query keys. Admin loading/empty/error states use the same shared components and green/charcoal theme. Review with /dashboard?demoState=loading, empty or error while signed in as admin.

## Cold-load performance check

With the production Docker app running (npm run docker:up), run npm ci and install Chromium once with npx playwright install chromium if necessary. Then run npm run test:performance. It measures login, dashboard and My Documents three times each, using fresh browser contexts, disabled HTTP cache, simulated slow 4G and 4× CPU slowdown. It also checks that protected-page skeletons render with JavaScript disabled. The command fails when the declared timing/layout budgets are exceeded.

Defaults to http://localhost:3006. To measure another local production port in PowerShell, set $env:PERF_BASE_URL = 'http://localhost:3005' before running the command. PERF_SAMPLES accepts 3–10 repetitions per route. Use a production build with demo authentication enabled and avoid concurrent builds/tests during measurement. Results are local lab evidence with a warm server, not a remote-device guarantee or field percentile.

Raw JSON is written to test-results/performance/cold-load.json and is ignored by Git. Recorded results, budget definitions and measurement limits are in [Phase 1 performance evidence](docs/PHASE_1_REVIEW.md#measured-cold-load-performance).

## Review quality gate

Run npm run check for zero-warning lint, generated-route TypeScript, formatting, design-token consistency and unit/API tests. Then run npm run build and npm run test:e2e against the desired production port. npm run test:performance checks the documented lab budgets separately.

Dependency audit checked 14 October 2026: the production dependency audit is clean; the complete audit reports a development-only chain through eslint-config-next → fast-glob → micromatch → braces. [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) lists no patched braces release. Do not force npm's proposed downgrade of Next tooling to version 14. Keep lint glob configuration trusted and recheck npm audit as upstream fixes become available. No claim of a completely clean full dependency audit is made.
