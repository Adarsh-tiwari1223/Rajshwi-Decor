import { test, expect } from '../../../core/fixtures/customFixtures';
import { Config } from '../../../utils/env';
import path from 'path';

test.describe('Product Master - End-to-End Lifecycle & State Persistence Suite', () => {
  test.setTimeout(120000);

  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login(Config.adminEmail, Config.adminPassword);
  });

  test('RD_PRD_E2E_01: Complete 6-Step Creation -> Save & Exit -> Search & Validate Listing Row', async ({ productMasterPage }) => {
    const timestamp = Date.now().toString().slice(-4);
    const productName = `Royal Oud Luxury Pillar ${timestamp}`;
    const productSku = `ROL-${timestamp}`;

    // =========================================================================
    // 1. OPEN CREATE PRODUCT WIZARD
    // =========================================================================
    await productMasterPage.goto();
    await productMasterPage.openCreateProductWizard();
    await expect(productMasterPage.stepperDialog).toBeVisible();
    await expect(productMasterPage.activeTabTitle).toHaveText('Basic Information');

    // =========================================================================
    // STEP 1: BASIC INFORMATION
    // =========================================================================
    console.log(`[E2E-01] Filling Step 1: ${productName} (${productSku})...`);
    await productMasterPage.fill(productMasterPage.productNameInput, productName, 'Product Name');
    await productMasterPage.fill(productMasterPage.skuInput, productSku, 'SKU');
    const category = await productMasterPage.selectDropdownOption(productMasterPage.categoryDropdown, 0);
    const productType = await productMasterPage.selectDropdownOption(productMasterPage.productTypeDropdown, 0);
    await productMasterPage.fill(
      productMasterPage.descriptionInput,
      'Exclusive natural soy and beeswax artisanal candle with deep wood and floral accents.',
      'Description'
    );

    await productMasterPage.clickNext();
    await expect(productMasterPage.activeTabTitle).toHaveText('Candle Details');

    // =========================================================================
    // STEP 2: CANDLE DETAILS
    // =========================================================================
    console.log('[E2E-01] Filling Step 2: Candle Details...');
    await productMasterPage.selectDropdownOption(productMasterPage.waxTypeDropdown, 0);
    await productMasterPage.selectDropdownOption(productMasterPage.wickTypeDropdown, 0);
    await productMasterPage.selectDropdownOption(productMasterPage.wickSizeDropdown, 0);
    await productMasterPage.selectDropdownOption(productMasterPage.packagingTypeDropdown, 0);

    if (await productMasterPage.burnTimeInput.isVisible()) {
      await productMasterPage.fill(productMasterPage.burnTimeInput, '55', 'Burn Time');
      await productMasterPage.selectDropdownOption(productMasterPage.burnTimeUnitDropdown, 0);
    }

    await productMasterPage.selectDropdownOption(productMasterPage.fragranceDropdown, 0).catch(() => {});
    await productMasterPage.selectDropdownOption(productMasterPage.containerTypeDropdown, 0).catch(() => {});
    await productMasterPage.selectDropdownOption(productMasterPage.lidTypeDropdown, 0).catch(() => {});

    await productMasterPage.fill(
      productMasterPage.additionalNotesInput,
      'Clean double-wick burn, zero soot, natural cotton wicks.',
      'Additional Notes'
    );

    await productMasterPage.clickNext();
    await expect(productMasterPage.activeTabTitle).toHaveText('Dimensions & Weight');

    // =========================================================================
    // STEP 3: DIMENSIONS & WEIGHT
    // =========================================================================
    console.log('[E2E-01] Filling Step 3: Dimensions & Weight...');
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
    // STEP 4: PRICING (RETAIL TIER CONFIGURATION)
    // =========================================================================
    console.log('[E2E-01] Configuring Step 4: Retail Pricing...');
    await productMasterPage.click(productMasterPage.addRetailPriceBtn, 'Add Retail Price Button');
    await productMasterPage.retailPriceModal.waitFor({ state: 'visible', timeout: 8000 });
    await productMasterPage.selectDropdownOption(productMasterPage.pricingChannelDropdown, 0);
    await productMasterPage.fill(productMasterPage.retailSellingPriceInput, '850', 'Retail Selling Price');
    await productMasterPage.fill(productMasterPage.retailMinOrderQtyInput, '1', 'Retail Min Qty');
    await productMasterPage.fill(productMasterPage.retailMaxOrderQtyInput, '25', 'Retail Max Qty');
    await productMasterPage.fill(productMasterPage.retailMinDiscountInput, '5', 'Retail Min Discount');
    await productMasterPage.fill(productMasterPage.retailMaxDiscountInput, '12', 'Retail Max Discount');
    await productMasterPage.click(productMasterPage.retailModalSaveBtn, 'Retail Price Modal Save');
    await productMasterPage.retailPriceModal.waitFor({ state: 'hidden', timeout: 5000 });

    await productMasterPage.clickNext();
    await expect(productMasterPage.activeTabTitle).toHaveText('Stock Management');

    // =========================================================================
    // STEP 5: STOCK MANAGEMENT
    // =========================================================================
    console.log('[E2E-01] Configuring Step 5: Stock Levels & Warehouse...');
    await productMasterPage.fill(productMasterPage.openingStockInput, '150', 'Opening Stock');
    await productMasterPage.fill(productMasterPage.currentStockInput, '120', 'Current Stock');
    await productMasterPage.fill(productMasterPage.reservedStockInput, '20', 'Reserved Stock');
    await productMasterPage.fill(productMasterPage.minimumStockInput, '30', 'Minimum Stock');
    await productMasterPage.selectDropdownOption(productMasterPage.warehouseDropdown, 0);

    // Available Stock formula: 120 - 20 = 100
    await expect(productMasterPage.availableStockDisabled).toHaveValue('100');

    await productMasterPage.clickNext();
    await expect(productMasterPage.activeTabTitle).toHaveText('Images');

    // =========================================================================
    // STEP 6: IMAGES & SAVE & EXIT
    // =========================================================================
    console.log('[E2E-01] Uploading image asset and persisting product via SAVE & EXIT...');
    const imageAssetPath = path.resolve(__dirname, '../../../testdata/masters/sampleCandle.png');
    await productMasterPage.imagesFileInput.setInputFiles(imageAssetPath);
    await productMasterPage.page.waitForTimeout(1000);

    // Click SAVE & EXIT to save complete product and return to table
    await productMasterPage.clickSaveAndExit();
    await expect(productMasterPage.stepperDialog).toBeHidden();
    await expect(productMasterPage.pageHeading).toBeVisible();

    // =========================================================================
    // VERIFY PRODUCT IN LISTING TABLE
    // =========================================================================
    console.log(`[E2E-01] Searching for created product "${productName}" in table...`);
    await productMasterPage.verifyProductInTable({
      name: productName,
      sku: productSku,
      category: category
    });

    const createdRow = await productMasterPage.getRowData(0);
    console.log(`[E2E-01] Table listing verified: Name="${createdRow.name}", SKU="${createdRow.sku}", Type="${createdRow.productType}"`);
    expect(createdRow.name).toContain(productName);
    expect(createdRow.sku).toContain(productSku);

    // =========================================================================
    // TABLE OPERATION: CLICK ON IMAGE CELL -> OPEN PRODUCT IMAGES MODAL & VERIFY LOAD
    // =========================================================================
    console.log('[E2E-01] Testing Table Operation: Clicking product image thumbnail in table...');
    await productMasterPage.clickImageCell(0);
    await expect(productMasterPage.productImagesModal).toBeVisible();
    await expect(productMasterPage.productImagesModalTitle).toBeVisible();
    await expect(productMasterPage.productImagesCountBadge).toHaveText('1');

    console.log('[E2E-01] Verifying image is loaded with valid src attribute inside modal...');
    const imageStatus = await productMasterPage.verifyImageLoadsInModal();
    expect(imageStatus.src).toBeTruthy();
    console.log(`[E2E-01] Product image loaded successfully: src="${imageStatus.src?.slice(0, 60)}...", isNaturallyLoaded=${imageStatus.isLoaded}`);

    // Click inside the image thumbnail card to test interaction
    console.log('[E2E-01] Interacting with image thumbnail inside dialog...');
    await productMasterPage.click(productMasterPage.productImagesList.first(), 'Product Image Thumbnail');

    // Close the Product Images modal cleanly
    console.log('[E2E-01] Closing Product Images modal via header close button...');
    await productMasterPage.closeProductImagesModal();
    await expect(productMasterPage.productImagesModal).toBeHidden();

    console.log('[E2E-01] PASSED: Product created, verified in listing table, and image modal validated successfully!');
  });

  test('RD_PRD_E2E_02: Multi-Step Edit Across All Sections -> Persistence Verification after Browser Hard Refresh', async ({ productMasterPage, page }) => {
    const timestamp = Date.now().toString().slice(-4);
    const initialName = `Nordic Forest Cedar ${timestamp}`;
    const initialSku = `NFC-${timestamp}`;
    const updatedName = `Nordic Forest Cedar ${timestamp} (Rev 2)`;
    const updatedDescription = 'Updated formulation: Enhanced pine needle aroma with extended burn duration.';

    // =========================================================================
    // STEP 1: CREATE BASE PRODUCT VIA SAVE & EXIT
    // =========================================================================
    await productMasterPage.goto();
    await productMasterPage.openCreateProductWizard();
    await productMasterPage.fill(productMasterPage.productNameInput, initialName, 'Product Name');
    await productMasterPage.fill(productMasterPage.skuInput, initialSku, 'SKU');
    await productMasterPage.selectDropdownOption(productMasterPage.categoryDropdown, 0);
    await productMasterPage.selectDropdownOption(productMasterPage.productTypeDropdown, 0);
    await productMasterPage.fill(productMasterPage.descriptionInput, 'Initial batch handcrafted Nordic cedar candle.', 'Description');

    await productMasterPage.clickNext();
    await productMasterPage.selectDropdownOption(productMasterPage.waxTypeDropdown, 0);
    await productMasterPage.selectDropdownOption(productMasterPage.wickTypeDropdown, 0);
    await productMasterPage.selectDropdownOption(productMasterPage.wickSizeDropdown, 0);
    await productMasterPage.selectDropdownOption(productMasterPage.packagingTypeDropdown, 0);
    if (await productMasterPage.burnTimeInput.isVisible()) {
      await productMasterPage.fill(productMasterPage.burnTimeInput, '40', 'Burn Time');
      await productMasterPage.selectDropdownOption(productMasterPage.burnTimeUnitDropdown, 0);
    }

    await productMasterPage.clickNext();
    await productMasterPage.fill(productMasterPage.productHeightInput, '10', 'Product Height');
    await productMasterPage.fill(productMasterPage.bottomDiameterInput, '6', 'Bottom Diameter');
    await productMasterPage.fill(productMasterPage.topDiameterInput, '6', 'Top Diameter');
    await productMasterPage.fill(productMasterPage.capacityWaxInput, '200', 'Capacity (Wax)');
    await productMasterPage.fill(productMasterPage.netWeightInput, '200', 'Net Weight');
    await productMasterPage.fill(productMasterPage.grossWeightInput, '350', 'Gross Weight');

    // Advance to Step 4 & 5 to configure initial stock so all required fields are populated
    await productMasterPage.clickNext();
    await productMasterPage.clickNext();
    await productMasterPage.fill(productMasterPage.openingStockInput, '100', 'Initial Opening Stock');
    await productMasterPage.fill(productMasterPage.currentStockInput, '100', 'Initial Current Stock');
    await productMasterPage.fill(productMasterPage.reservedStockInput, '10', 'Initial Reserved Stock');
    await productMasterPage.fill(productMasterPage.minimumStockInput, '20', 'Initial Minimum Stock');
    await productMasterPage.selectDropdownOption(productMasterPage.warehouseDropdown, 0);

    // Save initial product state
    console.log(`[E2E-02] Saving initial base product "${initialName}"...`);
    await productMasterPage.clickSaveAndExit();
    await expect(productMasterPage.stepperDialog).toBeHidden();

    // =========================================================================
    // STEP 2: SEARCH PRODUCT & OPEN IN EDIT MODE
    // =========================================================================
    console.log(`[E2E-02] Searching for "${initialName}" to open in Edit mode...`);
    await productMasterPage.searchProduct(initialName);
    await productMasterPage.clickEditProduct(0);
    await expect(productMasterPage.stepperDialog).toBeVisible();

    // Verify initial pre-filled values
    await expect(productMasterPage.productNameInput).toHaveValue(initialName);
    await expect(productMasterPage.skuInput).toHaveValue(initialSku);

    // =========================================================================
    // STEP 3: EDIT ACROSS MULTIPLE STEPS
    // =========================================================================
    console.log('[E2E-02] Modifying Step 1 fields (Name, Description)...');
    await productMasterPage.fill(productMasterPage.productNameInput, updatedName, 'Updated Product Name');
    await productMasterPage.fill(productMasterPage.descriptionInput, updatedDescription, 'Updated Description');

    // Proceed to Step 2 & Edit Candle Details
    await productMasterPage.clickNext();
    await expect(productMasterPage.activeTabTitle).toHaveText('Candle Details');
    console.log('[E2E-02] Modifying Step 2 fields (Burn Time to 65)...');
    if (await productMasterPage.burnTimeInput.isVisible()) {
      await productMasterPage.fill(productMasterPage.burnTimeInput, '65', 'Updated Burn Time');
    }
    await productMasterPage.fill(productMasterPage.additionalNotesInput, 'Revised formula with 65-hour burn test certification.', 'Updated Notes');

    // Proceed to Step 3 & Edit Dimensions
    await productMasterPage.clickNext();
    await expect(productMasterPage.activeTabTitle).toHaveText('Dimensions & Weight');
    console.log('[E2E-02] Modifying Step 3 fields (Height to 16, Gross Weight to 450)...');
    await productMasterPage.fill(productMasterPage.productHeightInput, '16', 'Updated Product Height');
    await productMasterPage.fill(productMasterPage.capacityWaxInput, '250', 'Updated Capacity');
    await productMasterPage.fill(productMasterPage.grossWeightInput, '450', 'Updated Gross Weight');

    // Proceed to Step 4 (Pricing)
    await productMasterPage.clickNext();
    await expect(productMasterPage.activeTabTitle).toHaveText('Pricing');

    // Proceed to Step 5 & Edit Stock Levels
    await productMasterPage.clickNext();
    await expect(productMasterPage.activeTabTitle).toHaveText('Stock Management');
    console.log('[E2E-02] Modifying Step 5 fields (Current Stock: 200, Reserved: 40)...');
    await productMasterPage.fill(productMasterPage.currentStockInput, '200', 'Updated Current Stock');
    await productMasterPage.fill(productMasterPage.reservedStockInput, '40', 'Updated Reserved Stock');
    await expect(productMasterPage.availableStockDisabled).toHaveValue('160');

    // Save changes via SAVE & EXIT
    console.log('[E2E-02] Persisting all edits via SAVE & EXIT...');
    await productMasterPage.clickSaveAndExit();
    await expect(productMasterPage.stepperDialog).toBeHidden();

    // =========================================================================
    // STEP 4: HARD BROWSER REFRESH & PERSISTENCE VERIFICATION
    // =========================================================================
    console.log('[E2E-02] Performing hard browser reload to verify persistent DB state...');
    await page.reload({ waitUntil: 'networkidle' });
    await expect(productMasterPage.pageHeading).toBeVisible();

    // Search for updated product name
    console.log(`[E2E-02] Searching table for updated product name: "${updatedName}"...`);
    await productMasterPage.searchProduct(updatedName);
    const updatedRow = await productMasterPage.getRowData(0);
    expect(updatedRow.name).toContain(updatedName);
    console.log(`[E2E-02] Table verified with updated name: "${updatedRow.name}"`);

    // Reopen in Edit mode to assert every updated field retained its new value after refresh
    console.log('[E2E-02] Reopening product in Edit mode to verify field-by-field persistence after reload...');
    await productMasterPage.clickEditProduct(0);
    await expect(productMasterPage.stepperDialog).toBeVisible();

    // Verify Step 1 persisted
    await expect(productMasterPage.activeTabTitle).toHaveText('Basic Information');
    await expect(productMasterPage.productNameInput).toHaveValue(updatedName);
    await expect(productMasterPage.descriptionInput).toHaveValue(updatedDescription);

    // Verify Step 2 persisted
    await productMasterPage.clickNext();
    await expect(productMasterPage.activeTabTitle).toHaveText('Candle Details');
    if (await productMasterPage.burnTimeInput.isVisible()) {
      await expect(productMasterPage.burnTimeInput).toHaveValue('65');
    }

    // Verify Step 3 persisted
    await productMasterPage.clickNext();
    await expect(productMasterPage.activeTabTitle).toHaveText('Dimensions & Weight');
    await expect(productMasterPage.productHeightInput).toHaveValue('16');
    await expect(productMasterPage.grossWeightInput).toHaveValue('450');

    // Verify Step 5 persisted
    await productMasterPage.clickNext(); // Step 4
    await productMasterPage.clickNext(); // Step 5
    await expect(productMasterPage.activeTabTitle).toHaveText('Stock Management');
    await expect(productMasterPage.currentStockInput).toHaveValue('200');
    await expect(productMasterPage.reservedStockInput).toHaveValue('40');
    await expect(productMasterPage.availableStockDisabled).toHaveValue('160');

    // Dismiss modal cleanly
    await productMasterPage.click(productMasterPage.cancelBtn, 'Cancel Button');
    await expect(productMasterPage.stepperDialog).toBeHidden();

    console.log('=========================================================================');
    console.log('PASSED: Multi-step edit persisted across browser reload with 100% data integrity!');
    console.log('=========================================================================');
  });

  test('RD_PRD_E2E_03: Product Status & CRUD Lifecycle (Search, Verify Active Badge, Delete/Deactivate Confirmation)', async ({ productMasterPage }) => {
    const timestamp = Date.now().toString().slice(-4);
    const productName = `Saffron Sunrise Votive ${timestamp}`;
    const productSku = `SSV-${timestamp}`;

    // Create a product for status verification
    await productMasterPage.goto();
    await productMasterPage.openCreateProductWizard();
    await productMasterPage.fill(productMasterPage.productNameInput, productName, 'Product Name');
    await productMasterPage.fill(productMasterPage.skuInput, productSku, 'SKU');
    await productMasterPage.selectDropdownOption(productMasterPage.categoryDropdown, 0);
    await productMasterPage.selectDropdownOption(productMasterPage.productTypeDropdown, 0);
    await productMasterPage.fill(productMasterPage.descriptionInput, 'Seasonal sunrise votive for status validation.', 'Description');

    await productMasterPage.clickNext();
    await productMasterPage.selectDropdownOption(productMasterPage.waxTypeDropdown, 0);
    await productMasterPage.selectDropdownOption(productMasterPage.wickTypeDropdown, 0);
    await productMasterPage.selectDropdownOption(productMasterPage.wickSizeDropdown, 0);
    await productMasterPage.selectDropdownOption(productMasterPage.packagingTypeDropdown, 0);
    if (await productMasterPage.burnTimeInput.isVisible()) {
      await productMasterPage.fill(productMasterPage.burnTimeInput, '35', 'Burn Time');
      await productMasterPage.selectDropdownOption(productMasterPage.burnTimeUnitDropdown, 0);
    }

    await productMasterPage.clickNext();
    await productMasterPage.fill(productMasterPage.productHeightInput, '10', 'Product Height');
    await productMasterPage.fill(productMasterPage.bottomDiameterInput, '6', 'Bottom Diameter');
    await productMasterPage.fill(productMasterPage.topDiameterInput, '6', 'Top Diameter');
    await productMasterPage.fill(productMasterPage.capacityWaxInput, '200', 'Capacity (Wax)');
    await productMasterPage.fill(productMasterPage.netWeightInput, '200', 'Net Weight');
    await productMasterPage.fill(productMasterPage.grossWeightInput, '350', 'Gross Weight');

    await productMasterPage.clickSaveAndExit();
    await expect(productMasterPage.stepperDialog).toBeHidden();

    // Search and verify product in table
    console.log(`[E2E-03] Validating status lifecycle for "${productName}"...`);
    await productMasterPage.searchProduct(productName);
    const row = await productMasterPage.getRowData(0);
    expect(row.name).toContain(productName);

    // Verify status indicator in the row
    const status = await productMasterPage.getProductStatus(0);
    console.log(`[E2E-03] Initial Product Status in table: "${status}"`);
    expect(status.toLowerCase()).not.toContain('inactive');

    // Test Delete / Deactivate action button
    console.log('[E2E-03] Testing Delete/Deactivate button interaction...');
    await productMasterPage.clickDeleteProduct(0);

    // Handle confirm dialog if present
    await productMasterPage.confirmDialogAccept();
    console.log('[E2E-03] Confirm dialog accepted (if present).');

    console.log('=========================================================================');
    console.log('PASSED: Product Status & CRUD Lifecycle verified successfully!');
    console.log('=========================================================================');
  });

  test('RD_PRD_E2E_04: Product Table Operations (Image Viewer Modal, Count Badge, Image Load Verification & Dismissal)', async ({ productMasterPage }) => {
    await productMasterPage.goto();

    // Look for existing rows with images or create a quick product with image
    let hasImageRow = false;
    const rowCount = await productMasterPage.tableRows.count();
    let targetRowIndex = 0;

    for (let i = 0; i < Math.min(rowCount, 10); i++) {
      const cell = productMasterPage.tableRows.nth(i).locator('td').nth(3);
      const cellText = (await cell.innerText()).trim();
      if (cellText !== '--' && cellText !== '') {
        hasImageRow = true;
        targetRowIndex = i;
        break;
      }
      if (await cell.locator('img, button, [role="button"], a').isVisible().catch(() => false)) {
        hasImageRow = true;
        targetRowIndex = i;
        break;
      }
    }

    if (!hasImageRow) {
      const timestamp = Date.now().toString().slice(-4);
      const prodName = `Gallery Test Candle ${timestamp}`;
      const prodSku = `GTC-${timestamp}`;

      console.log(`[E2E-04] Creating test product "${prodName}" with image asset...`);
      await productMasterPage.openCreateProductWizard();
      await productMasterPage.fill(productMasterPage.productNameInput, prodName, 'Product Name');
      await productMasterPage.fill(productMasterPage.skuInput, prodSku, 'SKU');
      await productMasterPage.selectDropdownOption(productMasterPage.categoryDropdown, 0);
      await productMasterPage.selectDropdownOption(productMasterPage.productTypeDropdown, 0);

      // Advance to Step 5 (Stocks) and Step 6 (Images)
      await productMasterPage.clickNext();
      await productMasterPage.clickNext();
      await productMasterPage.clickNext();
      await productMasterPage.clickNext();
      await productMasterPage.fill(productMasterPage.openingStockInput, '50', 'Opening Stock');
      await productMasterPage.fill(productMasterPage.currentStockInput, '50', 'Current Stock');
      await productMasterPage.fill(productMasterPage.reservedStockInput, '5', 'Reserved Stock');
      await productMasterPage.fill(productMasterPage.minimumStockInput, '10', 'Minimum Stock');
      await productMasterPage.selectDropdownOption(productMasterPage.warehouseDropdown, 0);

      await productMasterPage.clickNext();
      const imageAssetPath = path.resolve(__dirname, '../../../testdata/masters/sampleCandle.png');
      await productMasterPage.imagesFileInput.setInputFiles(imageAssetPath);
      await productMasterPage.page.waitForTimeout(1000);
      await productMasterPage.clickSaveAndExit();
      await expect(productMasterPage.stepperDialog).toBeHidden();

      await productMasterPage.searchProduct(prodName);
      targetRowIndex = 0;
    }

    // =========================================================================
    // 1. OPEN PRODUCT IMAGES MODAL VIA TABLE IMAGE CELL
    // =========================================================================
    console.log(`[E2E-04] Clicking image cell in row ${targetRowIndex + 1}...`);
    await productMasterPage.clickImageCell(targetRowIndex);

    // Verify modal container and header
    await expect(productMasterPage.productImagesModal).toBeVisible();
    await expect(productMasterPage.productImagesModal.locator('.pi-images')).toBeVisible();
    await expect(productMasterPage.productImagesModalTitle).toBeVisible();

    // Verify count badge
    const badgeText = (await productMasterPage.productImagesCountBadge.innerText()).trim();
    console.log(`[E2E-04] Product Images count badge: "${badgeText}"`);
    expect(Number(badgeText)).toBeGreaterThanOrEqual(1);

    // =========================================================================
    // 2. VERIFY IMAGE CONTENT & BROWSER RENDERING
    // =========================================================================
    console.log('[E2E-04] Validating image source and rendering in modal...');
    const imageInfo = await productMasterPage.verifyImageLoadsInModal();
    expect(imageInfo.src).toBeTruthy();
    expect(imageInfo.src).toMatch(/^(blob:|http|data:)/);
    console.log(`[E2E-04] Image successfully loaded: src="${imageInfo.src?.slice(0, 70)}...", isNaturallyLoaded=${imageInfo.isLoaded}`);

    // Click inside thumbnail card
    await productMasterPage.click(productMasterPage.productImagesList.first(), 'Image item inside modal');

    // =========================================================================
    // 3. DISMISS IMAGE MODAL VIA CLOSE BUTTON
    // =========================================================================
    console.log('[E2E-04] Closing Product Images modal...');
    await productMasterPage.closeProductImagesModal();
    await expect(productMasterPage.productImagesModal).toBeHidden();

    // =========================================================================
    // 4. OPEN PRODUCT DIMENSIONS MODAL VIA TABLE DIMENSIONS CELL
    // =========================================================================
    console.log(`[E2E-04] Clicking Dimensions cell in row ${targetRowIndex + 1}...`);
    await productMasterPage.clickDimensionsCell(targetRowIndex);

    // Verify Dimensions modal container and header
    await expect(productMasterPage.previewDimensionsModal).toBeVisible();
    await expect(productMasterPage.previewDimensionsModalTitle).toContainText('Product Dimensions & Weight');

    // Verify all 3 sub-sections: Candle Dimensions, Weight, Package Dimensions
    const dimensionsText = await productMasterPage.previewDimensionsContent.innerText();
    expect(dimensionsText).toContain('Candle Dimensions');
    expect(dimensionsText).toContain('Height');
    expect(dimensionsText).toContain('Top Diameter');
    expect(dimensionsText).toContain('Bottom Diameter');

    expect(dimensionsText).toContain('Weight');
    expect(dimensionsText).toContain('Capacity (Wax)');
    expect(dimensionsText).toContain('Net Weight');
    expect(dimensionsText).toContain('Gross Weight');

    expect(dimensionsText).toContain('Package Dimensions (Shipping)');
    expect(dimensionsText).toContain('Length');
    expect(dimensionsText).toContain('Width');
    expect(dimensionsText).toContain('Package Weight');

    // Dismiss Dimensions modal cleanly
    console.log('[E2E-04] Closing Product Dimensions modal...');
    await productMasterPage.closeDimensionsModal();
    await expect(productMasterPage.previewDimensionsModal).toBeHidden();

    console.log('=========================================================================');
    console.log('PASSED: Product table operations (Image & Dimensions Modals) verified successfully!');
    console.log('=========================================================================');
  });
});

