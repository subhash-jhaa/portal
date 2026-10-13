import { test, expect } from "@playwright/test";
import { signIn } from "./auth-helpers";
test("documents page and API require a session", async ({ page, request }) => {
  await page.goto("/documents");
  await expect(page).toHaveURL(/\/login\?returnTo=/);
  expect((await request.get("/api/employee/documents")).status()).toBe(401);
});
test("employee documents show honest metadata and ignore owner overrides", async ({
  page,
}) => {
  await signIn(page);
  await page.getByRole("link", { name: "My Documents", exact: true }).click();
  await expect(page).toHaveURL(/\/documents$/);
  await expect(
    page.getByRole("heading", { name: "My Documents", exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("table")).toBeVisible();
  await expect(
    page
      .getByRole("table")
      .getByText("Employment confirmation.pdf", { exact: true }),
  ).toBeVisible();
  await expect(
    page
      .getByRole("table")
      .getByRole("button", { name: "Preview Employment confirmation.pdf" }),
  ).toBeDisabled();
  const response = await page.request.get(
    "/api/employee/documents?ownerId=GR-1001",
  );
  const data = await response.json();
  expect(data.ownerId).toBe("GR-1042");
  expect(data.items[0].updatedAt).toBe("2026-10-10");
  await page.screenshot({
    path: "docs/designs/screenshots/integrated-documents.png",
    fullPage: true,
  });
});
test("documents show loading, empty and error with working retry", async ({
  page,
}) => {
  await signIn(page);
  await page.goto("/documents?demoState=loading");
  await expect(page.getByLabel("Loading documents")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "My Documents", exact: true }),
  ).toBeVisible();
  await page.goto("/documents?demoState=empty");
  await expect(
    page.getByRole("heading", { name: "No documents yet" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Check again" }).click();
  await expect(page.getByRole("table")).toBeVisible();
  await page.goto("/documents?demoState=error");
  await expect(
    page.getByRole("heading", { name: "Unable to load your documents" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(page.getByRole("table")).toBeVisible();
});
test("documents preserve readable mobile cards and dark theme", async ({
  page,
}) => {
  await signIn(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/documents");
  await expect(
    page.getByRole("heading", {
      name: "Training certificate.pdf",
      exact: true,
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Toggle color theme" }).click();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "docs/designs/screenshots/integrated-documents-mobile-dark.png",
    fullPage: true,
  });
});
test("registered colleagues are discoverable before their first login", async ({
  page,
}) => {
  await signIn(page);
  const email = "directory-persist-" + crypto.randomUUID() + "@example.com";
  const response = await page.request.post("/api/auth/register", {
    headers: { Origin: new URL(page.url()).origin },
    data: { name: "Samira Discovery", email, password: "Employee123!" },
  });
  expect(response.status()).toBe(201);
  const { user } = await response.json();
  await page.goto("/directory?q=" + encodeURIComponent(email));
  await page
    .getByRole("link", { name: "Samira Discovery", exact: true })
    .click();
  await expect(page).toHaveURL(new RegExp("/directory/" + user.id + "$"));
  await expect(page.getByText(email, { exact: true })).toBeVisible();
});
