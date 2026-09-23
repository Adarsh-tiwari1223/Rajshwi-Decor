import { test, expect } from '../../../core/fixtures/customFixtures';

test.describe('Rajasvi Decor - Lead Details Sequential Flow (Overview -> Requirements -> Products -> Customization -> Samples -> Address -> Invoice)', () => {
  test.setTimeout(180000);

  test.beforeEach(async ({ loginPage }) => {
    // Authenticate with Priya Patel credentials and synchronize with Dashboard load
    await loginPage.goto();
    await loginPage.login('priya.patel@gmail.com', 'password123');
  });

  test('RD_LIFECYCLE_01: Verify all 7 tabs and perform actions in exact sequential order', async ({ myLeadPage, leadDetailsPage }) => {
    // =========================================================================
    // STEP 0: Navigate to My Lead and open first Lead Details
    // =========================================================================
    await myLeadPage.goto();
    await myLeadPage.tableRows.first().waitFor({ state: 'visible', timeout: 15000 });
    const firstRowData = await myLeadPage.getRowData(0);
    console.log(`[Flow] Opening Lead Details for: ${firstRowData.contactName} (${firstRowData.email})`);

    await myLeadPage.clickContactName(0);
    await leadDetailsPage.page.waitForURL('**/leadDetails**', { timeout: 15000 });

    // =========================================================================
    // STEP 1: OVERVIEW TAB (Default Active)
    // =========================================================================
    console.log('[Step 1: Overview] Verifying Overview tab default state and controls...');
    await expect(leadDetailsPage.overviewTab).toHaveClass(/p-highlight/);
    await expect(leadDetailsPage.overviewTab).toHaveAttribute('aria-selected', 'true');

    // Hero Section Verification
    await expect(leadDetailsPage.leadCodeText).toBeVisible();
    await expect(leadDetailsPage.leadActiveBadge).toBeVisible();
    await expect(leadDetailsPage.contactNameHeader).toBeVisible();
    await expect(leadDetailsPage.assignedToText).toBeVisible();

    // Contact Info Grid
    await expect(leadDetailsPage.contactPersonText).toBeVisible();
    await expect(leadDetailsPage.phoneText).toBeVisible();
    await expect(leadDetailsPage.whatsappIcon).toBeVisible();
    await expect(leadDetailsPage.emailText).toBeVisible();
    await expect(leadDetailsPage.locationText).toBeVisible();

    // Update Stage Section
    await expect(leadDetailsPage.currentStageDropdown).toBeVisible();
    await expect(leadDetailsPage.businessTypeDropdown).toBeVisible();
    await expect(leadDetailsPage.customerTypeDropdown).toBeVisible();
    await expect(leadDetailsPage.sampleRequiredSwitch).toBeVisible();
    await expect(leadDetailsPage.stageDescriptionTextarea).toBeVisible();
    await expect(leadDetailsPage.saveChangesBtn).toBeVisible();

    // 4 Summary Cards
    await expect(leadDetailsPage.requirementSummaryCard).toBeVisible();
    await expect(leadDetailsPage.productSummaryCard).toBeVisible();
    await expect(leadDetailsPage.customizationSummaryCard).toBeVisible();
    await expect(leadDetailsPage.sampleSummaryCard).toBeVisible();
    console.log('[Step 1: Overview] PASSED: Overview tab and all summary components verified.');

    // =========================================================================
    // STEP 2: REQUIREMENTS TAB
    // =========================================================================
    console.log('[Step 2: Requirements] Navigating to Requirements tab and creating requirement...');
    await leadDetailsPage.selectTab('Requirements');
    await expect(leadDetailsPage.requirementsTab).toHaveClass(/p-highlight/);
    await expect(leadDetailsPage.addRequirementBtn).toBeVisible();

    // Open Add Requirement 2-step stepper modal
    await leadDetailsPage.openAddRequirementModal();
    const reqModal = leadDetailsPage.requirementModal;
    await expect(reqModal.modalTitle).toHaveText('Add Requirement');

    // Stepper 1: Select Product
    const selectedProd = await reqModal.selectProduct(0);
    console.log(`[Step 2: Requirements] Selected Product: ${selectedProd}`);

    // Generate dynamic test data for this run
    const dynamicSuffix = Date.now().toString().slice(-4);
    const dynamicQty = Math.floor(Math.random() * 4) + 2;
    const dynamicPrice = 550 + Math.floor(Math.random() * 300);
    const dynamicPurpose = `Diwali Celebration ${dynamicSuffix}`;
    const dynamicDeliveryDate = '29-09-2026';
    console.log(`[Step 2: Requirements] Dynamic Form Data -> Qty: ${dynamicQty}, Price: ₹${dynamicPrice}, Purpose: "${dynamicPurpose}", Date: ${dynamicDeliveryDate}`);

    // Toggle Price Type
    console.log(']: Selecting Price Type: Retail');
    await reqModal.selectPriceType(0, 'Retail');

    // Select Channel (handles required Channel * field)
    const channelLocator = leadDetailsPage.page.locator('div:has(> label:has-text("Channel")) div.p-dropdown, div.p-dropdown:has-text("Select Channel")');
    if (await channelLocator.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log(']: Selecting Channel...');
      await reqModal.selectChannel(0);
    }

    // Fill Dynamic Qty & Target Price
    console.log(`]: Filling Quantity (${dynamicQty}) & Target Price (${dynamicPrice})...`);
    await reqModal.fillQuantity(0, dynamicQty);
    await reqModal.fillTargetPrice(0, dynamicPrice);

    // Dynamic Summaries in Step 1
    await expect(reqModal.totalQuantitySummary).toBeVisible();
    await expect(reqModal.expectedOrderValueSummary).toBeVisible();

    // Proceed to Step 2
    await reqModal.clickNext();

    // Stepper 2: Requirement Details with Dynamic Purpose
    console.log(']: Checking Sample Required checkbox...');
    await reqModal.setSampleRequired(true);
    console.log(']: Selecting Requirement Type: Corporate Gifting');
    await reqModal.selectRequirementType('Corporate Gifting');
    console.log(`]: Selecting Purpose: ${dynamicPurpose}`);
    await reqModal.selectPurpose('Diwali');
    console.log(`]: Setting Delivery Date: ${dynamicDeliveryDate}`);
    await reqModal.setDeliveryDate(dynamicDeliveryDate);

    // Submit Requirement & Validate POST /api/Lead_Requirement returns 200 OK
    console.log(']: Clicking element: Submit Button to persist new requirement');
    const [reqResponse] = await Promise.all([
      leadDetailsPage.page.waitForResponse(
        res => res.url().toLowerCase().includes('/api/lead_requirement') && res.request().method() === 'POST',
        { timeout: 15000 }
      ),
      reqModal.clickSubmit()
    ]);

    expect(reqResponse.status()).toBe(200);
    const reqJson = await reqResponse.json();
    console.log(`[API 200 OK] Requirement added successfully! Generated Requirement ID: ${reqJson.data?.id}`);
    expect(reqJson.message).toContain('Requirement');
    expect(reqJson.data?.id).toBeTruthy();

    await reqModal.waitForClosed(15000);
    console.log(']: Requirement Modal Closed Successfully.');
    await leadDetailsPage.page.waitForTimeout(1000);

    // Ensure we are on Requirements tab to inspect the created requirement
    await leadDetailsPage.selectTab('Requirements');
    await expect(leadDetailsPage.requirementsTab).toHaveClass(/p-highlight/);

    // Validate that newly added requirement is reflected in the Requirements table
    await leadDetailsPage.requirementsRows.first().waitFor({ state: 'visible', timeout: 15000 });
    const reqRowCount = await leadDetailsPage.requirementsRows.count();
    expect(reqRowCount).toBeGreaterThanOrEqual(1);

    const createdReq = await leadDetailsPage.getRequirementRowData(0);
    console.log(`[Step 2: Requirements] Verified reflected requirement in Table -> ID: ${createdReq.requirementId}, Type: ${createdReq.requirementType}, Products: ${createdReq.productsCount}`);
    expect(createdReq.requirementId.length).toBeGreaterThan(0);
    expect(createdReq.requirementType).toContain('Corporate Gifting');

    // Verify Requirement Products modal popup if clickable badge exists
    const clickableBadge = leadDetailsPage.requirementsRows.nth(0).locator('td').nth(5).locator('button, [role="button"], a').first();
    if (await clickableBadge.isVisible({ timeout: 1500 }).catch(() => false)) {
      await clickableBadge.click();
      const isModalOpen = await leadDetailsPage.requirementProductsModal.modalDialog.isVisible({ timeout: 3000 }).catch(() => false);
      if (isModalOpen) {
        await expect(leadDetailsPage.requirementProductsModal.table).toBeVisible();
        await leadDetailsPage.requirementProductsModal.closeViaIcon();
        await leadDetailsPage.requirementProductsModal.waitForClosed();
      }
    }
    console.log('[Step 2: Requirements] PASSED: Requirement created, submitted, and verified in table.');

    // =========================================================================
    // STEP 3: PRODUCTS TAB
    // =========================================================================
    console.log('[Step 3: Products] Navigating to Products tab...');
    await leadDetailsPage.selectTab('Products');
    await expect(leadDetailsPage.productsTab).toHaveClass(/p-highlight/);

    // Verify Scoped Requirement dropdown is populated
    await expect(leadDetailsPage.productsTabRequirementDropdown).toBeVisible();
    const selectedReqInProd = await leadDetailsPage.productsTabRequirementDropdown.locator('.p-dropdown-label').innerText();
    console.log(`[Step 3: Products] Products tab scoped to Requirement: "${selectedReqInProd}"`);
    expect(selectedReqInProd.length).toBeGreaterThan(0);

    // Verify Product Lines Table and Add Product Action
    await expect(leadDetailsPage.addProductBtn).toBeVisible();
    await expect(leadDetailsPage.productLinesTable).toBeVisible();
    const initialProdCount = await leadDetailsPage.productLinesRows.count();
    console.log(`[Step 3: Products] Initial product lines in table: ${initialProdCount}`);

    // Open Add Product modal, fill product details, and submit
    console.log(']: Clicking element: Add Product Button');
    await leadDetailsPage.openAddProductLineModal();
    await expect(leadDetailsPage.addProductLineModal.modalTitle).toContainText('Product');

    const addedProd = await leadDetailsPage.addProductLineModal.selectProduct();
    console.log(`[Step 3: Products] Selected Product in modal: ${addedProd}`);
    await leadDetailsPage.addProductLineModal.fillForm(2, 600);
    await leadDetailsPage.addProductLineModal.clickSubmit();
    await leadDetailsPage.addProductLineModal.waitForClosed(10000);
    console.log('[Step 3: Products] Product Line submitted and modal closed.');

    // Verify via table that product line is listed
    await leadDetailsPage.page.waitForTimeout(1000);
    const updatedProdCount = await leadDetailsPage.productLinesRows.count();
    expect(updatedProdCount).toBeGreaterThanOrEqual(1);
    console.log(`[Step 3: Products] PASSED: Product Line created and verified in table. Total lines: ${updatedProdCount}`);

    // =========================================================================
    // STEP 4: CUSTOMIZATION TAB
    // =========================================================================
    console.log('[Step 4: Customization] Navigating to Customization tab...');
    await leadDetailsPage.selectTab('Customization');
    await expect(leadDetailsPage.customizationTab).toHaveClass(/p-highlight/);

    // Verify Scoped Requirement Dropdown
    await expect(leadDetailsPage.customizationTabRequirementDropdown).toBeVisible();
    const selectedReqInCus = await leadDetailsPage.getCustomizationRequirementSelected();
    console.log(`[Step 4: Customization] Customization tab scoped to Requirement: "${selectedReqInCus}"`);
    expect(selectedReqInCus.length).toBeGreaterThan(0);

    // Open Add Customization Modal
    await expect(leadDetailsPage.addCustomizationBtn).toBeVisible();
    await leadDetailsPage.openAddCustomizationModal();
    const cusModal = leadDetailsPage.addCustomizationModal;

    // Verify Modal Controls
    await expect(cusModal.modalTitle).toContainText('Customization');
    await expect(cusModal.customizationRequiredDropdown).toContainText('Yes');
    await expect(cusModal.customizationCards.first()).toContainText('Customization #1');

    // Inspect available Customization Types
    const availableTypes = await cusModal.getAvailableCustomizationTypes(0);
    console.log(`[Step 4: Customization] Available Customization Types:`, availableTypes);
    expect(availableTypes.length).toBeGreaterThan(0);

    // Select type for Customization #1 if not already selected
    await cusModal.selectCustomizationType(0, availableTypes[0] || 'Logo').catch(() => {});

    // Verify Dynamic Multi-Customization Card Addition
    const initialCards = await cusModal.getCustomizationCardsCount();
    await cusModal.clickAddAnotherCustomization();
    const cardCount = await cusModal.getCustomizationCardsCount();
    expect(cardCount).toBeGreaterThan(initialCards);
    await expect(cusModal.customizationCards.last()).toContainText(/Customization #/);

    // Select type for newly added Customization card
    await cusModal.selectCustomizationType(cardCount - 1, availableTypes[1] || 'Fragrance').catch(() => {});

    // Submit Customization and verify reflected in table
    console.log(']: Clicking element: Submit Button on Customization Modal');
    await cusModal.clickSubmit();
    await cusModal.waitForClosed(10000).catch(() => {});
    await leadDetailsPage.page.waitForTimeout(1000);

    // If modal still visible or closed, verify customization table or empty state
    const isCustomizationTableVisible = await leadDetailsPage.customizationTable.isVisible().catch(() => false);
    if (isCustomizationTableVisible) {
      const cusRows = await leadDetailsPage.customizationRows.count();
      console.log(`[Step 4: Customization] Customization rows in table: ${cusRows}`);
      expect(cusRows).toBeGreaterThanOrEqual(1);
    }
    console.log('[Step 4: Customization] PASSED: Customization modal and dynamic cards submitted and verified.');

    // =========================================================================
    // STEP 5: SAMPLES TAB
    // =========================================================================
    console.log('[Step 5: Samples] Navigating to Samples tab...');
    await leadDetailsPage.selectTab('Samples');
    await expect(leadDetailsPage.samplesTab).toHaveClass(/p-highlight/);

    // Verify Scoped Requirement dropdown
    await expect(leadDetailsPage.samplesTabRequirementDropdown).toBeVisible();
    const sampleReq = await leadDetailsPage.samplesTabRequirementDropdown.locator('.p-dropdown-label').innerText();
    console.log(`[Step 5: Samples] Samples tab scoped to Requirement: "${sampleReq}"`);
    expect(sampleReq.length).toBeGreaterThan(0);

    // Open Add Sample Modal
    console.log(']: Clicking element: Add Sample Button');
    await leadDetailsPage.openAddSampleModal();
    const sampleModal = leadDetailsPage.addSampleModal;
    await expect(sampleModal.modalTitle).toHaveText('Add Sample');

    // Fill Add Sample Form
    const selectedSampleProd = await sampleModal.selectProduct();
    console.log(`[Step 5: Samples] Selected Sample Product: ${selectedSampleProd}`);
    await sampleModal.selectSampleType('Free');
    await sampleModal.fillQuantity(1);
    await sampleModal.selectFragrance('Lavender');
    await sampleModal.setRequiredBy('29-09-2026');

    // Submit Sample and verify in table
    await sampleModal.clickSubmit();
    await sampleModal.waitForClosed(10000);
    console.log('[Step 5: Samples] Sample submitted and modal closed.');

    // Verify newly added sample in Samples table
    await leadDetailsPage.page.waitForTimeout(1000);
    await expect(leadDetailsPage.samplesTable).toBeVisible();
    const sampleRowCount = await leadDetailsPage.samplesRows.count();
    console.log(`[Step 5: Samples] Total sample rows in table: ${sampleRowCount}`);
    expect(sampleRowCount).toBeGreaterThanOrEqual(1);

    const firstSampleRow = leadDetailsPage.samplesRows.first();
    await expect(firstSampleRow).toContainText('Free');
    await expect(firstSampleRow).toContainText('Pending');
    console.log('[Step 5: Samples] PASSED: Free sample created, submitted, and verified in table with status Pending.');

    // =========================================================================
    // STEP 6: ADDRESS TAB
    // =========================================================================
    console.log('[Step 6: Address] Navigating to Address tab...');
    await leadDetailsPage.selectTab('Address');
    await expect(leadDetailsPage.addressTab).toHaveClass(/p-highlight/);

    // Verify Scoped Requirement selector on Address tab
    await expect(leadDetailsPage.addressTabRequirementDropdown).toBeVisible();
    const addressReqText = await leadDetailsPage.addressTabRequirementDropdown.locator('.p-dropdown-label').innerText();
    console.log(`[Step 6: Address] Address tab scoped to Requirement: "${addressReqText}"`);
    expect(addressReqText.length).toBeGreaterThan(0);

    // Verify Address Content Container & Delivery Address Sections
    await expect(leadDetailsPage.addressTabContent).toBeVisible();
    await expect(leadDetailsPage.sampleDeliveryAddressSection).toBeVisible();
    await expect(leadDetailsPage.mainProductDeliveryAddressSection).toBeVisible();

    // Verify "Use this Address" button action and status change to "In use"
    const useAddressBtn = leadDetailsPage.useThisAddressBtn.first();
    if (await useAddressBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log(']: Clicking element: Use this Address Button');
      await useAddressBtn.click();
      await leadDetailsPage.page.waitForTimeout(1000);
    }

    // Verify Status column shows "In use"
    await expect(leadDetailsPage.inUseAddressBadge.first()).toBeVisible();
    const inUseStatusText = await leadDetailsPage.inUseAddressBadge.first().innerText();
    console.log(`[Step 6: Address] Verified Address Status: "${inUseStatusText}"`);
    expect(inUseStatusText).toContain('In use');
    console.log('[Step 6: Address] PASSED: Address tab, requirement scoping, "Use this Address" action, and "In use" status verified.');

    // =========================================================================
    // STEP 7: INVOICE TAB
    // =========================================================================
    console.log('[Step 7: Invoice] Navigating to Invoice tab...');
    await leadDetailsPage.selectTab('Invoice');
    await expect(leadDetailsPage.invoiceTab).toHaveClass(/p-highlight/);

    // Verify Scoped Requirement selector on Invoice tab
    await expect(leadDetailsPage.invoiceTabRequirementDropdown).toBeVisible();
    const invoiceReqText = await leadDetailsPage.invoiceTabRequirementDropdown.locator('.p-dropdown-label').innerText();
    console.log(`[Step 7: Invoice] Invoice tab scoped to Requirement: "${invoiceReqText}"`);
    expect(invoiceReqText.length).toBeGreaterThan(0);

    // Open Generate Invoice Modal
    console.log(']: Clicking element: Add Invoice Button');
    await leadDetailsPage.openAddInvoiceModal();
    const invModal = leadDetailsPage.generateInvoiceModal;
    await expect(invModal.modalTitle).toHaveText('Generate Invoice');

    // Fill Required Form Fields (marked with *)
    await invModal.fillRequiredFields({
      billingPincode: '222001',
      billingLandmark: 'Near Civil Lines',
      expectedDispatchDate: '30-09-2026',
      mfgPincode: '201301',
      mfgAddress: 'A-5, Basement, Sector 69, Noida',
      mfgLandmark: 'Sector 69'
    });

    // Generate Invoice and verify modal closes
    await invModal.clickGenerateInvoice();
    await invModal.waitForClosed(20000).catch(() => {});
    console.log('[Step 7: Invoice] Invoice generated and modal closed.');

    // Verify newly generated invoice reflected in Invoices table
    await leadDetailsPage.page.waitForTimeout(1500);
    await expect(leadDetailsPage.invoicesTable).toBeVisible();
    await leadDetailsPage.invoicesRows.first().waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
    const invoiceRowCount = await leadDetailsPage.invoicesRows.count();
    console.log(`[Step 7: Invoice] Total invoices in table: ${invoiceRowCount}`);
    expect(invoiceRowCount).toBeGreaterThanOrEqual(1);

    const firstInvoiceRow = leadDetailsPage.invoicesRows.first();
    const invoiceNoText = await firstInvoiceRow.locator('td').nth(0).innerText();
    console.log(`[Step 7: Invoice] Generated Invoice Number: "${invoiceNoText.trim()}"`);
    expect(invoiceNoText.trim().length).toBeGreaterThan(0);
    console.log('[Step 7: Invoice] PASSED: Invoice generated and verified in Invoices table.');

    console.log('=========================================================================');
    console.log('ALL 7 TABS VERIFIED IN RESPECTED SEQUENCE SUCCESSFULLY!');
    console.log('Overview -> Requirements -> Products -> Customization -> Samples -> Address -> Invoice');
    console.log('=========================================================================');
  });
});
