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

  test('RD_DSH_06: Verify Lead Funnel & Stat Cards for Target User @user @akasnsha @akanksha @admin', async ({ loginPage, dashboardPage, page, currentUser }) => {
    console.log(`[RD_DSH_06] Running test with resolved user: "${currentUser.name}" <${currentUser.email}>`);

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
    console.log(`[RD_DSH_06] Attempting login with ${currentUser.email}...`);
    await loginPage.login(currentUser.email, currentUser.password);
    await loginPage.switchBackToRajasviTab();
    await page.waitForTimeout(1000);

    const postLoginUrl = page.url();
    console.log(`[RD_DSH_06] Post-login URL: ${postLoginUrl}`);

    if (postLoginUrl.includes('login')) {
      const err = await loginPage.errorMessage.textContent().catch(() => '');
      throw new Error(`Login failed for ${currentUser.name} (${currentUser.email}). Error: "${err}"`);
    }

    await dashboardPage.goto();
    await expect(dashboardPage.dashboardContainer).toBeVisible();

    // Verify Welcome Banner
    const welcomeGreeting = await dashboardPage.getWelcomeBannerGreeting();
    console.log(`[RD_DSH_06] Welcome Banner Greeting: "${welcomeGreeting}"`);
    expect(welcomeGreeting.toLowerCase()).toContain(currentUser.name.split(' ')[0].toLowerCase());

    // Read Funnel stages & Stat cards
    const totalLeads = await dashboardPage.getFunnelTotalLeads();
    const inFollowUp = await dashboardPage.getFunnelStageCount('In Follow Up');
    const followUpPending = await dashboardPage.getFunnelStageCount('Follow-up Pending');
    const created = await dashboardPage.getFunnelStageCount('Created');

    const newLeads = await dashboardPage.getStatCardValue('New Leads').catch(() => 0);
    const callsMade = await dashboardPage.getStatCardValue('Calls Made').catch(() => 0);
    const whatsApp = await dashboardPage.getStatCardValue('WhatsApp').catch(() => 0);
    const followupsStat = await dashboardPage.getFollowupsStatCardValue().catch(() => 0);
    const requirements = await dashboardPage.getStatCardValue('Requirements').catch(() => 0);
    const sampleInvoices = await dashboardPage.getStatCardValue('Sample Invoices').catch(() => 0);
    const sampleSales = await dashboardPage.getStatCardValue('Sample Sales').catch(() => 0);
    const convertedSales = await dashboardPage.getStatCardValue('Converted Sales').catch(() => 0);

    const enquiriesCount = await dashboardPage.recentEnquiriesRows.count().catch(() => 0);

    console.log('======================================================================');
    console.log(`[Dashboard Population Report: ${currentUser.name}]`);
    console.log(`- Welcome Greeting: "${welcomeGreeting}"`);
    console.log(`- Stat Card 'New Leads': ${newLeads}`);
    console.log(`- Stat Card 'Calls Made': ${callsMade}`);
    console.log(`- Stat Card 'WhatsApp': ${whatsApp}`);
    console.log(`- Stat Card 'Follow-ups': ${followupsStat}`);
    console.log(`- Stat Card 'Requirements': ${requirements}`);
    console.log(`- Stat Card 'Sample Invoices': ${sampleInvoices}`);
    console.log(`- Stat Card 'Sample Sales': ${sampleSales}`);
    console.log(`- Stat Card 'Converted Sales': ${convertedSales}`);
    console.log('----------------------------------------------------------------------');
    console.log(`- Lead Funnel Total Leads: ${totalLeads}`);
    console.log(`- Lead Funnel Created: ${created}`);
    console.log(`- Lead Funnel In Follow up: ${inFollowUp}`);
    console.log(`- Lead Funnel Follow-up Pending: ${followUpPending}`);
    console.log('----------------------------------------------------------------------');
    console.log(`- Recent Enquiries Rows Count: ${enquiriesCount}`);
    console.log('======================================================================');

    // Funnel Visibility Check
    if (currentUser.name.toLowerCase().includes('admin')) {
      console.log('[RD_DSH_06] Admin role: personal sales funnel is not applicable / 0.');
    } else {
      console.log(`[RD_DSH_06] Sales user ${currentUser.name}: verifying funnel visibility...`);
      await expect(dashboardPage.leadFunnelCard).toBeVisible();
    }

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
