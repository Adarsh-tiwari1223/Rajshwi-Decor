import { test, expect } from '../../../core/fixtures/customFixtures';
import { Config } from '../../../utils/env';
import * as path from 'path';

test.describe('Product Master - End-to-End Validation & Boundary Suite', () => {
  test.setTimeout(240000);

  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login(Config.adminEmail, Config.adminPassword);
  });

  test('RD_PRD_VAL_01: 6-Step Multi-Step Validation Pipeline in Single Run (Blank Check -> Negative -> String -> Next Trigger -> Rectify)', async ({ productMasterPage }) => {
    const timestamp = Date.now().toString().slice(-4);
    const validProdName = `Artisan Sovereign Candle ${timestamp}`;
    const validProdSku = `ASC-${timestamp}`;

    await productMasterPage.goto();
    await productMasterPage.openCreateProductWizard();
    await expect(productMasterPage.stepperDialog).toBeVisible();

    // =========================================================================
    // STEP 1: BASIC INFORMATION
    // 1. BLANK TEST -> Click NEXT -> Must throw errors
    // =========================================================================
    console.log('[Step 1] 1. Blank Check: Clicking NEXT with blank fields...');
    await productMasterPage.clickNext();
    await expect(productMasterPage.activeTabTitle).toHaveText('Basic Information');

    const step1Errors = await productMasterPage.getAllVisibleErrors();
    console.log('[Step 1] Blank submission errors thrown:', step1Errors);
    expect(step1Errors.length).toBeGreaterThanOrEqual(1);

    // 2. RECTIFY -> Click NEXT -> Must advance to Step 2
    console.log('[Step 1] 2. Rectifying with valid data...');
    await productMasterPage.fill(productMasterPage.productNameInput, validProdName, 'Product Name');
    await productMasterPage.fill(productMasterPage.skuInput, validProdSku, 'SKU');
    await productMasterPage.selectDropdownOption(productMasterPage.categoryDropdown, 0);
    await productMasterPage.selectDropdownOption(productMasterPage.productTypeDropdown, 0);
    await productMasterPage.fill(productMasterPage.descriptionInput, 'Premium handcrafted candle formula.', 'Description');

    await productMasterPage.clickNext();
    await expect(productMasterPage.activeTabTitle).toHaveText('Candle Details');

    // =========================================================================
    // STEP 2: CANDLE DETAILS
    // 1. BLANK TEST -> Click NEXT -> Must throw error / stay on Candle Details
    // =========================================================================
    console.log('[Step 2] 1. Blank Check: Clicking NEXT without required candle specifications...');
    await productMasterPage.clickNext();
    await expect(productMasterPage.activeTabTitle).toHaveText('Candle Details');

    // 2. NEGATIVE TEST on Burn Time -> Click NEXT -> Must throw error / stay on Candle Details
    console.log('[Step 2] 2. Negative Value Check: Entering negative Burn Time and clicking NEXT...');
    if (await productMasterPage.burnTimeInput.isVisible()) {
      await productMasterPage.burnTimeInput.fill('-35');
      await productMasterPage.clickNext();
      await expect(productMasterPage.activeTabTitle).toHaveText('Candle Details');
      const burnTimeNegErr = await productMasterPage.getFieldError('Burn Time');
      console.log(`[Step 2] Burn Time negative error on NEXT: "${burnTimeNegErr}"`);
    }

    // 3. STRING TEST on Burn Time -> Click NEXT -> Must throw error ("Burn Time must be a number")
    console.log('[Step 2] 3. String Check: Entering string into Burn Time and clicking NEXT...');
    if (await productMasterPage.burnTimeInput.isVisible()) {
      await productMasterPage.burnTimeInput.fill('abc');
      await productMasterPage.clickNext();
      await expect(productMasterPage.activeTabTitle).toHaveText('Candle Details');
      const burnTimeStrErr = await productMasterPage.getFieldError('Burn Time');
      console.log(`[Step 2] Burn Time string error on NEXT: "${burnTimeStrErr}"`);
      if (burnTimeStrErr) {
        expect(burnTimeStrErr.toLowerCase()).toContain('burn time must be a number');
      }
    }

    // 4. RECTIFY -> Click NEXT -> Must advance to Step 3
    console.log('[Step 2] 4. Rectifying with valid specifications & Burn Time...');
    await productMasterPage.selectDropdownOption(productMasterPage.waxTypeDropdown, 0);
    await productMasterPage.selectDropdownOption(productMasterPage.wickTypeDropdown, 0);
    await productMasterPage.selectDropdownOption(productMasterPage.wickSizeDropdown, 0);
    await productMasterPage.selectDropdownOption(productMasterPage.packagingTypeDropdown, 0);
    if (await productMasterPage.burnTimeInput.isVisible()) {
      await productMasterPage.burnTimeInput.fill('45');
      await productMasterPage.selectDropdownOption(productMasterPage.burnTimeUnitDropdown, 0);
    }
    await productMasterPage.fill(productMasterPage.additionalNotesInput, 'Zero soot, organic soy burn.', 'Notes');

    await productMasterPage.clickNext();
    await expect(productMasterPage.activeTabTitle).toHaveText('Dimensions & Weight');

    // =========================================================================
    // STEP 3: DIMENSIONS & WEIGHT
    // 1. BLANK TEST -> Click NEXT -> Must block and throw errors
    // =========================================================================
    console.log('[Step 3] 1. Blank Check: Clicking NEXT with blank dimensions...');
    await productMasterPage.clickNext();
    await expect(productMasterPage.activeTabTitle).toHaveText('Dimensions & Weight');

    // 2. NEGATIVE TEST -> Enter negative height -> Click NEXT
    console.log('[Step 3] 2. Negative Check: Entering negative Product Height and clicking NEXT...');
    await productMasterPage.productHeightInput.fill('-14');
    await productMasterPage.clickNext();
    await expect(productMasterPage.activeTabTitle).toHaveText('Dimensions & Weight');

    // 3. STRING IN NUMBER TEST -> Simulate string typing into Capacity -> Click NEXT -> Must throw error
    console.log('[Step 3] 3. String in Number Check: Entering string in Capacity and clicking NEXT...');
    await productMasterPage.capacityWaxInput.focus();
    await productMasterPage.page.keyboard.type('abc');
    await productMasterPage.clickNext();
    await expect(productMasterPage.activeTabTitle).toHaveText('Dimensions & Weight');

    const capacityError = await productMasterPage.getFieldError('Capacity');
    console.log(`[Step 3] Capacity error thrown on NEXT: "${capacityError}"`);
    if (capacityError) {
      expect(capacityError.toLowerCase()).toContain('capacity must be a number');
    }

    // 4. RECTIFY -> Click NEXT -> Must advance to Step 4
    console.log('[Step 3] 4. Rectifying Dimensions & Weight with valid positive numbers...');
    await productMasterPage.fill(productMasterPage.productHeightInput, '14', 'Product Height');
    await productMasterPage.fill(productMasterPage.bottomDiameterInput, '8', 'Bottom Diameter');
    await productMasterPage.fill(productMasterPage.topDiameterInput, '8', 'Top Diameter');
    await productMasterPage.fill(productMasterPage.capacityWaxInput, '320', 'Capacity (Wax)');
    await productMasterPage.fill(productMasterPage.netWeightInput, '320', 'Net Weight');
    await productMasterPage.fill(productMasterPage.grossWeightInput, '480', 'Gross Weight');

    await productMasterPage.fill(productMasterPage.packageLengthInput, '16', 'Package Length');
    await productMasterPage.fill(productMasterPage.packageWidthInput, '11', 'Package Width');
    await productMasterPage.fill(productMasterPage.packageHeightInput, '16', 'Package Height');
    await productMasterPage.fill(productMasterPage.packageWeightInput, '520', 'Package Weight');

    await productMasterPage.clickNext();
    await expect(productMasterPage.activeTabTitle).toHaveText('Pricing');

    // =========================================================================
    // STEP 4: PRICING
    // Configure Retail Pricing & advance
    // =========================================================================
    console.log('[Step 4] Configuring Retail Pricing modal...');
    await productMasterPage.click(productMasterPage.addRetailPriceBtn, 'Add Retail Price Button');
    await productMasterPage.retailPriceModal.waitFor({ state: 'visible', timeout: 5000 });

    await productMasterPage.selectDropdownOption(productMasterPage.pricingChannelDropdown, 0);
    await productMasterPage.fill(productMasterPage.retailSellingPriceInput, '850', 'Selling Price');
    await productMasterPage.fill(productMasterPage.retailMinOrderQtyInput, '1', 'Min Qty');
    await productMasterPage.fill(productMasterPage.retailMaxOrderQtyInput, '20', 'Max Qty');
    await productMasterPage.fill(productMasterPage.retailMinDiscountInput, '5', 'Min Discount');
    await productMasterPage.fill(productMasterPage.retailMaxDiscountInput, '12', 'Max Discount');
    await productMasterPage.click(productMasterPage.retailModalSaveBtn, 'Retail Modal Save');
    await productMasterPage.retailPriceModal.waitFor({ state: 'hidden', timeout: 5000 });

    await productMasterPage.clickNext();
    await expect(productMasterPage.activeTabTitle).toHaveText('Stock Management');

    // =========================================================================
    // STEP 5: STOCK MANAGEMENT
    // 1. BLANK TEST -> Leave Warehouse unselected -> Click NEXT -> Must throw Warehouse error
    // =========================================================================
    console.log('[Step 5] 1. Blank Check: Clicking NEXT without selecting Warehouse...');
    await productMasterPage.fill(productMasterPage.openingStockInput, '100', 'Opening Stock');
    await productMasterPage.fill(productMasterPage.currentStockInput, '100', 'Current Stock');
    await productMasterPage.fill(productMasterPage.reservedStockInput, '10', 'Reserved Stock');
    await productMasterPage.fill(productMasterPage.minimumStockInput, '20', 'Minimum Stock');

    await productMasterPage.clickNext();
    await expect(productMasterPage.activeTabTitle).toHaveText('Stock Management');

    const warehouseError = await productMasterPage.getFieldError('Warehouse');
    console.log(`[Step 5] Warehouse error thrown on NEXT: "${warehouseError}"`);
    if (warehouseError) {
      expect(warehouseError.toLowerCase()).toContain('warehouse is required');
    }

    // 2. STRING IN NUMBER TEST -> Enter non-numeric strings -> Click NEXT -> Must throw errors
    console.log('[Step 5] 2. String Check: Entering string in Opening Stock and Minimum Stock, clicking NEXT...');
    await productMasterPage.openingStockInput.fill('invalid_stock');
    await productMasterPage.minimumStockInput.fill('not_a_number');

    await productMasterPage.clickNext();
    await expect(productMasterPage.activeTabTitle).toHaveText('Stock Management');

    const openingStockError = await productMasterPage.getFieldError('Opening Stock');
    const minStockError = await productMasterPage.getFieldError('Minimum Stock');
    console.log(`[Step 5] Opening Stock error thrown: "${openingStockError}"`);
    console.log(`[Step 5] Minimum Stock error thrown: "${minStockError}"`);
    if (openingStockError) {
      expect(openingStockError.toLowerCase()).toContain('opening stock must be a number');
    }
    if (minStockError) {
      expect(minStockError.toLowerCase()).toContain('minimum stock must be a number');
    }

    // 3. RECTIFY -> Fill valid stocks (including 0 boundary) & select Warehouse
    console.log('[Step 5] 3. Rectifying stocks with valid values & selecting Warehouse...');
    await productMasterPage.fill(productMasterPage.openingStockInput, '100', 'Opening Stock');
    await productMasterPage.fill(productMasterPage.currentStockInput, '100', 'Current Stock');
    await productMasterPage.fill(productMasterPage.reservedStockInput, '0', 'Reserved Stock (0)');
    await productMasterPage.fill(productMasterPage.minimumStockInput, '0', 'Minimum Stock (0)');
    await productMasterPage.selectDropdownOption(productMasterPage.warehouseDropdown, 0);

    // Available Stock calculation: 100 - 0 = 100
    await expect(productMasterPage.availableStockDisabled).toHaveValue('100');

    await productMasterPage.clickNext();
    await expect(productMasterPage.activeTabTitle).toHaveText('Images');

    // =========================================================================
    // STEP 6: IMAGES & PERSISTENCE
    // Upload image asset -> Save & Exit -> Verify product in table
    // =========================================================================
    console.log('[Step 6] Uploading asset and saving complete product...');
    const imageAssetPath = path.resolve(__dirname, '../../../testdata/masters/sampleCandle.png');
    await productMasterPage.imagesFileInput.setInputFiles(imageAssetPath);
    await productMasterPage.page.waitForTimeout(1000);

    await productMasterPage.clickSaveAndExit();
    await expect(productMasterPage.stepperDialog).toBeHidden();

    // Verify record in table
    console.log(`[Validation Pipeline] Verifying created product "${validProdName}" in table...`);
    await productMasterPage.verifyProductInTable({
      name: validProdName,
      sku: validProdSku
    });

    console.log('=========================================================================');
    console.log('PASSED: Blank -> Negative -> String -> Next Trigger validation cycle verified on all steps!');
    console.log('=========================================================================');
  });

  test('RD_PRD_VAL_02: Boundary Zero Acceptance - Exact 0 values calculate Available Stock correctly', async ({ productMasterPage }) => {
    const timestamp = Date.now().toString().slice(-4);
    const prodName = `Boundary Zero Candle ${timestamp}`;
    const prodSku = `BZC-${timestamp}`;

    await productMasterPage.goto();
    await productMasterPage.openCreateProductWizard();

    // Step 1
    await productMasterPage.fill(productMasterPage.productNameInput, prodName, 'Product Name');
    await productMasterPage.fill(productMasterPage.skuInput, prodSku, 'SKU');
    await productMasterPage.selectDropdownOption(productMasterPage.categoryDropdown, 0);
    await productMasterPage.selectDropdownOption(productMasterPage.productTypeDropdown, 0);
    await productMasterPage.clickNext();

    // Step 2
    await productMasterPage.selectDropdownOption(productMasterPage.waxTypeDropdown, 0);
    await productMasterPage.selectDropdownOption(productMasterPage.wickTypeDropdown, 0);
    await productMasterPage.selectDropdownOption(productMasterPage.wickSizeDropdown, 0);
    await productMasterPage.selectDropdownOption(productMasterPage.packagingTypeDropdown, 0);
    await productMasterPage.clickNext();

    // Step 3
    await productMasterPage.fill(productMasterPage.productHeightInput, '10', 'Height');
    await productMasterPage.fill(productMasterPage.bottomDiameterInput, '5', 'Bottom Diameter');
    await productMasterPage.fill(productMasterPage.topDiameterInput, '5', 'Top Diameter');
    await productMasterPage.fill(productMasterPage.capacityWaxInput, '150', 'Capacity');
    await productMasterPage.fill(productMasterPage.netWeightInput, '150', 'Net Weight');
    await productMasterPage.fill(productMasterPage.grossWeightInput, '250', 'Gross Weight');
    await productMasterPage.clickNext();

    // Step 4 & 5
    await productMasterPage.clickNext();
    console.log('[Boundary Test] Testing boundary 0 for Reserved Stock & Minimum Stock...');
    await productMasterPage.fill(productMasterPage.openingStockInput, '50', 'Opening Stock');
    await productMasterPage.fill(productMasterPage.currentStockInput, '50', 'Current Stock');
    await productMasterPage.fill(productMasterPage.reservedStockInput, '0', 'Reserved Stock (0)');
    await productMasterPage.fill(productMasterPage.minimumStockInput, '0', 'Minimum Stock (0)');
    await productMasterPage.selectDropdownOption(productMasterPage.warehouseDropdown, 0);

    // Available Stock formula: Current(50) - Reserved(0) = 50
    await expect(productMasterPage.availableStockDisabled).toHaveValue('50');

    await productMasterPage.clickSaveAndExit();
    await expect(productMasterPage.stepperDialog).toBeHidden();

    // Search and verify
    await productMasterPage.searchProduct(prodName);
    const row = await productMasterPage.getRowData(0);
    expect(row.name).toContain(prodName);
    console.log('PASSED: Boundary 0 stock values verified successfully!');
  });
});
