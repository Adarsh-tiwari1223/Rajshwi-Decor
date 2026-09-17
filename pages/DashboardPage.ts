import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class DashboardPage extends BasePage {
  readonly userProfileName: Locator;
  readonly logoutButton: Locator;
  readonly navigationMenu: Locator;
  readonly userCardList: Locator;

  constructor(page: Page) {
    super(page);
    this.userProfileName = page.locator('.user-profile, .user-name, #profile');
    this.logoutButton = page.locator('button:has-text("Logout"), a:has-text("Logout")');
    this.navigationMenu = page.locator('nav, .navbar, .sidebar');
    this.userCardList = page.locator('.user-card, .card, table tr');
  }

  async logout(): Promise<void> {
    await this.click(this.logoutButton, 'Logout Button');
  }

  async getUserCount(): Promise<number> {
    return this.userCardList.count();
  }
}
