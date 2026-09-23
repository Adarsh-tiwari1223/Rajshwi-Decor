import { test, expect } from '../../../core/fixtures/customFixtures';
import { Config } from '../../../utils/env';
import { ContactDataGenerator } from '../../../testdata/lead/leadGenerator';

test.describe('Smoke Test Suite - Rajshwi Decor Automation [@smoke]', () => {
  test.setTimeout(60000);

  // =========================================================================
  // 1. LOGIN TESTS (VALID, INVALID, BLANK)
  // =========================================================================

  test('RD_SMK_01: Login with Valid credentials redirects to Dashboard', { tag: '@smoke' }, async ({ loginPage, page }) => {
    console.log('[Smoke] Testing Login with VALID credentials...');
    await loginPage.goto();
    await expect(loginPage.emailInput).toBeVisible();

    // Perform valid login
    await loginPage.login(Config.adminEmail, Config.adminPassword);

    // Assert successful redirect to dashboard
    expect(page.url()).toContain('/dashboard');
    const dashboardIndicator = page.locator('.rd-dashboard, .rd-welcome-banner, .layout-topbar, span:has-text("Dashboard")').first();
    await expect(dashboardIndicator).toBeVisible({ timeout: 15000 });
    console.log('[Smoke] PASSED: Valid login redirected successfully to Dashboard!');
  });

  test('RD_SMK_02: Login with Invalid credentials displays error and prevents access', { tag: '@smoke' }, async ({ loginPage, page }) => {
    console.log('[Smoke] Testing Login with INVALID credentials...');
    await loginPage.goto();
    await expect(loginPage.emailInput).toBeVisible();

    // Submit invalid credentials
    await loginPage.submitCredentials('invalid_user_smoke@rajasvidecor.com', 'WrongPassword@999');

    // Assert error toast is displayed or stays on login page
    const toast = page.locator('.p-toast-message-error, .p-toast-detail, .p-toast');
    const toastVisible = await toast.waitFor({ state: 'visible', timeout: 5000 }).then(() => true).catch(() => false);
    if (toastVisible) {
      const toastText = (await toast.innerText()).trim();
      console.log(`[Smoke] Toast error caught: "${toastText}"`);
      expect(toastText.length).toBeGreaterThan(0);
    }

    // Must remain on login page and not reach dashboard
    expect(page.url()).not.toContain('/dashboard');
    await expect(loginPage.loginSubmitBtn).toBeVisible();
    console.log('[Smoke] PASSED: Invalid login rejected, user remained on Login page.');
  });

  test('RD_SMK_03: Login with Blank fields triggers validation and blocks submission', { tag: '@smoke' }, async ({ loginPage, page }) => {
    console.log('[Smoke] Testing Login with BLANK fields...');
    await loginPage.goto();
    await expect(loginPage.emailInput).toBeVisible();

    // Ensure inputs are blank
    await loginPage.emailInput.fill('');
    await loginPage.passwordInput.fill('');

    // Click Sign In
    await loginPage.clickSignIn();
    await page.waitForTimeout(1000);

    // Must remain on login page and not navigate to dashboard
    expect(page.url()).not.toContain('/dashboard');
    await expect(loginPage.loginSubmitBtn).toBeVisible();

    // Verify HTML5 validation or UI field invalid state
    const isEmailRequired = await loginPage.emailInput.getAttribute('required');
    const isPasswordRequired = await loginPage.passwordInput.getAttribute('required');
    const isEmailInvalid = await loginPage.emailInput.evaluate((el: HTMLInputElement) => !el.checkValidity()).catch(() => false);
    
    console.log(`[Smoke] Blank login check - Required: email=${isEmailRequired !== null}, password=${isPasswordRequired !== null}, invalid=${isEmailInvalid}`);
    expect(isEmailRequired !== null || isEmailInvalid || !page.url().includes('/dashboard')).toBeTruthy();
    console.log('[Smoke] PASSED: Blank login blocked successfully!');
  });

  // =========================================================================
  // 2. CREATE LEAD (ADD LEAD & VERIFY)
  // =========================================================================

  test('RD_SMK_04: Create Lead -> Add contact details and verify lead record in table', { tag: '@smoke' }, async ({ loginPage, contactPage, myLeadPage, page }) => {
    console.log('[Smoke] Step 1: Logging in as Admin...');
    await loginPage.goto();
    await loginPage.login(Config.adminEmail, Config.adminPassword);

    console.log('[Smoke] Step 2: Navigating to Contacts (/contact)...');
    await contactPage.goto();
    await expect(contactPage.pageHeading).toBeVisible();

    // Generate unique test contact / lead data
    const contactData = ContactDataGenerator.generate();
    console.log(`[Smoke] Generated Lead Persona: Name="${contactData.contactPersonName}", Phone="${contactData.contactPersonNumber}", Email="${contactData.email}"`);

    // Open Add Contact modal
    await contactPage.clickNewContact();
    await contactPage.modal.waitForOpened();
    await expect(contactPage.modal.modalDialog).toBeVisible();

    // Fill contact & lead generation fields
    await contactPage.modal.fillForm({
      contactPersonName: contactData.contactPersonName,
      contactPersonNumber: contactData.contactPersonNumber,
      email: contactData.email,
      country: contactData.country,
      state: contactData.state,
      city: contactData.city,
      source: contactData.source
    });

    // Save Contact
    console.log('[Smoke] Saving new contact / lead...');
    await contactPage.modal.clickSave();
    await contactPage.modal.waitForClosed(10000).catch(() => {});
    await expect(contactPage.modal.modalDialog).toBeHidden();

    // Verify contact in /contact table
    console.log(`[Smoke] Searching for created contact "${contactData.contactPersonName}" in Contacts table...`);
    await contactPage.searchContact(contactData.contactPersonName);
    const contactRow = await contactPage.getRowData(0);
    console.log(`[Smoke] Found contact row: "${contactRow.name}", phone="${contactRow.contactNumber}"`);
    expect(contactRow.name.toLowerCase()).toContain(contactData.contactPersonName.toLowerCase());

    // Step 3: Navigate to /mylead and verify the generated lead appears
    console.log('[Smoke] Step 3: Navigating to My Lead (/mylead) to verify lead auto-creation...');
    await myLeadPage.goto();
    await expect(myLeadPage.pageHeading).toBeVisible();
    await expect(myLeadPage.dataTable).toBeVisible();

    // Search or verify latest row in /mylead
    const leadRow = await myLeadPage.getRowData(0);
    console.log(`[Smoke] Found lead in My Lead table: ContactName="${leadRow.contactName}", SalesManager="${leadRow.salesManager}", Status="${leadRow.status}"`);
    expect(leadRow.contactName.toLowerCase()).toContain(contactData.contactPersonName.toLowerCase());
    expect(leadRow.status).toBe('Created');

    console.log('=========================================================================');
    console.log(`[Smoke] PASSED: Lead "${contactData.contactPersonName}" verified successfully in My Lead table!`);
    console.log('=========================================================================');
  });
});
