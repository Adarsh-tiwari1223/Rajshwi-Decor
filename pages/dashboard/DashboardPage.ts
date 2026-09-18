import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class DashboardPage extends BasePage {
  readonly pageHeader: Locator;
  readonly statCards: Locator;
  readonly recentLeadsSection: Locator;
  readonly analyticsWidget: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeader = page.locator('h1, h2:has-text("Dashboard"), .dashboard-title');
    this.statCards = page.locator('.stat-card, .metric-card, .p-card');
    this.recentLeadsSection = page.locator('.recent-leads, [data-testid="recent-leads"]');
    this.analyticsWidget = page.locator('.chart-container, .analytics-widget');
  }

  async goto(): Promise<void> {
    await this.navigateTo('/dashboard');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async getStatCardCount(): Promise<number> {
    return this.statCards.count();
  }
}
