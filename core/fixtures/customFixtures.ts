import { test as base } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { DashboardPage } from '../../pages/DashboardPage';
import { UserApiClient } from '../api/UserApiClient';
import { GoogleSheetsService } from '../../utils/googleSheets';

type CustomFixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  userApiClient: UserApiClient;
  googleSheetsService: GoogleSheetsService;
};

export const test = base.extend<CustomFixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  dashboardPage: async ({ page }, use) => {
    const dashboardPage = new DashboardPage(page);
    await use(dashboardPage);
  },

  userApiClient: async ({ request }, use) => {
    const userApiClient = new UserApiClient(request);
    await use(userApiClient);
  },

  googleSheetsService: async ({}, use) => {
    const sheetsService = new GoogleSheetsService();
    await sheetsService.initialize();
    await use(sheetsService);
  }
});

export { expect } from '@playwright/test';
