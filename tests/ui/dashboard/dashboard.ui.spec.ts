import { test, expect } from '../../../core/fixtures/customFixtures';

test.describe('Rajasvi Decor - Dashboard & Lead Status Reflection UI Tests', () => {

  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login('admin@rajasvidecor.com', 'Admin@123');
  });

  test('RD_DSH_01: Verify Dashboard Welcome Banner, Taglines, and Top Filters', async ({ dashboardPage }) => {
    await dashboardPage.goto();

    // Verify main container
    await expect(dashboardPage.dashboardContainer).toBeVisible();

    // Verify Welcome Banner
    await expect(dashboardPage.welcomeBanner).toBeVisible();
    await expect(dashboardPage.bannerEyebrow).toContainText('WELCOME BACK');
    await expect(dashboardPage.bannerTitle).toContainText('Admin');
    await expect(dashboardPage.bannerTagline).toContainText('BEAUTIFUL SPACES');
    await expect(dashboardPage.bannerTagline).toContainText('STRONGER RELATIONSHIPS');

    // Verify Filters
    await expect(dashboardPage.dateRangeInput).toBeVisible();
    await expect(dashboardPage.userFilterDropdown).toBeVisible();
  });

  test('RD_DSH_02: Verify 8 Core Business Stat Cards Display on Dashboard', async ({ dashboardPage }) => {
    await dashboardPage.goto();

    // Ensure 8 stat cards are present
    const cardCount = await dashboardPage.statCards.count();
    expect(cardCount).toBe(8);

    // Verify metric values can be read
    const newLeads = await dashboardPage.getStatCardValue('New Leads');
    expect(newLeads).toBeGreaterThanOrEqual(0);

    const callsMade = await dashboardPage.getStatCardValue('Calls Made');
    expect(callsMade).toBeGreaterThanOrEqual(0);

    const requirements = await dashboardPage.getStatCardValue('Requirements');
    expect(requirements).toBeGreaterThanOrEqual(0);
  });

  test('RD_DSH_03: Verify Lead Funnel Widget Structure, Stages, and Percentages', async ({ dashboardPage }) => {
    await dashboardPage.goto();

    // Verify Lead Funnel card
    await expect(dashboardPage.leadFunnelCard).toBeVisible();
    await expect(dashboardPage.leadFunnelTitle).toHaveText('Lead Funnel');

    // Verify total leads count
    const totalLeads = await dashboardPage.getFunnelTotalLeads();
    expect(totalLeads).toBeGreaterThan(0);

    // Verify stage count
    const createdCount = await dashboardPage.getFunnelStageCount('Created');
    expect(createdCount).toBeGreaterThanOrEqual(0);

    const createdPercentage = await dashboardPage.getFunnelStagePercentage('Created');
    expect(createdPercentage).toMatch(/\d+%/);
  });

  test('RD_DSH_04: Verify Recent Enquiries Table and Row Layout', async ({ dashboardPage }) => {
    await dashboardPage.goto();

    // Verify Recent Enquiries section
    await expect(dashboardPage.recentEnquiriesSection).toBeVisible();
    await expect(dashboardPage.recentEnquiriesTitle).toHaveText('Recent Enquiries');
    await expect(dashboardPage.viewAllEnquiriesBtn).toBeVisible();

    // Verify table has records
    const rowCount = await dashboardPage.recentEnquiriesRows.count();
    expect(rowCount).toBeGreaterThan(0);

    // Inspect first row
    const firstRow = await dashboardPage.getRecentEnquiryRow(0);
    expect(firstRow.name).toBeTruthy();
    expect(firstRow.status).toBeTruthy();
  });

  test('RD_DSH_05: Verify Lead Status Update on /mylead immediately reflects on Dashboard Lead Funnel and Recent Enquiries', async ({ dashboardPage, myLeadPage }) => {
    // 1. Visit Dashboard and capture baseline metrics
    await dashboardPage.goto();
    const initialCreatedCount = await dashboardPage.getFunnelStageCount('Created');
    const initialCallingCount = await dashboardPage.getFunnelStageCount('Calling');

    // 2. Navigate to /mylead
    await myLeadPage.goto();
    const targetRow = await myLeadPage.getRowData(0);
    const targetContactName = targetRow.contactName;
    const initialStatus = targetRow.status;

    // Determine new status to toggle
    const newStatus = initialStatus.toLowerCase().includes('created') ? 'Calling' : 'Created';

    // 3. Update status via Modal
    await myLeadPage.clickStatusBadge(0);
    await myLeadPage.statusModal.waitForOpened();
    await myLeadPage.statusModal.selectStatus(newStatus);
    await myLeadPage.statusModal.clickSave();
    await myLeadPage.statusModal.waitForClosed(8000).catch(() => {});

    // Verify row status tag updated on /mylead
    const updatedRow = await myLeadPage.getRowData(0);
    expect(updatedRow.status.toLowerCase()).toContain(newStatus.toLowerCase());

    // 4. Navigate back to Dashboard to verify reflection
    await dashboardPage.goto();

    // Verify Lead Funnel counts have updated
    const updatedCreatedCount = await dashboardPage.getFunnelStageCount('Created');
    const updatedCallingCount = await dashboardPage.getFunnelStageCount('Calling');

    if (newStatus === 'Calling') {
      // Calling should increase by 1 or be at least initialCallingCount + 1
      expect(updatedCallingCount).toBeGreaterThanOrEqual(initialCallingCount + 1);
    } else {
      // Created should increase
      expect(updatedCreatedCount).toBeGreaterThanOrEqual(initialCreatedCount + 1);
    }

    // Check if the enquiry is in Recent Enquiries table and reflects the updated status
    const enquiry = await dashboardPage.findRecentEnquiryByName(targetContactName);
    if (enquiry) {
      expect(enquiry.status.toLowerCase()).toContain(newStatus.toLowerCase());
    }
  });

});
