import { Page, Locator, expect } from '@playwright/test';
import { logger } from '../utils/logger';

export abstract class BasePage {
  constructor(public readonly page: Page) {}

  async navigateTo(path: string): Promise<void> {
    logger.info(`Navigating to page: ${path}`);
    await this.page.goto(path, { waitUntil: 'domcontentloaded' });
  }

  async click(locator: Locator, description?: string): Promise<void> {
    if (description) {
      logger.info(`Clicking element: ${description}`);
    }
    await locator.waitFor({ state: 'visible' });
    await locator.click();
  }

  async type(locator: Locator, text: string, description?: string): Promise<void> {
    if (description) {
      logger.info(`Typing into ${description}: ${text}`);
    }
    await locator.waitFor({ state: 'visible' });
    await locator.fill(text);
  }

  async fill(locator: Locator, text: string, description?: string): Promise<void> {
    if (description) {
      logger.info(`Filling ${description}: ${text}`);
    }
    await locator.waitFor({ state: 'visible' });
    await locator.fill(text);
  }

  async getText(locator: Locator): Promise<string> {
    await locator.waitFor({ state: 'visible' });
    return (await locator.textContent()) || '';
  }

  async isVisible(locator: Locator): Promise<boolean> {
    return locator.isVisible();
  }

  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }
}
