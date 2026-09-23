import { test, expect } from '../../../core/fixtures/customFixtures';

test.describe('Rajasvi Decor - Lead Details Tab 3: Customization Flow (Priya Patel)', () => {
  test.setTimeout(60000);

  test.beforeEach(async ({ loginPage }) => {
    // 1. Authenticate with Priya Patel credentials and synchronize with Dashboard load
    await loginPage.goto();
    await loginPage.login('priya.patel@gmail.com', 'password123');
  });

  const openCustomizationTab = async (myLeadPage: any, leadDetailsPage: any) => {
    // 1. Navigate to /mylead
    await myLeadPage.goto();
    await myLeadPage.tableRows.first().waitFor({ state: 'visible', timeout: 15000 });

    // 2. Click on the first Contact Name to navigate to /leadDetails
    await myLeadPage.clickContactName(0);
    await leadDetailsPage.page.waitForURL('**/leadDetails**', { timeout: 15000 });

    // 3. Select Tab 3: Customization
    await leadDetailsPage.selectTab('Customization');
    await expect(leadDetailsPage.customizationTab).toHaveClass(/p-highlight/);
  };

  test('RD_CUS_01: Verify Tab 3 layout, Requirement dropdown scoping, and initial empty state', async ({ myLeadPage, leadDetailsPage }) => {
    await openCustomizationTab(myLeadPage, leadDetailsPage);

    // 1. Verify Customization section header
    const header = leadDetailsPage.page.locator('div:has(> .flex > span:has-text("Customization")), span:has-text("Customization")').first();
    await expect(header).toBeVisible();

    // 2. Verify Requirement dropdown lists requirements from Tab 1 / Tab 2
    await expect(leadDetailsPage.customizationTabRequirementDropdown).toBeVisible();
    const selectedReq = await leadDetailsPage.getCustomizationRequirementSelected();
    expect(selectedReq.length).toBeGreaterThan(0);
    console.log(`Tab 3 Customization scoped to Requirement: "${selectedReq}"`);

    // 3. Verify Add Customization button with pi-plus icon
    await expect(leadDetailsPage.addCustomizationBtn).toBeVisible();
    await expect(leadDetailsPage.addCustomizationBtn.locator('.pi-plus')).toBeVisible();

    // 4. Verify Empty state message when no customization set
    const isEmpty = await leadDetailsPage.customizationEmptyState.isVisible();
    if (isEmpty) {
      await expect(leadDetailsPage.customizationEmptyState).toContainText('No customization set for this requirement yet.');
    }
  });

  test('RD_CUS_02: Open Add Customization modal and verify form controls', async ({ myLeadPage, leadDetailsPage }) => {
    await openCustomizationTab(myLeadPage, leadDetailsPage);

    // 1. Click Add Customization button
    await leadDetailsPage.openAddCustomizationModal();

    // 2. Verify Modal title and close icon
    const modal = leadDetailsPage.addCustomizationModal;
    await expect(modal.modalTitle).toHaveText('Add Customization');
    await expect(modal.closeIconBtn).toBeVisible();

    // 3. Verify Customization Required dropdown defaults to 'Yes'
    await expect(modal.customizationRequiredDropdown).toBeVisible();
    await expect(modal.customizationRequiredDropdown).toContainText('Yes');

    // 4. Verify Customization #1 section card exists
    const initialCards = await modal.getCustomizationCardsCount();
    expect(initialCards).toBeGreaterThanOrEqual(1);
    await expect(modal.customizationCards.first()).toContainText('Customization #1');

    // 5. Verify Customization Type dropdown inside Card #1
    const typeDropdown = modal.customizationCards.first().locator('.p-dropdown');
    await expect(typeDropdown).toBeVisible();
    await expect(typeDropdown).toContainText('Select Type');

    // 6. Verify Add Another Customization button
    await expect(modal.addAnotherCustomizationBtn).toBeVisible();

    // 7. Verify Close and Submit footer buttons
    await expect(modal.closeBtn).toBeVisible();
    await expect(modal.submitBtn).toBeVisible();

    // Dismiss modal cleanly
    await modal.clickClose();
    await modal.waitForClosed();
  });

  test('RD_CUS_03: Dynamic addition of multiple customization items via Add Another Customization', async ({ myLeadPage, leadDetailsPage }) => {
    await openCustomizationTab(myLeadPage, leadDetailsPage);

    // 1. Open modal
    await leadDetailsPage.openAddCustomizationModal();
    const modal = leadDetailsPage.addCustomizationModal;

    // 2. Count initial cards (should be 1)
    const initialCount = await modal.getCustomizationCardsCount();
    expect(initialCount).toBe(1);

    // 3. Click Add Another Customization
    await modal.clickAddAnotherCustomization();

    // 4. Verify second card Customization #2 appears
    const newCount = await modal.getCustomizationCardsCount();
    expect(newCount).toBe(initialCount + 1);
    await expect(modal.customizationCards.nth(1)).toContainText('Customization #2');

    // 5. Dismiss modal cleanly
    await modal.closeViaIcon();
    await modal.waitForClosed();
  });

  test('RD_CUS_04: Verify available Customization Types in dropdown panel', async ({ myLeadPage, leadDetailsPage }) => {
    await openCustomizationTab(myLeadPage, leadDetailsPage);

    // 1. Open modal
    await leadDetailsPage.openAddCustomizationModal();
    const modal = leadDetailsPage.addCustomizationModal;

    // 2. Inspect available customization types in the dropdown
    const availableTypes = await modal.getAvailableCustomizationTypes(0);
    console.log(`Available Customization Types:`, availableTypes);
    expect(availableTypes.length).toBeGreaterThan(0);

    // 3. Close modal
    await modal.clickClose();
    await modal.waitForClosed();
  });

});
