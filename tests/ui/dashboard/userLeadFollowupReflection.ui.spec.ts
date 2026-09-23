import { test, expect } from '../../../core/fixtures/customFixtures';

test.describe('Rajasvi Decor - User Lead Status Update & Follow-up Calculation Reflection', () => {

  const USER_EMAIL = process.env.USER_RAHUL_EMAIL || 'rahul.sharma@gmail.com';
  const USER_PASSWORD = process.env.USER_RAHUL_PASSWORD || 'password123';

  test.beforeEach(async ({ loginPage }) => {
    // 1. Login via regular user (Rahul Sharma)
    await loginPage.goto();
    await loginPage.login(USER_EMAIL, USER_PASSWORD);
  });

  test('RD_USR_01: Verify user can view their dashboard metrics and Follow-ups initial formula', async ({ dashboardPage }) => {
    await dashboardPage.goto();
    await expect(dashboardPage.dashboardContainer).toBeVisible();

    // Verify [Calls Made] and [WhatsApp] exist (noting they have no operational meaning right now)
    const callsMade = await dashboardPage.getStatCardValue('Calls Made');
    const whatsApp = await dashboardPage.getStatCardValue('WhatsApp');
    console.log(`[Informational] Calls Made: ${callsMade}, WhatsApp: ${whatsApp} (Currently placeholders)`);

    // Verify Follow-ups count aligns with sum(Follow-up Pending + In Follow Up)
    const followupsStat = await dashboardPage.getFollowupsStatCardValue();
    const calculatedSum = await dashboardPage.getCalculatedFollowupsSum();
    console.log(`[Baseline] Follow-ups Stat Card: ${followupsStat} | Calculated Sum: ${calculatedSum}`);
    expect(followupsStat).toBe(calculatedSum);
  });

  test('RD_USR_02: Change lead status to Follow-up Pending on /mylead and verify Follow-ups reflection on Dashboard', async ({ dashboardPage, myLeadPage }) => {
    // 1. Visit Dashboard and record baseline
    await dashboardPage.goto();
    const initialFollowupsStat = await dashboardPage.getFollowupsStatCardValue();
    const initialPendingCount = await dashboardPage.getFunnelStageCount('Follow-up Pending');

    // 2. Navigate to /mylead
    await myLeadPage.goto();
    await expect(myLeadPage.dataTable).toBeVisible();

    const rowCount = await myLeadPage.getDisplayedRowCount();
    expect(rowCount).toBeGreaterThan(0);

    // Pick first lead row
    const targetRow = await myLeadPage.getRowData(0);
    const targetContactName = targetRow.contactName;
    console.log(`Updating status for assigned lead: ${targetContactName} (Current Status: ${targetRow.status})`);

    // 3. Open Update Lead Status modal
    await myLeadPage.clickStatusBadge(0);
    await myLeadPage.statusModal.waitForOpened();

    // Select "Follow-up Pending"
    await myLeadPage.statusModal.selectStatus('Follow-up Pending');
    await myLeadPage.statusModal.clickSave();
    await myLeadPage.statusModal.waitForClosed(8000).catch(() => {});

    // Verify table row badge updated
    const updatedRow = await myLeadPage.getRowData(0);
    expect(updatedRow.status.toLowerCase()).toContain('follow-up pending');

    // 4. Navigate back to Dashboard to verify formula reflection
    await dashboardPage.goto();

    const updatedPendingCount = await dashboardPage.getFunnelStageCount('Follow-up Pending');
    const updatedFollowupsStat = await dashboardPage.getFollowupsStatCardValue();
    const updatedCalculatedSum = await dashboardPage.getCalculatedFollowupsSum();

    console.log(`[After Update] Funnel Follow-up Pending: ${updatedPendingCount} (was ${initialPendingCount})`);
    console.log(`[After Update] Follow-ups Stat Card: ${updatedFollowupsStat} | Calculated Sum: ${updatedCalculatedSum}`);

    // Verify Follow-up Pending count incremented
    expect(updatedPendingCount).toBeGreaterThanOrEqual(initialPendingCount + 1);

    // Verify Follow-ups stat card reflects sum(Follow-up Pending + In Follow Up)
    expect(updatedFollowupsStat).toBe(updatedCalculatedSum);
  });

});
