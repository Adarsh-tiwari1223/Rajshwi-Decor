import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export interface LoginHistoryRowData {
  sNo: string;
  name: string;
  email: string;
  loginCount: string;
  status: string;
  hasHistoryBtn: boolean;
}

export class LoginHistoryPage extends BasePage {
  // Sidebar Navigation
  readonly reportsMenuButton: Locator;
  readonly loginHistorySubmenuLink: Locator;

  // Header & Title
  readonly pageHeading: Locator;

  // Filter Accordion
  readonly filterAccordionHeader: Locator;
  readonly filterAccordionContent: Locator;

  // Table Controls
  readonly globalSearchInput: Locator;
  readonly dataTable: Locator;
  readonly tableHeaders: Locator;
  readonly tableRows: Locator;

  // History Detail Dialog
  readonly historyDialog: Locator;
  readonly dialogTitle: Locator;
  readonly dialogCloseBtn: Locator;
  readonly dialogTable: Locator;
  readonly dialogRows: Locator;

  // Paginator
  readonly paginator: Locator;
  readonly paginatorCurrentText: Locator;
  readonly firstPageBtn: Locator;
  readonly prevPageBtn: Locator;
  readonly nextPageBtn: Locator;
  readonly lastPageBtn: Locator;
  readonly rowsPerPageDropdown: Locator;

  constructor(page: Page) {
    super(page);

    // Sidebar
    this.reportsMenuButton = page.locator('button.rajasvi-menu-link:has-text("Reports"), button:has-text("Reports")').first();
    this.loginHistorySubmenuLink = page.locator('a[href="/loginHistory"], a:has-text("Login History")').first();

    // Header
    this.pageHeading = page.locator('h4:has-text("Login History"), h4:has-text("LOGIN HISTORY")');

    // Filter Accordion
    this.filterAccordionHeader = page.locator('.p-accordion-header-link:has-text("Filter")').first();
    this.filterAccordionContent = page.locator('.p-accordion-content');

    // Table
    this.globalSearchInput = page.locator('.p-datatable-header input[type="search"]');
    this.dataTable = page.locator('table.p-datatable-table');
    this.tableHeaders = page.locator('thead.p-datatable-thead th');
    this.tableRows = page.locator('tbody.p-datatable-tbody tr[role="row"]');

    // History Modal
    this.historyDialog = page.locator('.p-dialog:has(.p-dialog-title:has-text("History")), .p-dialog:has(.p-dialog-title:has-text("Login"))');
    this.dialogTitle = page.locator('.p-dialog-title');
    this.dialogCloseBtn = page.locator('.p-dialog-header-close');
    this.dialogTable = page.locator('.p-dialog:visible table');
    this.dialogRows = page.locator('.p-dialog:visible tbody tr');

    // Paginator
    this.paginator = page.locator('.p-paginator');
    this.paginatorCurrentText = page.locator('.p-paginator-current');
    this.firstPageBtn = page.locator('button.p-paginator-first');
    this.prevPageBtn = page.locator('button.p-paginator-prev');
    this.nextPageBtn = page.locator('button.p-paginator-next');
    this.lastPageBtn = page.locator('button.p-paginator-last');
    this.rowsPerPageDropdown = page.locator('.p-paginator .p-dropdown');
  }

  /**
   * Wait for table data to finish loading and spinner to disappear
   */
  async waitForTableLoaded(): Promise<void> {
    // Wait for any loading spinner / overlay to disappear
    const spinner = this.page.locator('.p-progress-spinner, .p-datatable-loading-overlay, .pi-spin, [class*="spinner"], [class*="loader"], .p-blockui');
    await spinner.first().waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});

    // Wait for data table rows to render and paginator to stabilize
    await this.page.waitForFunction(() => {
      const rows = document.querySelectorAll('tbody.p-datatable-tbody tr[role="row"]');
      const paginatorText = document.querySelector('.p-paginator-current')?.textContent || '';
      return rows.length > 0 || (paginatorText.includes('Showing') && !paginatorText.includes('0 to 0 of 0'));
    }, { timeout: 15000 }).catch(() => {});

    await this.page.waitForTimeout(500);
  }

  /**
   * Navigate directly to /loginHistory
   */
  async goto(): Promise<void> {
    await this.navigateTo('/loginHistory');
    await this.page.waitForLoadState('domcontentloaded');
    await this.dataTable.waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
    await this.waitForTableLoaded();
  }

  /**
   * Navigate via sidebar menu: Reports -> Login History
   */
  async navigateViaSidebar(): Promise<void> {
    await this.reportsMenuButton.waitFor({ state: 'visible', timeout: 10000 });
    const isSubmenuVisible = await this.loginHistorySubmenuLink.isVisible().catch(() => false);
    if (!isSubmenuVisible) {
      await this.click(this.reportsMenuButton, 'Reports Sidebar Menu');
      await this.loginHistorySubmenuLink.waitFor({ state: 'visible', timeout: 5000 });
    }
    await this.click(this.loginHistorySubmenuLink, 'Login History Submenu Link');
    await this.page.waitForURL('**/loginHistory**', { timeout: 15000 });
    await this.waitForTableLoaded();
  }

  /**
   * Search by text using global search input
   */
  async searchGlobal(query: string): Promise<void> {
    await this.globalSearchInput.waitFor({ state: 'visible', timeout: 5000 });
    await this.globalSearchInput.click();
    await this.globalSearchInput.fill(query);
    await this.globalSearchInput.dispatchEvent('input').catch(() => {});
    await this.page.waitForTimeout(800);
  }

  /**
   * Clear global search input and wait for table to reset
   */
  async clearGlobalSearch(): Promise<void> {
    await this.globalSearchInput.click();
    await this.globalSearchInput.fill('');
    await this.globalSearchInput.dispatchEvent('input').catch(() => {});
    await this.globalSearchInput.press('Backspace').catch(() => {});
    await this.globalSearchInput.press('Enter').catch(() => {});
    await this.waitForTableLoaded();
  }

  /**
   * Get all visible column header titles
   */
  async getColumnTitles(): Promise<string[]> {
    await this.tableHeaders.first().waitFor({ state: 'visible', timeout: 10000 });
    const texts = await this.tableHeaders.allInnerTexts();
    return texts.map(t => t.trim()).filter(Boolean);
  }

  /**
   * Get total row count in data table
   */
  async getRowCount(): Promise<number> {
    return this.tableRows.count();
  }

  /**
   * Extract row data by index
   */
  async getRowData(index = 0): Promise<LoginHistoryRowData> {
    const row = this.tableRows.nth(index);
    const cells = row.locator('td');
    const eyeBtn = cells.nth(5).locator('button');
    const hasHistoryBtn = (await eyeBtn.count()) > 0;

    return {
      sNo: (await cells.nth(0).innerText()).trim(),
      name: (await cells.nth(1).innerText()).trim(),
      email: (await cells.nth(2).innerText()).trim(),
      loginCount: (await cells.nth(3).innerText()).trim(),
      status: (await cells.nth(4).innerText()).trim(),
      hasHistoryBtn
    };
  }

  /**
   * Click the Eye action button in History column for a row
   */
  async clickHistoryButton(index = 0): Promise<void> {
    const eyeBtn = this.tableRows.nth(index).locator('td').nth(5).locator('button');
    await eyeBtn.scrollIntoViewIfNeeded().catch(() => {});
    await this.click(eyeBtn, `History button for row ${index + 1}`);
    await this.historyDialog.waitFor({ state: 'visible', timeout: 8000 });
  }

  /**
   * Close the History modal
   */
  async closeHistoryDialog(): Promise<void> {
    await this.dialogCloseBtn.click();
    await this.historyDialog.waitFor({ state: 'hidden', timeout: 5000 });
  }

  /**
   * Read pagination text (e.g. "Showing 1 to 19 of 19")
   */
  async getPaginationText(): Promise<string> {
    return (await this.paginatorCurrentText.innerText()).trim();
  }
}
