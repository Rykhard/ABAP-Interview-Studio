const {defineConfig} = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests/browser',
  globalSetup: './tests/serve.cjs',
  fullyParallel: true,
  workers: process.env.CI ? 2 : undefined,
  retries: 0,
  timeout: 30_000,
  globalTimeout: 180_000,
  use: {
    baseURL: 'http://127.0.0.1:8794',
    headless: true,
    launchOptions: process.env.CHROME_PATH ? {executablePath: process.env.CHROME_PATH} : {},
    trace: 'retain-on-failure',
  },
});
