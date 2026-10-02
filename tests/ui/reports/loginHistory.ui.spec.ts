import { test, expect } from '../../../core/fixtures/customFixtures';
import { Config } from '../../../utils/env';

test.describe('Reports Module - Login History (/loginHistory) UI Test Suite (Single Login)', () => {
  test.setTimeout(90000);

  test('RD_REP_LH_ALL: Single-Login Complete Validation of Login History Module', async ({
    loginPage,
    dashboardPage,
    loginHistoryPage,
    page
  }) => {
    // ── STEP 1: Single Login & Sidebar Navigation ──────────────────────────────
    await test.step('Step 1: Login once and navigate via Reports sidebar menu', async () => {
      await loginPage.goto();
      await loginPage.login(Config.adminEmail, Config.adminPassword);

      await dashboardPage.goto();
      await expect(dashboardPage.dashboardContainer).toBeVisible();

      // Navigate using sidebar menu: Reports -> Login History
      await loginHistoryPage.navigateViaSidebar();
      await expect(page).toHaveURL(/.*loginHistory/);
      await expect(loginHistoryPage.pageHeading).toBeVisible();
    });

    // ── STEP 2: Filter Accordion & Search Bar ──────────────────────────────────
    await test.step('Step 2: Verify Filter accordion and search input visibility', async () => {
      await expect(loginHistoryPage.filterAccordionHeader).toBeVisible();
      await expect(loginHistoryPage.globalSearchInput).toBeVisible();
    });

    // ── STEP 3: Table Columns & Sortable Headers ───────────────────────────────
    await test.step('Step 3: Verify all 6 table columns match exact schema and check sortable columns', async () => {
      const titles = await loginHistoryPage.getColumnTitles();
      console.log('[RD_REP_LH] Table Columns:', titles);

      const expectedColumns = [
        'S.No',
        'Name',
        'Email',
        'Login Count',
        'Status',
        'History'
      ];

      expect(titles.length).toBe(expectedColumns.length);
      for (let i = 0; i < expectedColumns.length; i++) {
        expect(titles[i]).toBe(expectedColumns[i]);
      }

      // Verify sortable columns have sort icons
      const sortableHeaders = loginHistoryPage.tableHeaders.filter({
        has: loginHistoryPage.page.locator('.p-sortable-column-icon')
      });
      expect(await sortableHeaders.count()).toBeGreaterThanOrEqual(2);
    });

    // ── STEP 4: User Rows, Counts, and Status ──────────────────────────────────
    let initialCount = 0;
    await test.step('Step 4: Verify user login counts and active status rendering', async () => {
      initialCount = await loginHistoryPage.getRowCount();
      expect(initialCount).toBeGreaterThan(0);
      console.log(`[RD_REP_LH] Total User Rows: ${initialCount}`);

      // Verify Admin row (row 0)
      const row0 = await loginHistoryPage.getRowData(0);
      expect(row0.sNo).toBe('1');
      expect(row0.name).toContain('Admin');
      expect(row0.email).toContain('admin@rajasvidecor.com');
      expect(parseInt(row0.loginCount, 10)).toBeGreaterThan(0);
      expect(row0.status).toBe('Logged In');
      expect(row0.hasHistoryBtn).toBe(true);
    });

    // ── STEP 5: Eye Action Button in History Column ────────────────────────────
    let activeRowIndex = -1;
    let inactiveRowIndex = -1;
    await test.step('Step 5: Verify Eye action button behavior for active vs inactive users', async () => {
      for (let i = 0; i < initialCount; i++) {
        const data = await loginHistoryPage.getRowData(i);
        if (parseInt(data.loginCount, 10) > 0 && activeRowIndex === -1) {
          activeRowIndex = i;
        }
        if (parseInt(data.loginCount, 10) === 0 && inactiveRowIndex === -1) {
          inactiveRowIndex = i;
        }
      }

      // Active row must have eye button
      expect(activeRowIndex).toBeGreaterThanOrEqual(0);
      const activeRow = await loginHistoryPage.getRowData(activeRowIndex);
      expect(activeRow.hasHistoryBtn).toBe(true);

      // Inactive row should have "-" without eye button
      if (inactiveRowIndex >= 0) {
        const inactiveRow = await loginHistoryPage.getRowData(inactiveRowIndex);
        expect(inactiveRow.hasHistoryBtn).toBe(false);
        expect(inactiveRow.status).toBe('Not Logged In Yet');
      }
    });

    // ── STEP 6: History Modal Drilldown ────────────────────────────────────────
    await test.step('Step 6: Click Eye button opens History detail dialog, inspect logs and close', async () => {
      await loginHistoryPage.clickHistoryButton(0);
      await expect(loginHistoryPage.historyDialog).toBeVisible();

      // Verify dialog table and records
      await expect(loginHistoryPage.dialogTable).toBeVisible();
      const historyRows = await loginHistoryPage.dialogRows.count();
      console.log(`[RD_REP_LH] History records in dialog: ${historyRows}`);
      expect(historyRows).toBeGreaterThanOrEqual(1);

      // Close modal
      await loginHistoryPage.closeHistoryDialog();
      await expect(loginHistoryPage.historyDialog).toBeHidden();
    });

    // ── STEP 7: Global Search Filtering & Reset ───────────────────────────────
    await test.step('Step 7: Verify global search filters by user name/email and restores on clear', async () => {
      // Search for "Priya"
      await loginHistoryPage.searchGlobal('Priya');
      await expect(loginHistoryPage.tableRows).toHaveCount(1, { timeout: 8000 });
      const filteredCount = await loginHistoryPage.getRowCount();
      expect(filteredCount).toBe(1);

      const row = await loginHistoryPage.getRowData(0);
      expect(row.name.toLowerCase()).toContain('priya');

      // Clear search and verify restoration
      await loginHistoryPage.clearGlobalSearch();
      await expect(loginHistoryPage.tableRows).toHaveCount(initialCount, { timeout: 8000 });
      const restoredCount = await loginHistoryPage.getRowCount();
      expect(restoredCount).toBe(initialCount);
    });

    // ── STEP 8: Paginator Elements ─────────────────────────────────────────────
    await test.step('Step 8: Verify pagination text and controls', async () => {
      await expect(loginHistoryPage.paginator).toBeVisible();
      const paginationText = await loginHistoryPage.getPaginationText();
      console.log(`[RD_REP_LH] Pagination Text: "${paginationText}"`);
      expect(paginationText).toContain('Showing');
      expect(paginationText).toContain('of');
    });
  });
});
