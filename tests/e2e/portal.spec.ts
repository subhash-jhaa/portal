import { test, expect } from "@playwright/test";
import { signIn } from "./auth-helpers";
test.beforeEach(async ({ page }) => {
  await signIn(page);
});
test("main routes use MSW API responses and share the reviewed design", async ({
  page,
}) => {
  const endpoints: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("/api/employee/")) endpoints.push(request.url());
  });
  await page.reload();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(
    page.getByRole("heading", { name: "Welcome, Aarav" }),
  ).toBeVisible();
  await page.screenshot({
    path: "docs/designs/screenshots/integrated-dashboard.png",
    fullPage: true,
  });
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "My profile" })
    .click();
  await expect(
    page.getByRole("button", { name: "Edit contact details" }),
  ).toBeVisible();
  await page.screenshot({
    path: "docs/designs/screenshots/integrated-profile.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Edit contact details" }).click();
  await page
    .getByLabel("Work email", { exact: true })
    .fill("updated.employee@example.com");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(
    page.getByText("updated.employee@example.com", { exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByText("updated.employee@example.com", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Payslips", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "September 2026", exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: "docs/designs/screenshots/integrated-payslip.png",
    fullPage: true,
  });
  await page.getByLabel("Pay period").selectOption("August 2026");
  await expect(page.getByText("No payslip for this period")).toBeVisible();
  expect(endpoints.some((url) => url.includes("/dashboard"))).toBe(true);
  expect(endpoints.some((url) => url.includes("/profile"))).toBe(true);
  expect(endpoints.some((url) => url.includes("/payslip"))).toBe(true);
});
test("actual API errors retry successfully and theme persists", async ({
  page,
}) => {
  await page.goto("/dashboard?demoState=error");
  await expect(page.getByRole("main").getByRole("alert")).toBeVisible();
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(
    page.getByRole("heading", { name: "Welcome, Aarav" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Toggle color theme" }).click();
  const theme = await page.locator("html").getAttribute("class");
  await page.goto("/profile");
  await expect(page.locator("html")).toHaveAttribute("class", theme!);
});
test("mobile routing works and the live payslip fits", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/dashboard");
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page
    .getByRole("navigation", { name: "Mobile navigation" })
    .getByRole("link", { name: "Payslips", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Your payslips" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "September 2026", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "docs/designs/screenshots/integrated-payslip-mobile.png",
    fullPage: true,
  });
});
test("main empty and loading states are API-driven", async ({ page }) => {
  await page.goto("/dashboard?demoState=empty");
  await expect(page.getByText("Your workspace is getting ready")).toBeVisible();
  await page.goto("/profile?demoState=empty");
  await expect(
    page.getByText("Some contact details are missing.", { exact: false }),
  ).toBeVisible();
  await page.goto("/payslip?demoState=loading");
  await expect(
    page.getByRole("status", { name: "Loading payslip" }),
  ).toBeVisible();
});
test("health and original project API example remain available", async ({
  page,
  request,
}) => {
  expect((await request.get("/health")).status()).toBe(200);
  await page.goto("/projects");
  await expect(
    page.getByText("Customer portal", { exact: true }),
  ).toBeVisible();
});
