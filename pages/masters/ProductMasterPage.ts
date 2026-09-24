import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class ProductMasterPage extends BasePage {
  // =========================================================================
  // 1. PRODUCT MASTER MAIN TABLE & HEADER LOCATORS (/product)
  // =========================================================================
  readonly pageHeading: Locator;
  readonly searchInput: Locator;
  readonly newProductBtn: Locator;
  readonly dataTable: Locator;
  readonly tableRows: Locator;
  readonly paginator: Locator;
  readonly paginatorCurrent: Locator;

  // =========================================================================
  // 2. INTRODUCTORY CONFIRMATION DIALOG
  // =========================================================================
  readonly introDialog: Locator;
  readonly introCancelBtn: Locator;
  readonly introContinueBtn: Locator;

  // =========================================================================
  // 3. STEPPER FORM DIALOG & NAVIGATION CONTAINER
  // =========================================================================
  readonly stepperDialog: Locator;
  readonly stepperCloseBtn: Locator;
  readonly tabList: Locator;
  readonly tabLinks: Locator;
  readonly activeTabTitle: Locator;

  // Global Stepper Navigation Buttons
  readonly cancelBtn: Locator;
  readonly backBtn: Locator;
  readonly saveExitBtn: Locator;
  readonly nextBtn: Locator;
  readonly finalSaveBtn: Locator;
  readonly formErrorMessages: Locator;

  // =========================================================================
  // 4. STEP 1: BASIC INFORMATION
  // =========================================================================
  readonly productNameInput: Locator;
  readonly skuInput: Locator;
  readonly categoryDropdown: Locator;
  readonly productTypeDropdown: Locator;
  readonly brandDropdown: Locator;
  readonly descriptionInput: Locator;

  // =========================================================================
  // 5. STEP 2: CANDLE DETAILS
  // =========================================================================
  readonly fragranceDropdown: Locator;
  readonly waxTypeDropdown: Locator;
  readonly colorPickerPreview: Locator;
  readonly colorValueText: Locator;
  readonly wickTypeDropdown: Locator;
  readonly wickSizeDropdown: Locator;
  readonly burnTimeInput: Locator;
  readonly burnTimeUnitDropdown: Locator;
  readonly containerTypeDropdown: Locator;
  readonly lidTypeDropdown: Locator;
  readonly packagingTypeDropdown: Locator;
  readonly additionalNotesInput: Locator;

  // =========================================================================
  // 6. STEP 3: DIMENSIONS & WEIGHT
  // =========================================================================
  // Section A: Product Dimensions (Candle)
  readonly productHeightInput: Locator;
  readonly productHeightUnitDropdown: Locator;
  readonly bottomDiameterInput: Locator;
  readonly bottomDiameterUnitDropdown: Locator;
  readonly topDiameterInput: Locator;

  // Section B: Weight & Capacity
  readonly capacityWaxInput: Locator;
  readonly capacityUnitDropdown: Locator;
  readonly netWeightInput: Locator;
  readonly netWeightUnitDropdown: Locator;
  readonly grossWeightInput: Locator;
  readonly grossWeightUnitDropdown: Locator;

  // Section C: Package Dimensions
  readonly packageLengthInput: Locator;
  readonly packageWidthInput: Locator;
  readonly packageHeightInput: Locator;
  readonly packageDimensionUnitDropdown: Locator;
  readonly packageWeightInput: Locator;
  readonly packageWeightUnitDropdown: Locator;

  // =========================================================================
  // 7. STEP 4: PRICING (RETAIL, WHOLESALE, B2B)
  // =========================================================================
  readonly hsnSacCodeInput: Locator;
  readonly retailPricingSubTab: Locator;
  readonly wholesalePricingSubTab: Locator;
  readonly b2bPricingSubTab: Locator;

  // Retail Pricing
  readonly addRetailPriceBtn: Locator;
  readonly retailPriceTable: Locator;
  readonly retailPriceEmptyMsg: Locator;
  readonly retailPriceModal: Locator;
  readonly pricingChannelDropdown: Locator;
  readonly retailSellingPriceInput: Locator;
  readonly retailMinOrderQtyInput: Locator;
  readonly retailMaxOrderQtyInput: Locator;
  readonly retailMinDiscountInput: Locator;
  readonly retailMaxDiscountInput: Locator;
  readonly retailModalCancelBtn: Locator;
  readonly retailModalSaveBtn: Locator;

  // Wholesale Pricing
  readonly addWholesalePriceBtn: Locator;
  readonly wholesalePriceModal: Locator;
  readonly wholesaleQtyFromInput: Locator;
  readonly wholesaleQtyToInput: Locator;
  readonly wholesalePriceInput: Locator;
  readonly wholesaleDiscountInput: Locator;
  readonly wholesaleProfitMarginInput: Locator;
  readonly wholesaleModalCancelBtn: Locator;
  readonly wholesaleModalSaveBtn: Locator;

  // B2B Pricing
  readonly addCustomerSpecificPriceBtn: Locator;
  readonly customerSpecificModal: Locator;
  readonly b2bCustomerCompanyInput: Locator;
  readonly b2bCustomerPriceInput: Locator;
  readonly b2bCustomerMinQtyInput: Locator;
  readonly b2bCustomerMaxQtyInput: Locator;
  readonly b2bCustomerValidFromInput: Locator;
  readonly b2bCustomerValidToInput: Locator;
  readonly b2bCustomerCancelBtn: Locator;
  readonly b2bCustomerSaveBtn: Locator;

  readonly addDefaultB2BPriceBtn: Locator;
  readonly defaultB2BModal: Locator;
  readonly b2bDefaultPriceInput: Locator;
  readonly b2bDefaultMinQtyInput: Locator;
  readonly b2bDefaultMaxQtyInput: Locator;
  readonly b2bDefaultValidFromInput: Locator;
  readonly b2bDefaultValidToInput: Locator;
  readonly b2bDefaultCancelBtn: Locator;
  readonly b2bDefaultSaveBtn: Locator;

  readonly copyRetailToB2BBtn: Locator;
  readonly resetAllB2BPricesBtn: Locator;

  // =========================================================================
  // 8. STEP 5: STOCK MANAGEMENT
  // =========================================================================
  readonly openingStockInput: Locator;
  readonly currentStockInput: Locator;
  readonly reservedStockInput: Locator;
  readonly availableStockDisabled: Locator;
  readonly minimumStockInput: Locator;
  readonly warehouseDropdown: Locator;

  readonly inventorySummaryCard: Locator;
  readonly summaryOpeningStock: Locator;
  readonly summaryCurrentStock: Locator;
  readonly summaryReservedStock: Locator;
  readonly summaryMinimumStock: Locator;
  readonly summaryAvailableStock: Locator;
  readonly stockWarningAlert: Locator;

  // =========================================================================
  // 9. STEP 6: IMAGES
  // =========================================================================
  readonly imagesDropzone: Locator;
  readonly imagesFileInput: Locator;

  // =========================================================================
  // 10. TABLE PREVIEW & POPUP MODALS
  // =========================================================================
  readonly productImagesModal: Locator;
  readonly productImagesModalTitle: Locator;
  readonly productImagesCountBadge: Locator;
  readonly productImagesModalCloseBtn: Locator;
  readonly productImagesContainer: Locator;
  readonly productImagesList: Locator;

  readonly previewDimensionsModal: Locator;
  readonly previewDimensionsModalTitle: Locator;
  readonly previewDimensionsModalCloseBtn: Locator;
  readonly previewDimensionsContent: Locator;

  readonly previewDescriptionModal: Locator;
  readonly previewPricingModal: Locator;
  readonly previewStockModal: Locator;

  constructor(page: Page) {
    super(page);

    // 1. Main Table
    this.pageHeading = page.locator('.p-datatable-header h4:has-text("Product")');
    this.searchInput = page.locator('.p-datatable-header input[type="search"][placeholder*="Search" i]');
    this.newProductBtn = page.locator('button[aria-label="New"]:has(.pi-plus)');
    this.dataTable = page.locator('table.p-datatable-table');
    this.tableRows = page.locator('table.p-datatable-table tbody tr[role="row"]:not(.p-datatable-emptymessage)');
    this.paginator = page.locator('.p-paginator');
    this.paginatorCurrent = page.locator('.p-paginator-current');

    // 2. Intro Dialog
    this.introDialog = page.locator('.p-dialog:has(h2:has-text("Add Product"))');
    this.introCancelBtn = this.introDialog.locator('button[aria-label="Cancel"]');
    this.introContinueBtn = this.introDialog.locator('button[aria-label="Continue"]');

    // 3. Stepper Dialog & Navigation
    this.stepperDialog = page.locator('.p-dialog:has(.product-stepper-form)');
    this.stepperCloseBtn = this.stepperDialog.locator('.p-dialog-header-close, button:has(.pi-times)');
    this.tabList = this.stepperDialog.locator('.product-stepper-tabmenu .p-tabmenu-nav[role="tablist"]');
    this.tabLinks = this.stepperDialog.locator('.product-stepper-tabmenu .p-menuitem-link');
    this.activeTabTitle = this.stepperDialog.locator('.product-stepper-tabmenu .p-tabmenuitem.p-highlight .p-menuitem-text');

    // Navigation Buttons
    this.cancelBtn = this.stepperDialog.locator('button[aria-label="CANCEL"]');
    this.backBtn = this.stepperDialog.locator('button[aria-label="BACK"]');
    this.saveExitBtn = this.stepperDialog.locator('button[aria-label="SAVE & EXIT"]');
    this.nextBtn = this.stepperDialog.locator('button[aria-label="NEXT"]');
    this.finalSaveBtn = this.stepperDialog.locator('button[aria-label="SAVE"]');
    this.formErrorMessages = this.stepperDialog.locator('small.p-error, small[style*="239, 68, 68"], small.text-red-500');

    // 4. Step 1: Basic Information
    this.productNameInput = this.stepperDialog.locator('input[name="product_Name"]');
    this.skuInput = this.stepperDialog.locator('input[name="sku"]');
    this.categoryDropdown = this.stepperDialog.locator('div.p-dropdown:has(select[name="category_Id"])');
    this.productTypeDropdown = this.stepperDialog.locator('div.p-dropdown:has(select[name="product_Type_Id"])');
    this.brandDropdown = this.stepperDialog.locator('div.p-dropdown:has(select[name="brand_Id"])');
    this.descriptionInput = this.stepperDialog.locator('textarea[name="description"]');

    // 5. Step 2: Candle Details
    this.fragranceDropdown = this.stepperDialog.locator('div.p-dropdown:has(select[name="fragrance_Id"])');
    this.waxTypeDropdown = this.stepperDialog.locator('div.p-dropdown:has(select[name="wax_Type_Id"])');
    this.colorPickerPreview = this.stepperDialog.locator('.p-colorpicker-preview');
    this.colorValueText = this.stepperDialog.locator('.flex:has(.p-colorpicker) span.ml-2');
    this.wickTypeDropdown = this.stepperDialog.locator('div.p-dropdown:has(select[name="wick_Type_Id"])');
    this.wickSizeDropdown = this.stepperDialog.locator('div.p-dropdown:has(select[name="wick_Size_Id"])');
    this.burnTimeInput = this.stepperDialog.locator('div:has(> label:has-text("Burn Time")) input.p-inputnumber-input');
    this.burnTimeUnitDropdown = this.stepperDialog.locator('div:has(> label:has-text("Burn Time")) div.p-dropdown');
    this.containerTypeDropdown = this.stepperDialog.locator('div.p-dropdown:has(select[name="container_Type_Id"])');
    this.lidTypeDropdown = this.stepperDialog.locator('div.p-dropdown:has(select[name="lid_Type_Id"])');
    this.packagingTypeDropdown = this.stepperDialog.locator('div.p-dropdown:has(select[name="packing_Type_Id"])');
    this.additionalNotesInput = this.stepperDialog.locator('textarea[name="additional_Note"]');

    // 6. Step 3: Dimensions & Weight
    this.productHeightInput = this.stepperDialog.locator('input[name="product_Height"]');
    this.productHeightUnitDropdown = this.stepperDialog.locator('div.p-dropdown:has(select[name="product_Height_Unit"])');
    this.bottomDiameterInput = this.stepperDialog.locator('input[name="product_Bottom_Diameter"]');
    this.bottomDiameterUnitDropdown = this.stepperDialog.locator('div.p-dropdown:has(select[name="product_Diameter_Unit"])');
    this.topDiameterInput = this.stepperDialog.locator('input[name="product_Top_Diameter"]');

    this.capacityWaxInput = this.stepperDialog.locator('input[name="capacity"]');
    this.capacityUnitDropdown = this.stepperDialog.locator('div.p-dropdown:has(select[name="capacity_Unit"])');
    this.netWeightInput = this.stepperDialog.locator('input[name="weight"]');
    this.netWeightUnitDropdown = this.stepperDialog.locator('div.p-dropdown:has(select[name="net_Weight_Unit"])');
    this.grossWeightInput = this.stepperDialog.locator('input[name="gross_Weight"]');
    this.grossWeightUnitDropdown = this.stepperDialog.locator('div.p-dropdown:has(select[name="gross_Weight_Unit"])');

    this.packageLengthInput = this.stepperDialog.locator('input[name="package_Length"]');
    this.packageWidthInput = this.stepperDialog.locator('input[name="package_Width"]');
    this.packageHeightInput = this.stepperDialog.locator('input[name="package_Height"]');
    this.packageDimensionUnitDropdown = this.stepperDialog.locator('div.p-dropdown:has(select[name="package_Dimension_Unit"])');
    this.packageWeightInput = this.stepperDialog.locator('input[name="package_Weight"]');
    this.packageWeightUnitDropdown = this.stepperDialog.locator('div.p-dropdown:has(select[name="package_Weight_Unit"])');

    // 7. Step 4: Pricing
    this.hsnSacCodeInput = this.stepperDialog.locator('input[name="hsn_Sac_Code"]');
    this.retailPricingSubTab = this.stepperDialog.locator('.p-tabmenuitem:has-text("Retail Pricing")');
    this.wholesalePricingSubTab = this.stepperDialog.locator('.p-tabmenuitem:has-text("Wholesale Pricing")');
    this.b2bPricingSubTab = this.stepperDialog.locator('.p-tabmenuitem:has-text("B2B Pricing")');

    this.addRetailPriceBtn = this.stepperDialog.locator('button[aria-label="Add Retail Price"]').first();
    this.retailPriceTable = this.stepperDialog.locator('table.p-datatable-table:has(th:has-text("Channel"))').first();
    this.retailPriceEmptyMsg = this.stepperDialog.locator('tr.p-datatable-emptymessage:has-text("No retail prices added yet")').first();
    this.retailPriceModal = page.locator('.p-dialog:has(.p-dialog-title:has-text("Add Retail Price"))').first();
    this.pricingChannelDropdown = this.retailPriceModal.locator('div:has(> label:has-text("Pricing Channel")) .p-dropdown').first();
    this.retailSellingPriceInput = this.retailPriceModal.locator('div:has(> label:has-text("Selling Price")) input.p-inputnumber-input').first();
    this.retailMinOrderQtyInput = this.retailPriceModal.locator('div:has(> label:has-text("Minimum Order Quantity")) input.p-inputnumber-input').first();
    this.retailMaxOrderQtyInput = this.retailPriceModal.locator('div:has(> label:has-text("Maximum Order Quantity")) input.p-inputnumber-input').first();
    this.retailMinDiscountInput = this.retailPriceModal.locator('div:has(> label:has-text("Minimum Discount")) input.p-inputtext').first();
    this.retailMaxDiscountInput = this.retailPriceModal.locator('div:has(> label:has-text("Maximum Discount")) input.p-inputtext').first();
    this.retailModalCancelBtn = this.retailPriceModal.locator('button[aria-label="Cancel"]').first();
    this.retailModalSaveBtn = this.retailPriceModal.locator('button[aria-label="Save"][type="submit"]').first();

    this.addWholesalePriceBtn = this.stepperDialog.locator('button:has-text("Wholesale")').first();
    this.wholesalePriceModal = page.locator('.p-dialog:has(.p-dialog-title:has-text("Add Wholesale Price Range"))').first();
    this.wholesaleQtyFromInput = this.wholesalePriceModal.locator('div:has(> label:has-text("Quantity From")) input.p-inputnumber-input');
    this.wholesaleQtyToInput = this.wholesalePriceModal.locator('div:has(> label:has-text("Quantity To")) input.p-inputnumber-input');
    this.wholesalePriceInput = this.wholesalePriceModal.locator('div:has(> label:has-text("Wholesale Price")) input.p-inputnumber-input');
    this.wholesaleDiscountInput = this.wholesalePriceModal.locator('div:has(> label:has-text("Discount (%)")) input.p-inputtext');
    this.wholesaleProfitMarginInput = this.wholesalePriceModal.locator('div:has(> label:has-text("Profit Margin")) input[readonly]');
    this.wholesaleModalCancelBtn = this.wholesalePriceModal.locator('button[aria-label="Cancel"]');
    this.wholesaleModalSaveBtn = this.wholesalePriceModal.locator('button[aria-label="Save"][type="submit"]');

    this.addCustomerSpecificPriceBtn = this.stepperDialog.locator('button[aria-label="Add Customer Specific Price"]');
    this.customerSpecificModal = page.locator('.p-dialog:has(.p-dialog-title:has-text("Add Customer Specific Price"))');
    this.b2bCustomerCompanyInput = this.customerSpecificModal.locator('div:has(> label:has-text("Customer / Company")) input.p-inputtext');
    this.b2bCustomerPriceInput = this.customerSpecificModal.locator('div:has(> label:has-text("Price (₹)")) input.p-inputnumber-input');
    this.b2bCustomerMinQtyInput = this.customerSpecificModal.locator('div:has(> label:has-text("Minimum Quantity")) input.p-inputnumber-input');
    this.b2bCustomerMaxQtyInput = this.customerSpecificModal.locator('div:has(> label:has-text("Maximum Quantity")) input.p-inputnumber-input');
    this.b2bCustomerValidFromInput = this.customerSpecificModal.locator('div:has(> label:has-text("Valid From")) input[type="date"]');
    this.b2bCustomerValidToInput = this.customerSpecificModal.locator('div:has(> label:has-text("Valid To")) input[type="date"]');
    this.b2bCustomerCancelBtn = this.customerSpecificModal.locator('button[aria-label="Cancel"]');
    this.b2bCustomerSaveBtn = this.customerSpecificModal.locator('button[aria-label="Save"][type="submit"]');

    this.addDefaultB2BPriceBtn = this.stepperDialog.locator('button[aria-label="Add Default B2B Price"]');
    this.defaultB2BModal = page.locator('.p-dialog:has(.p-dialog-title:has-text("Add Default B2B Price"))');
    this.b2bDefaultPriceInput = this.defaultB2BModal.locator('div:has(> label:has-text("Price (₹)")) input.p-inputnumber-input');
    this.b2bDefaultMinQtyInput = this.defaultB2BModal.locator('div:has(> label:has-text("Minimum Quantity")) input.p-inputnumber-input');
    this.b2bDefaultMaxQtyInput = this.defaultB2BModal.locator('div:has(> label:has-text("Maximum Quantity")) input.p-inputnumber-input');
    this.b2bDefaultValidFromInput = this.defaultB2BModal.locator('div:has(> label:has-text("Valid From")) input[type="date"]');
    this.b2bDefaultValidToInput = this.defaultB2BModal.locator('div:has(> label:has-text("Valid To")) input[type="date"]');
    this.b2bDefaultCancelBtn = this.defaultB2BModal.locator('button[aria-label="Cancel"]');
    this.b2bDefaultSaveBtn = this.defaultB2BModal.locator('button[aria-label="Save"][type="submit"]');

    this.copyRetailToB2BBtn = this.stepperDialog.locator('button:has-text("Copy Retail Price to B2B")');
    this.resetAllB2BPricesBtn = this.stepperDialog.locator('button:has-text("Reset All B2B Prices")');

    // 8. Step 5: Stock Management
    this.openingStockInput = this.stepperDialog.locator('input[name="opening_Stock"]');
    this.currentStockInput = this.stepperDialog.locator('input[name="current_Stock"]');
    this.reservedStockInput = this.stepperDialog.locator('input[name="reserved_Stock"]');
    this.availableStockDisabled = this.stepperDialog.locator('div:has(> label:has-text("Available Stock")) input[disabled]');
    this.minimumStockInput = this.stepperDialog.locator('input[name="minimum_Stock"]');
    this.warehouseDropdown = this.stepperDialog.locator('div.p-dropdown:has(select[name="warehouse_Id"])');

    this.inventorySummaryCard = this.stepperDialog.locator('div:has(> div:has-text("Inventory Summary"))');
    this.summaryOpeningStock = this.inventorySummaryCard.locator('div:has(> span:text-is("Opening Stock")) span').nth(1);
    this.summaryCurrentStock = this.inventorySummaryCard.locator('div:has(> span:text-is("Current Stock")) span').nth(1);
    this.summaryReservedStock = this.inventorySummaryCard.locator('div:has(> span:text-is("Reserved Stock")) span').nth(1);
    this.summaryMinimumStock = this.inventorySummaryCard.locator('div:has(> span:text-is("Minimum Stock")) span').nth(1);
    this.summaryAvailableStock = this.inventorySummaryCard.locator('div:has(> span:text-is("Available Stock")) span').nth(1);
    this.stockWarningAlert = this.stepperDialog.locator('text=/Available stock is at or below minimum level/i');

    // 9. Step 6: Images
    this.imagesDropzone = this.stepperDialog.locator('label[for="product-images-input"]');
    this.imagesFileInput = this.stepperDialog.locator('input#product-images-input[type="file"]');

    // 10. Table Preview Modals
    this.productImagesModal = page.locator('.p-dialog:has(.p-dialog-title:has-text("Product Images"))');
    this.productImagesModalTitle = this.productImagesModal.locator('.p-dialog-title span:has-text("Product Images")');
    this.productImagesCountBadge = this.productImagesModal.locator('.p-dialog-title span').nth(1);
    this.productImagesModalCloseBtn = this.productImagesModal.locator('.p-dialog-header-close, button[aria-label="Close"]');
    this.productImagesContainer = this.productImagesModal.locator('.p-dialog-content');
    this.productImagesList = this.productImagesModal.locator('.p-dialog-content img');

    this.previewDimensionsModal = page.locator('.p-dialog:has(.p-dialog-title:has-text("Product Dimensions & Weight"))');
    this.previewDimensionsModalTitle = this.previewDimensionsModal.locator('.p-dialog-title');
    this.previewDimensionsModalCloseBtn = this.previewDimensionsModal.locator('.p-dialog-header-close, button[aria-label="Close"]');
    this.previewDimensionsContent = this.previewDimensionsModal.locator('.p-dialog-content');

    this.previewDescriptionModal = page.locator('.p-dialog:has(.p-dialog-title:has-text("Description"))');
    this.previewPricingModal = page.locator('.p-dialog:has(.p-dialog-title:has-text("Pricing"))');
    this.previewStockModal = page.locator('.p-dialog:has(.p-dialog-title:has-text("Stock"))');
  }

  // =========================================================================
  // ACTIONS & WORKFLOW HELPER METHODS
  // =========================================================================
  async goto(): Promise<void> {
    await this.navigateTo('/product');
    await this.page.waitForLoadState('domcontentloaded');
    await this.pageHeading.waitFor({ state: 'visible', timeout: 15000 });
  }

  async openCreateProductWizard(): Promise<void> {
    await this.click(this.newProductBtn, 'New Product Button');
    await this.introDialog.waitFor({ state: 'visible', timeout: 10000 });
    await this.click(this.introContinueBtn, 'Intro Continue Button');
    await this.stepperDialog.waitFor({ state: 'visible', timeout: 15000 });
  }

  async selectDropdownOption(dropdown: Locator, optionTextOrIndex: string | number = 0): Promise<string> {
    await this.click(dropdown, 'Dropdown Wrapper');
    const panel = this.page.locator('.p-dropdown-panel:visible');
    await panel.waitFor({ state: 'visible', timeout: 5000 });

    let targetOption: Locator;
    if (typeof optionTextOrIndex === 'string') {
      targetOption = panel.locator(`.p-dropdown-item:has-text("${optionTextOrIndex}")`).first();
    } else {
      targetOption = panel.locator('.p-dropdown-item').nth(optionTextOrIndex);
    }

    const selectedText = (await targetOption.innerText()).trim();
    await this.click(targetOption, `Dropdown Option: ${selectedText}`);
    await this.page.waitForTimeout(300);
    return selectedText;
  }

  async clickNext(): Promise<void> {
    await this.click(this.nextBtn, 'NEXT Button');
    await this.page.waitForTimeout(600);
  }

  async clickBack(): Promise<void> {
    await this.click(this.backBtn, 'BACK Button');
    await this.page.waitForTimeout(600);
  }

  async clickSaveAndExit(): Promise<void> {
    await this.click(this.saveExitBtn, 'SAVE & EXIT Button');
    await this.stepperDialog.waitFor({ state: 'hidden', timeout: 20000 });
  }

  async clickFinalSave(): Promise<void> {
    await this.click(this.finalSaveBtn, 'SAVE Final Button');
    await this.page.waitForTimeout(1000);
  }

  async searchProduct(nameOrSku: string): Promise<void> {
    await this.searchInput.fill('');
    await this.fill(this.searchInput, nameOrSku, 'Product Search Input');
    await this.searchInput.press('Enter').catch(() => {});
    await this.page.waitForTimeout(1000);
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async clearSearch(): Promise<void> {
    await this.searchInput.fill('');
    await this.searchInput.press('Enter').catch(() => {});
    await this.page.waitForTimeout(800);
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async getRowData(index: number = 0): Promise<{ name: string; sku: string; productType: string; category: string; rowText: string }> {
    const row = this.tableRows.nth(index);
    await row.waitFor({ state: 'visible', timeout: 10000 });
    const rowText = (await row.innerText()).trim();
    const name = (await row.locator('td').nth(1).innerText()).trim();
    const sku = (await row.locator('td').nth(2).innerText()).trim();
    const productType = (await row.locator('td').nth(4).innerText()).trim();
    const category = (await row.locator('td').nth(6).innerText()).trim();
    return { name, sku, productType, category, rowText };
  }

  async verifyProductInTable(params: { name: string; sku: string; category?: string }): Promise<void> {
    await this.searchProduct(params.name);
    const row = this.tableRows.first();
    await row.waitFor({ state: 'visible', timeout: 10000 });
    const rowText = await row.innerText();
    if (!rowText.includes(params.name)) {
      throw new Error(`Expected table to contain product name "${params.name}", but found: ${rowText}`);
    }
    if (!rowText.includes(params.sku)) {
      throw new Error(`Expected table to contain SKU "${params.sku}", but found: ${rowText}`);
    }
    if (params.category && !rowText.includes(params.category)) {
      throw new Error(`Expected table to contain category "${params.category}", but found: ${rowText}`);
    }
  }

  async clickEditProduct(index: number = 0): Promise<void> {
    const row = this.tableRows.nth(index);
    const editBtn = row.locator('.actions button:has(.pi-pencil), button:has(.pi-pencil)').first();
    await this.click(editBtn, `Edit Product in row ${index + 1}`);
    await this.stepperDialog.waitFor({ state: 'visible', timeout: 15000 });
  }

  async clickDeleteProduct(index: number = 0): Promise<void> {
    const row = this.tableRows.nth(index);
    const deleteBtn = row.locator('.actions button:has(.pi-trash), button:has(.pi-trash)').first();
    await this.click(deleteBtn, `Delete Product in row ${index + 1}`);
  }

  async confirmDialogAccept(): Promise<void> {
    const acceptBtn = this.page.locator('.p-confirm-dialog-accept, .p-dialog button:has-text("Yes"), button[aria-label="Yes"]').first();
    if (await acceptBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await this.click(acceptBtn, 'Confirm Dialog Accept Button');
      await this.page.waitForTimeout(500);
      await this.page.waitForLoadState('networkidle').catch(() => {});
    }
  }

  async getProductStatus(index: number = 0): Promise<string> {
    const row = this.tableRows.nth(index);
    const statusTag = row.locator('.p-tag, .status-badge, td.status, td:has(.p-tag)').first();
    if (await statusTag.isVisible({ timeout: 3000 }).catch(() => false)) {
      return (await statusTag.innerText()).trim();
    }
    const fullRowText = await row.innerText();
    if (/inactive/i.test(fullRowText)) return 'Inactive';
    if (/active/i.test(fullRowText)) return 'Active';
    return '';
  }

  // =========================================================================
  // TABLE CELL INTERACTION & PREVIEW MODAL HELPERS
  // =========================================================================
  async clickImageCell(rowIndex: number = 0): Promise<void> {
    const row = this.tableRows.nth(rowIndex);
    const imageCell = row.locator('td').nth(3);
    const clickable = imageCell.locator('img, button, [role="button"], span.cursor-pointer, div.cursor-pointer, a').first();
    if (await clickable.isVisible({ timeout: 2000 }).catch(() => false)) {
      await this.click(clickable, `Image Cell thumbnail in row ${rowIndex + 1}`);
    } else {
      await this.click(imageCell, `Image Cell in row ${rowIndex + 1}`);
    }
    await this.productImagesModal.waitFor({ state: 'visible', timeout: 10000 });
  }

  async closeProductImagesModal(): Promise<void> {
    await this.click(this.productImagesModalCloseBtn, 'Product Images Modal Close Button');
    await this.productImagesModal.waitFor({ state: 'hidden', timeout: 10000 });
  }

  async verifyImageLoadsInModal(): Promise<{ src: string | null; isLoaded: boolean }> {
    const firstImg = this.productImagesList.first();
    await firstImg.waitFor({ state: 'visible', timeout: 10000 });
    const src = await firstImg.getAttribute('src');
    
    // Check if the image element is naturally loaded in DOM
    const isLoaded = await firstImg.evaluate((img: HTMLImageElement) => {
      return img.complete && img.naturalWidth > 0;
    });

    return { src, isLoaded };
  }

  async clickDimensionsCell(rowIndex: number = 0): Promise<void> {
    const row = this.tableRows.nth(rowIndex);
    const trigger = row.locator('td').nth(9).locator('[title*="Dimensions" i], [aria-label*="Dimensions" i], button, span, i, div').first();
    await this.click(trigger, `Dimensions icon in row ${rowIndex + 1}`);
    await this.previewDimensionsModal.waitFor({ state: 'visible', timeout: 10000 });
  }

  async closeDimensionsModal(): Promise<void> {
    await this.click(this.previewDimensionsModalCloseBtn, 'Product Dimensions Modal Close Button');
    await this.previewDimensionsModal.waitFor({ state: 'hidden', timeout: 10000 });
  }

  async clickDescriptionCell(rowIndex: number = 0): Promise<void> {
    const row = this.tableRows.nth(rowIndex);
    const trigger = row.locator('td').nth(10).locator('button, [cursor="pointer"], .cursor-pointer, i, span').first();
    await this.click(trigger, `Description trigger in row ${rowIndex + 1}`);
    await this.previewDescriptionModal.waitFor({ state: 'visible', timeout: 8000 }).catch(() => {});
  }

  async clickPricingCell(rowIndex: number = 0): Promise<void> {
    const row = this.tableRows.nth(rowIndex);
    const trigger = row.locator('td').nth(19).locator('button, [cursor="pointer"], .cursor-pointer, i, span').first();
    await this.click(trigger, `Pricing trigger in row ${rowIndex + 1}`);
    await this.previewPricingModal.waitFor({ state: 'visible', timeout: 8000 }).catch(() => {});
  }

  async clickStockCell(rowIndex: number = 0): Promise<void> {
    const row = this.tableRows.nth(rowIndex);
    const trigger = row.locator('td').nth(20).locator('button, [cursor="pointer"], .cursor-pointer, i, span').first();
    await this.click(trigger, `Stock trigger in row ${rowIndex + 1}`);
    await this.previewStockModal.waitFor({ state: 'visible', timeout: 8000 }).catch(() => {});
  }

  // =========================================================================
  // UNIVERSAL FORM VALIDATION ERROR HELPERS (INHERITED FROM BASEPAGE)
  // =========================================================================
  override async getFieldError(fieldName: string, container?: Locator): Promise<string> {
    return super.getFieldError(fieldName, container || this.stepperDialog);
  }

  override async hasFieldError(fieldName: string, expectedPattern?: string | RegExp, container?: Locator): Promise<boolean> {
    return super.hasFieldError(fieldName, expectedPattern, container || this.stepperDialog);
  }

  override async getAllVisibleErrors(container?: Locator): Promise<string[]> {
    return super.getAllVisibleErrors(container || this.stepperDialog);
  }
}

