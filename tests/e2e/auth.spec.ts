import { test, expect } from "@playwright/test";
import { signIn } from "./auth-helpers";
test("protects all portal pages and APIs while keeping designs and health public", async ({
  page,
  request,
}) => {
  for (const path of [
    "/",
    "/dashboard",
    "/profile",
    "/payslip",
    "/projects",
    "/directory",
    "/documents",
  ]) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/login\?/);
  }
  for (const path of [
    "/api/auth/me",
    "/api/employee/profile",
    "/api/employee/dashboard",
    "/api/employee/directory",
    "/api/employee/documents",
    "/api/projects",
  ])
    expect((await request.get(path)).status()).toBe(401);
  expect((await request.get("/health")).status()).toBe(200);
  await page.goto("/designs");
  await expect(
    page.getByText("Task 2 · Reviewed v0 designs", { exact: true }),
  ).toBeVisible();
});
test("validates login, retains inputs after wrong credentials, and supports password visibility", async ({
  page,
}) => {
  await page.goto("/login");
  await page.screenshot({
    path: "docs/designs/screenshots/integrated-login.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(
    page.getByText("Enter a valid work email", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Enter your password", { exact: true }),
  ).toBeVisible();
  await page
    .getByLabel("Work email", { exact: true })
    .fill("aarav.mehta@example.com");
  await page.getByLabel("Password", { exact: true }).fill("wrong-password");
  await page
    .getByRole("button", { name: "Show password", exact: true })
    .click();
  await expect(page.getByLabel("Password", { exact: true })).toHaveAttribute(
    "type",
    "text",
  );
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByRole("main").getByRole("alert")).toContainText(
    "Email or password is incorrect",
  );
  await expect(page.getByLabel("Password", { exact: true })).toHaveValue(
    "wrong-password",
  );
});
test("uses an httpOnly cookie and returns safe identity without tokens", async ({
  page,
  context,
}) => {
  const responsePromise = page.waitForResponse("/api/auth/login");
  await signIn(page);
  const data = await (await responsePromise).json();
  expect(Object.keys(data)).toEqual(["user"]);
  const session = (await context.cookies()).find(
    (cookie) => cookie.name === "growmer_session",
  );
  expect(session?.httpOnly).toBe(true);
  expect(session?.sameSite).toBe("Lax");
  expect(session?.path).toBe("/");
  expect(await page.evaluate(() => document.cookie)).not.toContain(
    "growmer_session",
  );
  expect(
    await page.evaluate(() =>
      Object.keys(localStorage).filter((key) =>
        /token|session|auth/i.test(key),
      ),
    ),
  ).toEqual([]);
  await expect(page.getByTestId("current-role")).toHaveText("employee");
  await page.goto("/login");
  await expect(page).toHaveURL(/\/dashboard$/);
});
test("shows the admin identity and role through the same helper", async ({
  page,
}) => {
  await signIn(page, "admin");
  await expect(
    page.getByRole("heading", { name: "Welcome, Neha" }),
  ).toBeVisible();
  await page.screenshot({
    path: "docs/designs/screenshots/auth-admin-dashboard.png",
    fullPage: true,
  });
  await expect(page.getByTestId("current-role")).toHaveText("admin");
  await expect(
    page.getByRole("heading", { name: "Welcome, Neha" }),
  ).toBeVisible();
});
test("cookie deletion and tampering redirect to login", async ({
  page,
  context,
  baseURL,
  browser,
}) => {
  await signIn(page);
  await context.clearCookies();
  await page.reload();
  await expect(page).toHaveURL(/\/login\?/);
  // Isolate tampering from late 401 responses/polling in the previous signed-in page.
  const tampered = await browser.newContext({ baseURL });
  try {
    await tampered.addCookies([
      {
        name: "growmer_session",
        value: "invalid.jwt.signature",
        url: baseURL!,
        httpOnly: true,
      },
    ]);
    const tab = await tampered.newPage();
    await tab.goto("/profile");
    await expect(tab).toHaveURL(/reason=session-expired/);
    await expect(tab.getByRole("status")).toContainText(
      "Your session has ended",
    );
    expect(
      (await tampered.cookies()).some(
        (cookie) => cookie.name === "growmer_session",
      ),
    ).toBe(false);
  } finally {
    await tampered.close();
  }
});
test("upstream 401 clears cookie and gives a friendly redirect", async ({
  page,
  context,
}) => {
  await signIn(page);
  await page.goto("/dashboard?demoState=expired");
  await expect(page).toHaveURL(/\/login\?reason=session-expired/);
  await page.screenshot({
    path: "docs/designs/screenshots/auth-session-expired.png",
    fullPage: true,
  });
  await expect(page.getByRole("status")).toContainText("Please sign in again");
  expect(
    (await context.cookies()).some(
      (cookie) => cookie.name === "growmer_session",
    ),
  ).toBe(false);
});
test("logout clears the cookie and revoked tokens cannot access the mock backend", async ({
  page,
  context,
  baseURL,
}) => {
  await signIn(page);
  const cookie = (await context.cookies()).find(
    (cookie) => cookie.name === "growmer_session",
  )!;
  await page
    .getByRole("button", { name: "Sign out", exact: true })
    .filter({ visible: true })
    .click();
  await expect(page).toHaveURL(/reason=logged-out/);
  expect(
    (await context.cookies()).some((item) => item.name === "growmer_session"),
  ).toBe(false);
  await context.addCookies([
    { name: cookie.name, value: cookie.value, url: baseURL!, httpOnly: true },
  ]);
  expect((await context.request.get("/api/employee/profile")).status()).toBe(
    401,
  );
});
test("rejects cross-origin mutations and unsafe return URLs", async ({
  page,
  request,
}) => {
  const crossOrigin = await request.post("/api/auth/login", {
    headers: { Origin: "https://evil.example" },
    data: { email: "aarav.mehta@example.com", password: "Employee123!" },
  });
  expect(crossOrigin.status()).toBe(403);
  await page.goto("/login?returnTo=https://evil.example");
  await page
    .getByLabel("Work email", { exact: true })
    .fill("aarav.mehta@example.com");
  await page.getByLabel("Password", { exact: true }).fill("Employee123!");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  const forbidden = await page.request.patch("/api/employee/profile", {
    headers: { Origin: "https://evil.example" },
    data: { email: "edited@example.com", phone: "" },
  });
  expect(forbidden.status()).toBe(403);
});
