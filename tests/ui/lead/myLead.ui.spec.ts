import { test, expect } from '../../../core/fixtures/customFixtures';
import { Config } from '../../../utils/env';
import { ContactDataGenerator } from '../../../testdata/lead/leadGenerator';

test.describe('Lead Module - My Lead & Auto-Assignment UI Test Suite', () => {
  test.setTimeout(60000);

  test.beforeEach(async ({ loginPage }) => {
    // 1. Authenticate with admin credentials
    await loginPage.goto();
    await loginPage.login(Config.adminEmail, Config.adminPassword);
  });

  test('RD_MYL_01: Verify Contact-to-Lead Auto-Creation and Auto-Assignment to Creator on /mylead', async ({ contactPage, myLeadPage }) => {
    // Step 1: Generate authentic Indian contact persona
    const contactData = ContactDataGenerator.generate();

    // Step 2: Navigate to /contact and create new contact
    await contactPage.goto();
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

    // Verify row in /contact has Lead Generated icon active
    const contactRow0 = await contactPage.getRowData(0);
    expect(contactRow0.name).toContain(contactData.contactPersonName);
    expect(contactRow0.hasLeadGenerated).toBeTruthy();

    // Step 3: Navigate to /mylead page
    await myLeadPage.goto();
    await expect(myLeadPage.pageHeading).toBeVisible();
    await expect(myLeadPage.dataTable).toBeVisible();

    // Step 4: Verify auto-created lead appears in My Lead table assigned to Admin
    const leadRow0 = await myLeadPage.getRowData(0);
    expect(leadRow0.contactName.toLowerCase()).toContain(contactData.contactPersonName.toLowerCase());
    expect(leadRow0.salesManager).toBe('Admin'); // Auto-assigned to creator
    expect(leadRow0.status).toBe('Created');
    expect(leadRow0.createdBy).toBe('Admin');
  });

  test('RD_MYL_02: Verify My Lead table layout, headers, and filter accordion structure', async ({ myLeadPage }) => {
    await myLeadPage.goto();
    await expect(myLeadPage.pageHeading).toBeVisible();
    await expect(myLeadPage.filterAccordionHeader).toBeVisible();

    // Expand Filter Accordion
    await myLeadPage.expandFilter();

    // Verify Filter Form Fields exist
    await expect(myLeadPage.contactInput).toBeVisible();
    await expect(myLeadPage.statusDropdown).toBeVisible();
    await expect(myLeadPage.sourceDropdown).toBeVisible();
    await expect(myLeadPage.countryDropdown).toBeVisible();
    await expect(myLeadPage.searchBtn).toBeVisible();
    await expect(myLeadPage.clearBtn).toBeVisible();
  });

  test('RD_MYL_03: Search contact in My Lead filter and verify table displays matched record', async ({ myLeadPage }) => {
    await myLeadPage.goto();
    const firstRow = await myLeadPage.getRowData(0);
    const targetName = firstRow.contactName;
    expect(targetName).toBeTruthy();

    // Search by contact
    await myLeadPage.searchByContact(targetName);
    const rowCount = await myLeadPage.getDisplayedRowCount();
    expect(rowCount).toBeGreaterThanOrEqual(1);

    const filteredRow = await myLeadPage.getRowData(0);
    expect(filteredRow.contactName.toLowerCase()).toContain(targetName.toLowerCase());

    // Clear filter
    await myLeadPage.clearFilter();
  });

  test('RD_MYL_04: Filter by Status in My Lead and verify matching status badges', async ({ myLeadPage }) => {
    await myLeadPage.goto();

    // Filter by "Created" status
    await myLeadPage.filterByStatus('Created');
    const rowCount = await myLeadPage.getDisplayedRowCount();

    if (rowCount > 0) {
      const rowData = await myLeadPage.getRowData(0);
      expect(rowData.status).toBe('Created');
    }

    // Clear filter
    await myLeadPage.clearFilter();
  });

  test('RD_MYL_05: Verify My Lead pagination info indicator format', async ({ myLeadPage }) => {
    await myLeadPage.goto();
    await expect(myLeadPage.paginator).toBeVisible();
    const paginationText = await myLeadPage.getPaginationText();
    expect(paginationText).toMatch(/Showing \d+ to \d+ of \d+/i);
  });

  test('RD_MYL_06: Click Status badge opens Update Lead Status modal with title and controls', async ({ myLeadPage }) => {
    await myLeadPage.goto();
    const firstRow = await myLeadPage.getRowData(0);
    const targetName = firstRow.contactName;

    // Click Status badge
    await myLeadPage.clickStatusBadge(0);
    await myLeadPage.statusModal.waitForOpened();

    // Verify modal elements
    await expect(myLeadPage.statusModal.modalTitle).toContainText('Update Lead Status');
    await expect(myLeadPage.statusModal.modalTitle).toContainText(targetName);
    await expect(myLeadPage.statusModal.statusDropdown).toBeVisible();
    await expect(myLeadPage.statusModal.saveBtn).toBeVisible();
    await expect(myLeadPage.statusModal.closeBtn).toBeVisible();

    // Dismiss via CLOSE button
    await myLeadPage.statusModal.clickClose();
    await myLeadPage.statusModal.waitForClosed();
  });

  test('RD_MYL_07: Close Update Lead Status modal via top-right X icon', async ({ myLeadPage }) => {
    await myLeadPage.goto();
    await myLeadPage.clickStatusBadge(0);
    await myLeadPage.statusModal.waitForOpened();

    // Close via top-right X icon
    await myLeadPage.statusModal.closeViaIcon();
    await myLeadPage.statusModal.waitForClosed();
  });

  test('RD_MYL_08: Select new Status from dropdown and save updates lead status tag', async ({ myLeadPage }) => {
    await myLeadPage.goto();
    const beforeRow = await myLeadPage.getRowData(0);
    const initialStatus = beforeRow.status;

    // Choose target status different from current
    const newStatus = initialStatus.toLowerCase().includes('created') ? 'Calling' : 'Created';

    await myLeadPage.clickStatusBadge(0);
    await myLeadPage.statusModal.waitForOpened();
    await myLeadPage.statusModal.selectStatus(newStatus);
    await myLeadPage.statusModal.clickSave();
    await myLeadPage.statusModal.waitForClosed(8000).catch(() => {});

    // Verify row status tag updated
    const afterRow = await myLeadPage.getRowData(0);
    expect(afterRow.status.toLowerCase()).toContain(newStatus.toLowerCase());
  });

});

