import { test, expect } from "@playwright/test";
import { signIn } from "./auth-helpers";

test("admin has a workforce dashboard, department links and separate personal records", async ({
  page,
}) => {
  await signIn(page, "admin");
  await expect(page.getByTestId("admin-overview")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Total employees" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Department overview" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Recent joiners" }),
  ).toBeVisible();
  await page
    .getByRole("main")
    .getByRole("link", { name: /^People Operations \d+$/ })
    .click();
  await expect(page).toHaveURL(/department=People(%20|\+)Operations/);
  await expect(page.getByRole("table")).toContainText("Neha Kapoor");
  await page.goto("/payslip");
  await expect(page.getByRole("main")).toContainText("₹1,00,000");
  await expect(page.getByRole("main")).toContainText("7396");
  await page.goto("/profile");
  await expect(page.getByRole("main")).toContainText("People Operations Lead");
});

test("employee keeps the personal dashboard and cannot call the admin API", async ({
  page,
}) => {
  await signIn(page);
  await expect(page.getByTestId("admin-overview")).toHaveCount(0);
  await expect(page.getByRole("main")).toContainText("₹65,000");
  expect(
    (
      await page.request.get("/api/admin/overview?role=admin", {
        headers: { "X-Role": "admin" },
      })
    ).status(),
  ).toBe(403);
  await expect(
    page.getByRole("heading", { name: "Welcome, Aarav" }),
  ).toBeVisible();
});

test("admin overview supports loading, empty, errors and retry", async ({
  page,
}) => {
  await signIn(page, "admin");
  await page.goto("/dashboard?demoState=loading");
  await expect(
    page.getByRole("status", { name: "Loading workforce overview" }),
  ).toBeVisible();
  await page.goto("/dashboard?demoState=empty");
  await expect(
    page.getByRole("heading", { name: "No employees yet" }),
  ).toBeVisible();
  await page.goto("/dashboard?demoState=error");
  await expect(page.getByRole("main").getByRole("alert")).toContainText(
    "Unable to load workforce overview",
  );
  await page.getByRole("button", { name: "Try again", exact: true }).click();
  await expect(page.getByTestId("admin-overview")).toBeVisible();
});

test("mobile admin navigation distinguishes people operations from personal pages", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await signIn(page, "admin");
  await page.getByRole("button", { name: "Open navigation" }).click();
  const nav = page.getByRole("navigation", { name: "Mobile navigation" });
  await expect(
    nav.getByRole("link", { name: "People overview" }),
  ).toBeVisible();
  await expect(
    nav.getByRole("link", { name: "Employee directory" }),
  ).toBeVisible();
  await expect(nav.getByRole("link", { name: "My payslip" })).toBeVisible();
  await nav.getByRole("link", { name: "My profile" }).click();
  await expect(page).toHaveURL(/\/profile$/);
});
