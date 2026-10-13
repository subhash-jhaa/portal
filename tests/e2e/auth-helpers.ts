import { expect, type Page } from "@playwright/test";
export async function signIn(
  page: Page,
  role: "employee" | "admin" = "employee",
) {
  await page.goto("/login");
  await page
    .getByLabel("Work email", { exact: true })
    .fill(
      role === "admin" ? "neha.kapoor@example.com" : "aarav.mehta@example.com",
    );
  await page
    .getByLabel("Password", { exact: true })
    .fill(role === "admin" ? "Admin123!" : "Employee123!");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}
