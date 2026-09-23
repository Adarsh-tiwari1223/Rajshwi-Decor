import { test, expect } from '../../../core/fixtures/customFixtures';

export interface DashboardStatsApiResponse {
  newLeads: number;
  callsMade: number;
  whatsApp: number;
  followUps: number;
  requirements: number;
  sampleInvoices: number;
  sampleSales: number;
  convertedSales: number;
}

export interface FunnelStageItem {
  stage: string;
  count: number;
}

export interface TopLeadItem {
  leadId: number;
  name: string;
  enquiryType: string | null;
  purpose: string | null;
  date: string;
  status: string;
}

test.describe('Rajasvi Decor - Comprehensive Dashboard Validation (API vs UI)', () => {

  test('Complete Dashboard Validation: Stat Cards, Lead Funnel Stages & Recent Enquiries vs API', async ({ loginPage, dashboardPage, page }) => {
    let statsApi: DashboardStatsApiResponse | null = null;
    let funnelApi: FunnelStageItem[] | null = null;
    let topLeadsApi: TopLeadItem[] | null = null;

    // 1. Intercept Dashboard Backend APIs
    page.on('response', async (res) => {
      const url = res.url();
      if (res.status() === 200) {
        if (url.includes('/api/Dashboard/stats')) {
          try { statsApi = await res.json(); } catch (_) {}
        }
        if (url.includes('/api/Dashboard/lead-funnel')) {
          try { funnelApi = await res.json(); } catch (_) {}
        }
        if (url.includes('/api/Dashboard/getTopLead')) {
          try { topLeadsApi = await res.json(); } catch (_) {}
        }
      }
    });

    // 2. Login as Admin
    await loginPage.goto();
    await loginPage.login('admin@rajasvidecor.com', 'Admin@123');

    // 3. Ensure Dashboard is loaded
    await dashboardPage.goto();
    await expect(dashboardPage.dashboardContainer).toBeVisible();

    // Await API responses
    await expect.poll(() => statsApi, { timeout: 10000 }).not.toBeNull();
    await expect.poll(() => funnelApi, { timeout: 10000 }).not.toBeNull();
    await expect.poll(() => topLeadsApi, { timeout: 10000 }).not.toBeNull();

    console.log('\n======================================================================');
    console.log('PART 1: 8 STAT CARDS VALIDATION (API vs UI)');
    console.log('======================================================================');

    const cardMapping = [
      { name: 'New Leads', apiValue: statsApi!.newLeads },
      { name: 'Calls Made', apiValue: statsApi!.callsMade },
      { name: 'WhatsApp', apiValue: statsApi!.whatsApp },
      { name: 'Follow-ups', apiValue: statsApi!.followUps },
      { name: 'Requirements', apiValue: statsApi!.requirements },
      { name: 'Sample Invoices', apiValue: statsApi!.sampleInvoices },
      { name: 'Sample Sales', apiValue: statsApi!.sampleSales },
      { name: 'Converted Sales', apiValue: statsApi!.convertedSales }
    ];

    for (const card of cardMapping) {
      const uiVal = await dashboardPage.getStatCardValue(card.name);
      console.log(`[Stat Card] ${card.name.padEnd(16)} | API: ${String(card.apiValue).padStart(3)} | UI: ${String(uiVal).padStart(3)}`);
      expect(uiVal, `Stat card "${card.name}" UI value must match API payload`).toBe(card.apiValue);
    }

    // Unimplemented telephony / WhatsApp rule
    expect(statsApi!.callsMade, 'Calls Made must be 0').toBe(0);
    expect(statsApi!.whatsApp, 'WhatsApp must be 0').toBe(0);

    // Follow-ups formula rule: Follow-ups = Follow-up Pending + In Follow up
    const pending = funnelApi!.find(f => f.stage === 'Follow-up Pending')?.count || 0;
    const inFollowUp = funnelApi!.find(f => f.stage === 'In Follow up')?.count || 0;
    const calculatedFollowups = pending + inFollowUp;
    console.log(`\n[Follow-ups Formula] Pending (${pending}) + In Follow up (${inFollowUp}) = ${calculatedFollowups} | Stat Card: ${statsApi!.followUps}`);
    expect(statsApi!.followUps, 'Follow-ups must equal Pending + In Follow up').toBe(calculatedFollowups);

    console.log('\n======================================================================');
    console.log('PART 2: LEAD FUNNEL STAGES VALIDATION (API vs UI)');
    console.log('======================================================================');

    // Funnel header total count
    const totalFunnelApi = funnelApi!.reduce((sum, item) => sum + item.count, 0);
    const totalFunnelUi = await dashboardPage.getFunnelTotalLeads();
    console.log(`[Lead Funnel Total] API Total: ${totalFunnelApi} | UI Total Badge: ${totalFunnelUi}`);
    expect(totalFunnelUi, 'Funnel total leads badge must match total sum of stage counts from API').toBe(totalFunnelApi);

    // Validate key primary funnel stages against API
    const primaryStages = ['Created', 'Calling', 'Activated'];
    for (const stage of primaryStages) {
      const stageApiCount = funnelApi!.find(f => f.stage === stage)?.count || 0;
      const stageUiCount = await dashboardPage.getFunnelStageCount(stage);
      console.log(`[Funnel Stage] ${stage.padEnd(14)} | API: ${String(stageApiCount).padStart(3)} | UI: ${String(stageUiCount).padStart(3)}`);
      expect(stageUiCount, `Funnel stage "${stage}" count must match API`).toBe(stageApiCount);
    }

    console.log('\n======================================================================');
    console.log('PART 3: RECENT ENQUIRIES TABLE VALIDATION (API vs UI)');
    console.log('======================================================================');

    const uiRowCount = await dashboardPage.recentEnquiriesRows.count();
    console.log(`[Recent Enquiries] API Rows: ${topLeadsApi!.length} | UI Rows: ${uiRowCount}`);
    expect(uiRowCount, 'Recent enquiries table row count must match API count').toBe(topLeadsApi!.length);

    for (let i = 0; i < topLeadsApi!.length; i++) {
      const apiItem = topLeadsApi![i];
      const uiItem = await dashboardPage.getRecentEnquiryRow(i);
      console.log(`[Row ${i + 1}] Name: "${uiItem.name}" (API: "${apiItem.name}") | Status: "${uiItem.status}" (API: "${apiItem.status}")`);
      expect(uiItem.name.toLowerCase(), `Row ${i} name must match API`).toContain(apiItem.name.toLowerCase());
      expect(uiItem.status.toLowerCase(), `Row ${i} status must match API`).toBe(apiItem.status.toLowerCase());
    }

    console.log('\n======================================================================');
    console.log('DASHBOARD COMPLETE VALIDATION: ALL PARTS PASSED (100% MATCH)');
    console.log('======================================================================');
  });

});
