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

  /**
   * Retrieves the validation error message for a specific field by its label or name.
   * Supports both PrimeVue standard (<small class="p-error">) and inline colored (<small style="...rgb(239, 68, 68)...">).
   */
  async getFieldError(fieldName: string, container?: Locator): Promise<string> {
    const scope = container || this.page.locator('.p-dialog:visible').last();
    
    // Strategy 1: Error message following label/input by fieldName
    const directError = scope
      .locator(`//label[contains(text(), "${fieldName}")]/following-sibling::small | //label[contains(text(), "${fieldName}")]/..//small`)
      .first();

    if (await directError.isVisible({ timeout: 1500 }).catch(() => false)) {
      return (await directError.innerText()).trim();
    }

    // Strategy 2: <small> tag inside the container wrapping the field
    const containerError = scope
      .locator(`div:has(> label:has-text("${fieldName}")), div:has(> span:has-text("${fieldName}"))`)
      .locator('small.p-error, small[style*="239, 68, 68"], small')
      .first();

    if (await containerError.isVisible({ timeout: 1500 }).catch(() => false)) {
      return (await containerError.innerText()).trim();
    }

    return '';
  }

  /**
   * Checks if a field has an active visible validation error matching an optional pattern.
   */
  async hasFieldError(fieldName: string, expectedPattern?: string | RegExp, container?: Locator): Promise<boolean> {
    const errorText = await this.getFieldError(fieldName, container);
    if (!errorText) return false;
    if (!expectedPattern) return true;
    if (typeof expectedPattern === 'string') {
      return errorText.toLowerCase().includes(expectedPattern.toLowerCase());
    }
    return expectedPattern.test(errorText);
  }

  /**
   * Returns a list of all currently visible error messages on the active page or modal.
   */
  async getAllVisibleErrors(container?: Locator): Promise<string[]> {
    let scope: Locator;
    if (container) {
      scope = container;
    } else {
      const activeDialog = this.page.locator('.p-dialog:visible').last();
      if (await activeDialog.isVisible().catch(() => false)) {
        scope = activeDialog;
      } else {
        scope = this.page.locator('body');
      }
    }

    const errorLocators = scope.locator('small.p-error, small[style*="239, 68, 68"], small.text-red-500');
    const count = await errorLocators.count();
    const result: string[] = [];
    for (let i = 0; i < count; i++) {
      const err = errorLocators.nth(i);
      if (await err.isVisible().catch(() => false)) {
        const text = (await err.innerText()).trim();
        if (text && !result.includes(text)) {
          result.push(text);
        }
      }
    }
    return result;
  }
}

