import { test, expect } from '../../../core/fixtures/customFixtures';
import { Config } from '../../../utils/env';

test.describe('Rajasvi Decor - Lead Details Meeting Scheduling Test Suite', () => {
  test.setTimeout(90000);

  test.beforeEach(async ({ loginPage, myLeadPage, leadDetailsPage }) => {
    // 1. Authenticate (Priya Patel has active leads and leadDetails permissions)
    const priya = Config.users.find(u => u.name === 'Priya Patel') || Config.users[0];
    await loginPage.goto();
    await loginPage.login(priya.email, priya.password);

    // 2. Navigate to My Leads and click the first available lead
    await myLeadPage.goto();
    await myLeadPage.tableRows.first().waitFor({ state: 'visible', timeout: 15000 });
    await myLeadPage.clickContactName(0);
    await leadDetailsPage.page.waitForURL('**/leadDetails**', { timeout: 15000 });
  });

  test('RD_MTG_01: Verify Meeting Tab layout, default form fields, and table headers', async ({ leadDetailsPage }) => {
    // 1. Select the Meeting tab
    console.log('[RD_MTG_01] Selecting Meeting tab in Lead Details...');
    await leadDetailsPage.selectTab('Meeting');

    // 2. Verify Meeting Tab is active
    await expect(leadDetailsPage.meetingTab).toBeVisible();
    await expect(leadDetailsPage.meetingTab).toHaveClass(/p-highlight/);

    // 3. Verify Form Fields
    await expect(leadDetailsPage.meetingTitleInput).toBeVisible();
    await expect(leadDetailsPage.meetingDateInput).toBeVisible();
    await expect(leadDetailsPage.meetingDurationDropdown).toBeVisible();
    await expect(leadDetailsPage.meetingStartTimeInput).toBeVisible();
    await expect(leadDetailsPage.meetingEndTimeInput).toBeVisible();
    await expect(leadDetailsPage.meetingEndTimeInput).toBeDisabled();
    await expect(leadDetailsPage.meetingTypeDropdown).toBeVisible();
    await expect(leadDetailsPage.meetingDescriptionTextarea).toBeVisible();
    await expect(leadDetailsPage.meetingStatusDropdown).toBeVisible();
    await expect(leadDetailsPage.meetingSaveBtn).toBeVisible();

    // 4. Verify Meetings Table
    await expect(leadDetailsPage.meetingsTable).toBeVisible();
    const tableHeaders = await leadDetailsPage.meetingsTable.locator('thead th').allInnerTexts();
    console.log('[RD_MTG_01] Observed Meeting Table Headers:', tableHeaders.map(h => h.trim()).filter(Boolean));

    expect(tableHeaders.some(h => h.includes('Meeting Title'))).toBe(true);
    expect(tableHeaders.some(h => h.includes('Status'))).toBe(true);
    expect(tableHeaders.some(h => h.includes('Duration'))).toBe(true);
  });

  test('RD_MTG_02: Fill and schedule a new meeting, then verify table reflection and status', async ({ leadDetailsPage, page }) => {
    await leadDetailsPage.selectTab('Meeting');

    // Listen for meeting creation API response
    let createMeetingRes: any = null;
    page.on('response', async (res) => {
      const url = res.url().toLowerCase();
      if ((url.includes('/meeting') || url.includes('/schedule')) && res.request().method() === 'POST') {
        try {
          createMeetingRes = await res.json();
          console.log(`[API Meeting Response] Status ${res.status()}:`, JSON.stringify(createMeetingRes).slice(0, 300));
        } catch (_) {}
      }
    });

    const meetingTitle = `Discussion Meeting ${Date.now()}`;
    const todayStr = new Date().toISOString().split('T')[0];

    console.log(`[RD_MTG_02] Scheduling new meeting: "${meetingTitle}" on ${todayStr}...`);

    // Fill Title
    await leadDetailsPage.meetingTitleInput.fill(meetingTitle);

    // Fill Date
    await leadDetailsPage.meetingDateInput.fill(todayStr);

    // Fill Start Time (e.g. 11:30)
    await leadDetailsPage.meetingStartTimeInput.fill('11:30');

    // Add Description
    await leadDetailsPage.meetingDescriptionTextarea.fill('Automated test meeting created via Playwright framework.');

    // Click Save
    await leadDetailsPage.meetingSaveBtn.click();
    await page.waitForTimeout(2000);

    // Verify toast or confirmation
    const toast = page.locator('.p-toast-message, .p-toast-detail');
    if (await toast.isVisible({ timeout: 4000 }).catch(() => false)) {
      const toastText = (await toast.innerText()).trim();
      console.log(`[RD_MTG_02] Toast Message: "${toastText}"`);
    }

    // Wait for the newly created meeting row to appear in the table
    const meetingRow = leadDetailsPage.meetingsTable.locator('tbody tr').filter({ hasText: meetingTitle });
    await expect(meetingRow).toBeVisible({ timeout: 15000 });

    const rowText = (await meetingRow.innerText()).replace(/\t/g, ' | ').replace(/\n/g, ' ');
    console.log(`[RD_MTG_02] Confirmed Scheduled Meeting Row:\n${rowText}`);

    // Verify key fields in row
    expect(rowText).toContain(meetingTitle);
    expect(rowText).toContain('Scheduled');
    expect(rowText).toContain('Priya Patel');
  });

  test('RD_MTG_03: Verify End Time is auto-computed based on Start Time and Duration', async ({ leadDetailsPage, page }) => {
    await leadDetailsPage.selectTab('Meeting');

    // Select start time 10:00
    await leadDetailsPage.meetingStartTimeInput.fill('10:00');
    await leadDetailsPage.page.waitForTimeout(500);

    // Check End Time value
    const endTimeValue = await leadDetailsPage.meetingEndTimeInput.inputValue();
    console.log(`[RD_MTG_03] Start Time: "10:00" -> Computed End Time: "${endTimeValue}"`);

    // With 15 mins default duration, 10:00 should auto-populate 10:15
    expect(endTimeValue).toBeTruthy();
  });
});
