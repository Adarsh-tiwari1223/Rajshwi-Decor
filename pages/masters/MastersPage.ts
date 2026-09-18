import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class MastersPage extends BasePage {
  readonly masterTabs: Locator;
  readonly addMasterItemBtn: Locator;
  readonly masterDataTable: Locator;
  readonly masterItemNameInput: Locator;
  readonly saveBtn: Locator;

  constructor(page: Page) {
    super(page);
    this.masterTabs = page.locator('.p-tabview-nav, .nav-tabs, .master-menu-list');
    this.addMasterItemBtn = page.locator('button:has-text("Add New"), button.add-master');
    this.masterDataTable = page.locator('table, .p-datatable');
    this.masterItemNameInput = page.locator('input[name="masterName"], input.master-input');
    this.saveBtn = page.locator('button:has-text("Save"), button[type="submit"]');
  }

  async goto(): Promise<void> {
    await this.navigateTo('/masters');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async selectMasterTab(tabName: string): Promise<void> {
    const tab = this.page.locator(`text="${tabName}"`);
    await this.click(tab, `Master Tab: ${tabName}`);
  }
}
