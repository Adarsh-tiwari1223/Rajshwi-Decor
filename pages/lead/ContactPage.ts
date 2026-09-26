import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export interface NewContactFormData {
  contactPersonName: string;
  contactPersonNumber: string;
  email?: string;
  country?: string;
  state?: string;
  city?: string;
  source?: string;
}

export class ContactModal {
  readonly modalDialog: Locator;
  readonly modalTitle: Locator;
  readonly closeIconBtn: Locator;

  // Form Inputs
  readonly contactPersonNameInput: Locator;
  readonly contactPersonNumberInput: Locator;
  readonly emailInput: Locator;

  // Dropdowns (PrimeReact .p-dropdown)
  readonly countryDropdown: Locator;
  readonly stateDropdown: Locator;
  readonly cityDropdown: Locator;
  readonly sourceDropdown: Locator;
  readonly dropdownPanel: Locator;
  readonly dropdownPanelItems: Locator;

  // Validation Error Messages (<small class="p-error">)
  readonly nameError: Locator;
  readonly numberError: Locator;
  readonly countryError: Locator;
  readonly stateError: Locator;
  readonly cityError: Locator;
  readonly sourceError: Locator;

  // Buttons
  readonly saveBtn: Locator;
  readonly closeBtn: Locator;

  constructor(private page: Page) {
    // Dialog structure
    this.modalDialog = page.locator('div.p-dialog[role="dialog"]');
    this.modalTitle = page.locator('.p-dialog-title:has-text("Add/Edit Contact")');
    this.closeIconBtn = page.locator('button.p-dialog-header-close');

    // Text Inputs
    this.contactPersonNameInput = page.locator('input[name="contact_Person_Name"]');
    this.contactPersonNumberInput = page.locator('input[name="contact_Person_Number"]');
    this.emailInput = page.locator('input[name="contact_Person_Email"]');

    // PrimeReact Dropdowns (identified by inner input ID)
    this.countryDropdown = page.locator('div.p-dropdown:has(input#country_ID)');
    this.stateDropdown = page.locator('div.p-dropdown:has(input#state_ID)');
    this.cityDropdown = page.locator('div.p-dropdown:has(input#city_ID)');
    this.sourceDropdown = page.locator('div.p-dropdown:has(input#source_ID)');
    this.dropdownPanel = page.locator('.p-dropdown-panel:visible');
    this.dropdownPanelItems = page.locator('.p-dropdown-panel .p-dropdown-item');

    // Form Field Validation Errors
    this.nameError = page.locator('div.field:has(label[for="contact_Person_Name"]) small.p-error');
    this.numberError = page.locator('div.field:has(label[for="contact_Person_Number"]) small.p-error');
    this.countryError = page.locator('div.field:has(label[for="country_ID"]) small.p-error');
    this.stateError = page.locator('div.field:has(label[for="state_ID"]) small.p-error');
    this.cityError = page.locator('div.field:has(label[for="city_ID"]) small.p-error');
    this.sourceError = page.locator('div.field:has(label[for="source_ID"]) small.p-error');

    // Action Buttons
    this.saveBtn = page.locator('button[aria-label="SAVE"]');
    this.closeBtn = page.locator('button[aria-label="CLOSE"]');
  }

  /**
   * Check if modal is visible in viewport
   */
  async isVisible(): Promise<boolean> {
    return this.modalDialog.isVisible();
  }

  /**
   * Wait for modal to be fully opened and rendered
   */
  async waitForOpened(timeout = 5000): Promise<void> {
    await this.modalDialog.waitFor({ state: 'visible', timeout });
    await this.modalTitle.waitFor({ state: 'visible', timeout });
  }

  /**
   * Wait for modal to be closed/dismissed
   */
  async waitForClosed(timeout = 5000): Promise<void> {
    await this.modalDialog.waitFor({ state: 'hidden', timeout });
  }

  /**
   * Select an option from PrimeReact dropdown with filter support
   */
  async selectDropdownOption(dropdown: Locator, optionText: string): Promise<void> {
    await dropdown.waitFor({ state: 'visible', timeout: 5000 });
    await dropdown.scrollIntoViewIfNeeded();
    await dropdown.click();

    // Wait for the panel overlay to render
    const panel = this.page.locator('.p-dropdown-panel:visible');
    await panel.waitFor({ state: 'visible', timeout: 5000 });

    // Check if dropdown panel has a filter/search input
    const filterInput = panel.locator('input.p-dropdown-filter');
    if (await filterInput.isVisible().catch(() => false)) {
      await filterInput.fill(optionText);
      await this.page.waitForTimeout(400);
    }

    // Match exact text to avoid substring clashes (e.g. India vs British Indian Ocean Territory)
    const exactRegex = new RegExp(`^\\s*${optionText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'i');
    let option = panel.locator('.p-dropdown-item').filter({ hasText: exactRegex }).first();
    if (!(await option.isVisible().catch(() => false))) {
      option = panel.locator('.p-dropdown-item').filter({ hasText: optionText }).first();
    }
    await option.waitFor({ state: 'visible', timeout: 5000 });
    await option.click();

    // Ensure panel closes
    await panel.waitFor({ state: 'hidden', timeout: 3000 }).catch(() => {});
  }

  /**
   * Select country and await cascading enablement of State dropdown
   */
  async selectCountry(country: string): Promise<void> {
    await this.selectDropdownOption(this.countryDropdown, country);
    // Wait for State dropdown to enable (removes .p-disabled)
    await this.page.locator('div.p-dropdown:has(input#state_ID):not(.p-disabled)').waitFor({ state: 'visible', timeout: 8000 }).catch(() => {});
    await this.page.waitForTimeout(500);
  }

  /**
   * Select state and await cascading enablement of City dropdown
   */
  async selectState(state: string): Promise<void> {
    await this.selectDropdownOption(this.stateDropdown, state);
    // Wait for City dropdown to enable (removes .p-disabled)
    await this.page.locator('div.p-dropdown:has(input#city_ID):not(.p-disabled)').waitFor({ state: 'visible', timeout: 8000 }).catch(() => {});
    await this.page.waitForTimeout(500);
  }

  /**
   * Select city
   */
  async selectCity(city: string): Promise<void> {
    await this.selectDropdownOption(this.cityDropdown, city);
  }

  /**
   * Select source
   */
  async selectSource(source: string): Promise<void> {
    await this.selectDropdownOption(this.sourceDropdown, source);
  }

  /**
   * Get the current displayed text/label of a dropdown
   */
  async getDropdownText(dropdown: Locator): Promise<string> {
    const label = dropdown.locator('.p-dropdown-label');
    return (await label.textContent())?.trim() || '';
  }

  /**
   * Fill out the entire Add/Edit Contact form
   */
  async fillForm(data: NewContactFormData): Promise<void> {
    // 1. Fill Contact Person Name
    await this.contactPersonNameInput.fill(data.contactPersonName);

    // 2. Fill Contact Person Number (supports PrimeReact p-inputmask)
    await this.contactPersonNumberInput.click();
    await this.contactPersonNumberInput.pressSequentially(data.contactPersonNumber, { delay: 30 });

    // 3. Fill Email if provided
    if (data.email) {
      await this.emailInput.fill(data.email);
    }

    // 4. Fill Cascading Dropdowns
    if (data.country) {
      await this.selectCountry(data.country);
    }

    if (data.state) {
      await this.selectState(data.state);
    }

    if (data.city) {
      await this.selectCity(data.city);
    }

    if (data.source) {
      await this.selectSource(data.source);
    }
  }

  /**
   * Click SAVE button
   */
  async clickSave(): Promise<void> {
    await this.saveBtn.click();
  }

  /**
   * Click CLOSE button
   */
  async clickClose(): Promise<void> {
    await this.closeBtn.click();
  }

  /**
   * Close modal via top-right 'X' icon
   */
  async closeViaIcon(): Promise<void> {
    await this.closeIconBtn.click();
  }

  /**
   * Get all active validation error messages in the modal
   */
  async getValidationErrors(): Promise<{
    name?: string;
    number?: string;
    country?: string;
    state?: string;
    city?: string;
    source?: string;
  }> {
    const errors: { [key: string]: string } = {};
    if (await this.nameError.isVisible()) errors.name = (await this.nameError.textContent())?.trim() || '';
    if (await this.numberError.isVisible()) errors.number = (await this.numberError.textContent())?.trim() || '';
    if (await this.countryError.isVisible()) errors.country = (await this.countryError.textContent())?.trim() || '';
    if (await this.stateError.isVisible()) errors.state = (await this.stateError.textContent())?.trim() || '';
    if (await this.cityError.isVisible()) errors.city = (await this.cityError.textContent())?.trim() || '';
    if (await this.sourceError.isVisible()) errors.source = (await this.sourceError.textContent())?.trim() || '';
    return errors;
  }
}

export class BulkUploadModal {
  readonly modalDialog: Locator;
  readonly modalTitle: Locator;
  readonly closeIconBtn: Locator;
  readonly onBehalfUserDropdown: Locator;
  readonly chooseFileBtn: Locator;
  readonly fileInput: Locator;
  readonly saveBtn: Locator;
  readonly closeBtn: Locator;

  constructor(private page: Page) {
    this.modalDialog = page.locator('.p-dialog:has-text("Bulk Upload")');
    this.modalTitle = page.locator('.p-dialog-title:has-text("Bulk Upload")');
    this.closeIconBtn = page.locator('.p-dialog:has-text("Bulk Upload") .p-dialog-header-close');
    this.onBehalfUserDropdown = page.locator('.p-dialog:has-text("Bulk Upload") div.p-dropdown:has(input#onBehalfUserID)');
    this.chooseFileBtn = page.locator('.p-dialog:has-text("Bulk Upload") .p-fileupload-choose');
    this.fileInput = page.locator('.p-dialog:has-text("Bulk Upload") input[type="file"]');
    this.saveBtn = page.locator('.p-dialog:has-text("Bulk Upload") button[aria-label="SAVE"]');
    this.closeBtn = page.locator('.p-dialog:has-text("Bulk Upload") button[aria-label="CLOSE"]');
  }

  async waitForOpened(timeout = 5000): Promise<void> {
    await this.modalDialog.waitFor({ state: 'visible', timeout });
  }

  async waitForClosed(timeout = 5000): Promise<void> {
    await this.modalDialog.waitFor({ state: 'hidden', timeout });
  }

  async selectOnBehalfUser(userName: string): Promise<void> {
    await this.onBehalfUserDropdown.click();
    const panel = this.page.locator('.p-dropdown-panel:visible');
    await panel.waitFor({ state: 'visible', timeout: 5000 });

    const filterInput = panel.locator('input.p-dropdown-filter');
    if (await filterInput.isVisible().catch(() => false)) {
      await filterInput.fill(userName);
      await this.page.waitForTimeout(300);
    }

    let option = panel.locator('.p-dropdown-item').filter({ hasText: new RegExp(`^\\s*${userName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'i') }).first();
    if (!(await option.isVisible().catch(() => false))) {
      option = panel.locator('.p-dropdown-item').filter({ hasText: userName }).first();
    }
    await option.waitFor({ state: 'visible', timeout: 5000 });
    await option.click();
    await this.page.waitForTimeout(300);
  }

  async getAvailableOnBehalfUsers(): Promise<string[]> {
    await this.onBehalfUserDropdown.click();
    const panel = this.page.locator('.p-dropdown-panel:visible');
    await panel.waitFor({ state: 'visible', timeout: 5000 });
    const items = await panel.locator('.p-dropdown-item').allInnerTexts();
    await this.page.keyboard.press('Escape');
    return items.map(i => i.trim()).filter(i => i.length > 0 && i !== 'Select');
  }

  async uploadFile(absoluteFilePath: string): Promise<void> {
    await this.fileInput.setInputFiles(absoluteFilePath);
    await this.page.waitForTimeout(500);
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

export class ContactPage extends BasePage {
  // Topbar Actions
  readonly notificationBtn: Locator;
  readonly profileBtn: Locator;
  readonly profileMenu: Locator;
  readonly profileOption: Locator;
  readonly logoutOption: Locator;

  // Toolbar Actions
  readonly bulkUploadBtn: Locator;
  readonly downloadSampleBtn: Locator;
  readonly filterAccordion: Locator;

  // Header & Controls
  readonly newContactBtn: Locator;
  readonly pageHeading: Locator;
  readonly searchInput: Locator;

  // Table Elements
  readonly dataTable: Locator;
  readonly tableRows: Locator;
  readonly selectAllCheckbox: Locator;
  readonly editButtons: Locator;
  readonly copyButtons: Locator;

  // Paginator Elements
  readonly paginator: Locator;
  readonly paginatorCurrentText: Locator;
  readonly nextPageBtn: Locator;
  readonly prevPageBtn: Locator;
  readonly rowsPerPageDropdown: Locator;

  // Notification Toast
  readonly toastContainer: Locator;
  readonly toastMessage: Locator;

  // Modals
  readonly modal: ContactModal;
  readonly bulkUploadModal: BulkUploadModal;

  constructor(page: Page) {
    super(page);

    // Topbar
    this.notificationBtn = page.locator('button.rajasvi-icon-button:has(.pi-bell)');
    this.profileBtn = page.locator('button.rajasvi-profile-button');
    this.profileMenu = page.locator('ul.rajasvi-profile-menu');
    this.profileOption = page.locator('ul.rajasvi-profile-menu button:has-text("Profile")');
    this.logoutOption = page.locator('ul.rajasvi-profile-menu button:has-text("Logout")');

    // Toolbar
    this.bulkUploadBtn = page.locator('button[aria-label="Bulk Upload"]');
    this.downloadSampleBtn = page.locator('button[aria-label="Download Sample"]');
    this.filterAccordion = page.locator('.p-accordion-header-link:has-text("Filter")');

    // Table Header
    this.newContactBtn = page.locator('button[aria-label="New"]');
    this.pageHeading = page.locator('h4:has-text("Contact")');
    this.searchInput = page.locator('.p-input-icon-left input[type="search"]');

    // Data Table
    this.dataTable = page.locator('table.p-datatable-table');
    this.tableRows = page.locator('tbody.p-datatable-tbody tr');
    this.selectAllCheckbox = page.locator('th.p-selection-column .p-checkbox-box');
    this.editButtons = page.locator('button.p-button-icon-only:has(.pi-pencil)');
    this.copyButtons = page.locator('button.p-button-icon-only:has(.pi-copy)');

    // Paginator
    this.paginator = page.locator('.p-paginator');
    this.paginatorCurrentText = page.locator('.p-paginator-current');
    this.nextPageBtn = page.locator('button.p-paginator-next');
    this.prevPageBtn = page.locator('button.p-paginator-prev');
    this.rowsPerPageDropdown = page.locator('.p-paginator .p-dropdown');

    // Toast
    this.toastContainer = page.locator('.p-toast');
    this.toastMessage = page.locator('.p-toast-message, .p-toast-detail, .p-toast-message-text');

    // Modals
    this.modal = new ContactModal(page);
    this.bulkUploadModal = new BulkUploadModal(page);
  }

  /**
   * Open the Bulk Upload modal
   */
  async openBulkUploadModal(): Promise<void> {
    await this.click(this.bulkUploadBtn, 'Bulk Upload Button');
    await this.bulkUploadModal.waitForOpened();
  }

  /**
   * Get toast notification text if visible
   */
  async getToastText(timeout = 3000): Promise<string> {
    const isVisible = await this.toastMessage.first().waitFor({ state: 'visible', timeout }).then(() => true).catch(() => false);
    if (!isVisible) return '';
    return (await this.toastMessage.first().textContent()) || '';
  }

  /**
   * Navigate directly to contact page
   */
  async goto(): Promise<void> {
    await this.navigateTo('/contact');
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Click "New" to open contact creation modal/form
   */
  async clickNewContact(): Promise<void> {
    await this.click(this.newContactBtn, 'New Contact Button');
    await this.modal.modalDialog.waitFor({ state: 'visible', timeout: 5000 });
  }

  /**
   * Search contacts by keyword (name, email, phone)
   */
  async searchContact(query: string): Promise<void> {
    await this.type(this.searchInput, query, 'Contact Search Input');
    await this.page.keyboard.press('Enter');
    await this.page.waitForTimeout(1000);
  }

  /**
   * Clear search input
   */
  async clearSearch(): Promise<void> {
    await this.searchInput.fill('');
    await this.page.keyboard.press('Enter');
    await this.page.waitForTimeout(1000);
  }

  /**
   * Toggle filter accordion
   */
  async toggleFilter(): Promise<void> {
    await this.click(this.filterAccordion, 'Filter Accordion Toggle');
  }

  /**
   * Get total row count currently displayed in table
   */
  async getDisplayedRowCount(): Promise<number> {
    await this.tableRows.first().waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
    return this.tableRows.count();
  }

  /**
   * Get row data by index (0-based)
   */
  async getRowData(index = 0) {
    const row = this.tableRows.nth(index);
    const cells = row.locator('td');
    const cleanText = (text: string | null) => (text || '').replace(/[]/g, '').trim();

    return {
      sn: cleanText(await cells.nth(0).textContent()),
      hasLeadGenerated: await cells.nth(1).locator('i.pi-check-circle').isVisible().catch(() => false),
      name: cleanText(await cells.nth(2).textContent()),
      contactNumber: cleanText(await cells.nth(3).textContent()),
      email: cleanText(await cells.nth(4).textContent()),
      createdAt: cleanText(await cells.nth(5).textContent()),
      createdBy: cleanText(await cells.nth(6).textContent()),
      updatedBy: cleanText(await cells.nth(7).textContent()),
      address: cleanText(await cells.nth(8).textContent()),
      sourceName: cleanText(await cells.nth(9).textContent())
    };
  }

  /**
   * Click Edit button on a specific row index
   */
  async clickEditRow(index = 0): Promise<void> {
    const editBtn = this.tableRows.nth(index).locator('button:has(.pi-pencil)');
    await this.click(editBtn, `Edit Button for Row ${index + 1}`);
    await this.modal.modalDialog.waitFor({ state: 'visible', timeout: 5000 });
  }

  /**
   * Select a contact row checkbox
   */
  async selectRow(index = 0): Promise<void> {
    const checkbox = this.tableRows.nth(index).locator('td.p-selection-column .p-checkbox-box');
    await this.click(checkbox, `Select Checkbox for Row ${index + 1}`);
  }

  /**
   * Read pagination current info string (e.g. "Showing 1 to 25 of 409")
   */
  async getPaginationText(): Promise<string> {
    return (await this.paginatorCurrentText.textContent()) || '';
  }
}
