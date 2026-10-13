# Python API integration handoff — pending agreement

No Python team draft has been supplied. All files in contracts/ are provisional frontend proposals. This document does not claim backend sign-off or production integration.

Browser requests stay same-origin through /api. The BFF verifies the httpOnly session cookie and forwards Bearer tokens server-side. MSW/node currently intercepts that upstream request. This is an intentional adjustment from the browser-worker introduction in Task 1: browsers never need the bearer token.

Agree POST /auth/register, POST /auth/login, GET /auth/me and POST /auth/logout; token shape, RS256/JWKS, trusted issuer/audience, expiry/revocation, error envelope {error:{code,message}}, and registration policy. Employee auth role (employee/admin) is different from directory job title.

Agree GET/PATCH /employee/profile, GET /employee/dashboard, GET /employee/payslip?period=..., GET /employee/directory?q=&department=&page=1, GET /employee/directory/{id}, and GET /employee/documents. Directory pagination currently uses ten items and returns items,total,page,pageSize,totalPages,departments. Directory profiles must exclude emergency contact, banking details and password material. Profile PATCH accepts only contact email, phone and emergency contact; updating contact email does not change sign-in credentials.

Document records are fictional metadata; no upload or download endpoint exists. Real documents must be scoped to the authenticated user on the backend. Do not accept a userId override from browser input.

Acceptance: map approved schemas and errors, disable both mock flags, configure BACKEND_API_URL and HTTPS JWKS/issuer/audience, enable Secure cookies and APP_ORIGIN, rebuild public settings, then exercise registration/login/logout/expiry, own-profile PATCH, directory search/page and colleague privacy, and current-user document isolation against Python. Durable profile storage, rate limiting and role authorization belong to Python.

Status: ready for contract review; external agreement and live backend verification pending.
