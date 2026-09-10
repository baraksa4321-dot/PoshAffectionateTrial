import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.GYMTRACK_SMOKE_PORT || 4173);

export default defineConfig({
  testDir: ".",
  testMatch: "authenticated-ios.pw.mjs",
  timeout: 45_000,
  expect: {
    timeout: 8_000,
  },
  fullyParallel: false,
  workers: 1,
  // A single retry absorbs transient WebKit process/context failures while
  // keeping repeated application failures visible in the release gate.
  retries: 1,
  reporter: [["list"]],
  projects: [
    {
      name: "webkit-iphone",
      use: {
        ...devices["iPhone 13"],
        browserName: "webkit",
      },
    },
    {
      name: "webkit-desktop",
      use: {
        ...devices["Desktop Safari"],
        browserName: "webkit",
      },
    },
  ],
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    locale: "he-IL",
    timezoneId: "Asia/Jerusalem",
    colorScheme: "light",
    trace: "retain-on-failure",
  },
});
