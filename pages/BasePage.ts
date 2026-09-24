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

  // =========================================================================
  // UNIVERSAL FORM VALIDATION ERROR HELPERS (SHARED ACROSS ALL MODULES)
  // =========================================================================
  /**
   * Universal error reader for ANY field across ANY form in the CRM.
   * Handles PrimeVue standard `<small class="p-error">` and custom styled
   * `<small style="color: rgb(239, 68, 68)...">` error messages.
   *
   * Automatically scopes to active .p-dialog if open, an explicitly passed container,
   * or falls back to the full page body.
   *
   * @param fieldName - The label text or name of the field (e.g. 'Burn Time', 'Mobile', 'Email')
   * @param container - Optional container Locator (e.g. modal dialog, sidebar card)
   */
  async getFieldError(fieldName: string, container?: Locator): Promise<string> {
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

    // Strategy 1: <small> tag that directly mentions the field name
    const directError = scope
      .locator('small.p-error, small[style*="239, 68, 68"], small.text-red-500, small')
      .filter({ hasText: new RegExp(fieldName, 'i') })
      .first();

    if (await directError.isVisible({ timeout: 1500 }).catch(() => false)) {
      return (await directError.innerText()).trim();
    }

    // Strategy 2: <small> tag inside the container that wraps the field's label or input
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
   * Checks if a field has an active visible validation error matching an optional message pattern.
   * @param fieldName - Field label or name
   * @param expectedPattern - Optional string or RegExp to match against error text
   * @param container - Optional container Locator
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
   * @param container - Optional container Locator
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
