import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export interface LeadProgressRowData {
  sNo: string;
  name: string;
  email: string;
  totalLeads: string;
  created: string;
  calling: string;
  interested: string;
  activated: string;
  convertedToSales: string;
  notInterested: string;
  totalRequirements: string;
  totalInvoices: string;
  invoiceProducts: string;
}

export interface LeadDetailsDialogRow {
  name: string;
  email: string;
  phone: string;
  status: string;
}

export class LeadProgressReportPage extends BasePage {
  // Sidebar Navigation
  readonly reportsMenuButton: Locator;
  readonly leadProgressSubmenuLink: Locator;

  // Header & Title
  readonly pageHeading: Locator;

  // Filter Accordion
  readonly filterAccordionHeader: Locator;
  readonly filterAccordionContent: Locator;
  readonly rangeDropdown: Locator;
  readonly fromDateInput: Locator;
  readonly toDateInput: Locator;
  readonly searchFilterBtn: Locator;
  readonly clearFilterBtn: Locator;

  // Table & Controls
  readonly globalSearchInput: Locator;
  readonly dataTable: Locator;
  readonly tableHeaders: Locator;
  readonly tableRows: Locator;
  readonly tableFooterRow: Locator;

  // Drill-down Modal
  readonly leadDetailsDialog: Locator;
  readonly dialogTitle: Locator;
  readonly dialogCloseBtn: Locator;
  readonly dialogHeaders: Locator;
  readonly dialogRows: Locator;

  // Paginator
  readonly paginator: Locator;
  readonly firstPageBtn: Locator;
  readonly prevPageBtn: Locator;
  readonly nextPageBtn: Locator;
  readonly lastPageBtn: Locator;
  readonly rowsPerPageDropdown: Locator;

  constructor(page: Page) {
    super(page);

    // Sidebar
    this.reportsMenuButton = page.locator('button.rajasvi-menu-link:has-text("Reports"), button:has-text("Reports")').first();
    this.leadProgressSubmenuLink = page.locator('a[href="/leadProgressReport"], a:has-text("Lead Progress Report")').first();

    // Header
    this.pageHeading = page.locator('h4:has-text("Lead Progress Report"), h4:has-text("LEAD PROGRESS REPORT")');

    // Filter Accordion
    this.filterAccordionHeader = page.locator('.p-accordion-header-link:has-text("Filter")').first();
    this.filterAccordionContent = page.locator('.p-accordion-content');
    this.rangeDropdown = page.locator('.p-accordion-content div.p-dropdown:has(select[name="range"]), .p-accordion-content div.p-dropdown:has-text("Select Range")').first();
    this.fromDateInput = page.locator('.p-accordion-content input[name="fromDate"]');
    this.toDateInput = page.locator('.p-accordion-content input[name="toDate"]');
    this.searchFilterBtn = page.locator('.p-accordion-content button:has-text("Search")');
    this.clearFilterBtn = page.locator('.p-accordion-content button:has-text("Clear")');

    // Table
    this.globalSearchInput = page.locator('.p-datatable-header input[type="search"]');
    this.dataTable = page.locator('table.p-datatable-table');
    this.tableHeaders = page.locator('thead.p-datatable-thead th');
    this.tableRows = page.locator('tbody.p-datatable-tbody tr[role="row"]');
    this.tableFooterRow = page.locator('tfoot.p-datatable-tfoot tr[role="row"]');

    // Drill-down Modal ("Lead Details")
    this.leadDetailsDialog = page.locator('.p-dialog:has(.p-dialog-title:has-text("Lead Details")), .p-dialog:has-text("Lead Details")');
    this.dialogTitle = page.locator('.p-dialog-title:has-text("Lead Details")');
    this.dialogCloseBtn = page.locator('.p-dialog:has-text("Lead Details") .p-dialog-header-close');
    this.dialogHeaders = page.locator('.p-dialog:has-text("Lead Details") thead th');
    this.dialogRows = page.locator('.p-dialog:has-text("Lead Details") tbody tr');

    // Paginator
    this.paginator = page.locator('.p-paginator');
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

    // Wait for data table rows to render
    await this.page.waitForFunction(() => {
      const rows = document.querySelectorAll('tbody.p-datatable-tbody tr[role="row"]');
      const paginatorText = document.querySelector('.p-paginator-current')?.textContent || '';
      return rows.length > 0 || (paginatorText.includes('Showing') && !paginatorText.includes('0 to 0 of 0'));
    }, { timeout: 15000 }).catch(() => {});

    await this.page.waitForTimeout(500);
  }

  /**
   * Navigate directly to /leadProgressReport
   */
  async goto(): Promise<void> {
    await this.navigateTo('/leadProgressReport');
    await this.page.waitForLoadState('domcontentloaded');
    await this.dataTable.waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
    await this.waitForTableLoaded();
  }

  /**
   * Navigate via sidebar menu: Reports -> Lead Progress Report
   */
  async navigateViaSidebar(): Promise<void> {
    await this.reportsMenuButton.waitFor({ state: 'visible', timeout: 10000 });
    const isSubmenuVisible = await this.leadProgressSubmenuLink.isVisible().catch(() => false);
    if (!isSubmenuVisible) {
      await this.click(this.reportsMenuButton, 'Reports Sidebar Menu');
      await this.leadProgressSubmenuLink.waitFor({ state: 'visible', timeout: 5000 });
    }
    await this.click(this.leadProgressSubmenuLink, 'Lead Progress Report Submenu Link');
    await this.page.waitForURL('**/leadProgressReport**', { timeout: 15000 });
    await this.waitForTableLoaded();
  }

  /**
   * Expand filter accordion if not already expanded
   */
  async expandFilter(): Promise<void> {
    const isExpanded = await this.searchFilterBtn.isVisible().catch(() => false);
    if (!isExpanded) {
      await this.click(this.filterAccordionHeader, 'Filter Accordion Header');
      await this.searchFilterBtn.waitFor({ state: 'visible', timeout: 5000 });
    }
  }

  /**
   * Collapse filter accordion if expanded
   */
  async collapseFilter(): Promise<void> {
    const isExpanded = await this.searchFilterBtn.isVisible().catch(() => false);
    if (isExpanded) {
      await this.click(this.filterAccordionHeader, 'Filter Accordion Header');
      await this.searchFilterBtn.waitFor({ state: 'hidden', timeout: 5000 });
    }
  }

  /**
   * Search by text using global search
   */
  async searchGlobal(query: string): Promise<void> {
    await this.globalSearchInput.waitFor({ state: 'visible', timeout: 5000 });
    await this.globalSearchInput.fill(query);
    await this.page.waitForTimeout(600);
  }

  /**
   * Clear global search input
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
  async getRowData(index = 0): Promise<LeadProgressRowData> {
    const row = this.tableRows.nth(index);
    const cells = row.locator('td');
    return {
      sNo: (await cells.nth(0).innerText()).trim(),
      name: (await cells.nth(1).innerText()).trim(),
      email: (await cells.nth(2).innerText()).trim(),
      totalLeads: (await cells.nth(3).innerText()).trim(),
      created: (await cells.nth(4).innerText()).trim(),
      calling: (await cells.nth(5).innerText()).trim(),
      interested: (await cells.nth(6).innerText()).trim(),
      activated: (await cells.nth(7).innerText()).trim(),
      convertedToSales: (await cells.nth(8).innerText()).trim(),
      notInterested: (await cells.nth(9).innerText()).trim(),
      totalRequirements: (await cells.nth(10).innerText()).trim(),
      totalInvoices: (await cells.nth(11).innerText()).trim(),
      invoiceProducts: (await cells.nth(12).innerText()).trim()
    };
  }

  /**
   * Extract footer TOTAL row data
   */
  async getFooterTotals(): Promise<LeadProgressRowData> {
    const cells = this.tableFooterRow.locator('td');
    return {
      sNo: (await cells.nth(0).innerText()).trim(),
      name: (await cells.nth(1).innerText()).trim(),
      email: (await cells.nth(2).innerText()).trim(),
      totalLeads: (await cells.nth(3).innerText()).trim(),
      created: (await cells.nth(4).innerText()).trim(),
      calling: (await cells.nth(5).innerText()).trim(),
      interested: (await cells.nth(6).innerText()).trim(),
      activated: (await cells.nth(7).innerText()).trim(),
      convertedToSales: (await cells.nth(8).innerText()).trim(),
      notInterested: (await cells.nth(9).innerText()).trim(),
      totalRequirements: (await cells.nth(10).innerText()).trim(),
      totalInvoices: (await cells.nth(11).innerText()).trim(),
      invoiceProducts: (await cells.nth(12).innerText()).trim()
    };
  }

  /**
   * Click on a clickable drill-down cell (e.g. Total Leads or Calling count)
   */
  async clickDrilldownCell(rowIndex: number, colIndex: number): Promise<void> {
    const cell = this.tableRows.nth(rowIndex).locator('td').nth(colIndex).locator('span[style*="cursor: pointer"], span');
    await cell.click();
    await this.leadDetailsDialog.waitFor({ state: 'visible', timeout: 8000 });
  }

  /**
   * Close the drill-down Lead Details modal
   */
  async closeDrilldownModal(): Promise<void> {
    await this.dialogCloseBtn.click();
    await this.leadDetailsDialog.waitFor({ state: 'hidden', timeout: 5000 });
  }

  /**
   * Get row count in drill-down modal
   */
  async getDrilldownRowCount(): Promise<number> {
    return this.dialogRows.count();
  }
}
