import { test as base } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { DashboardPage } from '../../pages/DashboardPage';
import { UserApiClient } from '../api/UserApiClient';
import { GoogleSheetsService } from '../../utils/googleSheets';
import { GoogleDriveService } from '../../utils/googleDrive';

type CustomFixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  userApiClient: UserApiClient;
  googleSheetsService: GoogleSheetsService;
  googleDriveService: GoogleDriveService;
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
  },

  googleDriveService: async ({}, use) => {
    const driveService = new GoogleDriveService();
    await driveService.initialize();
    await use(driveService);
  }
});

export { expect } from '@playwright/test';
