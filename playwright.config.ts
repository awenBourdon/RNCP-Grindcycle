import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
 

  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 2,
  workers: process.env.CI ? 1 : 5,
  reporter: 'html',
  timeout: 120000,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },

  projects: [
  {
    name: 'e2e-tests',
    testDir: './src/tests/e2e',
    use: { ...devices['Desktop Chrome'] },
  },
],

  webServer: {
    command: 'npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: process.env.CI ? 120000 : 30000,
  },
});
