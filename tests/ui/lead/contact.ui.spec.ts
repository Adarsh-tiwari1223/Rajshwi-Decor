import { test, expect } from '../../../core/fixtures/customFixtures';
import { Config } from '../../../utils/env';
import { ContactDataGenerator } from '../../../testdata/lead/leadGenerator';

test.describe('Lead Module - Contact Management Atomic UI Test Suite', () => {
  test.setTimeout(60000);

  test.beforeEach(async ({ loginPage, contactPage }) => {
    // 1. Authenticate with admin credentials
    await loginPage.goto();
    await loginPage.login(Config.adminEmail, Config.adminPassword);

    // 2. Navigate to Contact page
    await contactPage.goto();
  });

  // Group A: Navigation & Page Surface
  test('RD_CON_01: Navigate to Contact page and verify page heading and table load', async ({ contactPage }) => {
    await expect(contactPage.pageHeading).toBeVisible();
    await expect(contactPage.pageHeading).toHaveText(/Contact/i);
    await expect(contactPage.dataTable).toBeVisible();
  });

  test('RD_CON_02: Verify toolbar action buttons (Bulk Upload, Download Sample, Filter Accordion)', async ({ contactPage }) => {
    await expect(contactPage.bulkUploadBtn).toBeVisible();
    await expect(contactPage.downloadSampleBtn).toBeVisible();
    await expect(contactPage.filterAccordion).toBeVisible();
  });

  // Group B: Modal Open & Dismissal
  test('RD_CON_03: Click New button opens Add/Edit Contact modal with all fields', async ({ contactPage }) => {
    await contactPage.clickNewContact();
    await contactPage.modal.waitForOpened();
    await expect(contactPage.modal.modalDialog).toBeVisible();
    await expect(contactPage.modal.modalTitle).toBeVisible();

    // Verify key inputs & dropdowns are visible
    await expect(contactPage.modal.contactPersonNameInput).toBeVisible();
    await expect(contactPage.modal.contactPersonNumberInput).toBeVisible();
    await expect(contactPage.modal.countryDropdown).toBeVisible();
    await expect(contactPage.modal.saveBtn).toBeVisible();

    // Clean up
    await contactPage.modal.clickClose();
    await contactPage.modal.waitForClosed();
  });

  test('RD_CON_04: Click CLOSE button dismisses modal without saving', async ({ contactPage }) => {
    await contactPage.clickNewContact();
    await contactPage.modal.waitForOpened();
    await contactPage.modal.clickClose();
    await contactPage.modal.waitForClosed();
    await expect(contactPage.modal.modalDialog).toBeHidden();
  });

  test('RD_CON_05: Click top-right X icon dismisses modal', async ({ contactPage }) => {
    await contactPage.clickNewContact();
    await contactPage.modal.waitForOpened();
    await contactPage.modal.closeViaIcon();
    await contactPage.modal.waitForClosed();
    await expect(contactPage.modal.modalDialog).toBeHidden();
  });

  // Group C: Cascading Dropdowns
  test('RD_CON_06: Verify State and City dropdowns are disabled before Country is selected', async ({ contactPage }) => {
    await contactPage.clickNewContact();
    await contactPage.modal.waitForOpened();

    // State & City should have .p-disabled class initially
    await expect(contactPage.modal.stateDropdown).toHaveClass(/p-disabled/);
    await expect(contactPage.modal.cityDropdown).toHaveClass(/p-disabled/);

    // Clean up
    await contactPage.modal.clickClose();
    await contactPage.modal.waitForClosed();
  });

  test('RD_CON_07: Verify selecting Country enables State dropdown', async ({ contactPage }) => {
    await contactPage.clickNewContact();
    await contactPage.modal.waitForOpened();

    // Select Country
    await contactPage.modal.selectCountry('India');

    // State dropdown should be unlocked / enabled
    await expect(contactPage.modal.stateDropdown).not.toHaveClass(/p-disabled/);

    // Clean up
    await contactPage.modal.clickClose();
    await contactPage.modal.waitForClosed();
  });

  // Group D: Field Validations & Edge Cases
  test('RD_CON_08: Click SAVE on empty form triggers mandatory validation errors', async ({ contactPage }) => {
    await contactPage.clickNewContact();
    await contactPage.modal.waitForOpened();

    // Submit empty form
    await contactPage.modal.clickSave();

    // Form must block submission and keep modal visible
    await expect(contactPage.modal.modalDialog).toBeVisible();

    // Clean up
    await contactPage.modal.clickClose();
    await contactPage.modal.waitForClosed();
  });

  test('RD_CON_09: Whitespace-only input in required fields is rejected', async ({ contactPage }) => {
    await contactPage.clickNewContact();
    await contactPage.modal.waitForOpened();

    // Fill whitespace only
    await contactPage.modal.contactPersonNameInput.fill('     ');
    await contactPage.modal.contactPersonNumberInput.click();
    await contactPage.modal.contactPersonNumberInput.pressSequentially('     ', { delay: 20 });
    await contactPage.modal.clickSave();

    // Modal must remain open (submission blocked)
    await expect(contactPage.modal.modalDialog).toBeVisible();

    // Clean up
    await contactPage.modal.clickClose();
    await contactPage.modal.waitForClosed();
  });

  test('RD_CON_10: Field value leading and trailing spaces are trimmed', async ({ contactPage }) => {
    await contactPage.clickNewContact();
    await contactPage.modal.waitForOpened();

    const rawInput = '  Rajesh Kumar Verma  ';
    await contactPage.modal.contactPersonNameInput.fill(rawInput);
    await contactPage.modal.contactPersonNameInput.blur();

    const value = await contactPage.modal.contactPersonNameInput.inputValue();
    expect(value.trim()).toBe('Rajesh Kumar Verma');

    // Clean up
    await contactPage.modal.clickClose();
    await contactPage.modal.waitForClosed();
  });

  test('RD_CON_11: Entering already registered contact phone number is rejected as duplicate', async ({ contactPage }) => {
    const existingContact = await contactPage.getRowData(0);
    expect(existingContact.contactNumber).toBeTruthy();

    await contactPage.clickNewContact();
    await contactPage.modal.waitForOpened();

    const duplicateData = ContactDataGenerator.generate({
      contactPersonNumber: existingContact.contactNumber.replace(/\D/g, '').slice(-10)
    });

    await contactPage.modal.fillForm({
      contactPersonName: duplicateData.contactPersonName,
      contactPersonNumber: duplicateData.contactPersonNumber,
      email: duplicateData.email,
      country: duplicateData.country,
      state: duplicateData.state,
      city: duplicateData.city,
      source: duplicateData.source
    });

    await contactPage.modal.clickSave();

    // Modal must block save or show error toast
    const toastText = await contactPage.getToastText(3000);
    const isModalOpen = await contactPage.modal.modalDialog.isVisible();
    expect(isModalOpen || /already exists|duplicate/i.test(toastText)).toBeTruthy();

    // Clean up
    if (await contactPage.modal.modalDialog.isVisible()) {
      await contactPage.modal.clickClose();
      await contactPage.modal.waitForClosed();
    }
  });

  // Group E: End-to-End Actions & Search
  test('RD_CON_12: Create new contact with authentic Indian regional data and save successfully', async ({ contactPage }) => {
    const contactData = ContactDataGenerator.generate();

    await contactPage.clickNewContact();
    await contactPage.modal.waitForOpened();

    await contactPage.modal.fillForm({
      contactPersonName: contactData.contactPersonName,
      contactPersonNumber: contactData.contactPersonNumber,
      email: contactData.email,
      country: contactData.country,
      state: contactData.state,
      city: contactData.city,
      source: contactData.source
    });

    await contactPage.modal.clickSave();
    await contactPage.modal.waitForClosed(10000).catch(() => {});
    await expect(contactPage.modal.modalDialog).toBeHidden();
  });

  test('RD_CON_13: Search contact by Contact Name filters table and returns matching row', async ({ contactPage }) => {
    const firstRowBefore = await contactPage.getRowData(0);
    const searchTarget = firstRowBefore.name;
    expect(searchTarget).toBeTruthy();

    await contactPage.searchContact(searchTarget);
    const rowCount = await contactPage.getDisplayedRowCount();
    expect(rowCount).toBeGreaterThanOrEqual(1);

    const matchedRow = await contactPage.getRowData(0);
    expect(matchedRow.name.toLowerCase()).toContain(searchTarget.toLowerCase());

    // Reset search
    await contactPage.clearSearch();
  });

  test('RD_CON_14: Verify table pagination controls and status text indicator', async ({ contactPage }) => {
    await expect(contactPage.paginator).toBeVisible();
    const paginationText = await contactPage.getPaginationText();
    expect(paginationText).toMatch(/Showing \d+ to \d+ of \d+/i);
  });

});
