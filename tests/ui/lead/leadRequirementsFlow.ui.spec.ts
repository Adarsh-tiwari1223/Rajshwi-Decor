import { test, expect } from '../../../core/fixtures/customFixtures';

test.describe('Rajasvi Decor - Lead Details Requirements Tab & 2-Step Wizard Flow', () => {

  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login('admin@rajasvidecor.com', 'Admin@123');
  });

  test('RD_REQ_01: Verify default tab is Overview, navigate to Requirements tab, and verify table layout', async ({ myLeadPage, leadDetailsPage }) => {
    // 1. Navigate to /mylead and open first lead details
    await myLeadPage.goto();
    await myLeadPage.clickContactName(0);
    await leadDetailsPage.page.waitForLoadState('domcontentloaded');

    // 2. Verify Overview tab is selected by default
    await expect(leadDetailsPage.overviewTab).toHaveClass(/p-highlight/);
    await expect(leadDetailsPage.overviewTab).toHaveAttribute('aria-selected', 'true');

    // 3. Click Tab 1: Requirements
    await leadDetailsPage.selectTab('Requirements');
    await expect(leadDetailsPage.requirementsTab).toHaveClass(/p-highlight/);

    // 4. Verify Requirements section header, Add Requirement button, and data table
    await expect(leadDetailsPage.addRequirementBtn).toBeVisible();
    await expect(leadDetailsPage.requirementsTable).toBeVisible();

    // Verify column headers
    const headerRow = leadDetailsPage.requirementsTable.locator('thead tr');
    await expect(headerRow).toContainText('Requirement ID');
    await expect(headerRow).toContainText('Requirement Type');
    await expect(headerRow).toContainText('Purpose / Occasion');
    await expect(headerRow).toContainText('Quantity');
    await expect(headerRow).toContainText('Products');
    await expect(headerRow).toContainText('Delivery Date');
    await expect(headerRow).toContainText('Target Price');
    await expect(headerRow).toContainText('Status');
    await expect(headerRow).toContainText('Action');
  });

  test('RD_REQ_02: Open Add Requirement modal, verify 2-step Stepper, and dismiss cleanly', async ({ myLeadPage, leadDetailsPage }) => {
    await myLeadPage.goto();
    await myLeadPage.clickContactName(0);
    await leadDetailsPage.selectTab('Requirements');

    // Open modal
    await leadDetailsPage.openAddRequirementModal();

    // Verify Modal Dialog & Title
    await expect(leadDetailsPage.requirementModal.modalTitle).toHaveText('Add Requirement');

    // Verify Stepper 1 and 2 indicators
    await expect(leadDetailsPage.requirementModal.step1Indicator).toContainText('Product Details');
    await expect(leadDetailsPage.requirementModal.step2Indicator).toContainText('Requirement Details');

    // Dismiss via Close button
    await leadDetailsPage.requirementModal.clickClose();
    await leadDetailsPage.requirementModal.waitForClosed();
  });

  test('RD_REQ_03: Step 1 Product Selection, Price Type toggle, Channel auto-population, and min/max quantity validation', async ({ myLeadPage, leadDetailsPage }) => {
    await myLeadPage.goto();
    await myLeadPage.clickContactName(0);
    await leadDetailsPage.selectTab('Requirements');
    await leadDetailsPage.openAddRequirementModal();

    // 1. Select a Product from dropdown
    const productDropdown = leadDetailsPage.page.locator('div.p-dropdown:has(select[name="products.0.product_ID"])');
    await productDropdown.click();
    const panel = leadDetailsPage.page.locator('.p-dropdown-panel:visible');
    await panel.waitFor({ state: 'visible', timeout: 5000 });
    const firstOption = panel.locator('.p-dropdown-item').first();
    const productName = (await firstOption.innerText()).trim();
    await firstOption.click();
    await leadDetailsPage.page.waitForTimeout(300);

    // 2. Select Price Type (Retail / Wholesale)
    await leadDetailsPage.requirementModal.selectPriceType(0, 'Retail');

    // 3. Verify additional fields appear: Channel, Min Quantity, Max Quantity, Selling Price
    const channelDropdown = leadDetailsPage.page.locator('div.p-dropdown:has(select[name="products.0.channel"])');
    await expect(channelDropdown).toBeVisible();

    const minQtyBox = leadDetailsPage.page.locator('div:has(> label:has-text("Min Quantity")) div').first();
    const sellingPriceBox = leadDetailsPage.page.locator('div:has(> label:has-text("Selling Price")) div').first();
    await expect(minQtyBox).toBeVisible();
    await expect(sellingPriceBox).toBeVisible();

    const minQty = parseInt((await minQtyBox.innerText()).trim(), 10) || 1;
    console.log(`Product "${productName}" - Min Qty: ${minQty}, Selling Price: ${await sellingPriceBox.innerText()}`);

    // 4. Fill Quantity and Target Price
    await leadDetailsPage.requirementModal.fillQuantity(0, minQty);
    await leadDetailsPage.requirementModal.fillTargetPrice(0, 500);

    // Verify Total calculated
    const totalBox = leadDetailsPage.page.locator('div:has(> label:has-text("Total (₹)")) div').first();
    await expect(totalBox).not.toHaveText('₹0');

    // 5. Click Next to transition to Step 2
    await leadDetailsPage.requirementModal.clickNext();

    // 6. Verify Step 2 is active
    await expect(leadDetailsPage.requirementModal.requirementTypeDropdown).toBeVisible();
    await expect(leadDetailsPage.requirementModal.purposeDropdown).toBeVisible();
    await expect(leadDetailsPage.requirementModal.urgencyDropdown).toBeVisible();
    await expect(leadDetailsPage.requirementModal.deliveryDateInput).toBeVisible();

    // 7. Verify Back button returns to Step 1
    await leadDetailsPage.requirementModal.clickBack();
    await expect(channelDropdown).toBeVisible();
  });

});
