# Phase 1 review package

Implementation: Tasks 1–4, self-registration extension, My Documents exercise. Review package prepared locally; no review message has been sent to a teammate. A recipient/channel has not been supplied.

## Teammate demonstration

With Node.js 22.12+ and Docker installed, open the project folder and run npm run docker:up. It generates the ignored mock environment when absent and builds/starts the separate growmer-assignment container. Visit http://localhost:3006/login and use the employee demo account documented in README.md. Search a colleague in Directory, open their read-only public profile, update your own contacts in My profile, and inspect My Documents. Sign out and verify that protected pages redirect. Repeat as the predefined admin to check the role helper; role-specific management screens are future scope.

Use /documents?demoState=loading, empty or error in mock mode to demonstrate all states. Use /designs to compare both document options and all five screen states. DESIGN_GUIDE.md defines what should match on desktop/mobile and light/dark themes.

## Implementation evidence

Directory reads persisted registered identities and resolves colleague IDs from storage even before the colleague's first login; safe directory records exclude password material, payroll accounts and emergency contacts. Contact edits remain process-memory mock state and reset on restart. The registration account store persists through the Docker named volume.

Documents are token-subject scoped and fetched through lib/api. A route loading boundary and file-row skeletons preserve the heading. Sorting, specific empty/error messages, semantic table labels, mobile cards and disabled preview explanations correct the v0 draft. The original four-screen prompt was recovered from the live v0 chat; My Documents has two new v0-generated options. See docs/designs/ORIGINAL_PROMPT.md and DOCUMENTS.md.

## Docker mini challenge

The previous Node-based runner kept approximately 17.2 MiB of npm and 5.1 MiB of Yarn even though runtime starts node server.js. The new Alpine runner copies the Node binary only and installs its runtime libraries and certificates; build stages retain npm for npm ci and the build. Both stages use Alpine 3.24 to match the inspected musl runtime. Previous image size: 309990517 bytes. New image size and runtime checks are recorded after the Docker rebuild.

## Remaining external or learner steps

Python schemas, JWT claims/keys and endpoint behavior still need team approval and a real-backend integration run. See PYTHON_HANDOFF.md. The self-assessment notes below support the learner's own answers. Human teammate acceptance and sending this review are pending; automated checks do not replace those milestones.

## Verification

Passed: ESLint, TypeScript/generated routes, Prettier, canonical theme tokens, 45 Vitest unit/API tests and production build. All 35 Playwright checks passed locally on port 3005 and against Docker on port 3006. The one-command launcher succeeded. Docker remains healthy under growmer-assignment, UID 1001; Node is present and npm/Yarn are absent from the runtime.

An independent container restart check created a new fictional account, restarted only Growmer, then resolved its profile by ID before any directory warm-up, searched it, verified token-subject document ownership, signed in with the registered account and logged out. All assertions passed.

Visual review: inspected documents normal table, alternative cards, loading, empty, error, and mobile dark captures; labels/dates/actions remain readable without horizontal page overflow. Automated gallery checks traverse all five screens and four states.

Previous image 295.6 MiB (309990517 bytes); new image 255.3 MiB (267686358 bytes). Net reduction 40.3 MiB (13.6%), including the new documents feature. These are Docker-reported uncompressed image sizes, not registry download sizes.

Review the implemented designs at `/designs` and the signed-in portal routes. Optional screenshots can be regenerated with `npm run test:e2e`; image files are excluded from Git.

## Self-assessment reference notes

These are reference notes, not answers attributed to the learner. Explain each in your own words.

1. **Why keep fetch in lib/api?** One API boundary owns addresses, credentials, errors and runtime validation, so backend changes do not spread across screens.
2. **Why use httpOnly cookies?** Browser JavaScript cannot read the token. Secure/SameSite settings, trusted-origin checks and server verification remain necessary.
3. **What changed after AI generation?** Semantic tokens replaced literal colors; forms remain visible on error; skeletons follow screen structure; documents sort newest first and use labeled mobile cards with honest disabled previews. See designs/REVIEW.md and designs/DOCUMENTS.md.
4. **What are the four states?** Normal/success, loading, empty and error. An empty result is different from a failed request.
