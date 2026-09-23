import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export interface ProductRequirementItem {
  productName: string;
  priceType: 'Retail' | 'Wholesale';
  channel?: string;
  quantity: number;
  targetPrice?: number;
}

export interface RequirementDetailsData {
  sampleRequired?: boolean;
  address?: string;
  requirementType: string;
  purpose: string;
  urgency?: string;
  deliveryDate?: string;
}

export class AddRequirementModal {
  readonly modalDialog: Locator;
  readonly modalTitle: Locator;
  readonly closeIconBtn: Locator;

  // Stepper Indicators
  readonly step1Indicator: Locator;
  readonly step2Indicator: Locator;

  // Step 1: Product Details
  readonly addAnotherProductBtn: Locator;
  readonly totalQuantitySummary: Locator;
  readonly expectedOrderValueSummary: Locator;
  readonly step1CloseBtn: Locator;
  readonly nextBtn: Locator;

  // Step 2: Requirement Details
  readonly sampleRequiredCheckbox: Locator;
  readonly deliveryAddressDropdown: Locator;
  readonly editAddressBtn: Locator;
  readonly addNewAddressBtn: Locator;
  readonly requirementTypeDropdown: Locator;
  readonly purposeDropdown: Locator;
  readonly urgencyDropdown: Locator;
  readonly deliveryDateInput: Locator;
  readonly backBtn: Locator;
  readonly submitBtn: Locator;

  constructor(private page: Page) {
    this.modalDialog = page.locator('.p-dialog:has(.p-dialog-title:has-text("Requirement"))');
    this.modalTitle = page.locator('.p-dialog-title:has-text("Requirement")');
    this.closeIconBtn = page.locator('.p-dialog:has(.p-dialog-title:has-text("Requirement")) .p-dialog-header-close');

    // Stepper
    this.step1Indicator = page.locator('.p-dialog:has(.p-dialog-title:has-text("Requirement")) div:has-text("Product Details")').first();
    this.step2Indicator = page.locator('.p-dialog:has(.p-dialog-title:has-text("Requirement")) div:has-text("Requirement Details")').first();

    // Step 1 Buttons & Summaries
    this.addAnotherProductBtn = page.locator('button[aria-label="Add Another Product"], button:has-text("Add Another Product")');
    this.totalQuantitySummary = page.locator('span:has-text("Total Quantity:")');
    this.expectedOrderValueSummary = page.locator('span:has-text("Expected Order Value:")');
    this.step1CloseBtn = page.locator('.p-dialog:has(.p-dialog-title:has-text("Requirement")) button[aria-label="Close"]');
    this.nextBtn = page.locator('.p-dialog:has(.p-dialog-title:has-text("Requirement")) button[aria-label="Next"]');

    // Step 2 Fields
    this.sampleRequiredCheckbox = page.locator('#sampleRequired');
    this.deliveryAddressDropdown = page.locator('.p-dialog:has(.p-dialog-title:has-text("Requirement")) div.p-dropdown:has(select option[value])').first();
    this.editAddressBtn = page.locator('.p-dialog:has(.p-dialog-title:has-text("Requirement")) button:has(.pi-pencil)');
    this.addNewAddressBtn = page.locator('.p-dialog:has(.p-dialog-title:has-text("Requirement")) button[aria-label="Add New Address"]');
    this.requirementTypeDropdown = page.locator('.p-dialog:has(.p-dialog-title:has-text("Requirement")) div:has(> label:has-text("Requirement Type")) .p-dropdown, .p-dialog:has(.p-dialog-title:has-text("Requirement")) div.p-dropdown:has(input#requirementType)');
    this.purposeDropdown = page.locator('.p-dialog:has(.p-dialog-title:has-text("Requirement")) div:has(> label:has-text("Purpose")) .p-dropdown, .p-dialog:has(.p-dialog-title:has-text("Requirement")) div.p-dropdown:has(input#purpose)');
    this.urgencyDropdown = page.locator('.p-dialog:has(.p-dialog-title:has-text("Requirement")) div:has(> label:has-text("Urgency")) .p-dropdown, .p-dialog:has(.p-dialog-title:has-text("Requirement")) div.p-dropdown:has(input#urgency)');
    this.deliveryDateInput = page.locator('.p-dialog:has(.p-dialog-title:has-text("Requirement")) input[name="deliveryDate"], .p-dialog:has(.p-dialog-title:has-text("Requirement")) div:has(> label:has-text("Delivery Date")) input, .p-dialog:has(.p-dialog-title:has-text("Requirement")) .p-calendar input').first();
    this.backBtn = page.locator('.p-dialog:has(.p-dialog-title:has-text("Requirement")) button:has-text("Back"), .p-dialog:has(.p-dialog-title:has-text("Requirement")) button[aria-label="Back"]');
    this.submitBtn = page.locator('.p-dialog:has(.p-dialog-title:has-text("Requirement")) span.p-button-label:has-text("Submit"), .p-dialog:has(.p-dialog-title:has-text("Requirement")) button:has(span.p-button-label:has-text("Submit")), .p-dialog:has(.p-dialog-title:has-text("Requirement")) button:has-text("Submit")').first();
  }

  async waitForOpened(timeout = 5000): Promise<void> {
    await this.modalDialog.waitFor({ state: 'visible', timeout });
  }

  async waitForClosed(timeout = 10000): Promise<void> {
    await this.modalDialog.waitFor({ state: 'hidden', timeout });
  }

  async selectProduct(index = 0, productName?: string): Promise<string> {
    const dropdown = this.page.locator(`div:has(> label:has-text("Product")) div.p-dropdown, div.p-dropdown:has(select[name="products.${index}.product_ID"]), div.p-dropdown:has-text("Select Product")`).first();
    await dropdown.click();
    const panel = this.page.locator('.p-dropdown-panel:visible');
    await panel.waitFor({ state: 'visible', timeout: 5000 });
    let option: Locator;
    if (productName) {
      option = panel.locator('.p-dropdown-item').filter({ hasText: new RegExp(productName, 'i') }).first();
    } else {
      option = panel.locator('.p-dropdown-item').first();
    }
    await option.waitFor({ state: 'visible', timeout: 5000 });
    const selectedText = (await option.innerText()).trim();
    await option.click();
    await this.page.waitForTimeout(300);
    return selectedText;
  }

  async selectPriceType(index = 0, priceType: 'Retail' | 'Wholesale'): Promise<void> {
    const radio = this.page.locator(`label:has(#pt-${index}-${priceType})`);
    await radio.click();
    await this.page.waitForTimeout(300);
  }

  async selectChannel(index = 0, channel?: string): Promise<void> {
    const dropdown = this.page.locator(`div:has(> label:has-text("Channel")) div.p-dropdown, div.p-dropdown:has(select[name="products.${index}.channel"]), div.p-dropdown:has-text("Select Channel")`).first();
    await dropdown.click();
    const panel = this.page.locator('.p-dropdown-panel:visible');
    await panel.waitFor({ state: 'visible', timeout: 5000 });
    if (channel) {
      const option = panel.locator('.p-dropdown-item').filter({ hasText: new RegExp(channel, 'i') }).first();
      await option.waitFor({ state: 'visible', timeout: 5000 });
      await option.click();
    } else {
      const option = panel.locator('.p-dropdown-item').first();
      await option.waitFor({ state: 'visible', timeout: 5000 });
      await option.click();
    }
    await this.page.waitForTimeout(300);
  }

  async getMinQuantity(index = 0): Promise<number> {
    const el = this.page.locator(`div:has(> label:has-text("Min Quantity")) div`).nth(index);
    const text = await el.innerText();
    return parseInt(text.trim(), 10) || 0;
  }

  async getMaxQuantity(index = 0): Promise<number> {
    const el = this.page.locator(`div:has(> label:has-text("Max Quantity")) div`).nth(index);
    const text = await el.innerText();
    return parseInt(text.trim(), 10) || 0;
  }

  async getSellingPrice(index = 0): Promise<number> {
    const el = this.page.locator(`div:has(> label:has-text("Selling Price")) div`).nth(index);
    const text = await el.innerText();
    const match = text.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  }

  async fillQuantity(index = 0, quantity: number): Promise<void> {
    const input = this.page.locator(`input[name="products.${index}.quantity"]`);
    await input.fill(quantity.toString());
    await input.blur();
    await this.page.waitForTimeout(200);
  }

  async fillTargetPrice(index = 0, price: number): Promise<void> {
    const input = this.page.locator(`input[name="products.${index}.targetPrice"]`);
    await input.fill(price.toString());
    await input.blur();
    await this.page.waitForTimeout(200);
  }

  async setSampleRequired(required = true): Promise<void> {
    console.log(`]: Setting Sample Required: ${required}`);
    const label = this.page.locator('.p-dialog:has(.p-dialog-title:has-text("Requirement")) label[for="sampleRequired"], .p-dialog:has(.p-dialog-title:has-text("Requirement")) label:has-text("Sample Required")').first();
    const checkbox = this.page.locator('.p-dialog:has(.p-dialog-title:has-text("Requirement")) #sampleRequired');
    const isChecked = await checkbox.isChecked().catch(() => false);
    if (isChecked !== required) {
      await label.click();
      await this.page.waitForTimeout(300);
    }
  }

  async selectRequirementType(type: string): Promise<void> {
    await this.requirementTypeDropdown.click();
    const panel = this.page.locator('.p-dropdown-panel:visible');
    await panel.waitFor({ state: 'visible', timeout: 5000 });
    const option = panel.locator('.p-dropdown-item').filter({ hasText: new RegExp(type, 'i') }).first();
    await option.waitFor({ state: 'visible', timeout: 5000 });
    await option.click();
    await this.page.waitForTimeout(300);
  }

  async selectPurpose(purpose: string): Promise<void> {
    await this.purposeDropdown.click();
    const panel = this.page.locator('.p-dropdown-panel:visible');
    await panel.waitFor({ state: 'visible', timeout: 5000 });
    const option = panel.locator('.p-dropdown-item').filter({ hasText: new RegExp(purpose, 'i') }).first();
    await option.waitFor({ state: 'visible', timeout: 5000 });
    await option.click();
    await this.page.waitForTimeout(300);
  }

  async setDeliveryDate(dateStr = '29-09-2026'): Promise<void> {
    const input = this.deliveryDateInput;
    await input.waitFor({ state: 'visible', timeout: 5000 });
    await input.click();
    await this.page.waitForTimeout(200);

    // Clear and mimic real keystroke typing
    await input.press('ControlOrMeta+A');
    await input.press('Backspace');
    await input.pressSequentially(dateStr, { delay: 100 });
    await input.press('Tab');
    await this.page.waitForTimeout(300);

    // If calendar popup opened and is visible, dismiss it cleanly by clicking modal title
    const datePicker = this.page.locator('.p-datepicker:visible');
    if (await datePicker.isVisible({ timeout: 500 }).catch(() => false)) {
      await this.modalTitle.click();
      await this.page.waitForTimeout(200);
    }
  }

  async clickNext(): Promise<void> {
    console.log(']: Clicking element: Next Button (Advancing to Step 2: Requirement Details)');
    await this.nextBtn.click();
    await this.page.waitForTimeout(500);
  }

  async clickBack(): Promise<void> {
    console.log(']: Clicking element: Back Button');
    await this.backBtn.click();
    await this.page.waitForTimeout(500);
  }

  async clickSubmit(): Promise<void> {
    console.log(']: Clicking element: Submit Button (<span class="p-button-label p-c">Submit</span>)');
    await this.submitBtn.waitFor({ state: 'visible', timeout: 5000 });
    await this.submitBtn.scrollIntoViewIfNeeded().catch(() => {});
    await this.submitBtn.click();
  }

  async clickClose(): Promise<void> {
    await this.step1CloseBtn.click();
  }

  async closeViaIcon(): Promise<void> {
    await this.closeIconBtn.click();
  }
}

export class RequirementProductsModal {
  readonly modalDialog: Locator;
  readonly modalTitle: Locator;
  readonly closeIconBtn: Locator;
  readonly table: Locator;
  readonly rows: Locator;

  constructor(private page: Page) {
    this.modalDialog = page.locator('.p-dialog:has-text("Requirement Products")');
    this.modalTitle = page.locator('.p-dialog-title:has-text("Requirement Products")');
    this.closeIconBtn = page.locator('.p-dialog:has-text("Requirement Products") .p-dialog-header-close');
    this.table = page.locator('.p-dialog:has-text("Requirement Products") table.p-datatable-table');
    this.rows = page.locator('.p-dialog:has-text("Requirement Products") tbody.p-datatable-tbody tr');
  }

  async waitForOpened(timeout = 5000): Promise<void> {
    await this.modalDialog.waitFor({ state: 'visible', timeout });
  }

  async waitForClosed(timeout = 5000): Promise<void> {
    await this.modalDialog.waitFor({ state: 'hidden', timeout });
  }

  async closeViaIcon(): Promise<void> {
    await this.closeIconBtn.click();
  }

  async getProductRow(index = 0) {
    const row = this.rows.nth(index);
    await row.waitFor({ state: 'visible', timeout: 5000 });
    const cells = row.locator('td');
    return {
      product: (await cells.nth(0).innerText()).trim(),
      sku: (await cells.nth(1).innerText()).trim(),
      qty: (await cells.nth(2).innerText()).trim(),
      targetPrice: (await cells.nth(3).innerText()).trim(),
      lineValue: (await cells.nth(4).innerText()).trim()
    };
  }
}

export class AddProductLineModal {
  readonly modalDialog: Locator;
  readonly modalTitle: Locator;
  readonly closeIconBtn: Locator;
  readonly productDropdown: Locator;
  readonly quantityInput: Locator;
  readonly targetPriceInput: Locator;
  readonly closeBtn: Locator;
  readonly submitBtn: Locator;

  constructor(private page: Page) {
    this.modalDialog = page.locator('.p-dialog:has(.p-dialog-title:has-text("Product"))');
    this.modalTitle = page.locator('.p-dialog-title:has-text("Product")');
    this.closeIconBtn = page.locator('.p-dialog:has(.p-dialog-title:has-text("Product")) .p-dialog-header-close');
    this.productDropdown = page.locator('.p-dialog:has(.p-dialog-title:has-text("Product")) div.p-dropdown, .p-dialog:has(.p-dialog-title:has-text("Product")) div:has(> label:has-text("Product")) .p-dropdown').first();
    this.quantityInput = page.locator('.p-dialog:has(.p-dialog-title:has-text("Product")) input[name="quantity"], .p-dialog:has(.p-dialog-title:has-text("Product")) input[type="number"]').first();
    this.targetPriceInput = page.locator('.p-dialog:has(.p-dialog-title:has-text("Product")) input[name="targetPrice"], .p-dialog:has(.p-dialog-title:has-text("Product")) div:has(> label:has-text("Target Price")) input').first();
    this.closeBtn = page.locator('.p-dialog:has(.p-dialog-title:has-text("Product")) button:has-text("Close"), .p-dialog:has(.p-dialog-title:has-text("Product")) button[aria-label="Close"]').first();
    this.submitBtn = page.locator('.p-dialog:has(.p-dialog-title:has-text("Product")) span.p-button-label:has-text("Submit"), .p-dialog:has(.p-dialog-title:has-text("Product")) button:has-text("Submit"), .p-dialog:has(.p-dialog-title:has-text("Product")) button[type="submit"]').first();
  }

  async waitForOpened(timeout = 5000): Promise<void> {
    await this.modalDialog.waitFor({ state: 'visible', timeout });
  }

  async waitForClosed(timeout = 5000): Promise<void> {
    await this.modalDialog.waitFor({ state: 'hidden', timeout });
  }

  async selectProduct(productName?: string): Promise<string> {
    await this.productDropdown.click();
    const panel = this.page.locator('.p-dropdown-panel:visible');
    await panel.waitFor({ state: 'visible', timeout: 5000 });
    let option: Locator;
    if (productName) {
      option = panel.locator('.p-dropdown-item').filter({ hasText: new RegExp(productName, 'i') }).first();
    } else {
      option = panel.locator('.p-dropdown-item').first();
    }
    await option.waitFor({ state: 'visible', timeout: 5000 });
    const selectedText = (await option.innerText()).trim();
    await option.click();
    await this.page.waitForTimeout(300);
    return selectedText;
  }

  async fillForm(quantity: number, targetPrice?: number): Promise<void> {
    await this.quantityInput.fill(quantity.toString());
    if (targetPrice !== undefined) {
      await this.targetPriceInput.fill(targetPrice.toString());
    }
  }

  async clickSubmit(): Promise<void> {
    console.log(']: Clicking element: Submit Button on Add Product modal');
    await this.submitBtn.click();
  }

  async clickClose(): Promise<void> {
    await this.closeBtn.click();
  }

  async closeViaIcon(): Promise<void> {
    await this.closeIconBtn.click();
  }
}

export class AddCustomizationModal {
  readonly modalDialog: Locator;
  readonly modalTitle: Locator;
  readonly closeIconBtn: Locator;
  readonly customizationRequiredDropdown: Locator;
  readonly addAnotherCustomizationBtn: Locator;
  readonly closeBtn: Locator;
  readonly submitBtn: Locator;

  readonly customizationCards: Locator;

  constructor(private page: Page) {
    this.modalDialog = page.locator('.p-dialog:has(.p-dialog-title:has-text("Customization"))');
    this.modalTitle = page.locator('.p-dialog-title:has-text("Customization")');
    this.closeIconBtn = page.locator('.p-dialog:has(.p-dialog-title:has-text("Customization")) .p-dialog-header-close');
    this.customizationRequiredDropdown = page.locator('.p-dialog:has(.p-dialog-title:has-text("Customization")) div:has(> label:has-text("Customization Required")) .p-dropdown');
    this.customizationCards = page.locator('.p-dialog:has(.p-dialog-title:has-text("Customization")) div:has(> div > span:has-text("Customization #"))');
    this.addAnotherCustomizationBtn = page.locator('.p-dialog:has(.p-dialog-title:has-text("Customization")) button:has-text("Add Another"), button[aria-label="Add Another Customization"], button:has-text("Add Another Customization")').first();
    this.closeBtn = page.locator('.p-dialog:has(.p-dialog-title:has-text("Customization")) button:has-text("Close"), .p-dialog:has(.p-dialog-title:has-text("Customization")) button[aria-label="Close"]').first();
    this.submitBtn = page.locator('.p-dialog:has(.p-dialog-title:has-text("Customization")) button[type="submit"], .p-dialog:has(.p-dialog-title:has-text("Customization")) span.p-button-label:has-text("Submit"), .p-dialog:has(.p-dialog-title:has-text("Customization")) button:has-text("Submit"), .p-dialog:has(.p-dialog-title:has-text("Customization")) button:has-text("Update"), .p-dialog:has(.p-dialog-title:has-text("Customization")) button:has-text("Save")').first();
  }

  async waitForOpened(timeout = 5000): Promise<void> {
    await this.modalDialog.waitFor({ state: 'visible', timeout });
  }

  async waitForClosed(timeout = 5000): Promise<void> {
    await this.modalDialog.waitFor({ state: 'hidden', timeout });
  }

  async setCustomizationRequired(yesNo: 'Yes' | 'No'): Promise<void> {
    await this.customizationRequiredDropdown.click();
    const panel = this.page.locator('.p-dropdown-panel:visible');
    await panel.waitFor({ state: 'visible', timeout: 5000 });
    const option = panel.locator('.p-dropdown-item').filter({ hasText: new RegExp(`^\\s*${yesNo}\\s*$`, 'i') }).first();
    await option.waitFor({ state: 'visible', timeout: 5000 });
    await option.click();
    await this.page.waitForTimeout(300);
  }

  async getCustomizationCardsCount(): Promise<number> {
    return await this.customizationCards.count();
  }

  async selectCustomizationType(cardIndex = 0, typeName: string): Promise<void> {
    const card = this.customizationCards.nth(cardIndex);
    const dropdown = card.locator('div:has(> label:has-text("Customization Type")) .p-dropdown, .p-dropdown:has([aria-label="Select Type"]), .p-dropdown');
    await dropdown.first().click();
    const panel = this.page.locator('.p-dropdown-panel:visible');
    await panel.waitFor({ state: 'visible', timeout: 5000 });
    const option = panel.locator('.p-dropdown-item').filter({ hasText: new RegExp(typeName, 'i') }).first();
    await option.waitFor({ state: 'visible', timeout: 5000 });
    await option.click();
    await this.page.waitForTimeout(300);
  }

  async getAvailableCustomizationTypes(cardIndex = 0): Promise<string[]> {
    const card = this.customizationCards.nth(cardIndex);
    const dropdown = card.locator('div:has(> label:has-text("Customization Type")) .p-dropdown, .p-dropdown:has([aria-label="Select Type"]), .p-dropdown');
    await dropdown.first().click();
    const panel = this.page.locator('.p-dropdown-panel:visible');
    await panel.waitFor({ state: 'visible', timeout: 5000 });
    const items = panel.locator('.p-dropdown-item');
    const count = await items.count();
    const types: string[] = [];
    for (let i = 0; i < count; i++) {
      types.push((await items.nth(i).innerText()).trim());
    }
    // Dismiss dropdown panel by clicking modal title (DO NOT use Escape which closes dialog!)
    await this.modalTitle.click();
    await this.page.waitForTimeout(300);
    return types;
  }

  async clickAddAnotherCustomization(): Promise<void> {
    console.log(']: Clicking element: Add Another Customization Button');
    await this.addAnotherCustomizationBtn.waitFor({ state: 'visible', timeout: 5000 });
    await this.addAnotherCustomizationBtn.click();
    await this.page.waitForTimeout(300);
  }

  async clickSubmit(): Promise<void> {
    const btn = this.modalDialog.locator('button[type="submit"], button:has-text("Submit"), button:has-text("Update"), button:has-text("Save"), span.p-button-label:has-text("Submit"), span.p-button-label:has-text("Update")').first();
    console.log(']: Clicking element: Submit Button on Customization Modal');
    await btn.click();
  }

  async clickClose(): Promise<void> {
    await this.closeBtn.click();
  }

  async closeViaIcon(): Promise<void> {
    await this.closeIconBtn.click();
  }
}

export class AddSampleModal {
  readonly modalDialog: Locator;
  readonly modalTitle: Locator;
  readonly closeIconBtn: Locator;
  readonly productDropdown: Locator;
  readonly sampleTypeDropdown: Locator;
  readonly quantityInput: Locator;
  readonly fragranceDropdown: Locator;
  readonly requiredByInput: Locator;
  readonly addressDropdown: Locator;
  readonly closeBtn: Locator;
  readonly submitBtn: Locator;

  constructor(private page: Page) {
    this.modalDialog = page.locator('.p-dialog:has(.p-dialog-title:has-text("Add Sample"))');
    this.modalTitle = page.locator('.p-dialog-title:has-text("Add Sample")');
    this.closeIconBtn = page.locator('.p-dialog:has(.p-dialog-title:has-text("Add Sample")) .p-dialog-header-close');
    this.productDropdown = page.locator('.p-dialog:has(.p-dialog-title:has-text("Add Sample")) div:has(> label[for="requirementProductId"]) .p-dropdown, .p-dialog:has(.p-dialog-title:has-text("Add Sample")) div.p-dropdown:has(#requirementProductId)');
    this.sampleTypeDropdown = page.locator('.p-dialog:has(.p-dialog-title:has-text("Add Sample")) div:has(> label[for="sampleType"]) .p-dropdown, .p-dialog:has(.p-dialog-title:has-text("Add Sample")) div.p-dropdown:has(#sampleType)');
    this.quantityInput = page.locator('.p-dialog:has(.p-dialog-title:has-text("Add Sample")) input[name="quantity"]');
    this.fragranceDropdown = page.locator('.p-dialog:has(.p-dialog-title:has-text("Add Sample")) div:has(> label[for="fragranceId"]) .p-dropdown, .p-dialog:has(.p-dialog-title:has-text("Add Sample")) div.p-dropdown:has(#fragranceId)');
    this.requiredByInput = page.locator('.p-dialog:has(.p-dialog-title:has-text("Add Sample")) input[name="requiredBy"], .p-dialog:has(.p-dialog-title:has-text("Add Sample")) .p-calendar input').first();
    this.addressDropdown = page.locator('.p-dialog:has(.p-dialog-title:has-text("Add Sample")) div:has(> div:has-text("Sample Delivery Address")) .p-dropdown').first();
    this.closeBtn = page.locator('.p-dialog:has(.p-dialog-title:has-text("Add Sample")) button[aria-label="Close"], .p-dialog:has(.p-dialog-title:has-text("Add Sample")) button:has-text("Close")').first();
    this.submitBtn = page.locator('.p-dialog:has(.p-dialog-title:has-text("Add Sample")) button[type="submit"], .p-dialog:has(.p-dialog-title:has-text("Add Sample")) button:has-text("Submit"), .p-dialog:has(.p-dialog-title:has-text("Add Sample")) span.p-button-label:has-text("Submit")').first();
  }

  async waitForOpened(timeout = 5000): Promise<void> {
    await this.modalDialog.waitFor({ state: 'visible', timeout });
  }

  async waitForClosed(timeout = 5000): Promise<void> {
    await this.modalDialog.waitFor({ state: 'hidden', timeout });
  }

  async selectProduct(productName?: string): Promise<string> {
    await this.productDropdown.click();
    const panel = this.page.locator('.p-dropdown-panel:visible');
    await panel.waitFor({ state: 'visible', timeout: 5000 });
    let option: Locator;
    if (productName) {
      option = panel.locator('.p-dropdown-item').filter({ hasText: new RegExp(productName, 'i') }).first();
    } else {
      option = panel.locator('.p-dropdown-item').first();
    }
    await option.waitFor({ state: 'visible', timeout: 5000 });
    const selectedText = (await option.innerText()).trim();
    await option.click();
    await this.page.waitForTimeout(300);
    return selectedText;
  }

  async selectSampleType(sampleType = 'Free'): Promise<string> {
    await this.sampleTypeDropdown.click();
    const panel = this.page.locator('.p-dropdown-panel:visible');
    await panel.waitFor({ state: 'visible', timeout: 5000 });
    let option = panel.locator('.p-dropdown-item').filter({ hasText: new RegExp(`^\\s*${sampleType}`, 'i') }).first();
    if (!await option.isVisible().catch(() => false)) {
      option = panel.locator('.p-dropdown-item').first();
    }
    await option.waitFor({ state: 'visible', timeout: 5000 });
    const selectedText = (await option.innerText()).trim();
    await option.click();
    await this.page.waitForTimeout(300);
    return selectedText;
  }

  async fillQuantity(qty: number): Promise<void> {
    await this.quantityInput.fill(qty.toString());
    await this.quantityInput.blur();
    await this.page.waitForTimeout(200);
  }

  async selectFragrance(fragranceName = 'Lavender'): Promise<string> {
    await this.fragranceDropdown.click();
    const panel = this.page.locator('.p-dropdown-panel:visible');
    await panel.waitFor({ state: 'visible', timeout: 5000 });
    let option = panel.locator('.p-dropdown-item').filter({ hasText: new RegExp(fragranceName, 'i') }).first();
    if (!await option.isVisible().catch(() => false)) {
      option = panel.locator('.p-dropdown-item').first();
    }
    await option.waitFor({ state: 'visible', timeout: 5000 });
    const selectedText = (await option.innerText()).trim();
    await option.click();
    await this.page.waitForTimeout(300);
    return selectedText;
  }

  async setRequiredBy(dateStr: string): Promise<void> {
    await this.requiredByInput.click();
    await this.requiredByInput.clear();
    await this.requiredByInput.pressSequentially(dateStr, { delay: 100 });
    await this.requiredByInput.press('Tab');
    await this.page.waitForTimeout(300);
  }

  async clickSubmit(): Promise<void> {
    console.log(']: Clicking element: Submit Button on Add Sample modal');
    await this.submitBtn.click();
  }

  async clickClose(): Promise<void> {
    await this.closeBtn.click();
  }
}

export class GenerateInvoiceModal {
  readonly modalDialog: Locator;
  readonly modalTitle: Locator;
  readonly closeIconBtn: Locator;

  // BILL TO
  readonly customerNameInput: Locator;
  readonly contactNoInput: Locator;
  readonly billingPincodeInput: Locator;
  readonly billingAddressInput: Locator;
  readonly billingLandmarkInput: Locator;

  // INVOICE DETAILS
  readonly orderDateInput: Locator;
  readonly expectedDispatchInput: Locator;
  readonly placeOfSupplyInput: Locator;

  // SHIPPING ADDRESS
  readonly sameAsBillingCheckbox: Locator;

  // MANUFACTURING ADDRESS
  readonly mfgCountryDropdown: Locator;
  readonly mfgStateDropdown: Locator;
  readonly mfgCityDropdown: Locator;
  readonly mfgPincodeInput: Locator;
  readonly mfgAddressInput: Locator;
  readonly mfgLandmarkInput: Locator;

  // Footer Buttons
  readonly cancelBtn: Locator;
  readonly generateInvoiceBtn: Locator;

  constructor(private page: Page) {
    this.modalDialog = page.locator('.p-dialog:has(.p-dialog-title:has-text("Generate Invoice"))');
    this.modalTitle = page.locator('.p-dialog-title:has-text("Generate Invoice")');
    this.closeIconBtn = page.locator('.p-dialog:has(.p-dialog-title:has-text("Generate Invoice")) .p-dialog-header-close');

    // BILL TO
    const dialog = page.locator('.p-dialog:has(.p-dialog-title:has-text("Generate Invoice"))');
    this.customerNameInput = dialog.locator('input[placeholder*="Customer name"]');
    this.contactNoInput = dialog.locator('input[placeholder*="Contact no"]');
    this.billingPincodeInput = dialog.locator('input[placeholder*="Pincode"]').nth(0);
    this.billingAddressInput = dialog.locator('input[placeholder*="Address"]').nth(0);
    this.billingLandmarkInput = dialog.locator('input[placeholder*="Landmark"]').nth(0);

    // INVOICE DETAILS
    this.orderDateInput = dialog.locator('input[placeholder*="Order date"]');
    this.expectedDispatchInput = dialog.locator('input[placeholder*="Expected dispatch"]');
    this.placeOfSupplyInput = dialog.locator('input[placeholder*="Place of supply"]');

    // SHIPPING ADDRESS
    this.sameAsBillingCheckbox = dialog.locator('#sameAsBilling');

    // MANUFACTURING ADDRESS
    const mfgCard = dialog.locator('div.col-6:has(div:has-text("MANUFACTURING ADDRESS"))');
    this.mfgCountryDropdown = mfgCard.locator('.p-dropdown').nth(0);
    this.mfgStateDropdown = mfgCard.locator('.p-dropdown').nth(1);
    this.mfgCityDropdown = mfgCard.locator('.p-dropdown').nth(2);
    this.mfgPincodeInput = dialog.locator('input[placeholder*="Pincode"]').nth(2);
    this.mfgAddressInput = dialog.locator('input[placeholder*="Address"]').nth(2);
    this.mfgLandmarkInput = dialog.locator('input[placeholder*="Landmark"]').nth(2);

    // Footer Buttons
    this.cancelBtn = dialog.locator('button[aria-label="Cancel"]');
    this.generateInvoiceBtn = dialog.locator('button[aria-label="Generate Invoice"], button:has-text("Generate Invoice")');
  }

  async waitForOpened(timeout = 5000): Promise<void> {
    await this.modalDialog.waitFor({ state: 'visible', timeout });
  }

  async waitForClosed(timeout = 10000): Promise<void> {
    await this.modalDialog.waitFor({ state: 'hidden', timeout });
  }

  async fillRequiredFields(options?: {
    billingPincode?: string;
    billingLandmark?: string;
    expectedDispatchDate?: string;
    mfgPincode?: string;
    mfgAddress?: string;
    mfgLandmark?: string;
  }): Promise<void> {
    const dialog = this.modalDialog;

    // 1. Fill Bill To required empty fields
    console.log(']: Filling Bill To Pincode (222001) & Landmark (Near Civil Lines)...');
    await this.billingPincodeInput.click();
    await this.billingPincodeInput.fill('');
    await this.billingPincodeInput.pressSequentially(options?.billingPincode || '222001', { delay: 50 });
    await this.billingPincodeInput.press('Tab');

    await this.billingLandmarkInput.click();
    await this.billingLandmarkInput.fill('');
    await this.billingLandmarkInput.pressSequentially(options?.billingLandmark || 'Near Civil Lines', { delay: 50 });
    await this.billingLandmarkInput.press('Tab');

    // 2. Check Shipping Pincode and Landmark
    const shippingPincode = dialog.locator('input[placeholder*="Pincode"]').nth(1);
    const shippingLandmark = dialog.locator('input[placeholder*="Landmark"]').nth(1);
    const sameAsBillingLabel = dialog.locator('label[for="sameAsBilling"]');
    
    // Toggle sameAsBilling off and on to force sync from newly typed Bill To values
    if (await sameAsBillingLabel.isVisible().catch(() => false)) {
      await sameAsBillingLabel.click();
      await this.page.waitForTimeout(200);
      await sameAsBillingLabel.click();
      await this.page.waitForTimeout(200);
    }
    
    // If shipping inputs are enabled, fill directly
    if (await shippingPincode.isEnabled().catch(() => false)) {
      await shippingPincode.fill(options?.billingPincode || '222001');
      await shippingLandmark.fill(options?.billingLandmark || 'Near Civil Lines');
    }

    // 2. Select Expected Dispatch Date from Datepicker Overlay
    console.log(']: Opening Expected Dispatch Datepicker and selecting date...');
    await this.expectedDispatchInput.click();
    const datepicker = this.page.locator('.p-datepicker:visible');
    await datepicker.waitFor({ state: 'visible', timeout: 5000 });
    
    // Select date 30 if enabled, otherwise select any enabled future day
    const day30 = datepicker.locator('.p-datepicker-calendar td:not(.p-datepicker-other-month) span:not(.p-disabled)').filter({ hasText: /^30$/ }).first();
    if (await day30.isVisible().catch(() => false)) {
      await day30.click();
    } else {
      const enabledDays = datepicker.locator('.p-datepicker-calendar td:not(.p-datepicker-other-month) span:not(.p-disabled)');
      await enabledDays.last().click();
    }
    await this.page.waitForTimeout(300);

    // 3. Fill Manufacturing Address if Country dropdown is unselected
    const mfgCountryText = await this.mfgCountryDropdown.innerText().catch(() => '');
    if (mfgCountryText.includes('Country')) {
      console.log(']: Selecting Manufacturing Country (India), State (Uttar Pradesh), City (Noida)...');
      await this.mfgCountryDropdown.click();
      const countryPanel = this.page.locator('.p-dropdown-panel:visible');
      await countryPanel.waitFor({ state: 'visible', timeout: 5000 });
      await countryPanel.locator('.p-dropdown-item').filter({ hasText: /^India$/i }).first().click();
      await this.page.waitForTimeout(300);

      // State
      await this.mfgStateDropdown.click();
      const statePanel = this.page.locator('.p-dropdown-panel:visible');
      await statePanel.waitFor({ state: 'visible', timeout: 5000 });
      await statePanel.locator('.p-dropdown-item').filter({ hasText: /Uttar Pradesh/i }).first().click();
      await this.page.waitForTimeout(300);

      // City
      await this.mfgCityDropdown.click();
      const cityPanel = this.page.locator('.p-dropdown-panel:visible');
      await cityPanel.waitFor({ state: 'visible', timeout: 5000 });
      await cityPanel.locator('.p-dropdown-item').first().click();
      await this.page.waitForTimeout(300);
    }

    console.log(']: Filling Manufacturing Pincode (201301), Address & Landmark...');
    await this.mfgPincodeInput.click();
    await this.mfgPincodeInput.fill(options?.mfgPincode || '201301');
    await this.mfgPincodeInput.blur();

    await this.mfgAddressInput.click();
    await this.mfgAddressInput.fill(options?.mfgAddress || 'A-5, Basement, Sector 69, Noida');
    await this.mfgAddressInput.blur();

    await this.mfgLandmarkInput.click();
    await this.mfgLandmarkInput.fill(options?.mfgLandmark || 'Sector 69');
    await this.mfgLandmarkInput.blur();
  }

  async clickGenerateInvoice(): Promise<void> {
    console.log(']: Clicking element: Generate Invoice Button');
    await this.generateInvoiceBtn.click();
  }
}

export class LeadDetailsPage extends BasePage {
  // Top Back Button
  readonly backToLeadsBtn: Locator;

  // Hero Section
  readonly breadcrumb: Locator;
  readonly leadCodeText: Locator;
  readonly leadActiveBadge: Locator;
  readonly contactNameHeader: Locator;
  readonly assignedToText: Locator;
  readonly createdOnText: Locator;
  readonly leadSourceText: Locator;

  // Pill Badges
  readonly stagePill: Locator;
  readonly businessTypePill: Locator;
  readonly customerTypePill: Locator;

  // Contact Info Grid
  readonly contactPersonText: Locator;
  readonly phoneText: Locator;
  readonly whatsappIcon: Locator;
  readonly emailText: Locator;
  readonly locationText: Locator;

  // Update Stage Section
  readonly currentStageDropdown: Locator;
  readonly businessTypeDropdown: Locator;
  readonly customerTypeDropdown: Locator;
  readonly sampleRequiredSwitch: Locator;
  readonly stageDescriptionTextarea: Locator;
  readonly saveChangesBtn: Locator;

  // Segmented Pill Tabs
  readonly tabMenu: Locator;
  readonly overviewTab: Locator;
  readonly requirementsTab: Locator;
  readonly productsTab: Locator;
  readonly customizationTab: Locator;
  readonly samplesTab: Locator;
  readonly addressTab: Locator;
  readonly invoiceTab: Locator;

  // Overview Summary Cards
  readonly requirementSummaryCard: Locator;
  readonly productSummaryCard: Locator;
  readonly customizationSummaryCard: Locator;
  readonly sampleSummaryCard: Locator;

  // Requirements Tab Table & Actions
  readonly requirementsTable: Locator;
  readonly requirementsRows: Locator;
  readonly addRequirementBtn: Locator;
  readonly requirementModal: AddRequirementModal;
  readonly requirementProductsModal: RequirementProductsModal;

  // Products Tab Actions & Table
  readonly productsTabRequirementDropdown: Locator;
  readonly addProductBtn: Locator;
  readonly productLinesTable: Locator;
  readonly productLinesRows: Locator;
  readonly addProductLineModal: AddProductLineModal;

  // Customization Tab Actions
  readonly customizationTabRequirementDropdown: Locator;
  readonly addCustomizationBtn: Locator;
  readonly customizationTable: Locator;
  readonly customizationRows: Locator;
  readonly customizationEmptyState: Locator;
  readonly addCustomizationModal: AddCustomizationModal;

  // Samples Tab Actions
  readonly samplesTabRequirementDropdown: Locator;
  readonly addSampleBtn: Locator;
  readonly samplesTable: Locator;
  readonly samplesRows: Locator;
  readonly addSampleModal: AddSampleModal;

  // Address Tab Actions
  readonly addressTabRequirementDropdown: Locator;
  readonly addressTabContent: Locator;
  readonly sampleDeliveryAddressSection: Locator;
  readonly mainProductDeliveryAddressSection: Locator;
  readonly useThisAddressBtn: Locator;
  readonly inUseAddressBadge: Locator;

  // Invoice Tab Actions
  readonly invoiceTabRequirementDropdown: Locator;
  readonly addInvoiceBtn: Locator;
  readonly invoicesTable: Locator;
  readonly invoicesRows: Locator;
  readonly invoiceEmptyState: Locator;
  readonly generateInvoiceModal: GenerateInvoiceModal;

  // Toast Notification
  readonly toastMessage: Locator;

  constructor(page: Page) {
    super(page);

    // Back button
    this.backToLeadsBtn = page.locator('button.ld-back, button:has-text("Back to leads")');

    // Hero Section
    this.breadcrumb = page.locator('nav.p-breadcrumb');
    this.leadCodeText = page.locator('.ld-hero span:has-text("LEAD-")').first();
    this.leadActiveBadge = page.locator('.ld-hero span:has-text("Active"), .ld-hero span.p-badge, .ld-hero [class*="badge"], .ld-hero span:has-text("Lead")').first();
    this.contactNameHeader = page.locator('.ld-hero span[style*="rgba(255, 255, 255, 0.6)"]');
    this.assignedToText = page.locator('.ld-hero-meta div:has-text("Assigned to") span[style*="font-weight: 600"]');
    this.createdOnText = page.locator('.ld-hero-meta div:has-text("Created on") span[style*="font-weight: 600"]');
    this.leadSourceText = page.locator('.ld-hero-meta div:has-text("Lead source") span[style*="font-weight: 600"]');

    // Pill Badges
    this.stagePill = page.locator('span:has-text("Stage ·")');
    this.businessTypePill = page.locator('span:has-text("B2B"), span:has-text("B2C")');
    this.customerTypePill = page.locator('span:has-text("Corporate"), span:has-text("Hotel"), span:has-text("Wholesaler")');

    // Contact Info Grid
    this.contactPersonText = page.locator('.ld-contact-grid div:has-text("Contact person") span').nth(1);
    this.phoneText = page.locator('.ld-contact-grid div:has-text("Phone") span').nth(1);
    this.whatsappIcon = page.locator('.ld-contact-grid i.pi-whatsapp');
    this.emailText = page.locator('.ld-contact-grid div:has-text("Email") span').nth(1);
    this.locationText = page.locator('.ld-contact-grid div:has-text("Location") span').nth(1);

    // Update Stage Section
    this.currentStageDropdown = page.locator('.ld-stage-row .p-dropdown').nth(0);
    this.businessTypeDropdown = page.locator('.ld-stage-row .p-dropdown').nth(1);
    this.customerTypeDropdown = page.locator('.ld-stage-row .p-dropdown').nth(2);
    this.sampleRequiredSwitch = page.locator('.ld-stage-row .p-inputswitch');
    this.stageDescriptionTextarea = page.locator('textarea.p-inputtextarea');
    this.saveChangesBtn = page.locator('button.ld-save, button:has-text("Save changes")');

    // Segmented Pill Tabs
    this.tabMenu = page.locator('.ld-root .p-tabmenu');
    this.overviewTab = page.locator('.p-tabmenuitem:has-text("Overview")');
    this.requirementsTab = page.locator('.p-tabmenuitem:has-text("Requirements")');
    this.productsTab = page.locator('.p-tabmenuitem:has-text("Products")');
    this.customizationTab = page.locator('.p-tabmenuitem:has-text("Customization")');
    this.samplesTab = page.locator('.p-tabmenuitem:has-text("Sample")');
    this.addressTab = page.locator('.p-tabmenuitem:has-text("Address")');
    this.invoiceTab = page.locator('.p-tabmenuitem:has-text("Invoice")');

    // Overview Cards
    this.requirementSummaryCard = page.locator('div:has-text("Requirement Summary")').first();
    this.productSummaryCard = page.locator('div:has-text("Product Summary")').first();
    this.customizationSummaryCard = page.locator('div:has-text("Customization Summary")').first();
    this.sampleSummaryCard = page.locator('div:has-text("Sample Summary")').first();

    // Requirements Tab Table & Actions
    this.requirementsTable = page.locator('table.p-datatable-table');
    this.requirementsRows = page.locator('tbody.p-datatable-tbody tr');
    this.addRequirementBtn = page.locator('button[aria-label="Add Requirement"], button:has-text("Add Requirement")');
    this.requirementModal = new AddRequirementModal(page);
    this.requirementProductsModal = new RequirementProductsModal(page);

    // Products Tab
    this.productsTabRequirementDropdown = page.locator('.ld-root div.p-dropdown, div:has-text("Products") .p-dropdown').first();
    this.addProductBtn = page.locator('button[aria-label="Add Product"], button:has-text("Add Product")');
    this.productLinesTable = page.locator('table.p-datatable-table').first();
    this.productLinesRows = page.locator('tbody.p-datatable-tbody tr');
    this.addProductLineModal = new AddProductLineModal(page);

    // Customization Tab
    this.customizationTabRequirementDropdown = page.locator('.ld-root div.p-dropdown, div:has-text("Customization") .p-dropdown').first();
    this.addCustomizationBtn = page.locator('button[aria-label="Add Customization"], button:has-text("Add Customization"), button[aria-label="Edit Customization"], button:has-text("Edit Customization")');
    this.customizationTable = page.locator('table.p-datatable-table').first();
    this.customizationRows = page.locator('table.p-datatable-table tbody tr:not(.p-datatable-emptymessage)');
    this.customizationEmptyState = page.locator('div:text-is("No customization set for this requirement yet.")').first();
    this.addCustomizationModal = new AddCustomizationModal(page);

    // Samples Tab
    this.samplesTabRequirementDropdown = page.locator('div:has(> .flex span:has-text("Samples")) .p-dropdown, div:has(> span:has-text("Samples")) ~ div .p-dropdown, .ld-root div.p-dropdown').first();
    this.addSampleBtn = page.locator('button[aria-label="Add Sample"], button:has-text("Add Sample")');
    this.samplesTable = page.locator('table.p-datatable-table').first();
    this.samplesRows = page.locator('table.p-datatable-table tbody tr:not(.p-datatable-emptymessage)');
    this.addSampleModal = new AddSampleModal(page);

    // Address Tab
    this.addressTabRequirementDropdown = page.locator('div:has(> .flex span:has-text("Requirement")) .p-dropdown, div:has(> span:has-text("Requirement")) .p-dropdown, .ld-root div.p-dropdown').first();
    this.addressTabContent = page.locator('.ld-root div:has(.p-tabmenu) ~ div, div:has-text("Address")').first();
    this.sampleDeliveryAddressSection = page.locator('div:has(> .flex > span:has-text("Sample Delivery Address")), div:has-text("Sample Delivery Address")').first();
    this.mainProductDeliveryAddressSection = page.locator('div:has(> .flex > span:has-text("Main Product Delivery Address")), div:has-text("Main Product Delivery Address")').first();
    this.useThisAddressBtn = page.locator('button[aria-label="Use this Address"], button:has-text("Use this Address")');
    this.inUseAddressBadge = page.locator('span:has-text("In use"), span:has(i.pi-check-circle)');

    // Invoice Tab
    this.invoiceTabRequirementDropdown = page.locator('div:has(> .flex span:has-text("Invoices")) .p-dropdown, .ld-root div.p-dropdown, div:has(> label:has-text("Requirement")) .p-dropdown').first();
    this.addInvoiceBtn = page.locator('button[aria-label="Add Invoice"], button:has-text("Add Invoice")');
    this.invoicesTable = page.locator('table.p-datatable-table').first();
    this.invoicesRows = page.locator('table.p-datatable-table tbody tr:not(.p-datatable-emptymessage)');
    this.invoiceEmptyState = page.locator('div:has-text("No results found"), td:has-text("No results found")');
    this.generateInvoiceModal = new GenerateInvoiceModal(page);

    // Toast
    this.toastMessage = page.locator('.p-toast-message, .p-toast-detail');
  }

  /**
   * Click Back button to return to leads
   */
  async clickBackToLeads(): Promise<void> {
    await this.click(this.backToLeadsBtn, 'Back to leads button');
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Select a tab from the segmented pill bar
   */
  async selectTab(tabName: 'Overview' | 'Requirements' | 'Products' | 'Customization' | 'Samples' | 'Sample' | 'Address' | 'Invoice'): Promise<void> {
    const tabLocator = this.page.locator('.p-tabmenuitem').filter({ hasText: new RegExp(tabName, 'i') }).locator('a').first();
    await this.click(tabLocator, `${tabName} Tab`);
    await this.page.waitForTimeout(500);
  }

  /**
   * Open the Add Requirement modal
   */
  async openAddRequirementModal(): Promise<void> {
    await this.click(this.addRequirementBtn, 'Add Requirement Button');
    await this.requirementModal.waitForOpened();
  }

  /**
   * Update Stage and save
   */
  async updateStage(options: {
    stage?: string;
    businessType?: string;
    customerType?: string;
    sampleRequired?: boolean;
    description?: string;
  }): Promise<void> {
    if (options.description) {
      await this.stageDescriptionTextarea.fill(options.description);
    }
    await this.saveChangesBtn.click();
    await this.page.waitForTimeout(1000);
  }

  /**
   * Read Lead Code (e.g. "LEAD-444")
   */
  async getLeadCode(): Promise<string> {
    return (await this.leadCodeText.textContent()) || '';
  }

  /**
   * Get parsed requirement row data from Requirements table
   */
  async getRequirementRowData(index = 0) {
    const row = this.requirementsRows.nth(index);
    await row.waitFor({ state: 'visible', timeout: 5000 });
    const cells = row.locator('td');

    return {
      sn: (await cells.nth(0).innerText()).trim(),
      requirementId: (await cells.nth(1).innerText()).trim(),
      requirementType: (await cells.nth(2).innerText()).trim(),
      purpose: (await cells.nth(3).innerText()).trim(),
      quantity: (await cells.nth(4).innerText()).trim(),
      productsCount: (await cells.nth(5).innerText()).trim(),
      deliveryDate: (await cells.nth(6).innerText()).trim(),
      targetPrice: (await cells.nth(7).innerText()).trim(),
      status: (await cells.nth(8).innerText()).trim(),
      editBtn: cells.nth(9).locator('button:has(.pi-pencil), .pi-pencil'),
      deleteBtn: cells.nth(9).locator('button:has(.pi-trash), .pi-trash')
    };
  }

  /**
   * Click on the products badge button in requirement row (e.g. [ 📦 1 ])
   */
  async clickRequirementProductsBadge(index = 0): Promise<void> {
    const badge = this.requirementsRows.nth(index).locator('td').nth(5).locator('button, div, span').first();
    await this.click(badge, `Requirement Products Badge in row ${index + 1}`);
  }

  /**
   * Click Edit pencil button on a requirement row to open Edit Requirement modal
   */
  async clickEditRequirement(index = 0): Promise<void> {
    const editBtn = this.requirementsRows.nth(index).locator('td').nth(9).locator('button:has(.pi-pencil), .pi-pencil, svg').first();
    await this.click(editBtn, `Edit Requirement Button in row ${index + 1}`);
    await this.requirementModal.waitForOpened();
  }

  /**
   * Open the Add Product Line modal from Products tab
   */
  async openAddProductLineModal(): Promise<void> {
    await this.click(this.addProductBtn, 'Add Product Button');
    await this.addProductLineModal.waitForOpened();
  }

  /**
   * Get row data from Products tab table
   */
  async getProductLineRowData(index = 0) {
    const row = this.productLinesRows.nth(index);
    await row.waitFor({ state: 'visible', timeout: 5000 });
    const cells = row.locator('td');
    return {
      sn: (await cells.nth(0).innerText()).trim(),
      product: (await cells.nth(1).innerText()).trim(),
      sku: (await cells.nth(2).innerText()).trim(),
      qty: (await cells.nth(3).innerText()).trim(),
      targetPrice: (await cells.nth(4).innerText()).trim(),
      lineValue: (await cells.nth(5).innerText()).trim(),
      editBtn: cells.nth(6).locator('button:has(.pi-pencil), .pi-pencil'),
      deleteBtn: cells.nth(6).locator('button:has(.pi-trash), .pi-trash')
    };
  }

  /**
   * Open the Add Customization modal from Customization tab
   */
  async openAddCustomizationModal(): Promise<void> {
    await this.click(this.addCustomizationBtn, 'Add Customization Button');
    await this.addCustomizationModal.waitForOpened();
  }

  /**
   * Open the Add Sample modal from Samples tab
   */
  async openAddSampleModal(): Promise<void> {
    await this.click(this.addSampleBtn, 'Add Sample Button');
    await this.addSampleModal.waitForOpened();
  }

  /**
   * Open the Generate Invoice modal from Invoice tab
   */
  async openAddInvoiceModal(): Promise<void> {
    await this.click(this.addInvoiceBtn, 'Add Invoice Button');
    await this.generateInvoiceModal.waitForOpened();
  }

  /**
   * Get the currently selected requirement text in Customization tab
   */
  async getCustomizationRequirementSelected(): Promise<string> {
    const label = this.customizationTabRequirementDropdown.locator('.p-dropdown-label');
    return (await label.innerText()).trim();
  }

  /**
   * Select requirement by text in Customization tab dropdown
   */
  async selectCustomizationRequirement(requirementText: string): Promise<void> {
    await this.customizationTabRequirementDropdown.click();
    const panel = this.page.locator('.p-dropdown-panel:visible');
    await panel.waitFor({ state: 'visible', timeout: 5000 });
    const option = panel.locator('.p-dropdown-item').filter({ hasText: new RegExp(requirementText, 'i') }).first();
    await option.waitFor({ state: 'visible', timeout: 5000 });
    await option.click();
    await this.page.waitForTimeout(300);
  }

  /**
   * Get all requirement options available in Customization tab dropdown
   */
  async getCustomizationRequirementOptions(): Promise<string[]> {
    await this.customizationTabRequirementDropdown.click();
    const panel = this.page.locator('.p-dropdown-panel:visible');
    await panel.waitFor({ state: 'visible', timeout: 5000 });
    const items = panel.locator('.p-dropdown-item');
    const count = await items.count();
    const options: string[] = [];
    for (let i = 0; i < count; i++) {
      options.push((await items.nth(i).innerText()).trim());
    }
    await this.page.keyboard.press('Escape');
    return options;
  }
}
