import { test, expect } from '../../../core/fixtures/customFixtures';
import { Config } from '../../../utils/env';

test.describe('Lead Module - Lead Details (leadDetails) UI Test Suite', () => {
  test.setTimeout(60000);

  test.beforeEach(async ({ loginPage, myLeadPage }) => {
    // 1. Authenticate with Priya Patel credentials
    await loginPage.goto();
    await loginPage.login('priya.patel@gmail.com', 'password123');

    // 2. Navigate to /mylead
    await myLeadPage.goto();
  });

  test('RD_LDD_01: Click Contact Name in My Lead table opens /leadDetails and displays Hero Section', async ({ myLeadPage, leadDetailsPage, page }) => {
    const firstRow = await myLeadPage.getRowData(0);
    const targetName = firstRow.contactName;
    expect(targetName).toBeTruthy();

    // Click Contact Name
    await myLeadPage.clickContactName(0);
    await page.waitForURL('**/leadDetails**', { timeout: 10000 });

    // Verify Hero Section
    await expect(leadDetailsPage.leadCodeText).toBeVisible();
    await expect(leadDetailsPage.leadActiveBadge).toBeVisible();
    await expect(page.locator('.ld-hero')).toContainText(targetName);
    await expect(leadDetailsPage.assignedToText).toBeVisible();
  });

  test('RD_LDD_02: Click Contact Email in My Lead table opens /leadDetails and displays Contact Info Grid', async ({ myLeadPage, leadDetailsPage, page }) => {
    const firstRow = await myLeadPage.getRowData(0);
    const targetEmail = firstRow.email;
    expect(targetEmail).toBeTruthy();

    // Click Contact Email
    await myLeadPage.clickContactEmail(0);
    await page.waitForURL('**/leadDetails**', { timeout: 10000 });

    // Verify Contact Info Grid
    await expect(page.locator('.ld-contact-grid')).toBeVisible();
    await expect(leadDetailsPage.whatsappIcon).toBeVisible();
    await expect(page.locator('.ld-contact-grid')).toContainText(targetEmail);
  });

  test('RD_LDD_03: Verify Update Stage section controls and attributes', async ({ myLeadPage, leadDetailsPage, page }) => {
    await myLeadPage.clickContactName(0);
    await page.waitForURL('**/leadDetails**', { timeout: 10000 });

    // Verify Stage row controls
    await expect(leadDetailsPage.currentStageDropdown).toBeVisible();
    await expect(leadDetailsPage.businessTypeDropdown).toBeVisible();
    await expect(leadDetailsPage.customerTypeDropdown).toBeVisible();
    await expect(leadDetailsPage.sampleRequiredSwitch).toBeVisible();
    await expect(leadDetailsPage.stageDescriptionTextarea).toBeVisible();
    await expect(leadDetailsPage.saveChangesBtn).toBeVisible();
  });

  test('RD_LDD_04: Verify the 6 Segmented Pill Tabs menu and tab switching', async ({ myLeadPage, leadDetailsPage, page }) => {
    await myLeadPage.clickContactName(0);
    await page.waitForURL('**/leadDetails**', { timeout: 10000 });

    // Verify all 6 Segmented Tabs exist
    await expect(leadDetailsPage.overviewTab).toBeVisible();
    await expect(leadDetailsPage.requirementsTab).toBeVisible();
    await expect(leadDetailsPage.productsTab).toBeVisible();
    await expect(leadDetailsPage.customizationTab).toBeVisible();
    await expect(leadDetailsPage.addressTab).toBeVisible();
    await expect(leadDetailsPage.invoiceTab).toBeVisible();

    // Switch between tabs
    await leadDetailsPage.selectTab('Requirements');
    await expect(leadDetailsPage.requirementsTab).toHaveClass(/p-highlight/);

    await leadDetailsPage.selectTab('Overview');
    await expect(leadDetailsPage.overviewTab).toHaveClass(/p-highlight/);
  });

  test('RD_LDD_05: Verify the 4 Overview summary cards rendering', async ({ myLeadPage, leadDetailsPage, page }) => {
    await myLeadPage.clickContactName(0);
    await page.waitForURL('**/leadDetails**', { timeout: 10000 });

    // Verify 4 Overview cards
    await expect(leadDetailsPage.requirementSummaryCard).toBeVisible();
    await expect(leadDetailsPage.productSummaryCard).toBeVisible();
    await expect(leadDetailsPage.customizationSummaryCard).toBeVisible();
    await expect(leadDetailsPage.sampleSummaryCard).toBeVisible();
  });

  test('RD_LDD_06: Click Back to leads button navigates back to /mylead', async ({ myLeadPage, leadDetailsPage, page }) => {
    await myLeadPage.clickContactName(0);
    await page.waitForURL('**/leadDetails**', { timeout: 10000 });

    // Click Back button
    await leadDetailsPage.clickBackToLeads();
    await page.waitForURL('**/mylead**', { timeout: 10000 });
    await expect(myLeadPage.pageHeading).toBeVisible();
    await expect(myLeadPage.dataTable).toBeVisible();
  });

});
