import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class SettingsPage extends BasePage {
  readonly profileSection: Locator;
  readonly rolesPermissionSection: Locator;
  readonly notificationSettings: Locator;
  readonly saveSettingsBtn: Locator;

  constructor(page: Page) {
    super(page);
    this.profileSection = page.locator('.profile-settings, #profile-tab');
    this.rolesPermissionSection = page.locator('.roles-settings, #roles-tab');
    this.notificationSettings = page.locator('.notification-settings, #notifications');
    this.saveSettingsBtn = page.locator('button:has-text("Save Changes"), button.save-settings');
  }

  async goto(): Promise<void> {
    await this.navigateTo('/settings');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async saveSettings(): Promise<void> {
    await this.click(this.saveSettingsBtn, 'Save Settings Button');
  }
}
