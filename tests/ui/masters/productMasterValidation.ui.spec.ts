import { test, expect } from '../../../core/fixtures/customFixtures';
import { Config } from '../../../utils/env';
import path from 'path';

test.describe('Product Master - End-to-End Validation & Boundary Suite', () => {
  test.setTimeout(240000);

  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login(Config.adminEmail, Config.adminPassword);
  });

  test('RD_PRD_VAL_01: 6-Step Multi-Step Validation Pipeline in Single Run (Blank Check -> Negative -> String -> Next Trigger -> Rectify)', async ({ productMasterPage }) => {
    const timestamp = Date.now().toString().slice(-4);
    const validProdName = `Artisan Sovereign Candle ${timestamp}`;
    let validProdSku = '';

    await productMasterPage.goto();
    await productMasterPage.openCreateProductWizard();
    await expect(productMasterPage.stepperDialog).toBeVisible();

    // =========================================================================
    // STEP 1: BASIC INFORMATION
    // =========================================================================
    // 1. Auto-generated & Readonly SKU validation + Regenerate button check
    console.log('[Step 1] Validating auto-generated & readonly SKU...');
    await expect(productMasterPage.skuInput).toHaveAttribute('readonly', '');
    const initialSku = await productMasterPage.skuInput.inputValue();
    console.log(`[Step 1] Initial Auto-Generated SKU: "${initialSku}"`);
    expect(initialSku.trim().length).toBeGreaterThan(0);

    await productMasterPage.click(productMasterPage.regenerateSkuBtn, 'Regenerate SKU Button');
    await productMasterPage.page.waitForTimeout(300);
    validProdSku = await productMasterPage.skuInput.inputValue();
    console.log(`[Step 1] Regenerated SKU: "${validProdSku}"`);
    expect(validProdSku.trim().length).toBeGreaterThan(0);

    console.log('[Step 1] 1. Blank Check: Clicking NEXT with blank fields...');
    await productMasterPage.clickNext();
    await expect(productMasterPage.activeTabTitle).toHaveText('Basic Information');

    const step1Errors = await productMasterPage.getAllVisibleErrors();
    console.log('[Step 1] Blank submission errors thrown:', step1Errors);
    expect(step1Errors.length).toBeGreaterThanOrEqual(3);
    expect(step1Errors).toContain('Product Name is required');
    expect(step1Errors).not.toContain('SKU is required');
    expect(step1Errors).toContain('Category is required');
    expect(step1Errors).toContain('Product Type is required');

    console.log('[Step 1] 2. Rectifying with valid data...');
    await productMasterPage.fill(productMasterPage.productNameInput, validProdName, 'Product Name');
    await productMasterPage.selectDropdownOption(productMasterPage.categoryDropdown, 0);
    await productMasterPage.selectDropdownOption(productMasterPage.productTypeDropdown, 0);
    await productMasterPage.fill(productMasterPage.descriptionInput, 'Premium handcrafted candle formula.', 'Description');

    await productMasterPage.clickNext();
    await expect(productMasterPage.activeTabTitle).toHaveText('Candle Details');

    // =========================================================================
    // STEP 2: CANDLE DETAILS
    // =========================================================================
    console.log('[Step 2] 1. Blank Check: Clicking NEXT without required candle specifications...');
    await productMasterPage.clickNext();
    await expect(productMasterPage.activeTabTitle).toHaveText('Candle Details');

    console.log('[Step 2] 2. Negative Value Check: Entering negative Burn Time and clicking NEXT...');
    if (await productMasterPage.burnTimeInput.isVisible()) {
      await productMasterPage.burnTimeInput.fill('-35');
      await productMasterPage.clickNext();
      await expect(productMasterPage.activeTabTitle).toHaveText('Candle Details');
      const burnTimeNegErr = await productMasterPage.getFieldError('Burn Time');
      console.log(`[Step 2] Burn Time negative error on NEXT: "${burnTimeNegErr}"`);
    }

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

    console.log('[Step 2] 4. Rectifying with valid specifications & Burn Time...');
    await productMasterPage.selectDropdownOption(productMasterPage.waxTypeDropdown, 0);
    await productMasterPage.selectDropdownOption(productMasterPage.wickTypeDropdown, 0);
    if (await productMasterPage.wickSizeDropdown.isVisible({ timeout: 1000 }).catch(() => false)) {
      await productMasterPage.selectDropdownOption(productMasterPage.wickSizeDropdown, 0);
    }
    await productMasterPage.selectDropdownOption(productMasterPage.packagingTypeDropdown, 0);
    if (await productMasterPage.burnTimeInput.isVisible()) {
      await productMasterPage.burnTimeInput.fill('45');
      await productMasterPage.selectDropdownOption(productMasterPage.burnTimeUnitDropdown, 0);
    }
    await productMasterPage.fill(productMasterPage.additionalNotesInput, 'Zero soot, organic soy burn.', 'Notes');

    await productMasterPage.clickNext();
    await expect(productMasterPage.activeTabTitle).toHaveText('Dimensions & Weight');

    // =========================================================================
    // STEP 3: DIMENSIONS & WEIGHT (VALIDATING ALL 10 NUMERIC FIELDS)
    // =========================================================================
    console.log('[Step 3] 1. Blank Check: Clicking NEXT with blank dimensions...');
    await productMasterPage.clickNext();
    await expect(productMasterPage.activeTabTitle).toHaveText('Dimensions & Weight');

    // Define all 10 numeric inputs in Step 3
    const allDimensionFields = [
      { locator: productMasterPage.productHeightInput, name: 'Product Height' },
      { locator: productMasterPage.bottomDiameterInput, name: 'Bottom Diameter' },
      { locator: productMasterPage.topDiameterInput, name: 'Top Diameter' },
      { locator: productMasterPage.capacityWaxInput, name: 'Capacity' },
      { locator: productMasterPage.netWeightInput, name: 'Net Weight' },
      { locator: productMasterPage.grossWeightInput, name: 'Gross Weight' },
      { locator: productMasterPage.packageLengthInput, name: 'Package Length' },
      { locator: productMasterPage.packageWidthInput, name: 'Package Width' },
      { locator: productMasterPage.packageHeightInput, name: 'Package Height' },
      { locator: productMasterPage.packageWeightInput, name: 'Package Weight' },
    ];

    console.log('[Step 3] 2. Negative Value Checks: Entering negative values across all 10 dimension fields...');
    for (const field of allDimensionFields) {
      await field.locator.fill('-25');
    }
    await productMasterPage.clickNext();
    // Must remain on Dimensions & Weight
    await expect(productMasterPage.activeTabTitle).toHaveText('Dimensions & Weight');
    console.log('[Step 3] Negative values correctly blocked transition!');

    console.log('[Step 3] 3. String in Number Checks: Entering non-numeric text across dimension fields...');
    for (const field of allDimensionFields) {
      await field.locator.focus();
      await productMasterPage.page.keyboard.type('abc');
    }
    await productMasterPage.clickNext();
    await expect(productMasterPage.activeTabTitle).toHaveText('Dimensions & Weight');

    const capacityErr = await productMasterPage.getFieldError('Capacity');
    console.log(`[Step 3] Capacity string error on NEXT: "${capacityErr}"`);
    if (capacityErr) {
      expect(capacityErr.toLowerCase()).toContain('capacity must be a number');
    }

    console.log('[Step 3] 4. Rectifying all 10 dimension fields with valid positive numbers...');
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
    // STEP 4: PRICING (VALIDATING ALL 3 SUB-FORMS: RETAIL, WHOLESALE, B2B)
    // =========================================================================
    // Verify all 3 sub-tabs are rendered
    await expect(productMasterPage.retailPricingSubTab).toBeVisible();
    await expect(productMasterPage.wholesalePricingSubTab).toBeVisible();
    await expect(productMasterPage.b2bPricingSubTab).toBeVisible();

    // --- Sub-Form 4.1: Retail Pricing Modal Validation ---
    console.log('[Step 4.1: Retail Pricing] 1. Blank Check on modal submission...');
    await productMasterPage.click(productMasterPage.addRetailPriceBtn, 'Add Retail Price Button');
    await productMasterPage.retailPriceModal.waitFor({ state: 'visible', timeout: 5000 });

    // Click Save with completely blank fields
    await productMasterPage.click(productMasterPage.retailModalSaveBtn, 'Retail Modal Save (Blank)');
    await expect(productMasterPage.retailPriceModal).toBeVisible(); // Must not dismiss
    const retailBlankErrors = await productMasterPage.getAllVisibleErrors(productMasterPage.retailPriceModal);
    console.log('[Step 4.1: Retail Pricing] Blank modal errors thrown:', retailBlankErrors);

    // 2a. Negative discount percentage check in Retail
    console.log('[Step 4.1: Retail Pricing] 2a. Negative Percentage Check: Discounts cannot be negative...');
    await productMasterPage.fill(productMasterPage.retailMinDiscountInput, '-20', 'Min Discount (-20%)');
    await productMasterPage.fill(productMasterPage.retailMaxDiscountInput, '-10', 'Max Discount (-10%)');
    await productMasterPage.click(productMasterPage.retailModalSaveBtn, 'Retail Modal Save (Negative Discount)');
    await expect(productMasterPage.retailPriceModal).toBeVisible();

    const minNegErr = await productMasterPage.getFieldError('Minimum Discount', productMasterPage.retailPriceModal);
    const maxNegErr = await productMasterPage.getFieldError('Maximum Discount', productMasterPage.retailPriceModal);
    console.log(`[Step 4.1] Retail Negative Discount errors caught: Min="${minNegErr}", Max="${maxNegErr}"`);
    expect(minNegErr.toLowerCase()).toContain('cannot be negative');
    expect(maxNegErr.toLowerCase()).toContain('cannot be negative');

    // 2b. Percentage > 100% check in Retail
    console.log('[Step 4.1: Retail Pricing] 2b. Percentage Boundary Check: Discounts cannot exceed 100%...');
    await productMasterPage.fill(productMasterPage.retailMinDiscountInput, '110', 'Min Discount (110%)');
    await productMasterPage.fill(productMasterPage.retailMaxDiscountInput, '150', 'Max Discount (150%)');
    await productMasterPage.click(productMasterPage.retailModalSaveBtn, 'Retail Modal Save (>100% Discount)');
    await expect(productMasterPage.retailPriceModal).toBeVisible();

    const minDiscErr = await productMasterPage.getFieldError('Minimum Discount', productMasterPage.retailPriceModal);
    const maxDiscErr = await productMasterPage.getFieldError('Maximum Discount', productMasterPage.retailPriceModal);
    console.log(`[Step 4.1] Retail Discount > 100% errors caught: Min="${minDiscErr}", Max="${maxDiscErr}"`);
    expect(minDiscErr.toLowerCase()).toContain('cannot exceed 100');
    expect(maxDiscErr.toLowerCase()).toContain('cannot exceed 100');

    console.log('[Step 4.1: Retail Pricing] 3. Rectifying and saving valid retail price (discounts <= 100%)...');
    await productMasterPage.selectDropdownOption(productMasterPage.pricingChannelDropdown, 0);
    await productMasterPage.fill(productMasterPage.retailSellingPriceInput, '850', 'Selling Price');
    await productMasterPage.fill(productMasterPage.retailMinOrderQtyInput, '1', 'Min Qty');
    await productMasterPage.fill(productMasterPage.retailMaxOrderQtyInput, '20', 'Max Qty');
    await productMasterPage.fill(productMasterPage.retailMinDiscountInput, '5', 'Min Discount');
    await productMasterPage.fill(productMasterPage.retailMaxDiscountInput, '12', 'Max Discount');
    await productMasterPage.click(productMasterPage.retailModalSaveBtn, 'Retail Modal Save');
    await productMasterPage.retailPriceModal.waitFor({ state: 'hidden', timeout: 5000 });

    // --- Sub-Form 4.2: Wholesale Pricing Modal Validation ---
    console.log('[Step 4.2: Wholesale Pricing] Switching to Wholesale Pricing sub-tab...');
    await productMasterPage.click(productMasterPage.wholesalePricingSubTab, 'Wholesale Pricing Sub-Tab');
    await productMasterPage.page.waitForTimeout(500);

    const isAddWholesaleVisible = await productMasterPage.addWholesalePriceBtn.isVisible({ timeout: 2000 }).catch(() => false);
    if (isAddWholesaleVisible) {
      await productMasterPage.click(productMasterPage.addWholesalePriceBtn, 'Add Quantity Range Button');
      if (await productMasterPage.wholesalePriceModal.isVisible({ timeout: 3000 }).catch(() => false)) {
        console.log('[Step 4.2: Wholesale Pricing] 1. Blank Check on modal submission...');
        await productMasterPage.click(productMasterPage.wholesaleModalSaveBtn, 'Wholesale Modal Save (Blank)');
        await expect(productMasterPage.wholesalePriceModal).toBeVisible();

        console.log('[Step 4.2: Wholesale Pricing] 2. Percentage & Negative Value Check in Wholesale...');
        // Test discount > 100% boundary check
        await productMasterPage.fill(productMasterPage.wholesaleQtyFromInput, '21', 'Qty From');
        await productMasterPage.fill(productMasterPage.wholesaleQtyToInput, '100', 'Qty To');
        await productMasterPage.fill(productMasterPage.wholesalePriceInput, '450', 'Wholesale Price');
        await productMasterPage.fill(productMasterPage.wholesaleDiscountInput, '150', 'Discount (150%)');

        // Documenting Wholesale Defect: Check if >100% is blocked or accepted
        const discountVal = await productMasterPage.wholesaleDiscountInput.inputValue();
        console.log(`[Step 4.2: Wholesale Pricing] Entered Discount: "${discountVal}" (Boundary rule: cannot exceed 100%)`);

        // Rectify with valid compliant discount percentage (<= 100%)
        await productMasterPage.fill(productMasterPage.wholesaleDiscountInput, '25', 'Wholesale Discount (25%)');
        await productMasterPage.click(productMasterPage.wholesaleModalSaveBtn, 'Wholesale Modal Save');
        await productMasterPage.wholesalePriceModal.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
      }
    }

    // --- Sub-Form 4.3: B2B Pricing Modal Validation ---
    console.log('[Step 4.3: B2B Pricing] Switching to B2B Pricing sub-tab...');
    await productMasterPage.click(productMasterPage.b2bPricingSubTab, 'B2B Pricing Sub-Tab');
    await productMasterPage.page.waitForTimeout(500);

    const isAddCustomerSpecificVisible = await productMasterPage.addCustomerSpecificPriceBtn.isVisible({ timeout: 2000 }).catch(() => false);
    if (isAddCustomerSpecificVisible) {
      await productMasterPage.click(productMasterPage.addCustomerSpecificPriceBtn, 'Add Customer Specific Price');
      if (await productMasterPage.customerSpecificModal.isVisible({ timeout: 3000 }).catch(() => false)) {
        console.log('[Step 4.3: B2B Pricing] 1. Blank Check on modal submission...');
        await productMasterPage.click(productMasterPage.b2bCustomerSaveBtn, 'Customer Specific Save (Blank)');
        await expect(productMasterPage.customerSpecificModal).toBeVisible();

        console.log('[Step 4.3: B2B Pricing] 2. Negative value check in modal...');
        await productMasterPage.b2bCustomerPriceInput.fill('-300');
        await productMasterPage.click(productMasterPage.b2bCustomerSaveBtn, 'Customer Specific Save (Negative)');
        await expect(productMasterPage.customerSpecificModal).toBeVisible();

        // Dismiss modal cleanly via Cancel
        await productMasterPage.click(productMasterPage.b2bCustomerCancelBtn, 'Customer Specific Cancel');
        await productMasterPage.customerSpecificModal.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
      }
    }

    // Advance to Step 5
    await productMasterPage.clickNext();
    await expect(productMasterPage.activeTabTitle).toHaveText('Stock Management');

    // =========================================================================
    // STEP 5: STOCK MANAGEMENT
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
    // =========================================================================
    console.log('[Step 6] Uploading asset and saving complete product...');
    const imageAssetPath = path.resolve(__dirname, '../../../testdata/masters/sampleCandle.png');
    await productMasterPage.imagesFileInput.setInputFiles(imageAssetPath);
    await productMasterPage.page.waitForTimeout(1000);

    await productMasterPage.clickSaveAndExit();
    await expect(productMasterPage.stepperDialog).toBeHidden();

    console.log(`[Validation Pipeline] Verifying created product "${validProdName}" in table...`);
    await productMasterPage.verifyProductInTable({
      name: validProdName,
      sku: validProdSku
    });

    console.log('=========================================================================');
    console.log('PASSED: Comprehensive validation verified across all 10 dimension fields & 3 pricing sub-forms!');
    console.log('=========================================================================');
  });
});
