# Growmer — Frontend foundation

Task 1: Next.js App Router, strict TypeScript, Tailwind/shadcn UI, themes, a typed API boundary, MSW, and standalone Docker.

## Quick start

Requires Node.js 22.12+ and npm. From this folder:

```powershell
npm ci
Copy-Item .env.example .env.local
npm run dev
```

Open http://localhost:3000. Routes: / (overview), /projects, /health. Browser requests wait for MSW startup. The overview metrics and project table use the same API response. Mocks run in the browser, including in the Docker demo; there is no separate mock container. Use localhost or HTTPS for Service Workers.

## Architecture

- src/app: route composition and shared layouts; no fetch calls.
- src/components/ui: project-owned shadcn components.
- src/components/layout: responsive navigation and theme switch.
- src/components/features: domain UI and data state.
- src/components/providers: theme and asynchronous mock initialization.
- src/lib/api: sole HTTP boundary, consistent errors, runtime response validation.
- src/lib/types: Zod schemas and inferred TypeScript types.
- src/mocks: handlers and typed sample fixtures.
- contracts/openapi.yaml: PROVISIONAL contract, pending the Python team draft.

Dependencies flow from routes to features to domain API functions to the shared client. Generic UI does not import domain code. ESLint rejects fetch outside lib/api. Dark/light semantic color and radius tokens live in globals.css; spacing uses Tailwind's scale; fonts use a local system stack without remote font downloads.

## Configuration

| Variable                 | Default          | Purpose                                                         |
| ------------------------ | ---------------- | --------------------------------------------------------------- |
| NEXT_PUBLIC_API_BASE_URL | /api             | Relative same-origin or absolute browser-accessible API address |
| NEXT_PUBLIC_ENABLE_MOCKS | false when unset | Set true for the demo; .env.example and Compose enable it       |
| PORT                     | 3000             | Compose host port; container listens on 3000                    |

NEXT_PUBLIC variables are public and embedded at BUILD TIME. Change them before building and rebuild the image. Do not put secrets in them. A browser cannot resolve Docker service names as public API addresses. Compose reads .env/shell values, not .env.local.

## Contract and mocks

GET /api/projects returns { items, total }; GET /api/projects/{id} returns a project or a 404 error; POST /api/projects returns 201 or a 422 validation error. Created records are in memory and reset on reload. No authentication or persistence is claimed. Update the provisional contract, schemas, fixtures, handlers, and tests together when the Python contract arrives. Browser MSW does not intercept Server Component fetches; this foundation deliberately loads domain data in Client Components.

## Docker

This app uses the separate Compose project **growmer-assignment**, with container **growmer-assignment-portal-1** and its own network. It is independent of ai-sales-workforce. Start Docker Desktop with its Linux engine, then:

```powershell
docker compose up --build -d
docker compose ps
docker compose logs -f
docker compose exec portal id
docker compose down
```

Open http://localhost:3000. The three-stage image copies standalone output, static assets, and the worker and runs as UID 1001. /health reports frontend liveness, not backend readiness. Server logs go to stdout/stderr; MSW/client logs appear in browser DevTools.

## Verification

```powershell
npm run lint
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

The browser suite starts the production server itself. Unit/integration tests also cover malformed requests and cancellation, and cover mock creation and retrieval, 404 errors, invalid responses, and network failures. Browser tests cover mock startup, create flow, themes, search, and mobile navigation. Start with no process using port 3000.

## Connect the Python backend

Confirm contracts and update schemas first. Set NEXT_PUBLIC_ENABLE_MOCKS=false and NEXT_PUBLIC_API_BASE_URL to the real browser-accessible API URL, then rebuild/restart. Configure backend CORS for the portal origin when using a different origin. Endpoint functions and pages remain the same if the contract is unchanged. Authentication, persistence, and detailed screen design belong to later tasks.

## Production startup

Run `npm run build` then `npm start`. The start script copies public/static assets into standalone output and starts its server, matching the Docker runtime. The development command remains `npm run dev`.

## Dependency audit

The production dependency audit reports no vulnerabilities. The full audit currently flags the development-only braces/micromatch/fast-glob chain used by Next.js's ESLint plugin. npm's suggested force fix downgrades eslint-config-next to Next 14; do not apply it to this Next 16 project. Recheck the advisory and compatible upstream releases before updating lint tooling. No API secrets or real user data are included.
