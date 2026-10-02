import { test, expect } from '../../../core/fixtures/customFixtures';
import { Config } from '../../../utils/env';

test.describe('Reports Module - Lead Progress Report (/leadProgressReport) UI Test Suite (Single Login)', () => {
  test.setTimeout(90000);

  test('RD_REP_LPR_ALL: Single-Login Complete Validation of Lead Progress Report Module', async ({
    loginPage,
    dashboardPage,
    leadProgressReportPage,
    page
  }) => {
    // ── STEP 1: Single Login & Sidebar Navigation ──────────────────────────────
    await test.step('Step 1: Login once and navigate via Reports sidebar menu', async () => {
      await loginPage.goto();
      await loginPage.login(Config.adminEmail, Config.adminPassword);

      await dashboardPage.goto();
      await expect(dashboardPage.dashboardContainer).toBeVisible();

      // Navigate using sidebar menu: Reports -> Lead Progress Report
      await leadProgressReportPage.navigateViaSidebar();
      await expect(page).toHaveURL(/.*leadProgressReport/);
      await expect(leadProgressReportPage.pageHeading).toBeVisible();
    });

    // ── STEP 2: Filter Accordion Controls ──────────────────────────────────────
    await test.step('Step 2: Verify Filter accordion expand/collapse and filter controls', async () => {
      await expect(leadProgressReportPage.filterAccordionHeader).toBeVisible();

      // Expand filter
      await leadProgressReportPage.expandFilter();
      await expect(leadProgressReportPage.rangeDropdown).toBeVisible();
      await expect(leadProgressReportPage.fromDateInput).toBeVisible();
      await expect(leadProgressReportPage.toDateInput).toBeVisible();
      await expect(leadProgressReportPage.searchFilterBtn).toBeVisible();
      await expect(leadProgressReportPage.clearFilterBtn).toBeVisible();

      // Collapse filter
      await leadProgressReportPage.collapseFilter();
      await expect(leadProgressReportPage.searchFilterBtn).toBeHidden();
    });

    // ── STEP 3: Table Column Headers (13 Columns) ──────────────────────────────
    await test.step('Step 3: Verify all 13 table column headers match exact CRM specification', async () => {
      const titles = await leadProgressReportPage.getColumnTitles();
      console.log('[RD_REP_LPR] Table Columns:', titles);

      const expectedColumns = [
        'S.No',
        'Name',
        'Email',
        'Total Leads',
        'Created',
        'Calling',
        'Interested',
        'Activated',
        'Converted To Sales',
        'Not Interested',
        'Total Requirements',
        'Total Invoices',
        'Invoice Products'
      ];

      expect(titles.length).toBe(expectedColumns.length);
      for (let i = 0; i < expectedColumns.length; i++) {
        expect(titles[i]).toBe(expectedColumns[i]);
      }
    });

    // ── STEP 4: User Rows and Metrics ──────────────────────────────────────────
    let initialCount = 0;
    await test.step('Step 4: Verify user rows render with correct user names and metrics', async () => {
      initialCount = await leadProgressReportPage.getRowCount();
      expect(initialCount).toBeGreaterThan(0);
      console.log(`[RD_REP_LPR] Total User Rows: ${initialCount}`);

      // Verify first row contains Admin data
      const row0 = await leadProgressReportPage.getRowData(0);
      expect(row0.sNo).toBe('1');
      expect(row0.name).toContain('Admin');
      expect(row0.email).toContain('admin@rajasvidecor.com');
      expect(parseInt(row0.totalLeads, 10)).toBeGreaterThanOrEqual(0);

      // Verify presence of team members
      let foundRahul = false;
      let foundPriya = false;
      for (let i = 0; i < initialCount; i++) {
        const data = await leadProgressReportPage.getRowData(i);
        if (data.name.toLowerCase().includes('rahul')) foundRahul = true;
        if (data.name.toLowerCase().includes('priya')) foundPriya = true;
      }
      expect(foundRahul).toBe(true);
      expect(foundPriya).toBe(true);
    });

    // ── STEP 5: Footer TOTAL Row ───────────────────────────────────────────────
    await test.step('Step 5: Verify table footer TOTAL row aggregates', async () => {
      await expect(leadProgressReportPage.tableFooterRow).toBeVisible();
      const totals = await leadProgressReportPage.getFooterTotals();
      console.log('[RD_REP_LPR] Footer Totals:', totals);

      expect(totals.sNo).toBe('TOTAL');
      expect(parseInt(totals.totalLeads, 10)).toBeGreaterThanOrEqual(0);
    });

    // ── STEP 6: Global Search & Reset ──────────────────────────────────────────
    await test.step('Step 6: Verify global search filters dynamically and restores on clear', async () => {
      // Search for "Rahul"
      await leadProgressReportPage.searchGlobal('Rahul');
      await expect(leadProgressReportPage.tableRows).toHaveCount(1, { timeout: 8000 });
      const filteredCount = await leadProgressReportPage.getRowCount();
      expect(filteredCount).toBe(1);

      const filteredRow = await leadProgressReportPage.getRowData(0);
      expect(filteredRow.name.toLowerCase()).toContain('rahul');

      // Clear search and verify restored rows
      await leadProgressReportPage.clearGlobalSearch();
      await expect(leadProgressReportPage.tableRows).toHaveCount(initialCount, { timeout: 8000 });
      const restoredCount = await leadProgressReportPage.getRowCount();
      expect(restoredCount).toBe(initialCount);
    });

    // ── STEP 7: Drilldown Modal Click & Inspection ─────────────────────────────
    await test.step('Step 7: Verify drill-down click on non-zero count cell opens Lead Details dialog and close', async () => {
      const row0 = await leadProgressReportPage.getRowData(0);
      const totalLeads = parseInt(row0.totalLeads, 10);

      if (totalLeads > 0) {
        // Column index 3 is "Total Leads"
        await leadProgressReportPage.clickDrilldownCell(0, 3);
        await expect(leadProgressReportPage.dialogTitle).toHaveText('Lead Details');

        // Verify drill-down table columns: Name, Email, Phone, Status
        const dialogHeaders = await leadProgressReportPage.dialogHeaders.allInnerTexts();
        console.log('[RD_REP_LPR] Drilldown Table Headers:', dialogHeaders);
        expect(dialogHeaders.some(h => h.includes('Name'))).toBe(true);
        expect(dialogHeaders.some(h => h.includes('Email'))).toBe(true);
        expect(dialogHeaders.some(h => h.includes('Status'))).toBe(true);

        // Verify drilldown row count matches totalLeads
        const drilldownRows = await leadProgressReportPage.getDrilldownRowCount();
        expect(drilldownRows).toBe(totalLeads);

        // Close modal
        await leadProgressReportPage.closeDrilldownModal();
        await expect(leadProgressReportPage.leadDetailsDialog).toBeHidden();
      } else {
        console.log('[RD_REP_LPR] Total leads was 0, skipping drill-down click');
      }
    });

    // ── STEP 8: Pagination Elements ────────────────────────────────────────────
    await test.step('Step 8: Verify paginator presence and default rows-per-page', async () => {
      await expect(leadProgressReportPage.paginator).toBeVisible();
      await expect(leadProgressReportPage.rowsPerPageDropdown).toContainText('25');
    });
  });
});
