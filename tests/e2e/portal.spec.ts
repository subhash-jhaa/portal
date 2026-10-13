import { test, expect } from "@playwright/test";
test("portal loads browser mocks, creates a project, and retains its theme", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByText("Customer portal", { exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: "test-results/overview-light.png",
    fullPage: true,
  });
  await page
    .getByRole("navigation", { name: "Main navigation", exact: true })
    .getByRole("link", { name: "Projects" })
    .click();
  await page.getByRole("button", { name: "New project" }).click();
  await page
    .getByLabel("Project name", { exact: true })
    .fill("Browser initiative");
  await page.getByLabel("Owner", { exact: true }).fill("Platform team");
  await page
    .getByLabel("Description", { exact: true })
    .fill("Created through the API");
  await page
    .getByRole("button", { name: "Create project", exact: true })
    .click();
  await expect(
    page.getByText("Browser initiative", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Toggle color theme" }).click();
  await page.screenshot({
    path: "test-results/projects-theme.png",
    fullPage: true,
  });
  const theme = await page.locator("html").getAttribute("class");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("class", theme!);
  await expect(
    page.getByText("Customer portal", { exact: true }),
  ).toBeVisible();
});
test("empty search and mobile navigation", async ({ page }) => {
  await page.goto("/projects");
  await expect(
    page.getByText("Customer portal", { exact: true }),
  ).toBeVisible();
  await page.getByRole("textbox", { name: "Search projects" }).fill("zzzzzz");
  await expect(page.getByText("No matching projects")).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page
    .getByRole("navigation", { name: "Mobile navigation" })
    .getByRole("link", { name: "Overview" })
    .click();
  await expect(
    page.getByRole("heading", { name: "A clear view of what’s next." }),
  ).toBeVisible();
});

test("health endpoint reports frontend liveness", async ({ request }) => {
  const response = await request.get("/health");
  expect(response.status()).toBe(200);
  expect(await response.json()).toEqual({ status: "ok" });
});
