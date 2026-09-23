import { chromium } from '@playwright/test';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const baseUrl = process.env.BASE_URL || 'https://crm-stg.rajasvidecor.com';
  await page.goto(baseUrl + '/login');
  await page.fill('input[type="email"], input[name="email"]', process.env.ADMIN_EMAIL || 'admin@rajasvidecor.com');
  await page.fill('input[type="password"], input[name="password"]', process.env.ADMIN_PASSWORD || 'Admin@123');
  await page.click('button:has-text("Sign In"), button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 25000 });

  await page.goto(baseUrl + '/product');
  await page.waitForTimeout(2000);

  // Click "New" -> "Continue"
  await page.click('button[aria-label="New"], button:has-text("New")');
  await page.waitForTimeout(1000);
  await page.click('button[aria-label="Continue"], button:has-text("Continue")');
  await page.waitForTimeout(1500);

  // Step 1: Fill Basic Information
  await page.fill('input[name="product_Name"]', 'Automated Test Candle');
  await page.fill('input[name="sku"]', 'ATC-AUTO-' + Date.now().toString().slice(-4));

  const selectFirstDropdown = async (nameOrSelector: string) => {
    const dd = page.locator(nameOrSelector);
    if (await dd.isVisible()) {
      await dd.click();
      await page.waitForTimeout(400);
      const opt = page.locator('.p-dropdown-panel:visible .p-dropdown-item').first();
      if (await opt.isVisible()) {
        await opt.click();
        await page.waitForTimeout(300);
      }
    }
  };

  await selectFirstDropdown('div.p-dropdown:has(select[name="category_Id"])');
  await selectFirstDropdown('div.p-dropdown:has(select[name="product_Type_Id"])');

  console.log('Transitioning to Step 2...');
  await page.click('button[aria-label="NEXT"], button:has-text("NEXT")');
  await page.waitForTimeout(1500);

  // Step 2: Fill Candle Details mandatory fields
  await selectFirstDropdown('div.p-dropdown:has(select[name="wax_Type_Id"])');
  await selectFirstDropdown('div.p-dropdown:has(select[name="wick_Type_Id"])');
  await selectFirstDropdown('div.p-dropdown:has(select[name="wick_Size_Id"])');
  await selectFirstDropdown('div.p-dropdown:has(select[name="packing_Type_Id"])');

  console.log('Transitioning to Step 3 (Dimensions & Weight)...');
  await page.click('button[aria-label="NEXT"], button:has-text("NEXT")');
  await page.waitForTimeout(1500);

  let activeTab = await page.locator('.p-tabmenuitem.p-highlight .p-menuitem-text').innerText();
  console.log('Active tab:', activeTab);

  const step3Labels = await page.locator('.product-stepper-content label, form label').allInnerTexts();
  console.log('=== STEP 3 (Dimensions & Weight) LABELS ===');
  console.log(step3Labels.map(l => l.replace(/\n/g, ' ').trim()).filter(Boolean));

  const step3Inputs = await page.locator('.product-stepper-content input, .product-stepper-content select, .product-stepper-content textarea').evaluateAll(els =>
    els.map(el => ({
      tag: el.tagName.toLowerCase(),
      name: el.getAttribute('name') || el.getAttribute('id') || '',
      type: el.getAttribute('type') || '',
      placeholder: el.getAttribute('placeholder') || ''
    }))
  );
  console.log('=== STEP 3 INPUTS ===', step3Inputs);

  // Fill Step 3 inputs if any
  for (const input of step3Inputs) {
    if (input.tag === 'input' && input.type !== 'file' && input.name) {
      await page.fill(`input[name="${input.name}"]`, '10').catch(() => {});
    }
  }

  console.log('Transitioning to Step 4 (Pricing)...');
  await page.click('button[aria-label="NEXT"], button:has-text("NEXT")');
  await page.waitForTimeout(1500);

  activeTab = await page.locator('.p-tabmenuitem.p-highlight .p-menuitem-text').innerText();
  console.log('Active tab:', activeTab);

  const step4Labels = await page.locator('.product-stepper-content label, form label, .product-stepper-content h3, .product-stepper-content h4, .product-stepper-content h5').allInnerTexts();
  console.log('=== STEP 4 (Pricing) LABELS & HEADINGS ===');
  console.log(step4Labels.map(l => l.replace(/\n/g, ' ').trim()).filter(Boolean));

  const step4Buttons = await page.locator('.product-stepper-content button').allInnerTexts();
  console.log('=== STEP 4 BUTTONS ===');
  console.log(step4Buttons.map(b => b.replace(/\n/g, ' ').trim()).filter(Boolean));

  await browser.close();
})();
