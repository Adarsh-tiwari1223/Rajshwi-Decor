import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export interface MyLeadRowData {
  sn: string;
  contactName: string;
  email: string;
  contactNo: string;
  address: string;
  source: string;
  salesManager: string;
  status: string;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
  referredBy: string;
}

export class UpdateLeadStatusModal {
  readonly modalDialog: Locator;
  readonly modalTitle: Locator;
  readonly closeIconBtn: Locator;
  readonly statusDropdown: Locator;
  readonly saveBtn: Locator;
  readonly closeBtn: Locator;

  constructor(private page: Page) {
    this.modalDialog = page.locator('.p-dialog:has-text("Update Lead Status")');
    this.modalTitle = page.locator('.p-dialog-title:has-text("Update Lead Status")');
    this.closeIconBtn = page.locator('.p-dialog:has-text("Update Lead Status") .p-dialog-header-close');
    this.statusDropdown = page.locator('.p-dialog:has-text("Update Lead Status") div.p-dropdown:has(input#status_ID)');
    this.saveBtn = page.locator('.p-dialog:has-text("Update Lead Status") button[aria-label="SAVE"]');
    this.closeBtn = page.locator('.p-dialog:has-text("Update Lead Status") button[aria-label="CLOSE"]');
  }

  async waitForOpened(timeout = 5000): Promise<void> {
    await this.modalDialog.waitFor({ state: 'visible', timeout });
  }

  async waitForClosed(timeout = 5000): Promise<void> {
    await this.modalDialog.waitFor({ state: 'hidden', timeout });
  }

  async selectStatus(statusText: string): Promise<void> {
    await this.statusDropdown.click();
    const option = this.page.locator('li.p-dropdown-item').filter({ hasText: new RegExp(`^${statusText}$`, 'i') });
    await option.waitFor({ state: 'visible', timeout: 5000 });
    await option.click();
    await this.page.waitForTimeout(300);
  }

  async clickSave(): Promise<void> {
    await this.saveBtn.click();
  }

  async clickClose(): Promise<void> {
    await this.closeBtn.click();
  }

  async closeViaIcon(): Promise<void> {
    await this.closeIconBtn.click();
  }
}

export class MyLeadPage extends BasePage {
  // Page Header
  readonly pageHeading: Locator;

  // Filter Accordion Controls
  readonly filterAccordionHeader: Locator;
  readonly contactInput: Locator;
  readonly statusDropdown: Locator;
  readonly fromDateInput: Locator;
  readonly toDateInput: Locator;
  readonly sourceDropdown: Locator;
  readonly countryDropdown: Locator;
  readonly stateDropdown: Locator;
  readonly cityDropdown: Locator;
  readonly searchBtn: Locator;
  readonly clearBtn: Locator;

  // Data Table Elements
  readonly dataTable: Locator;
  readonly tableRows: Locator;
  readonly copyButtons: Locator;
  readonly historyButtons: Locator;

  // Paginator Elements
  readonly paginator: Locator;
  readonly paginatorCurrentText: Locator;
  readonly nextPageBtn: Locator;
  readonly prevPageBtn: Locator;

  // Status Update Modal
  readonly statusModal: UpdateLeadStatusModal;

  constructor(page: Page) {
    super(page);

    // Header
    this.pageHeading = page.locator('h4:has-text("My Lead")');

    // Filter Accordion & Inputs
    this.filterAccordionHeader = page.locator('.p-accordion-header-link:has-text("Filter")');
    this.contactInput = page.locator('input[name="contact"]');
    this.statusDropdown = page.locator('div.p-dropdown:has(input#status_ID)');
    this.fromDateInput = page.locator('input[name="fromDate"]');
    this.toDateInput = page.locator('input[name="toDate"]');
    this.sourceDropdown = page.locator('div.p-dropdown:has(input#source_ID)');
    this.countryDropdown = page.locator('div.p-dropdown:has(input#country_ID)');
    this.stateDropdown = page.locator('div.p-dropdown:has(input#state_ID)');
    this.cityDropdown = page.locator('div.p-dropdown:has(input#city_ID)');
    this.searchBtn = page.locator('button[aria-label="SEARCH"]');
    this.clearBtn = page.locator('button[aria-label="CLEAR"]');

    // Data Table
    this.dataTable = page.locator('table.p-datatable-table');
    this.tableRows = page.locator('tbody.p-datatable-tbody tr');
    this.copyButtons = page.locator('tbody.p-datatable-tbody tr button:has(.pi-copy)');
    this.historyButtons = page.locator('tbody.p-datatable-tbody tr button:has(.pi-history)');

    // Paginator
    this.paginator = page.locator('.p-paginator');
    this.paginatorCurrentText = page.locator('.p-paginator-current');
    this.nextPageBtn = page.locator('button.p-paginator-next');
    this.prevPageBtn = page.locator('button.p-paginator-prev');

    // Status Modal
    this.statusModal = new UpdateLeadStatusModal(page);
  }

  /**
   * Click the Status badge in a row to open Update Lead Status modal
   */
  async clickStatusBadge(index = 0): Promise<void> {
    const statusCell = this.tableRows.nth(index).locator('td').nth(7).locator('.p-tag, span').first();
    await this.click(statusCell, `Status Badge in row ${index + 1}`);
    await this.statusModal.waitForOpened();
  }

  /**
   * Navigate directly to /mylead
   */
  async goto(): Promise<void> {
    await this.navigateTo('/mylead');
    await this.page.waitForLoadState('domcontentloaded');
    await this.dataTable.waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
  }

  /**
   * Get total row count currently displayed in My Lead table
   */
  async getDisplayedRowCount(): Promise<number> {
    await this.tableRows.first().waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
    return this.tableRows.count();
  }

  /**
   * Extract row data by index (0-based)
   */
  async getRowData(index = 0): Promise<MyLeadRowData> {
    const row = this.tableRows.nth(index);
    const cells = row.locator('td');
    const cleanText = (text: string | null) => (text || '').replace(/[]/g, '').trim();

    return {
      sn: cleanText(await cells.nth(0).textContent()),
      contactName: cleanText(await cells.nth(1).textContent()),
      email: cleanText(await cells.nth(2).textContent()),
      contactNo: cleanText(await cells.nth(3).textContent()),
      address: cleanText(await cells.nth(4).textContent()),
      source: cleanText(await cells.nth(5).textContent()),
      salesManager: cleanText(await cells.nth(6).textContent()),
      status: cleanText(await cells.nth(7).textContent()),
      createdBy: cleanText(await cells.nth(8).textContent()),
      createdAt: cleanText(await cells.nth(9).textContent()),
      updatedBy: cleanText(await cells.nth(10).textContent()),
      updatedAt: cleanText(await cells.nth(11).textContent()),
      referredBy: cleanText(await cells.nth(12).textContent())
    };
  }

  /**
   * Find row index by Contact Name
   */
  async findRowIndexByContactName(name: string): Promise<number> {
    const count = await this.getDisplayedRowCount();
    for (let i = 0; i < count; i++) {
      const rowData = await this.getRowData(i);
      if (rowData.contactName.toLowerCase().includes(name.toLowerCase())) {
        return i;
      }
    }
    return -1;
  }

  /**
   * Expand filter accordion if collapsed
   */
  async expandFilter(): Promise<void> {
    const isVisible = await this.contactInput.isVisible().catch(() => false);
    if (!isVisible) {
      await this.filterAccordionHeader.click();
      await this.contactInput.waitFor({ state: 'visible', timeout: 5000 });
    }
  }

  /**
   * Filter table by searching contact autocomplete input
   */
  async searchByContact(query: string): Promise<void> {
    await this.expandFilter();
    await this.contactInput.click();
    await this.contactInput.fill(query);
    await this.page.waitForTimeout(500);
    const suggestion = this.page.locator('.p-autocomplete-item, .p-autocomplete-panel li').first();
    if (await suggestion.isVisible({ timeout: 2000 }).catch(() => false)) {
      await suggestion.click();
    } else {
      await this.contactInput.press('Enter');
    }
    await this.searchBtn.click();
    await this.page.waitForTimeout(1000);
  }

  /**
   * Clear all active filters
   */
  async clearFilter(): Promise<void> {
    await this.expandFilter();
    await this.clearBtn.click();
    await this.page.waitForTimeout(1000);
  }

  /**
   * Select an option from PrimeReact dropdown
   */
  async selectDropdown(dropdown: Locator, optionText: string): Promise<void> {
    await this.expandFilter();
    await dropdown.click();
    const option = this.page.locator('li.p-dropdown-item').filter({ hasText: new RegExp(`^${optionText}$`, 'i') });
    await option.waitFor({ state: 'visible', timeout: 5000 });
    await option.click();
    await this.page.waitForTimeout(300);
  }

  /**
   * Filter by Status
   */
  async filterByStatus(statusName: string): Promise<void> {
    await this.expandFilter();
    await this.selectDropdown(this.statusDropdown, statusName);
    await this.searchBtn.click();
    await this.page.waitForTimeout(1000);
  }

  /**
   * Filter by Source
   */
  async filterBySource(sourceName: string): Promise<void> {
    await this.expandFilter();
    await this.selectDropdown(this.sourceDropdown, sourceName);
    await this.searchBtn.click();
    await this.page.waitForTimeout(1000);
  }

  /**
   * Click History button on a row
   */
  async clickHistory(index = 0): Promise<void> {
    const historyBtn = this.tableRows.nth(index).locator('button:has(.pi-history)');
    await this.click(historyBtn, `History button for row ${index + 1}`);
  }

  /**
   * Click Contact Name in table row to open /leadDetails
   */
  async clickContactName(index = 0): Promise<void> {
    await this.tableRows.first().waitFor({ state: 'visible', timeout: 15000 });
    const contactNameCell = this.tableRows.nth(index).locator('td').nth(1);
    await contactNameCell.click();
    await this.page.waitForURL('**/leadDetails**', { timeout: 15000 }).catch(() => {});
  }

  /**
   * Click Contact Email in table row to open /leadDetails
   */
  async clickContactEmail(index = 0): Promise<void> {
    await this.tableRows.first().waitFor({ state: 'visible', timeout: 15000 });
    const emailCell = this.tableRows.nth(index).locator('td').nth(2);
    await emailCell.click();
    await this.page.waitForURL('**/leadDetails**', { timeout: 10000 }).catch(() => {});
  }

  /**
   * Read pagination text (e.g. "Showing 1 to 17 of 17")
   */
  async getPaginationText(): Promise<string> {
    return (await this.paginatorCurrentText.textContent()) || '';
  }
}

