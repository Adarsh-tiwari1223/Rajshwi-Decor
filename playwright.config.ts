import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '.env') });

const BASE_URL = process.env.BASE_URL || 'https://reqres.in';

export default defineConfig({
  testDir: './tests',
  timeout: 60 * 1000,
  expect: {
    timeout: 10000
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [
    ['html', { outputFolder: 'reports/html-report', open: 'never' }],
    ['junit', { outputFile: 'reports/junit.xml' }],
    ['list']
  ],
  use: {
    baseURL: BASE_URL,
    headless: false,
    ignoreHTTPSErrors: true,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    {
      name: 'api-tests',
      testMatch: /.*\.api\.spec\.ts/,
      use: {
        baseURL: process.env.API_BASE_URL || 'https://reqres.in',
        extraHTTPHeaders: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    },
    {
      name: 'chromium-ui',
      testMatch: /.*\.ui\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.BASE_URL || 'https://reqres.in'
      }
    },
    {
      name: 'firefox-ui',
      testMatch: /.*\.ui\.spec\.ts/,
      use: {
        ...devices['Desktop Firefox'],
        baseURL: process.env.BASE_URL || 'https://reqres.in'
      }
    },
    {
      name: 'hybrid-tests',
      testMatch: /.*\.hybrid\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.BASE_URL || 'https://reqres.in'
      }
    }
  ],
  outputDir: 'reports/test-results'
});
