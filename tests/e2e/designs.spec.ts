import { test, expect } from "@playwright/test";
const screens = ["login", "dashboard", "profile", "payslip", "documents"];
test("all selected screens expose four states and a distinct alternative", async ({
  page,
}) => {
  await page.goto("/designs");
  for (const screen of screens) {
    await page.getByLabel("Preview screen").selectOption(screen);
    for (const state of ["normal", "loading", "empty", "error"]) {
      await page.getByLabel("Preview state").selectOption(state);
      const region = page.getByRole("region", {
        name: screen.charAt(0).toUpperCase() + screen.slice(1) + " design",
      });
      await expect(region).toBeVisible();
      if (state === "error")
        await expect(region.getByRole("alert")).toBeVisible();
      if (state === "loading")
        await expect(region.getByRole("status")).toBeVisible();
      if (screen === "login" && state === "empty")
        await expect(
          page.getByLabel("Work email", { exact: true }),
        ).toHaveValue("");
      await page.screenshot({
        path: "docs/designs/screenshots/" + screen + "-" + state + ".png",
        fullPage: true,
      });
    }
    await page.getByLabel("Preview state").selectOption("normal");
    await page.getByLabel("Design direction").selectOption("alternative");
    await page.screenshot({
      path: "docs/designs/screenshots/" + screen + "-alternative.png",
      fullPage: true,
    });
  }
});
test("prototype interactions and themes remain honest and usable", async ({
  page,
}) => {
  await page.goto("/designs");
  await page.getByLabel("Preview screen").selectOption("login");
  await page
    .getByRole("button", { name: "Show password", exact: true })
    .click();
  await expect(page.getByLabel("Password", { exact: true })).toHaveAttribute(
    "type",
    "text",
  );
  await page.getByLabel("Preview screen").selectOption("profile");
  await page.getByRole("button", { name: "Edit preview", exact: true }).click();
  await page
    .getByLabel("Work email", { exact: true })
    .fill("aarav.demo@example.com");
  await page.getByRole("button", { name: "Save preview", exact: true }).click();
  await expect(
    page.getByText("aarav.demo@example.com", { exact: true }),
  ).toBeVisible();
  await page.getByLabel("Preview screen").selectOption("payslip");
  await page.getByLabel("Pay period").selectOption("August 2026");
  await expect(page.getByText("No payslip for this period")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Download PDF" }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Toggle color theme" }).click();
  const theme = await page.locator("html").getAttribute("class");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("class", theme!);
});
test("mobile designs fit the viewport and expose every screen", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/designs");
  for (const screen of screens) {
    await page.getByLabel("Preview screen").selectOption(screen);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: "docs/designs/screenshots/" + screen + "-mobile.png",
      fullPage: true,
    });
  }
  await page.getByRole("button", { name: "Open design navigation" }).click();
  await page
    .getByRole("navigation", { name: "Mobile design screens" })
    .getByRole("button", { name: "Login", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Sign in to Growmer" }),
  ).toBeVisible();
});
test("dark normal designs have readable surfaces", async ({ page }) => {
  await page.goto("/designs");
  await page.getByRole("button", { name: "Toggle color theme" }).click();
  for (const screen of screens) {
    await page.getByLabel("Preview screen").selectOption(screen);
    await page.screenshot({
      path: "docs/designs/screenshots/" + screen + "-dark.png",
      fullPage: true,
    });
  }
});
