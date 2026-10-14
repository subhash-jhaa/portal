import { test, expect } from "@playwright/test";
import { signIn } from "./auth-helpers";
test.beforeEach(async ({ page }) => {
  await signIn(page);
});
test("directory URL search, filter, pagination and colleague privacy", async ({
  page,
}) => {
  await page.goto("/directory");
  await expect(
    page.getByRole("link", { name: "Aarav Mehta", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page).toHaveURL(/page=2/);
  await page.reload();
  await expect(page.getByText(/Page 2 of/)).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL(/\/directory$/);
  await expect(page.getByText(/Page 1 of/)).toBeVisible();
  await page.goForward();
  await expect(page).toHaveURL(/page=2/);
  await expect(page.getByText(/Page 2 of/)).toBeVisible();
  await page.getByLabel("Search employees").fill("Aditi Sharma");
  await expect(page).toHaveURL(/q=Aditi/);
  await expect(
    page.getByRole("link", { name: "Aditi Sharma", exact: true }),
  ).toBeVisible();
  await page
    .getByLabel("Department", { exact: true })
    .selectOption("Engineering");
  await expect(page).toHaveURL(/department=Engineering/);
  await page.getByRole("link", { name: "Aditi Sharma", exact: true }).click();
  await expect(
    page.getByText("Directory profiles are read-only."),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Edit contact details" }),
  ).toHaveCount(0);
  await expect(page.getByText("Payroll account", { exact: true })).toHaveCount(
    0,
  );
});
test("no results, retry and loading states", async ({ page }) => {
  await page.goto("/directory?q=unmatchedxyz");
  await expect(
    page.getByRole("heading", { name: "No employees found" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Clear filters" }).click();
  await expect(page.getByRole("table")).toBeVisible();
  await page.goto("/directory?demoState=error");
  await expect(
    page.getByRole("alert").filter({ hasText: "The employee service" }),
  ).toContainText("unavailable");
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(page.getByRole("table")).toBeVisible();
  await page.goto("/directory?demoState=loading");
  await expect(page.getByLabel("Loading employees")).toBeVisible();
});
test("profile validates phone and saves editable fields", async ({ page }) => {
  await page.goto("/profile");
  await page.getByRole("button", { name: "Edit contact details" }).click();
  await page.getByLabel("Phone", { exact: true }).fill("invalidletters");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.locator("#error-phone")).toContainText("valid phone");
  await page.getByLabel("Phone", { exact: true }).fill("+91 90000 02222");
  await page
    .getByLabel("Emergency contact", { exact: true })
    .fill("Meera Mehta, +91 90000 03333");
  await page.route("**/api/employee/profile", (route) =>
    route.request().method() === "PATCH"
      ? route.fulfill({
          status: 503,
          contentType: "application/json",
          body: JSON.stringify({
            error: {
              code: "UNAVAILABLE",
              message: "Save unavailable. Please try again.",
            },
          }),
        })
      : route.continue(),
  );
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(
    page.getByText("Save unavailable. Please try again.", { exact: true }),
  ).toBeVisible();
  await page.unroute("**/api/employee/profile");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(
    page.getByText("Contact details saved.", { exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByText("Meera Mehta, +91 90000 03333", { exact: true }),
  ).toBeVisible();
});
test("directory stays within mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/directory");
  await expect(page.getByRole("table")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
test("new routes require authentication", async ({ page }) => {
  await page.context().clearCookies();
  await page.goto("/directory/GR-2001");
  await expect(page).toHaveURL(/\/login\?returnTo=/);
});

test("backend rejects immutable fields and colleague edits", async ({
  page,
}) => {
  const origin = new URL(page.url()).origin;
  const immutable = await page.request.patch("/api/employee/profile", {
    headers: { Origin: origin },
    data: { email: "valid@example.com", phone: "", department: "Finance" },
  });
  expect(immutable.status()).toBe(422);
  const colleague = await page.request.patch(
    "/api/employee/directory/GR-2001",
    {
      headers: { Origin: origin },
      data: { email: "valid@example.com", phone: "" },
    },
  );
  expect(colleague.status()).toBe(404);
  const publicData = await page.request.get("/api/employee/directory/GR-1042");
  const record = await publicData.json();
  expect(record).not.toHaveProperty("accountEnd");
  expect(record).not.toHaveProperty("emergencyContact");
});

test("normalizes invalid and out-of-range page URLs while preserving filters", async ({
  page,
}) => {
  for (const value of ["-1", "0", "abc", "1.5", "9999"]) {
    await page.goto(
      "/directory?q=Aditi%20Sharma&department=Engineering&page=" + value,
    );
    await expect(
      page.getByRole("link", { name: "Aditi Sharma", exact: true }),
    ).toBeVisible();
    await expect
      .poll(() => new URL(page.url()).searchParams.get("page"))
      .toBe("1");
    expect(new URL(page.url()).searchParams.get("q")).toBe("Aditi Sharma");
    expect(new URL(page.url()).searchParams.get("department")).toBe(
      "Engineering",
    );
  }
});
