import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class LeadPage extends BasePage {
  readonly leadListTable: Locator;
  readonly createLeadBtn: Locator;
  readonly searchInput: Locator;
  readonly filterDropdown: Locator;
  readonly leadNameInput: Locator;
  readonly leadPhoneInput: Locator;
  readonly leadEmailInput: Locator;
  readonly saveLeadBtn: Locator;

  constructor(page: Page) {
    super(page);
    this.leadListTable = page.locator('table, .p-datatable, .lead-table');
    this.createLeadBtn = page.locator('button:has-text("Add Lead"), button:has-text("Create Lead"), button.create-lead');
    this.searchInput = page.locator('input[placeholder*="Search"], input.search-input');
    this.filterDropdown = page.locator('.p-dropdown, select.lead-filter');
    this.leadNameInput = page.locator('input[name="name"], #leadName');
    this.leadPhoneInput = page.locator('input[name="phone"], #leadPhone');
    this.leadEmailInput = page.locator('input[name="email"], #leadEmail');
    this.saveLeadBtn = page.locator('button:has-text("Save"), button[type="submit"]');
  }

  async goto(): Promise<void> {
    await this.navigateTo('/lead');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async searchLead(query: string): Promise<void> {
    await this.type(this.searchInput, query, 'Lead Search Box');
  }

  async clickCreateLead(): Promise<void> {
    await this.click(this.createLeadBtn, 'Add Lead Button');
  }
}
