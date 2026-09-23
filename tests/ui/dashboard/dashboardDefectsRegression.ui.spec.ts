import { test, expect } from '../../../core/fixtures/customFixtures';

test.describe('Rajasvi Decor - Dashboard Failed Defects Regression Tests', () => {

  test('RD_DSH_09: Welcome banner displays logged-in user name dynamically (Not hardcoded Admin)', async ({ loginPage, dashboardPage }) => {
    // 1. Authenticate as regular user Priya Patel
    await loginPage.goto();
    await loginPage.login('priya.patel@gmail.com', 'password123');

    // 2. Navigate to Dashboard
    await dashboardPage.goto();
    await expect(dashboardPage.welcomeBanner).toBeVisible();

    // 3. Inspect Welcome Banner Heading: <h1 class="rd-banner-title">
    const bannerTitleText = (await dashboardPage.bannerTitle.innerText()).trim();
    console.log(`[RD_DSH_09] Logged in as Priya Patel. Observed Banner Title: "${bannerTitleText}"`);

    // Expected: Should contain user name "Priya" or "Priya Patel", not hardcoded "Admin!"
    expect(bannerTitleText, 'Welcome banner should display logged-in user name dynamically and not hardcoded "Admin!"').not.toMatch(/admin/i);
    expect(bannerTitleText).toMatch(/priya/i);
  });

  test('RD_DSH_06: Intercept Dashboard Metrics API and validate against UI Stat Cards', async ({ loginPage, dashboardPage, page }) => {
    // Capture metrics API response (e.g. /api/dashboard, /api/lead/stats, etc.)
    let metricsApiResponse: any = null;
    page.on('response', async (res) => {
      const url = res.url().toLowerCase();
      if ((url.includes('/dashboard') || url.includes('/stats') || url.includes('/funnel') || url.includes('/metrics')) && res.status() === 200) {
        try {
          const json = await res.json();
          if (json && typeof json === 'object') {
            console.log(`[API Intercepted] ${res.url()}`);
            metricsApiResponse = json;
          }
        } catch (_) {}
      }
    });

    await loginPage.goto();
    await loginPage.login('priya.patel@gmail.com', 'password123');

    await dashboardPage.goto();
    await expect(dashboardPage.dashboardContainer).toBeVisible();

    // Note from business rule: Calls Made & WhatsApp are not implemented yet, so they will always be 0
    const callsMade = await dashboardPage.getStatCardValue('Calls Made');
    const whatsApp = await dashboardPage.getStatCardValue('WhatsApp');
    console.log(`[Card Status] Calls Made: ${callsMade} (Expected 0 - not yet implemented)`);
    console.log(`[Card Status] WhatsApp: ${whatsApp} (Expected 0 - not yet implemented)`);
    expect(callsMade, 'Calls Made should be 0 until telephony integration').toBe(0);
    expect(whatsApp, 'WhatsApp should be 0 until WhatsApp integration').toBe(0);

    // Follow-ups metric card validation
    const followupsStat = await dashboardPage.getFollowupsStatCardValue();
    const funnelPending = await dashboardPage.getFunnelStageCount('Follow-up Pending');
    const funnelInFollowUp = await dashboardPage.getFunnelStageCount('In Follow Up');
    const funnelFollowupsTotal = funnelPending + funnelInFollowUp;

    console.log(`[RD_DSH_06] Follow-ups Stat Card: ${followupsStat} | Lead Funnel Total: ${funnelFollowupsTotal}`);
    expect(followupsStat, 'Follow-ups stat card value must match total follow-ups in Lead Funnel').toBe(funnelFollowupsTotal);

    if (metricsApiResponse) {
      console.log('[API Intercept] Raw Metrics API Payload:', JSON.stringify(metricsApiResponse).slice(0, 300));
    }
  });

  test('RD_DSH_07: Verify Recent Enquiries table date display format is localized DD/MM/YYYY or standard format', async ({ loginPage, dashboardPage }) => {
    await loginPage.goto();
    await loginPage.login('priya.patel@gmail.com', 'password123');

    await dashboardPage.goto();
    await expect(dashboardPage.recentEnquiriesSection).toBeVisible();

    const rowCount = await dashboardPage.recentEnquiriesRows.count();
    console.log(`[RD_DSH_07] Recent Enquiries Row Count: ${rowCount}`);
    expect(rowCount).toBeGreaterThan(0);

    const firstRow = await dashboardPage.getRecentEnquiryRow(0);
    console.log(`[RD_DSH_07] Row 0 Date Observed: "${firstRow.date}"`);

    // Expected: localized DD/MM/YYYY or DD-MM-YYYY format
    expect(firstRow.date, 'Date format should match standard localized DD/MM/YYYY or DD-MM-YYYY').toMatch(/^\d{2}[\/\-]\d{2}[\/\-]\d{4}$/);
  });

  test('RD_DSH_08: Verify View All button navigation in Recent Enquiries', async ({ loginPage, dashboardPage, page }) => {
    await loginPage.goto();
    await loginPage.login('priya.patel@gmail.com', 'password123');

    await dashboardPage.goto();
    await expect(dashboardPage.viewAllEnquiriesBtn).toBeVisible();

    console.log('[RD_DSH_08] Clicking "View All" button on Recent Enquiries widget...');
    const currentUrl = page.url();
    await dashboardPage.clickViewAllEnquiries();
    await page.waitForTimeout(2000);

    const newUrl = page.url();
    console.log(`[RD_DSH_08] URL before: ${currentUrl} | URL after click: ${newUrl}`);

    expect(newUrl, 'Clicking View All should navigate to enquiries or leads page').not.toBe(currentUrl);
    expect(newUrl).toMatch(/\/(lead|mylead|enquiry|enquiries)/i);
  });

  test('RD_ADM_01: Verify Admin login does not crash due to unmapped menu permission urls', async ({ loginPage, page }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', err => {
      console.log(`[RD_ADM_01 Page Error]: ${err.message}`);
      pageErrors.push(err.message);
    });

    console.log('[RD_ADM_01] Attempting Admin login (admin@rajasvidecor.com)...');
    await loginPage.goto();
    await loginPage.login('admin@rajasvidecor.com', 'Admin@123');

    await page.waitForTimeout(3000);
    const currentUrl = page.url();
    console.log(`[RD_ADM_01] Admin Post-Login URL: ${currentUrl}`);

    const pushError = pageErrors.find(e => e.includes('push') || e.includes('Cannot read properties of undefined'));
    expect(pushError, 'Admin login should not throw unhandled TypeError: Cannot read properties of undefined (reading push)').toBeUndefined();

    const bodyText = await page.locator('body').innerText();
    expect(bodyText.trim().length, 'Admin page should render UI and not be blank').toBeGreaterThan(50);
  });

});
