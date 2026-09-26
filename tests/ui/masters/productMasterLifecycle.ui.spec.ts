import { test, expect } from '../../../core/fixtures/customFixtures';
import { Config } from '../../../utils/env';

test.describe('Masters Module - Product Master & 6-Step Stepper Lifecycle Test Suite', () => {
  test.setTimeout(180000);

  test.beforeEach(async ({ loginPage }) => {
    // Authenticate with Admin credentials and synchronize
    await loginPage.goto();
    await loginPage.login(Config.adminEmail, Config.adminPassword);
  });

  test('RD_PRD_UI_01: Verify Product Master table layout, headers, and intro dialog transition', async ({ productMasterPage }) => {
    await productMasterPage.goto();
    await expect(productMasterPage.pageHeading).toBeVisible();
    await expect(productMasterPage.searchInput).toBeVisible();
    await expect(productMasterPage.newProductBtn).toBeVisible();
    await expect(productMasterPage.dataTable).toBeVisible();

    // Verify key table headers
    const headerText = await productMasterPage.dataTable.locator('thead').innerText();
    expect(headerText).toContain('Name');
    expect(headerText).toContain('SKU');
    expect(headerText).toContain('Product Type');
    expect(headerText).toContain('Category');
    expect(headerText).toContain('Dimensions');
    expect(headerText).toContain('Pricing');
    expect(headerText).toContain('Stock');
    expect(headerText).toContain('Status');
    expect(headerText).toContain('Action');

    // Click "New" button -> verify introductory dialog
    await productMasterPage.click(productMasterPage.newProductBtn, 'New Product Button');
    await expect(productMasterPage.introDialog).toBeVisible();
    await expect(productMasterPage.introDialog.locator('h2')).toContainText('Add Product');
    await expect(productMasterPage.introCancelBtn).toBeVisible();
    await expect(productMasterPage.introContinueBtn).toBeVisible();

    // Test Cancel button dismisses intro dialog cleanly
    await productMasterPage.click(productMasterPage.introCancelBtn, 'Intro Cancel Button');
    await expect(productMasterPage.introDialog).toBeHidden();
  });

  test('RD_PRD_UI_02: End-to-End 6-Step Stepper Lifecycle (Basic Info -> Candle Details -> Dimensions -> Pricing -> Stock -> Images -> Save)', async ({ productMasterPage }) => {
    const timestamp = Date.now().toString().slice(-4);
    const uniqueProductName = `Aroma Sovereign Candle ${timestamp}`;
    let uniqueSku = '';

    // =========================================================================
    // OPEN STEPPER WIZARD
    // =========================================================================
    await productMasterPage.goto();
    await productMasterPage.openCreateProductWizard();
    await expect(productMasterPage.stepperDialog).toBeVisible();
    await expect(productMasterPage.activeTabTitle).toHaveText('Basic Information');

    // =========================================================================
    // STEP 1: BASIC INFORMATION
    // =========================================================================
    console.log('[Step 1: Basic Information] Filling product identity fields...');
    await productMasterPage.fill(productMasterPage.productNameInput, uniqueProductName, 'Product Name');
    await expect(productMasterPage.skuInput).toHaveAttribute('readonly', '');
    uniqueSku = await productMasterPage.skuInput.inputValue();
    console.log(`[Step 1] Read auto-generated SKU: "${uniqueSku}"`);
    expect(uniqueSku.trim().length).toBeGreaterThan(0);

    // Select Category & Product Type
    const selectedCategory = await productMasterPage.selectDropdownOption(productMasterPage.categoryDropdown, 0);
    console.log(`[Step 1] Selected Category: ${selectedCategory}`);

    const selectedProductType = await productMasterPage.selectDropdownOption(productMasterPage.productTypeDropdown, 0);
    console.log(`[Step 1] Selected Product Type: ${selectedProductType}`);

    // Verify Brand defaults to "Rajasvi Decor"
    await expect(productMasterPage.brandDropdown).toContainText('Rajasvi Decor');

    // Fill Description
    await productMasterPage.fill(
      productMasterPage.descriptionInput,
      'Handcrafted luxury scented candle with eco-friendly natural wax and premium packaging.',
      'Description'
    );

    // Transition to Step 2
    await productMasterPage.clickNext();
    await expect(productMasterPage.activeTabTitle).toHaveText('Candle Details');

    // =========================================================================
    // STEP 2: CANDLE DETAILS
    // =========================================================================
    console.log('[Step 2: Candle Details] Configuring candle specifications...');

    // Select Wax Type (Mandatory *)
    const selectedWax = await productMasterPage.selectDropdownOption(productMasterPage.waxTypeDropdown, 0);
    console.log(`[Step 2] Selected Wax Type: ${selectedWax}`);

    // Select Wick Type (Mandatory *)
    const selectedWickType = await productMasterPage.selectDropdownOption(productMasterPage.wickTypeDropdown, 0);
    console.log(`[Step 2] Selected Wick Type: ${selectedWickType}`);

    // Select Wick Size (if present)
    if (await productMasterPage.wickSizeDropdown.isVisible({ timeout: 1000 }).catch(() => false)) {
      const selectedWickSize = await productMasterPage.selectDropdownOption(productMasterPage.wickSizeDropdown, 0);
      console.log(`[Step 2] Selected Wick Size: ${selectedWickSize}`);
    }

    // Select Packaging Type (Mandatory *)
    const selectedPackaging = await productMasterPage.selectDropdownOption(productMasterPage.packagingTypeDropdown, 0);
    console.log(`[Step 2] Selected Packaging Type: ${selectedPackaging}`);

    // Fill Burn Time & Unit
    if (await productMasterPage.burnTimeInput.isVisible()) {
      await productMasterPage.fill(productMasterPage.burnTimeInput, '45', 'Burn Time');
      await productMasterPage.selectDropdownOption(productMasterPage.burnTimeUnitDropdown, 0);
    }

    // Optional fields
    await productMasterPage.selectDropdownOption(productMasterPage.fragranceDropdown, 0).catch(() => {});
    await productMasterPage.selectDropdownOption(productMasterPage.containerTypeDropdown, 0).catch(() => {});
    await productMasterPage.selectDropdownOption(productMasterPage.lidTypeDropdown, 0).catch(() => {});

    await productMasterPage.fill(
      productMasterPage.additionalNotesInput,
      'Long-lasting fragrance, clean burn with zero toxic residue.',
      'Additional Notes'
    );

    // Verify Back navigation preserves Step 1 data
    console.log('[Step 2] Testing Back button to Step 1...');
    await productMasterPage.clickBack();
    await expect(productMasterPage.activeTabTitle).toHaveText('Basic Information');
    await expect(productMasterPage.productNameInput).toHaveValue(uniqueProductName);
    await expect(productMasterPage.skuInput).toHaveValue(uniqueSku);

    // Return to Step 2, then proceed to Step 3
    await productMasterPage.clickNext();
    await expect(productMasterPage.activeTabTitle).toHaveText('Candle Details');

    await productMasterPage.clickNext();
    await expect(productMasterPage.activeTabTitle).toHaveText('Dimensions & Weight');

    // =========================================================================
    // STEP 3: DIMENSIONS & WEIGHT
    // =========================================================================
    console.log('[Step 3: Dimensions & Weight] Filling candle and package dimensions...');

    // Candle Dimensions
    await productMasterPage.fill(productMasterPage.productHeightInput, '12', 'Product Height');
    await productMasterPage.fill(productMasterPage.bottomDiameterInput, '8', 'Bottom Diameter');
    await productMasterPage.fill(productMasterPage.topDiameterInput, '8', 'Top Diameter');

    // Capacity & Weight
    await productMasterPage.fill(productMasterPage.capacityWaxInput, '250', 'Capacity (Wax)');
    await productMasterPage.fill(productMasterPage.netWeightInput, '250', 'Net Weight');
    await productMasterPage.fill(productMasterPage.grossWeightInput, '420', 'Gross Weight');

    // Package Dimensions
    await productMasterPage.fill(productMasterPage.packageLengthInput, '14', 'Package Length');
    await productMasterPage.fill(productMasterPage.packageWidthInput, '10', 'Package Width');
    await productMasterPage.fill(productMasterPage.packageHeightInput, '14', 'Package Height');
    await productMasterPage.fill(productMasterPage.packageWeightInput, '450', 'Package Weight');

    // Proceed to Step 4
    await productMasterPage.clickNext();
    await expect(productMasterPage.activeTabTitle).toHaveText('Pricing');

    // =========================================================================
    // STEP 4: PRICING (RETAIL, WHOLESALE, B2B)
    // =========================================================================
    console.log('[Step 4: Pricing] Verifying multi-tier pricing configuration...');

    // Verify HSN/SAC code is pre-filled and disabled
    await expect(productMasterPage.hsnSacCodeInput).toBeDisabled();
    await expect(productMasterPage.hsnSacCodeInput).toHaveValue('34060010');

    // Verify 3 Pricing Sub-Tabs exist
    await expect(productMasterPage.retailPricingSubTab).toBeVisible();
    await expect(productMasterPage.wholesalePricingSubTab).toBeVisible();
    await expect(productMasterPage.b2bPricingSubTab).toBeVisible();

    // 4.1 Retail Pricing: Add Retail Price
    await productMasterPage.click(productMasterPage.addRetailPriceBtn, 'Add Retail Price Button');
    await expect(productMasterPage.retailPriceModal).toBeVisible();

    // Fill Add Retail Price Modal
    await productMasterPage.selectDropdownOption(productMasterPage.pricingChannelDropdown, 0);
    await productMasterPage.fill(productMasterPage.retailSellingPriceInput, '750', 'Retail Selling Price');
    await productMasterPage.fill(productMasterPage.retailMinOrderQtyInput, '1', 'Retail Min Qty');
    await productMasterPage.fill(productMasterPage.retailMaxOrderQtyInput, '20', 'Retail Max Qty');
    await productMasterPage.fill(productMasterPage.retailMinDiscountInput, '5', 'Retail Min Discount');
    await productMasterPage.fill(productMasterPage.retailMaxDiscountInput, '15', 'Retail Max Discount');

    await productMasterPage.click(productMasterPage.retailModalSaveBtn, 'Retail Price Modal Save');
    await productMasterPage.retailPriceModal.waitFor({ state: 'hidden', timeout: 8000 }).catch(() => {});

    // 4.2 Wholesale Pricing Sub-Tab
    await productMasterPage.click(productMasterPage.wholesalePricingSubTab, 'Wholesale Pricing Sub-Tab');
    await productMasterPage.page.waitForTimeout(500);

    const isAddWholesaleVisible = await productMasterPage.addWholesalePriceBtn.isVisible({ timeout: 2000 }).catch(() => false);
    if (isAddWholesaleVisible) {
      await productMasterPage.click(productMasterPage.addWholesalePriceBtn, 'Add Wholesale Price Button');
      if (await productMasterPage.wholesalePriceModal.isVisible({ timeout: 3000 }).catch(() => false)) {
        await productMasterPage.fill(productMasterPage.wholesaleQtyFromInput, '21', 'Wholesale Qty From');
        await productMasterPage.fill(productMasterPage.wholesaleQtyToInput, '100', 'Wholesale Qty To');
        await productMasterPage.fill(productMasterPage.wholesalePriceInput, '450', 'Wholesale Price');
        await productMasterPage.fill(productMasterPage.wholesaleDiscountInput, '25', 'Wholesale Discount');
        await productMasterPage.click(productMasterPage.wholesaleModalSaveBtn, 'Wholesale Modal Save');
        await productMasterPage.wholesalePriceModal.waitFor({ state: 'hidden', timeout: 8000 }).catch(() => {});
      }
    }

    // 4.3 B2B Pricing Sub-Tab & Quick Links
    await productMasterPage.click(productMasterPage.b2bPricingSubTab, 'B2B Pricing Sub-Tab');
    await productMasterPage.page.waitForTimeout(500);

    await expect(productMasterPage.addCustomerSpecificPriceBtn).toBeVisible();
    await expect(productMasterPage.addDefaultB2BPriceBtn).toBeVisible();
    await expect(productMasterPage.copyRetailToB2BBtn).toBeVisible();
    await expect(productMasterPage.resetAllB2BPricesBtn).toBeVisible();

    // Proceed to Step 5
    await productMasterPage.clickNext();
    await expect(productMasterPage.activeTabTitle).toHaveText('Stock Management');

    // =========================================================================
    // STEP 5: STOCK MANAGEMENT & BUSINESS FORMULA VERIFICATION
    // =========================================================================
    console.log('[Step 5: Stock Management] Validating stock formula & threshold alert...');

    const currentStock = 80;
    const reservedStock = 30;
    const minStock = 90;
    const expectedAvailable = currentStock - reservedStock; // 50

    await productMasterPage.fill(productMasterPage.openingStockInput, '100', 'Opening Stock');
    await productMasterPage.fill(productMasterPage.currentStockInput, String(currentStock), 'Current Stock');
    await productMasterPage.fill(productMasterPage.reservedStockInput, String(reservedStock), 'Reserved Stock');
    await productMasterPage.fill(productMasterPage.minimumStockInput, String(minStock), 'Minimum Stock');

    // Select Warehouse (Mandatory *)
    await productMasterPage.selectDropdownOption(productMasterPage.warehouseDropdown, 0);

    // Verify calculated Available Stock: Current (80) - Reserved (30) = 50
    console.log(`[Step 5] Checking Available Stock: Expected = ${expectedAvailable}...`);
    await expect(productMasterPage.availableStockDisabled).toHaveValue(String(expectedAvailable));
    await expect(productMasterPage.summaryAvailableStock).toHaveText(String(expectedAvailable));

    // Verify warning alert is triggered because Available (50) <= Min Stock (90)
    await expect(productMasterPage.stockWarningAlert).toBeVisible();
    console.log('[Step 5] PASSED: Warning alert "Available stock is at or below minimum level" verified successfully!');

    // Proceed to Step 6
    await productMasterPage.clickNext();
    await expect(productMasterPage.activeTabTitle).toHaveText('Images');

    // =========================================================================
    // STEP 6: IMAGES & FINAL SAVE (NEXT BUTTON BECOMES SAVE)
    // =========================================================================
    console.log('[Step 6: Images] Verifying images step, uploading image, and Final SAVE button...');
    await expect(productMasterPage.imagesDropzone).toBeVisible();
    await expect(productMasterPage.imagesFileInput).toBeAttached();

    // Attach authentic candle sample image
    const sampleImagePath = 'testdata/masters/sampleCandle.png';
    await productMasterPage.imagesFileInput.setInputFiles(sampleImagePath);
    await productMasterPage.page.waitForTimeout(1000);

    // Verify that at Step 6, the Next button became the SAVE button
    await expect(productMasterPage.nextBtn).toBeHidden();
    await expect(productMasterPage.finalSaveBtn).toBeVisible();

    // Verify Cancel or Back works cleanly
    await expect(productMasterPage.cancelBtn).toBeVisible();
    await expect(productMasterPage.backBtn).toBeVisible();

    console.log('[Step 6: Images] PASSED: Next button successfully transformed into SAVE button at final stage!');

    // Submit product creation via SAVE button and intercept API response
    console.log('[Step 6: Images] Clicking SAVE to persist new product...');
    const [productResponse] = await Promise.all([
      productMasterPage.page.waitForResponse(
        res => res.url().toLowerCase().includes('/api/product') && (res.request().method() === 'POST' || res.request().method() === 'PUT'),
        { timeout: 20000 }
      ).catch(() => null),
      productMasterPage.click(productMasterPage.finalSaveBtn, 'Final SAVE Button')
    ]);

    if (productResponse) {
      console.log(`[API Response] Product persistence status: ${productResponse.status()}`);
      expect(productResponse.status()).toBeLessThan(400);
    }

    // Verify stepper resets back to Step 1 (Basic Information) for continuous entry
    await expect(productMasterPage.activeTabTitle).toHaveText('Basic Information');
    console.log('[Step 6: Images] PASSED: Stepper reset back to Step 1 for rapid continuous product creation!');

    // Close stepper via Cancel button to return to table
    await productMasterPage.click(productMasterPage.cancelBtn, 'Cancel Button');
    await productMasterPage.stepperDialog.waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
    await expect(productMasterPage.pageHeading).toBeVisible();

    // Verify saved product record in the table via search
    console.log(`[Lifecycle] Searching for newly saved product "${uniqueProductName}" in table...`);
    await productMasterPage.verifyProductInTable({
      name: uniqueProductName,
      sku: uniqueSku,
      category: selectedCategory
    });
    console.log(`[Lifecycle] PASSED: Product "${uniqueProductName}" (${uniqueSku}) successfully validated in table!`);

    console.log('=========================================================================');
    console.log('ALL 6 STEPS OF PRODUCT MASTER CREATION WIZARD VERIFIED SUCCESSFULLY!');
    console.log('Basic Information -> Candle Details -> Dimensions & Weight -> Pricing -> Stock Management -> Images');
    console.log('=========================================================================');
  });

  test('RD_PRD_UI_03: Partial Fill -> SAVE & EXIT -> Verify record in Table -> Search product -> Reopen via Edit -> Verify pre-filled state persistence', async ({ productMasterPage }) => {
    const timestamp = Date.now().toString().slice(-4);
    const draftProductName = `Artisan Lavender Pillar ${timestamp}`;
    let draftSku = '';

    // =========================================================================
    // STEP 1: OPEN WIZARD & FILL BASIC INFORMATION
    // =========================================================================
    await productMasterPage.goto();
    await productMasterPage.openCreateProductWizard();
    await expect(productMasterPage.stepperDialog).toBeVisible();

    console.log(`[Draft Flow] Filling Step 1: ${draftProductName}...`);
    await productMasterPage.fill(productMasterPage.productNameInput, draftProductName, 'Product Name');
    await expect(productMasterPage.skuInput).toHaveAttribute('readonly', '');
    draftSku = await productMasterPage.skuInput.inputValue();
    console.log(`[Draft Flow] Read auto-generated SKU: "${draftSku}"`);
    expect(draftSku.trim().length).toBeGreaterThan(0);

    const categoryName = await productMasterPage.selectDropdownOption(productMasterPage.categoryDropdown, 0);
    const productTypeName = await productMasterPage.selectDropdownOption(productMasterPage.productTypeDropdown, 0);
    await productMasterPage.fill(productMasterPage.descriptionInput, 'Authentic calming lavender botanical candle.', 'Description');

    await productMasterPage.clickNext();
    await expect(productMasterPage.activeTabTitle).toHaveText('Candle Details');

    // =========================================================================
    // STEP 2: FILL CANDLE DETAILS
    // =========================================================================
    console.log('[Draft Flow] Filling Step 2: Candle Details...');
    const waxTypeName = await productMasterPage.selectDropdownOption(productMasterPage.waxTypeDropdown, 0);
    const wickTypeName = await productMasterPage.selectDropdownOption(productMasterPage.wickTypeDropdown, 0);
    if (await productMasterPage.wickSizeDropdown.isVisible({ timeout: 1000 }).catch(() => false)) {
      await productMasterPage.selectDropdownOption(productMasterPage.wickSizeDropdown, 0);
    }
    const packagingTypeName = await productMasterPage.selectDropdownOption(productMasterPage.packagingTypeDropdown, 0);

    if (await productMasterPage.burnTimeInput.isVisible()) {
      await productMasterPage.fill(productMasterPage.burnTimeInput, '50', 'Burn Time');
      await productMasterPage.selectDropdownOption(productMasterPage.burnTimeUnitDropdown, 0);
    }

    await productMasterPage.clickNext();
    await expect(productMasterPage.activeTabTitle).toHaveText('Dimensions & Weight');

    // =========================================================================
    // STEP 3: FILL DIMENSIONS & TRIGGER "SAVE & EXIT"
    // =========================================================================
    console.log('[Draft Flow] Filling Step 3: Dimensions & Weight and triggering SAVE & EXIT...');
    await productMasterPage.fill(productMasterPage.productHeightInput, '15', 'Product Height');
    await productMasterPage.fill(productMasterPage.bottomDiameterInput, '7', 'Bottom Diameter');
    await productMasterPage.fill(productMasterPage.topDiameterInput, '7', 'Top Diameter');
    await productMasterPage.fill(productMasterPage.capacityWaxInput, '300', 'Capacity (Wax)');
    await productMasterPage.fill(productMasterPage.netWeightInput, '300', 'Net Weight');
    await productMasterPage.fill(productMasterPage.grossWeightInput, '500', 'Gross Weight');

    // Click SAVE & EXIT -> Saves current progress and closes stepper modal
    console.log('[Draft Flow] Clicking SAVE & EXIT button...');
    await productMasterPage.clickSaveAndExit();
    await expect(productMasterPage.stepperDialog).toBeHidden();
    await expect(productMasterPage.pageHeading).toBeVisible();

    // =========================================================================
    // STEP 4: VERIFY RECORD IN TABLE VIA SEARCH (NAME & SKU)
    // =========================================================================
    console.log(`[Draft Flow] Searching by Product Name "${draftProductName}" in table...`);
    await productMasterPage.verifyProductInTable({
      name: draftProductName,
      sku: draftSku,
      category: categoryName
    });

    console.log(`[Draft Flow] Searching by SKU "${draftSku}" in table...`);
    await productMasterPage.searchProduct(draftSku);
    const rowBySku = await productMasterPage.getRowData(0);
    console.log(`[Table Match] Found row by SKU: Name="${rowBySku.name}", SKU="${rowBySku.sku}", Category="${rowBySku.category}"`);
    expect(rowBySku.name).toContain(draftProductName);
    expect(rowBySku.sku).toContain(draftSku);

    // =========================================================================
    // STEP 5: REOPEN VIA EDIT BUTTON & VERIFY PRE-FILLED PERSISTENCE
    // =========================================================================
    console.log('[Draft Flow] Clicking Edit action icon to reopen stepper in Edit mode...');
    await productMasterPage.clickEditProduct(0);
    await expect(productMasterPage.stepperDialog).toBeVisible();

    // Verify Step 1 pre-filled fields
    await expect(productMasterPage.activeTabTitle).toHaveText('Basic Information');
    await expect(productMasterPage.productNameInput).toHaveValue(draftProductName);
    await expect(productMasterPage.skuInput).toHaveValue(draftSku);
    await expect(productMasterPage.descriptionInput).toHaveValue('Authentic calming lavender botanical candle.');
    console.log('[Draft Flow] Step 1 pre-filled data verified successfully!');

    // Navigate to Step 2 & verify pre-filled specifications
    await productMasterPage.clickNext();
    await expect(productMasterPage.activeTabTitle).toHaveText('Candle Details');
    await expect(productMasterPage.burnTimeInput).toHaveValue('50');
    console.log('[Draft Flow] Step 2 pre-filled data verified successfully!');

    // Navigate to Step 3 & verify pre-filled dimensions
    await productMasterPage.clickNext();
    await expect(productMasterPage.activeTabTitle).toHaveText('Dimensions & Weight');
    await expect(productMasterPage.productHeightInput).toHaveValue('15');
    await expect(productMasterPage.bottomDiameterInput).toHaveValue('7');
    await expect(productMasterPage.topDiameterInput).toHaveValue('7');
    console.log('[Draft Flow] Step 3 pre-filled data verified successfully!');

    // Click SAVE & EXIT from edit mode to ensure updates persist and stepper closes cleanly
    console.log('[Draft Flow] Clicking SAVE & EXIT from edit mode...');
    await productMasterPage.clickSaveAndExit();
    await expect(productMasterPage.stepperDialog).toBeHidden();

    // Re-verify product in table after exiting edit
    console.log(`[Draft Flow] Re-validating record in table after edit SAVE & EXIT...`);
    await productMasterPage.verifyProductInTable({
      name: draftProductName,
      sku: draftSku
    });
    console.log('=========================================================================');
    console.log('SAVE & EXIT -> TABLE SEARCH -> EDIT REOPEN PREFILLED -> SAVE & EXIT VERIFIED!');
    console.log('=========================================================================');
  });
});

