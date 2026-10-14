import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "@playwright/test";

const baseURL = process.env.PERF_BASE_URL || "http://localhost:3006";
assert.ok(
  ["localhost", "127.0.0.1", "[::1]"].includes(new URL(baseURL).hostname),
  "Run the mock-account performance check against localhost.",
);
const samples = Number(process.env.PERF_SAMPLES || 3);
assert.ok(
  Number.isInteger(samples) && samples >= 3 && samples <= 10,
  "PERF_SAMPLES must be an integer from 3 to 10.",
);
const profile = {
  viewport: { width: 1365, height: 900 },
  latencyMs: 150,
  downloadBytesPerSecond: 200000,
  uploadBytesPerSecond: 93750,
  cpuSlowdown: 4,
};
// Project-specific lab targets. These are not field Core Web Vitals thresholds.
const budgets = { fcpMs: 1800, skeletonMs: 1800, readyMs: 6000, cls: 0.1 };
const routes = ["/login", "/dashboard", "/documents"];
const records = [];
const failures = [];
const serverRenderedSkeletons = {};
const browser = await chromium.launch({ headless: true });
const browserVersion = browser.version();

async function authenticate(context) {
  const response = await context.request.post("/api/auth/login", {
    headers: { Origin: new URL(baseURL).origin },
    data: { email: "aarav.mehta@example.com", password: "Employee123!" },
  });
  assert.ok(
    response.ok(),
    "Start the production app with demo authentication enabled.",
  );
}

async function measure(route, sample) {
  // New contexts have no page, asset or client-query cache. Only the authentication
  // cookie is populated via the request client; login duration is excluded here.
  const context = await browser.newContext({
    baseURL,
    viewport: profile.viewport,
    serviceWorkers: "block",
  });
  try {
    if (route !== "/login") await authenticate(context);
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const cdp = await context.newCDPSession(page);
    await cdp.send("Network.enable");
    await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
    await cdp.send("Network.emulateNetworkConditions", {
      offline: false,
      latency: profile.latencyMs,
      downloadThroughput: profile.downloadBytesPerSecond,
      uploadThroughput: profile.uploadBytesPerSecond,
      connectionType: "cellular4g",
    });
    await cdp.send("Emulation.setCPUThrottlingRate", {
      rate: profile.cpuSlowdown,
    });
    await page.addInitScript((route) => {
      window.growmerPerf = {
        skeletonMs: null,
        readyMs: null,
        cls: 0,
        observedLcpMs: null,
      };
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries())
          if (!entry.hadRecentInput) window.growmerPerf.cls += entry.value;
      }).observe({ type: "layout-shift", buffered: true });
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries())
          window.growmerPerf.observedLcpMs = entry.startTime;
      }).observe({ type: "largest-contentful-paint", buffered: true });
      function visible(element) {
        if (!element) return false;
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return (
          rect.width > 0 &&
          rect.height > 0 &&
          style.visibility !== "hidden" &&
          style.opacity !== "0"
        );
      }
      function frame() {
        const state = window.growmerPerf;
        const skeletonName =
          route === "/documents" ? "Loading documents" : "Loading dashboard";
        const skeleton = [...document.querySelectorAll('[role="status"]')].find(
          (element) =>
            element.getAttribute("aria-label") === skeletonName &&
            visible(element),
        );
        if (state.skeletonMs === null && skeleton)
          state.skeletonMs = performance.now();
        const ready =
          route === "/login"
            ? document.querySelector('button[type="submit"]:not(:disabled)')
            : route === "/documents"
              ? document.querySelector("main table")
              : [...document.querySelectorAll("main button")].find(
                  (element) => element.textContent.trim() === "View payslip",
                );
        if (visible(ready)) state.readyMs = performance.now();
        else requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    }, route);
    const response = await page.goto(route, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });
    assert.equal(response.status(), 200);
    await page.waitForFunction(
      () => window.growmerPerf.readyMs !== null,
      undefined,
      { timeout: 30000 },
    );
    // Let the content's paint observers settle; this is an observed LCP candidate,
    // not a final field LCP or an official time-to-interactive measurement.
    await page.evaluate(
      () =>
        new Promise((done) =>
          requestAnimationFrame(() => requestAnimationFrame(done)),
        ),
    );
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType("navigation")[0];
      const state = window.growmerPerf;
      return {
        ...state,
        fcpMs:
          performance.getEntriesByName("first-contentful-paint")[0]
            ?.startTime ?? null,
        ttfbMs: navigation.responseStart,
        jsTransferBytesThroughReady: performance
          .getEntriesByType("resource")
          .filter(
            (resource) =>
              new URL(resource.name).pathname.endsWith(".js") &&
              resource.responseEnd <= state.readyMs,
          )
          .reduce((sum, resource) => sum + resource.transferSize, 0),
      };
    });
    assert.deepEqual(errors, [], "Unexpected browser errors");
    const result = { route, sample, ...metrics };
    records.push(result);
    for (const [metric, limit] of Object.entries(budgets)) {
      if (metric === "skeletonMs" && route === "/login") continue;
      if (result[metric] === null || result[metric] > limit)
        failures.push(
          route +
            " sample " +
            sample +
            ": " +
            metric +
            "=" +
            result[metric] +
            " exceeds " +
            limit,
        );
    }
    console.log(JSON.stringify(result));
  } finally {
    await context.close();
  }
}

try {
  for (let sample = 1; sample <= samples; sample++) {
    for (const route of routes) await measure(route, sample);
  }
  // Prove useful placeholders are in server-rendered HTML, independent of hydration.
  const context = await browser.newContext({
    baseURL,
    viewport: profile.viewport,
    javaScriptEnabled: false,
  });
  try {
    await authenticate(context);
    const page = await context.newPage();
    for (const [route, name] of [
      ["/dashboard", "Loading dashboard"],
      ["/documents", "Loading documents"],
    ]) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      const visible = await page
        .locator('[aria-label="' + name + '"]:visible')
        .count();
      serverRenderedSkeletons[route] = visible > 0;
      assert.ok(
        visible > 0,
        route + " must display a skeleton without JavaScript",
      );
    }
  } finally {
    await context.close();
  }
} catch (error) {
  failures.push(error instanceof Error ? error.message : String(error));
} finally {
  await browser.close();
  const summary = routes.map((route) => {
    const rows = records.filter((record) => record.route === route);
    const values = (key) =>
      rows
        .map((row) => row[key])
        .filter((value) => value !== null)
        .sort((a, b) => a - b);
    const median = (key) => {
      const items = values(key);
      const mid = Math.floor(items.length / 2);
      return items.length
        ? items.length % 2
          ? items[mid]
          : (items[mid - 1] + items[mid]) / 2
        : null;
    };
    const max = (key) => {
      const items = values(key);
      return items.length ? items.at(-1) : null;
    };
    return {
      route,
      samples: rows.length,
      fcpMedianMs: median("fcpMs"),
      fcpMaxMs: max("fcpMs"),
      skeletonMedianMs: median("skeletonMs"),
      skeletonMaxMs: max("skeletonMs"),
      readyMedianMs: median("readyMs"),
      readyMaxMs: max("readyMs"),
      clsMax: max("cls"),
    };
  });
  const report = {
    capturedAt: new Date().toISOString(),
    baseURL,
    browserVersion,
    nodeVersion: process.version,
    cache:
      "New browser context per navigation; HTTP cache disabled; service workers blocked; warm running server",
    profile,
    budgets,
    serverRenderedSkeletons,
    summary,
    records,
    failures,
  };
  const directory = resolve("test-results/performance");
  mkdirSync(directory, { recursive: true });
  writeFileSync(
    resolve(directory, "cold-load.json"),
    JSON.stringify(report, null, 2) + "\n",
  );
  console.table(summary);
  console.log("Raw measurements: test-results/performance/cold-load.json");
  if (failures.length) {
    console.error(failures.join("\n"));
    process.exitCode = 1;
  } else
    console.log(
      "All cold-load budgets and server-rendered skeleton checks passed.",
    );
}
