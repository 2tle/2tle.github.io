// These tests use file fixtures only: no browser, web server or screenshots.
import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  testMatch: "content.spec.mjs",
  fullyParallel: true,
  workers: 2,
  reporter: "list",
  timeout: 30000,
});
