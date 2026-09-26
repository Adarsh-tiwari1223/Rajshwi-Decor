import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export interface RecentEnquiryData {
  name: string;
  enquiryType: string;
  purpose: string;
  date: string;
  status: string;
}

export interface FunnelStageData {
  stage: string;
  count: number;
  percentage: string;
}

export class DashboardPage extends BasePage {
  // Main Container
  readonly dashboardContainer: Locator;

  // Filter Bar
  readonly dateRangeInput: Locator;
  readonly userFilterDropdown: Locator;

  // Welcome Banner
  readonly welcomeBanner: Locator;
  readonly bannerEyebrow: Locator;
  readonly bannerTitle: Locator;
  readonly bannerSubtitle: Locator;
  readonly bannerTagline: Locator;

  // Stat Cards
  readonly statCards: Locator;

  // Lead Funnel Widget
  readonly leadFunnelCard: Locator;
  readonly leadFunnelTitle: Locator;
  readonly leadFunnelTotalBadge: Locator;
  readonly funnelStageItems: Locator;

  // Recent Enquiries Widget
  readonly recentEnquiriesSection: Locator;
  readonly recentEnquiriesTitle: Locator;
  readonly viewAllEnquiriesBtn: Locator;
  readonly recentEnquiriesTable: Locator;
  readonly recentEnquiriesRows: Locator;

  constructor(page: Page) {
    super(page);

    // Main Container
    this.dashboardContainer = page.locator('.rd-dashboard');

    // Filter Bar
    this.dateRangeInput = page.locator('.rd-dashboard .p-calendar input');
    this.userFilterDropdown = page.locator('.rd-dashboard .p-dropdown');

    // Welcome Banner
    this.welcomeBanner = page.locator('.rd-welcome-banner');
    this.bannerEyebrow = page.locator('.rd-banner-eyebrow');
    this.bannerTitle = page.locator('.rd-banner-title');
    this.bannerSubtitle = page.locator('.rd-banner-subtitle');
    this.bannerTagline = page.locator('.rd-banner-tagline');

    // 8 Stat Cards
    this.statCards = page.locator('.rd-stats .rd-stat-card');

    // Lead Funnel
    this.leadFunnelCard = page.locator('div:has(> div:has-text("Lead funnel"))').first();
    this.leadFunnelTitle = page.locator('h3:has-text("Lead funnel")').first();
    this.leadFunnelTotalBadge = page.locator('div:has(> span:has-text("Total leads")) span').first();
    this.funnelStageItems = page.locator('svg[aria-label="Lead funnel by status"] g');

    // Recent Enquiries
    this.recentEnquiriesSection = page.locator('section:has(h2:has-text("Recent Enquiries"))');
    this.recentEnquiriesTitle = page.locator('h2:has-text("Recent Enquiries")');
    this.viewAllEnquiriesBtn = page.locator('section:has(h2:has-text("Recent Enquiries")) button:has-text("View All")');
    this.recentEnquiriesTable = page.locator('section:has(h2:has-text("Recent Enquiries")) table.p-datatable-table');
    this.recentEnquiriesRows = page.locator('section:has(h2:has-text("Recent Enquiries")) tbody.p-datatable-tbody tr');
  }

  /**
   * Navigate directly to Dashboard (root / or /dashboard)
   */
  async goto(): Promise<void> {
    await this.navigateTo('/');
    await this.page.waitForLoadState('domcontentloaded');
    await this.dashboardContainer.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
  }

  /**
   * Get the dynamic logged-in user greeting text from the welcome banner (<h1 class="rd-banner-title">)
   */
  async getWelcomeBannerGreeting(): Promise<string> {
    await this.bannerTitle.waitFor({ state: 'visible', timeout: 5000 });
    return (await this.bannerTitle.innerText()).trim();
  }

  /**
   * Dynamically assert that the welcome banner reflects the expected logged-in user name
   * @param expectedUserName User display name or first name (e.g. 'Priya Patel', 'Rahul Sharma', 'Admin')
   */
  async verifyWelcomeBannerGreeting(expectedUserName: string): Promise<boolean> {
    const greeting = await this.getWelcomeBannerGreeting();
    // Normalize and clean punctuation (e.g. "Priya Patel!" -> "Priya Patel")
    const cleanGreeting = greeting.replace(/[!.,]/g, '').trim().toLowerCase();
    const cleanExpected = expectedUserName.replace(/[!.,]/g, '').trim().toLowerCase();
    return cleanGreeting.includes(cleanExpected);
  }

  /**
   * Get the numeric value of a specific Stat Card
   * Options: 'New Leads' | 'Calls Made' | 'WhatsApp' | 'Follow-ups' | 'Requirements' | 'Sample Invoices' | 'Sample Sales' | 'Converted Sales'
   */
  async getStatCardValue(statName: string): Promise<number> {
    const card = this.statCards.filter({ has: this.page.locator(`p:has-text("${statName}")`) });
    await card.waitFor({ state: 'visible', timeout: 5000 });
    const text = await card.locator('span[style*="font-size: 27px"], span').last().innerText();
    const parsed = parseInt(text.trim(), 10);
    return isNaN(parsed) ? 0 : parsed;
  }

  /**
   * Get total number of leads shown in the Lead Funnel header
   */
  async getFunnelTotalLeads(): Promise<number> {
    const badge = this.page.locator('div:has(> span:has-text("Total leads")) span').first();
    if (await badge.isVisible({ timeout: 3000 }).catch(() => false)) {
      const text = (await badge.innerText()).trim();
      return parseInt(text, 10) || 0;
    }
    return 0;
  }

  /**
   * Get count for a specific funnel stage (from SVG funnel or 'Other statuses' list)
   */
  async getFunnelStageCount(stageName: string): Promise<number> {
    // 1. Check primary stages in SVG
    const svgGroup = this.page.locator(`svg[aria-label="Lead funnel by status"] g`).filter({ has: this.page.locator(`text:has-text("${stageName}")`) }).first();
    if (await svgGroup.isVisible({ timeout: 1500 }).catch(() => false)) {
      // First <text> element inside stage group contains the numeric count (SVG elements use textContent)
      const countText = (await svgGroup.locator('text').first().textContent()) || '';
      return parseInt(countText.trim(), 10) || 0;
    }

    // 2. Check 'Other statuses' secondary list on the right
    const sideItem = this.page.locator(`div:has(> span[title="${stageName}"])`).first();
    if (await sideItem.isVisible({ timeout: 1500 }).catch(() => false)) {
      const countSpan = sideItem.locator('span').last();
      const countText = (await countSpan.textContent()) || '';
      return parseInt(countText.trim(), 10) || 0;
    }

    return 0;
  }

  /**
   * Get percentage string for a specific funnel stage (e.g. '93%', '4%')
   */
  async getFunnelStagePercentage(stageName: string): Promise<string> {
    const stageRow = this.leadFunnelCard.locator('div').filter({ has: this.page.locator(`span:text-is("${stageName}")`) });
    const textEl = stageRow.locator('span').nth(1);
    if (await textEl.isVisible({ timeout: 2000 }).catch(() => false)) {
      const text = await textEl.innerText();
      const match = text.match(/\d+%/);
      return match ? match[0] : '0%';
    }
    return '0%';
  }

  /**
   * Get row data from Recent Enquiries table by 0-based index
   */
  async getRecentEnquiryRow(index = 0): Promise<RecentEnquiryData> {
    const row = this.recentEnquiriesRows.nth(index);
    await row.waitFor({ state: 'visible', timeout: 5000 });
    const cells = row.locator('td');

    const name = (await cells.nth(0).innerText()).trim();
    const enquiryType = (await cells.nth(1).innerText()).trim();
    const purpose = (await cells.nth(2).innerText()).trim();
    const date = (await cells.nth(3).innerText()).trim();
    const status = (await cells.nth(4).innerText()).trim();

    return { name, enquiryType, purpose, date, status };
  }

  /**
   * Find a row in Recent Enquiries table by contact name
   */
  async findRecentEnquiryByName(contactName: string): Promise<RecentEnquiryData | null> {
    const rowCount = await this.recentEnquiriesRows.count();
    for (let i = 0; i < rowCount; i++) {
      const rowData = await this.getRecentEnquiryRow(i);
      if (rowData.name.toLowerCase().includes(contactName.toLowerCase())) {
        return rowData;
      }
    }
    return null;
  }

  /**
   * Click View All button in Recent Enquiries to navigate to leads
   */
  async clickViewAllEnquiries(): Promise<void> {
    await this.click(this.viewAllEnquiriesBtn, 'View All Enquiries Button');
  }

  /**
   * Get Follow-ups metric directly from stat card
   */
  async getFollowupsStatCardValue(): Promise<number> {
    return this.getStatCardValue('Follow-ups');
  }

  /**
   * Calculate Follow-ups sum: sum(Follow-up Pending + In Follow Up)
   */
  async getCalculatedFollowupsSum(): Promise<number> {
    const pendingCount = await this.getFunnelStageCount('Follow-up Pending');
    const inFollowUpCount = await this.getFunnelStageCount('In Follow Up');
    return pendingCount + inFollowUpCount;
  }
}
