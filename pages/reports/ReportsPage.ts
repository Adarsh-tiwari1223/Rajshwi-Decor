import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class ReportsPage extends BasePage {
  readonly dateRangeFilter: Locator;
  readonly exportReportBtn: Locator;
  readonly reportTable: Locator;
  readonly filterApplyBtn: Locator;

  constructor(page: Page) {
    super(page);
    this.dateRangeFilter = page.locator('.date-filter, input[name="daterange"]');
    this.exportReportBtn = page.locator('button:has-text("Export"), button:has-text("Download")');
    this.reportTable = page.locator('table, .report-data-table');
    this.filterApplyBtn = page.locator('button:has-text("Apply"), button:has-text("Filter")');
  }

  async goto(): Promise<void> {
    await this.navigateTo('/reports');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async exportReport(): Promise<void> {
    await this.click(this.exportReportBtn, 'Export Report Button');
  }
}
