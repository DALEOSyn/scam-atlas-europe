import { defineConfig, devices } from '@playwright/test';

/**
 * E2E runs against the production build (vite preview), so the CSP and
 * service worker are exercised. Locally, browsers come from
 * PLAYWRIGHT_BROWSERS_PATH; set PW_CHROMIUM_PATH to force a binary if the
 * installed revision does not match. Always run with `--trace off`.
 */
const executablePath = process.env.PW_CHROMIUM_PATH;

/**
 * Port for the preview server the e2e tests run against. Default 4173; set PW_PORT to give each git
 * worktree its own port (e.g. PW_PORT=4199 npm run e2e), so parallel runs never share or kill a server.
 */
const port = Number(process.env['PW_PORT'] ?? 4173);
if (!Number.isInteger(port) || port < 1024 || port > 65534) throw new Error(`PW_PORT must be a port number 1024–65534 (the harness uses PW_PORT + 1), got "${process.env['PW_PORT']}"`);
const baseURL = `http://127.0.0.1:${port}`;
/** The scene-engine harness (tests/e2e/harness, test-only build) runs on the next port. */
export const HARNESS_URL = `http://127.0.0.1:${port + 1}`;

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL,
    trace: 'off',
    ...(executablePath ? { launchOptions: { executablePath } } : {}),
  },
  projects: [
    { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chromium', use: { ...devices['Pixel 7'] } },
  ],
  webServer: [
    {
      command: `npm run build && npx vite preview --port ${port} --strictPort --host 127.0.0.1`,
      url: baseURL,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: `npx vite build -c vite.harness.config.ts && npx vite preview -c vite.harness.config.ts --port ${port + 1} --strictPort --host 127.0.0.1`,
      url: HARNESS_URL,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
