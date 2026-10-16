# Phase 1 review package

Implementation: Tasks 1–4, self-registration extension, My Documents exercise. Review package prepared locally; no review message has been sent to a teammate. A recipient/channel has not been supplied.

## Teammate demonstration

With Node.js 22.12+ and Docker installed, open the project folder and run npm run docker:up. It generates the ignored mock environment when absent and builds/starts the separate growmer-assignment container. Visit http://localhost:3006/login and use the employee demo account documented in README.md. Search a colleague in Directory, open their read-only public profile, update your own contacts in My profile, and inspect My Documents. Sign out and verify that protected pages redirect. Repeat as the predefined admin to review workforce totals, department distribution, recent joiners and directory shortcuts. Personal profiles and payslips remain scoped to each signed-in employee; editing colleagues is outside scope.

Use /documents?demoState=loading, empty or error in mock mode to demonstrate all states. Use /designs to compare both document options and all five screen states. DESIGN_GUIDE.md defines what should match on desktop/mobile and light/dark themes.

## Implementation evidence

Directory reads persisted registered identities and resolves colleague IDs from storage even before the colleague's first login; safe directory records exclude password material, payroll accounts and emergency contacts. Contact edits remain process-memory mock state and reset on restart. The registration account store persists through the Docker named volume.

Documents are token-subject scoped and fetched through lib/api. A route loading boundary and file-row skeletons preserve the heading. Sorting, specific empty/error messages, semantic table labels, mobile cards and disabled preview explanations correct the v0 draft. The original four-screen prompt was recovered from the live v0 chat; My Documents has two new v0-generated options. See docs/designs/ORIGINAL_PROMPT.md and DOCUMENTS.md.

## Docker mini challenge

The previous Node-based runner kept approximately 17.2 MiB of npm and 5.1 MiB of Yarn even though runtime starts node server.js. The new Alpine runner copies the Node binary only and installs its runtime libraries and certificates; build stages retain npm for npm ci and the build. Both stages use Alpine 3.24 to match the inspected musl runtime. Previous image size: 309990517 bytes. New image size and runtime checks are recorded after the Docker rebuild.

## Remaining external or learner steps

Python schemas, JWT claims/keys and endpoint behavior still need team approval and a real-backend integration run. See PYTHON_HANDOFF.md. My completed self-assessment answers are recorded below. Human teammate acceptance and sending this review are pending; automated checks do not replace those milestones.

## Verification

Passed: ESLint, TypeScript/generated routes, Prettier, canonical theme tokens, 54 Vitest unit/API tests and production build. All 42 Playwright checks passed against Docker on port 3006. The local browser run also passed all existing task checks and the focused admin suite passed on port 3005. The one-command launcher succeeded. Docker remains healthy under growmer-assignment, UID 1001; Node is present and npm/Yarn are absent from the runtime.

An independent container restart check created a new fictional account, restarted only Growmer, then resolved its profile by ID before any directory warm-up, searched it, verified token-subject document ownership, signed in with the registered account and logged out. All assertions passed.

Visual review: inspected documents normal table, alternative cards, loading, empty, error, and mobile dark captures; labels/dates/actions remain readable without horizontal page overflow. Automated gallery checks traverse all five screens and four states.

Previous image 295.6 MiB (309990517 bytes); new image 255.3 MiB (267686358 bytes). Net reduction 40.3 MiB (13.6%), including the new documents feature. These are Docker-reported uncompressed image sizes, not registry download sizes.

Review the implemented designs at `/designs` and the signed-in portal routes. Optional screenshots can be regenerated with `npm run test:e2e`; image files are excluded from Git.

## Self-assessment

1. **Why must pages never call fetch directly?**
   I keep API calls in `src/lib/api/` so I don't have to repeat the same request code on every page. This gives me one place to set the API address, send cookies, check the data coming back, and handle errors. When we connect the Python backend, I can make the request changes there. ESLint also helps me catch any direct `fetch` calls outside the API layer.

2. **Why are httpOnly cookies safer than localStorage for tokens?**
   I use an `httpOnly` cookie because browser JavaScript cannot read the token inside it. With `localStorage`, a harmful script running on the page could read and steal the token. The browser sends the cookie with requests, and the Next.js server checks the token before allowing access. This reduces the risk of token theft, but I still need secure cookie settings and checks that reject requests from other sites.

3. **What did you change in the AI's design, and why?**
   I used the v0 design as a starting point and made these changes to make the screens clearer and more consistent:

   - I moved the colors into shared theme tokens so the same green brand works in both light and dark mode.
   - I kept the login form visible after an error so the user can correct their details without starting again.
   - I made the loading skeletons follow each page's layout, including My Documents, so users can see where the content will appear.
   - I added a clear message when a payslip is missing. Showing ₹0 could make someone think their salary was zero.
   - I sorted documents with the newest first and used stacked cards on small screens. I also explained why preview buttons are disabled, since file viewing and downloads are not connected yet.

4. **What are the four states every screen needs?**
   I plan for four states: **normal**, when the data is ready; **loading**, while it is being fetched; **empty**, when there are no records to show; and **error**, when something goes wrong. I use skeletons while loading, helpful messages for empty results, and a clear error message with a way to try again. This helps users understand the difference between having no data and a request failing.

## Role-based workspace extension

Admin sessions now receive an organization overview on /dashboard; employees retain their personal dashboard. Both keep self-service profile, documents, payslip and directory features. Admin overview is read-only and its new provisional GET /admin/overview contract requires backend admin authorization. Real Python integration still requires contract agreement.

## Scope cleanup

Removed the legacy Projects demo (page, feature components, API client/types/fixture, backend handlers and its standalone contract) and three raw v0 archive copies. Employee endpoints now exercise the generic API boundary tests. Fixed the GET API allowlist to test the requested path before forwarding; unknown and removed endpoints are rejected. Reviewed design alternatives, prompts, review notes, shared controls, My Documents, registration and the explicitly requested admin workspace remain. Lint, formatting, tokens, 49 unit/API tests, production builds and 40 Docker browser checks passed after cleanup. Removed pages and API requests return 404; generated review captures and test reports were cleared after verification.

## Measured cold-load performance

Measured 14 October 2026 at 20:50 IST against the production Growmer Docker app at http://localhost:3006, using Chromium 156.0.8078.4, host Node v24.15.0, and three sequential samples per route (nine navigations). Every sample uses a fresh browser context, disabled HTTP cache, blocked service workers and no client-query cache. Authenticated route measurements establish only the demo session cookie before navigation; sign-in time is excluded from those samples. The production server is already running: this measures a cold browser cache, not container startup or a cold server process.

Controlled desktop profile: 1365 × 900 viewport, simulated 150 ms network latency, 1.6 Mbps download / 0.75 Mbps upload, and 4× renderer CPU slowdown. These localhost lab results do not establish performance on every device or over a remote deployment.

| Route      | Samples | Median FCP | Median skeleton | Slowest skeleton | Median UI ready | Slowest UI ready | Maximum initial CLS |
| ---------- | ------- | ---------- | --------------- | ---------------- | --------------- | ---------------- | ------------------- |
| /login     | 3       | 0.87 s     | N/A             | N/A              | 2.46 s          | 3.38 s           | 0.0015              |
| /dashboard | 3       | 0.70 s     | 0.68 s          | 0.78 s           | 3.37 s          | 3.44 s           | 0.0003              |
| /documents | 3       | 0.71 s     | 0.73 s          | 0.74 s           | 3.22 s          | 3.30 s           | 0.0000              |

FCP comes from the browser Paint Timing API. Skeleton time is the first animation frame in which the named loading region has visible geometry and styling. UI ready means the login submit button is enabled after hydration, the employee dashboard's View payslip action is visible after data loads, or the document table is visible. CLS is observed from navigation until two animation frames after UI ready. The raw report also records TTFB, JavaScript transfer bytes through UI ready and an observed LCP candidate; that candidate is not a final field LCP or an official time-to-interactive result.

Project-specific pass/fail budgets were set before the repeated run: FCP ≤ 1.8 s, skeleton ≤ 1.8 s on protected routes, UI ready ≤ 6 s, and initial CLS ≤ 0.1. Every sample passed. Dashboard and My Documents also passed a separate JavaScript-disabled check, proving their skeletons are present in server-rendered HTML and do not wait for hydration. No demoState or artificial API delay was used for these measurements; the normal MSW response delay remains part of the application.

Repeat with npm run test:performance after starting the production app. Raw samples, environment details, budgets and failures are written to ignored test-results/performance/cold-load.json. Three samples are a small lab check, not field percentiles; timing varies with host load. This supplies measured evidence of sub-second median loading feedback under the stated profile while complete data still takes roughly three seconds. The existing skeleton implementation meets these targets, so no extra runtime optimization was added solely to improve the report.

## Code-quality review

The npm run check gate enforces zero-warning lint, TypeScript, formatting, token consistency and unit/API regressions. Latest checks: 54 unit/API tests, 42 Docker browser tests, production builds and the throttled cold-load check passed. Session polling is single-flight and ignores late results after sign-out/unmount; ending/changing identities cancels and clears cached data, and cross-tab identity changes refresh the server workspace. Directory pagination normalizes malformed URLs while preserving filters. The upstream adapter handles bodyless responses and malformed JSON, mutation content types are checked exactly, and contact hints are linked to their inputs. Production dependency audit reported no vulnerabilities; the full audit retains five development-only entries from one unpatched braces advisory, documented in README.md. No rating or external acceptance is claimed.

The three-sample-per-route cold-cache rerun used the same documented slow-4G/4×-CPU profile and passed every budget plus both JavaScript-disabled skeleton checks. /login: median FCP 0.95 s, UI ready 2.52 s; /dashboard: median FCP 0.76 s, UI ready 3.81 s, skeleton 0.74 s; /documents: median FCP 0.71 s, UI ready 3.19 s, skeleton 0.80 s. These are local lab results with a warm production server.
