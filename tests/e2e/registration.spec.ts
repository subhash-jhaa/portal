import { test, expect } from "@playwright/test";
import { randomUUID } from "node:crypto";
import { signIn } from "./auth-helpers";
async function fillRegistration(
  page: import("@playwright/test").Page,
  email: string,
) {
  await page.getByLabel("Full name", { exact: true }).fill("Samira Patel");
  await page.getByLabel("Work email", { exact: true }).fill(email);
  await page
    .getByLabel("Password", { exact: true })
    .fill("My demo passphrase 123!");
  await page
    .getByLabel("Confirm password", { exact: true })
    .fill("My demo passphrase 123!");
}
test("links login and registration and validates all registration fields", async ({
  page,
}) => {
  await page.goto("/login");
  await page
    .getByRole("link", { name: "Create an account", exact: true })
    .click();
  await expect(page).toHaveURL(/\/register$/);
  await page
    .getByRole("button", { name: "Create account", exact: true })
    .click();
  await expect(
    page.getByText("Enter your full name (at least 2 characters)", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByText("Enter a valid work email", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Use at least 8 characters", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Confirm your password", { exact: true }),
  ).toBeVisible();
  await fillRegistration(page, "samira-" + randomUUID() + "@example.com");
  await page.getByLabel("Confirm password", { exact: true }).fill("different");
  await page
    .getByRole("button", { name: "Create account", exact: true })
    .click();
  await expect(
    page.getByText("Passwords do not match", { exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
});
test("registers, signs in, signs out and signs in again with the new account", async ({
  page,
  context,
}) => {
  const email = "samira-" + randomUUID() + "@example.com";
  await page.goto("/register");
  await page.screenshot({
    path: "docs/designs/screenshots/registration-desktop.png",
    fullPage: true,
  });
  await fillRegistration(page, email);
  const created = page.waitForResponse("/api/auth/register");
  await page
    .getByRole("button", { name: "Create account", exact: true })
    .click();
  const response = await created;
  expect(response.status()).toBe(201);
  expect(Object.keys(await response.json())).toEqual(["user"]);
  await expect(page).toHaveURL(/\/login\?reason=registered/);
  await expect(page.getByRole("status")).toContainText(
    "Account created successfully",
  );
  expect(
    (await context.cookies()).some(
      (cookie) => cookie.name === "growmer_session",
    ),
  ).toBe(false);
  async function login() {
    await page.getByLabel("Work email", { exact: true }).fill(email);
    await page
      .getByLabel("Password", { exact: true })
      .fill("My demo passphrase 123!");
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByTestId("current-role")).toHaveText("employee");
  }
  await login();
  expect(
    (await context.cookies()).find(
      (cookie) => cookie.name === "growmer_session",
    )?.httpOnly,
  ).toBe(true);
  await page.goto("/profile");
  await expect(
    page.getByRole("heading", { name: "Samira Patel", exact: true }),
  ).toBeVisible();
  await expect(page.getByText(email, { exact: true })).toBeVisible();
  await expect(
    page.getByText("Account not provided", { exact: false }),
  ).toBeVisible();
  await page.goto("/payslip");
  await expect(page.getByText("No payslip for this period")).toBeVisible();
  await page
    .getByRole("button", { name: "Sign out", exact: true })
    .filter({ visible: true })
    .click();
  await expect(page).toHaveURL(/reason=logged-out/);
  await login();
});
test("duplicate registration retains form entries and shows a clear error", async ({
  page,
}) => {
  await page.goto("/register");
  await fillRegistration(page, "aarav.mehta@example.com");
  await page
    .getByRole("button", { name: "Create account", exact: true })
    .click();
  await expect(page.getByRole("main").getByRole("alert")).toContainText(
    "already exists",
  );
  await expect(page.getByLabel("Work email", { exact: true })).toHaveValue(
    "aarav.mehta@example.com",
  );
});
test("registration APIs reject cross-origin requests and role escalation", async ({
  request,
  baseURL,
}) => {
  const input = {
    name: "Samira Patel",
    email: "samira-" + randomUUID() + "@example.com",
    password: "My demo passphrase 123!",
  };
  expect(
    (
      await request.post("/api/auth/register", {
        headers: { Origin: "https://evil.example" },
        data: input,
      })
    ).status(),
  ).toBe(403);
  expect(
    (
      await request.post("/api/auth/register", {
        headers: { Origin: baseURL! },
        data: { ...input, role: "admin" },
      })
    ).status(),
  ).toBe(422);
});
test("signed-in users are redirected away from registration", async ({
  page,
}) => {
  await signIn(page);
  await page.goto("/register");
  await expect(page).toHaveURL(/\/dashboard$/);
});
test("registration fits mobile and shares the portal theme", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/register");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "docs/designs/screenshots/registration-mobile.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Toggle color theme" }).click();
  const theme = await page.locator("html").getAttribute("class");
  await page.getByRole("link", { name: "Sign in", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("class", theme!);
});

test("authentication forms remain disabled until client initialization attaches submit handlers", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL,
    javaScriptEnabled: false,
  });
  try {
    const page = await context.newPage();
    await page.goto("/login");
    await expect(
      page.getByRole("button", { name: "Sign in", exact: true }),
    ).toBeDisabled();
    await expect(page.getByLabel("Work email", { exact: true })).toBeDisabled();
    await page.goto("/register");
    await expect(
      page.getByRole("button", { name: "Create account", exact: true }),
    ).toBeDisabled();
    await expect(page.getByLabel("Password", { exact: true })).toBeDisabled();
  } finally {
    await context.close();
  }
});
