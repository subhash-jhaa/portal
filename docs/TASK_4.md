# Employee profile and directory

Protected routes: /profile (own editable profile), /directory (searchable directory), /directory/[id] (read-only colleague details).

TanStack Query owns loading, cancellation, 30-second caching and refresh. Caches are scoped to the authenticated layout and user. A profile mutation invalidates employee queries so the directory and dashboard refresh. HTTP calls remain in lib/api; server routes forward authenticated requests to the backend.

The directory searches on the server after a 350 ms debounce. q, department and page are kept in the URL, including browser back/forward support. Pages contain ten records; invalid pages are normalized and out-of-range pages clamped. The MSW backend includes forty additional realistic employees plus the two demo accounts. Directory responses exclude emergency contacts and payroll account data.

Employees may update contact email, phone and emergency contact only. React Hook Form and Zod validate the form; the BFF and mock backend enforce the same strict schema. Job title, employee ID, department, manager and location are managed by HR. Changing contact email does not change sign-in credentials. Phone may be blank or contain 7–15 digits with optional + and separators.

Demonstrate loading, empty and error using /directory?demoState=loading, empty or error while mock mode is enabled. Error states have retry controls, and no-results states allow clearing filters. Existing profile demo states remain available.

Python's final employee contract has not been supplied. GET /employee/directory?q=&department=&page=1 and GET /employee/directory/:id are provisional endpoints; GET/PATCH /employee/profile remain the own-profile endpoints. Replace the provisional schemas and handlers when the contract arrives. Profile changes currently persist within the mock process and reset on restart; registration accounts continue to use their existing persistent store.

Registered-user discovery now reads persistent identities independently of profile-memory state. A registered colleague can be found before their first login and resolved directly by ID after a server restart.
