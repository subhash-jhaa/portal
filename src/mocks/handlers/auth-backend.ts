import { http, HttpResponse, delay } from "msw";
import { SignJWT } from "jose";
import {
  loginSchema,
  registrationSchema,
  type CurrentUser,
} from "@/lib/types/auth";
import { mockSigningKey, verifyAccessToken } from "@/lib/auth/token";
import { demoRecords } from "@/mocks/fixtures/demo-records";
import { contactInputSchema, type Employee } from "@/lib/types/employee";
import {
  createRegisteredAccount,
  authenticateRegisteredAccount,
  findRegisteredAccount,
  listRegisteredAccounts,
  DuplicateAccountError,
} from "@/mocks/accounts";
import { directoryEmployees } from "@/mocks/fixtures/employees";
import { colleagueSchema, directoryParams } from "@/lib/types/directory";
import { employeeDocuments } from "@/mocks/fixtures/documents";
import { canViewWorkforce } from "@/lib/auth/permissions";
const base = "http://growmer.mock.internal/api";
export const demoUsers = [
  {
    user: {
      id: "GR-1042",
      name: "Aarav Mehta",
      email: "aarav.mehta@example.com",
      role: "employee",
    } as CurrentUser,
    password: "Employee123!",
  },
  {
    user: {
      id: "GR-1001",
      name: "Neha Kapoor",
      email: "neha.kapoor@example.com",
      role: "admin",
    } as CurrentUser,
    password: "Admin123!",
  },
];
const employees = new Map<string, Employee>();
const revoked = new Map<string, number>();
export function resetAuthMocks() {
  employees.clear();
  revoked.clear();
}
function failure(status: number, code: string, message: string) {
  return HttpResponse.json({ error: { code, message } }, { status });
}
async function identity(request: Request) {
  const header = request.headers.get("authorization");
  const session = await verifyAccessToken(
    header?.startsWith("Bearer ") ? header.slice(7) : undefined,
  );
  const now = Math.floor(Date.now() / 1000);
  for (const [id, expiry] of revoked) if (expiry <= now) revoked.delete(id);
  if (!session || revoked.has(session.id)) return null;
  const known =
    demoUsers.some((entry) => entry.user.id === session.user.id) ||
    (await findRegisteredAccount(session.user.id));
  return known ? session : null;
}
async function profile(user: CurrentUser, createdAt?: string) {
  if (!demoUsers.some((entry) => entry.user.id === user.id)) {
    if (!employees.has(user.id)) {
      const registeredAt =
        createdAt || (await findRegisteredAccount(user.id))?.createdAt;
      employees.set(user.id, {
        id: user.id,
        name: user.name,
        email: user.email,
        initials: user.name
          .split(/\s+/)
          .slice(0, 2)
          .map((part) => part[0])
          .join("")
          .toUpperCase(),
        role: "Employee",
        department: "Not assigned",
        manager: "Not assigned",
        location: "Not provided",
        phone: "",
        joined: registeredAt
          ? new Date(registeredAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
              timeZone: "UTC",
            })
          : "Not provided",
        emergencyContact: "",
      });
    }
    return employees.get(user.id)!;
  }
  if (!employees.has(user.id))
    employees.set(user.id, structuredClone(demoRecords[user.id]!.employee));
  return employees.get(user.id)!;
}

async function workforceEmployees() {
  const records = new Map(directoryEmployees.map((item) => [item.id, item]));
  for (const entry of demoUsers)
    records.set(entry.user.id, await profile(entry.user));
  for (const account of await listRegisteredAccounts())
    records.set(
      account.user.id,
      await profile(account.user, account.createdAt),
    );
  for (const [id, item] of employees) records.set(id, item);
  return [...records.values()].sort((a, b) => a.name.localeCompare(b.name));
}
export const authBackendHandlers = [
  http.get(base + "/admin/overview", async ({ request }) => {
    const session = await identity(request);
    if (!session)
      return failure(401, "SESSION_EXPIRED", "Please sign in again.");
    if (!canViewWorkforce(session.user))
      return failure(403, "FORBIDDEN", "Admin access is required.");
    const state = new URL(request.url).searchParams.get("demoState");
    if (state === "loading") await delay("infinite");
    else await delay(250);
    if (state === "expired")
      return failure(401, "SESSION_EXPIRED", "Please sign in again.");
    if (state === "error")
      return failure(
        503,
        "UNAVAILABLE",
        "The workforce service is unavailable. Please retry.",
      );
    const all = state === "empty" ? [] : await workforceEmployees();
    const counts = new Map<string, number>();
    for (const employee of all)
      if (employee.department !== "Not assigned")
        counts.set(
          employee.department,
          (counts.get(employee.department) || 0) + 1,
        );
    return HttpResponse.json({
      totalEmployees: all.length,
      unassignedEmployees: all.filter(
        (employee) => employee.department === "Not assigned",
      ).length,
      departments: [...counts]
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)),
      recentJoiners: all
        .filter((employee) => Number.isFinite(Date.parse(employee.joined)))
        .sort(
          (a, b) =>
            Date.parse(b.joined) - Date.parse(a.joined) ||
            a.id.localeCompare(b.id),
        )
        .slice(0, 5)
        .map((employee) => colleagueSchema.parse(employee)),
    });
  }),
  http.post(base + "/auth/register", async ({ request }) => {
    await delay(250);
    const parsed = registrationSchema.safeParse(
      await request.json().catch(() => null),
    );
    if (!parsed.success)
      return failure(422, "VALIDATION_ERROR", parsed.error.issues[0].message);
    if (demoUsers.some((entry) => entry.user.email === parsed.data.email))
      return failure(
        409,
        "EMAIL_EXISTS",
        "An account with this email already exists. Sign in instead.",
      );
    try {
      const user = await createRegisteredAccount(parsed.data);
      return HttpResponse.json({ user }, { status: 201 });
    } catch (error) {
      if (error instanceof DuplicateAccountError)
        return failure(
          409,
          "EMAIL_EXISTS",
          "An account with this email already exists. Sign in instead.",
        );
      throw error;
    }
  }),
  http.post(base + "/auth/login", async ({ request }) => {
    await delay(250);
    const parsed = loginSchema.safeParse(
      await request.json().catch(() => null),
    );
    if (!parsed.success)
      return failure(
        422,
        "VALIDATION_ERROR",
        "Enter a valid email and password.",
      );
    const demo = demoUsers.find(
      (entry) => entry.user.email === parsed.data.email,
    );
    const user = demo
      ? demo.password === parsed.data.password
        ? demo.user
        : null
      : await authenticateRegisteredAccount(
          parsed.data.email,
          parsed.data.password,
        );
    if (!user)
      return failure(
        401,
        "INVALID_CREDENTIALS",
        "Email or password is incorrect.",
      );
    const ttl = 1800;
    const access_token = await new SignJWT({
      name: user.name,
      email: user.email,
      role: user.role,
    })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setSubject(user.id)
      .setIssuer("growmer-mock")
      .setAudience("growmer-portal")
      .setIssuedAt()
      .setJti(crypto.randomUUID())
      .setExpirationTime(Math.floor(Date.now() / 1000) + ttl)
      .sign(mockSigningKey());
    return HttpResponse.json({
      access_token,
      token_type: "Bearer",
      expires_in: ttl,
    });
  }),
  http.get(base + "/auth/me", async ({ request }) => {
    const session = await identity(request);
    return session
      ? HttpResponse.json({ user: session.user })
      : failure(
          401,
          "SESSION_EXPIRED",
          "Your session has ended. Please sign in again.",
        );
  }),
  http.post(base + "/auth/logout", async ({ request }) => {
    const session = await identity(request);
    if (session) revoked.set(session.id, session.expiresAt);
    return HttpResponse.json({ ok: true });
  }),
  http.get(base + "/employee/directory", async ({ request }) => {
    const session = await identity(request);
    if (!session)
      return failure(401, "SESSION_EXPIRED", "Please sign in again.");
    const url = new URL(request.url),
      state = url.searchParams.get("demoState");
    if (state === "loading") await delay("infinite");
    else await delay(250);
    if (state === "expired")
      return failure(401, "SESSION_EXPIRED", "Please sign in again.");
    if (state === "error")
      return failure(
        503,
        "UNAVAILABLE",
        "The employee service is unavailable. Please retry.",
      );
    const all = await workforceEmployees();
    const params = directoryParams(url.searchParams);
    const filtered =
      state === "empty"
        ? []
        : all.filter(
            (item) =>
              (!params.department || item.department === params.department) &&
              [
                item.name,
                item.email,
                item.role,
                item.location,
                item.department,
              ].some((value) =>
                value.toLowerCase().includes(params.q.toLowerCase()),
              ),
          );
    const totalPages = Math.max(1, Math.ceil(filtered.length / 10)),
      page = Math.min(params.page, totalPages);
    return HttpResponse.json({
      items: filtered
        .slice((page - 1) * 10, page * 10)
        .map((item) => colleagueSchema.parse(item)),
      total: filtered.length,
      page,
      pageSize: 10,
      totalPages,
      departments: [...new Set(all.map((item) => item.department))].sort(),
    });
  }),
  http.get(base + "/employee/directory/:id", async ({ request, params }) => {
    const session = await identity(request);
    if (!session)
      return failure(401, "SESSION_EXPIRED", "Please sign in again.");
    await delay(250);
    const demo = demoUsers.find((entry) => entry.user.id === params.id);
    const item =
      params.id === session.user.id
        ? await profile(session.user)
        : demo
          ? await profile(demo.user)
          : employees.get(String(params.id)) ||
            directoryEmployees.find((entry) => entry.id === params.id);
    const registered = !item
      ? await findRegisteredAccount(String(params.id))
      : undefined;
    const resolved =
      item ||
      (registered
        ? await profile(
            {
              id: registered.id,
              name: registered.name,
              email: registered.email,
              role: registered.role,
            },
            registered.createdAt,
          )
        : undefined);
    return resolved
      ? HttpResponse.json(colleagueSchema.parse(resolved))
      : failure(404, "NOT_FOUND", "Employee not found.");
  }),
  http.get(base + "/employee/:resource", async ({ request, params }) => {
    const session = await identity(request);
    if (!session)
      return failure(
        401,
        "SESSION_EXPIRED",
        "Your session has ended. Please sign in again.",
      );
    const url = new URL(request.url),
      state = url.searchParams.get("demoState");
    if (state === "expired")
      return failure(
        401,
        "SESSION_EXPIRED",
        "Your session has ended. Please sign in again.",
      );
    if (state === "loading") await delay("infinite");
    else await delay(250);
    if (state === "error")
      return failure(
        503,
        "UNAVAILABLE",
        "The employee service is unavailable. Please retry.",
      );
    if (params.resource === "documents") {
      const items = state === "empty" ? [] : employeeDocuments(session.user.id);
      return HttpResponse.json({
        ownerId: session.user.id,
        items,
        total: items.length,
      });
    }
    const employee = await profile(session.user);
    const payroll = demoRecords[session.user.id]?.payslip;
    if (params.resource === "profile")
      return HttpResponse.json(
        state === "empty"
          ? { ...employee, phone: "", emergencyContact: "" }
          : employee,
      );
    if (params.resource === "dashboard")
      return HttpResponse.json({
        employee,
        latestPayslip: state === "empty" || !payroll ? null : payroll,
        profileActionCount: employee.emergencyContact ? 0 : 1,
        announcement:
          "Please review your contact information before the next payroll cycle.",
      });
    if (params.resource === "payslip")
      return HttpResponse.json({
        employee,
        payslip:
          state === "empty" ||
          !payroll ||
          url.searchParams.get("period") !== payroll.period
            ? null
            : payroll,
      });
    return failure(404, "NOT_FOUND", "Endpoint not found.");
  }),
  http.patch(base + "/employee/profile", async ({ request }) => {
    const session = await identity(request);
    if (!session)
      return failure(
        401,
        "SESSION_EXPIRED",
        "Your session has ended. Please sign in again.",
      );
    const parsed = contactInputSchema.safeParse(
      await request.json().catch(() => null),
    );
    if (!parsed.success)
      return failure(422, "VALIDATION_ERROR", "Enter valid contact details.");
    const employee = { ...(await profile(session.user)), ...parsed.data };
    employees.set(session.user.id, employee);
    return HttpResponse.json(employee);
  }),
];
