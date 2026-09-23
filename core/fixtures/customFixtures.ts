import { test as base } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { DashboardPage } from '../../pages/DashboardPage';
import { ContactPage } from '../../pages/lead/ContactPage';
import { MyLeadPage } from '../../pages/lead/MyLeadPage';
import { LeadDetailsPage } from '../../pages/lead/LeadDetailsPage';
import { AuthApiClient } from '../api/AuthApiClient';
import { RoleApiClient } from '../api/RoleApiClient';
import { UserApiClient } from '../api/UserApiClient';
import { DepartmentApiClient } from '../api/DepartmentApiClient';
import { MasterApiClient } from '../api/MasterApiClient';
import { GoogleSheetsService } from '../../utils/googleSheets';
import { GoogleDriveService } from '../../utils/googleDrive';
import { Config } from '../../utils/env';

type CustomFixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  contactPage: ContactPage;
  myLeadPage: MyLeadPage;
  leadDetailsPage: LeadDetailsPage;
  authApiClient: AuthApiClient;
  roleApiClient: RoleApiClient;
  userApiClient: UserApiClient;
  departmentApiClient: DepartmentApiClient;
  masterApiClient: MasterApiClient;
  adminToken: string;
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

  contactPage: async ({ page }, use) => {
    const contactPage = new ContactPage(page);
    await use(contactPage);
  },

  myLeadPage: async ({ page }, use) => {
    const myLeadPage = new MyLeadPage(page);
    await use(myLeadPage);
  },

  leadDetailsPage: async ({ page }, use) => {
    const leadDetailsPage = new LeadDetailsPage(page);
    await use(leadDetailsPage);
  },

  authApiClient: async ({ request }, use) => {
    const authClient = new AuthApiClient(request);
    await use(authClient);
  },

  adminToken: async ({ authApiClient }, use) => {
    const token = await authApiClient.getAuthTokenFor(Config.adminEmail, Config.adminPassword);
    await use(token);
  },

  roleApiClient: async ({ request, adminToken }, use) => {
    const client = new RoleApiClient(request);
    client.setAuthToken(adminToken);
    await use(client);
  },

  userApiClient: async ({ request, adminToken }, use) => {
    const client = new UserApiClient(request);
    client.setAuthToken(adminToken);
    await use(client);
  },

  departmentApiClient: async ({ request, adminToken }, use) => {
    const client = new DepartmentApiClient(request);
    client.setAuthToken(adminToken);
    await use(client);
  },

  masterApiClient: async ({ request, adminToken }, use) => {
    const client = new MasterApiClient(request);
    client.setAuthToken(adminToken);
    await use(client);
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
