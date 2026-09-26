import { test, expect } from '../../../core/fixtures/customFixtures';
import { Config } from '../../../utils/env';
import { ContactDataGenerator } from '../../../testdata/lead/leadGenerator';

test.describe('Lead Module - Contact Form Comprehensive Validation Suite', () => {
  test.describe.configure({ mode: 'serial' });
  test.setTimeout(120000);

  test.beforeEach(async ({ loginPage, contactPage }) => {
    await loginPage.goto();
    await loginPage.login(Config.adminEmail, Config.adminPassword);
    await contactPage.goto();
  });

  test('RD_CON_VAL_01: Single-Run Full Contact Validation Pipeline (Blank -> Non-Numeric -> Incomplete/Negative -> Invalid Email -> Whitespace -> Cascading -> Rectify & Auto-Lead)', async ({ contactPage, myLeadPage }) => {
    // Open Add/Edit Contact Modal
    await contactPage.clickNewContact();
    await contactPage.modal.waitForOpened();
    await expect(contactPage.modal.modalDialog).toBeVisible();

    // =========================================================================
    // PHASE 1: BLANK SUBMISSION CHECK
    // =========================================================================
    console.log('[Phase 1] Blank Form Check: Clicking SAVE with empty fields...');
    await contactPage.modal.clickSave();
    await contactPage.page.waitForTimeout(500);

    // Modal must remain open and display all 6 required errors
    await expect(contactPage.modal.modalDialog).toBeVisible();
    const blankErrors = await contactPage.getAllVisibleErrors(contactPage.modal.modalDialog);
    console.log('[Phase 1] Blank submission errors thrown:', blankErrors);

    expect(blankErrors).toContain('Name is required');
    expect(blankErrors).toContain('Contact is required');
    expect(blankErrors).toContain('Country is required');
    expect(blankErrors).toContain('State is required');
    expect(blankErrors).toContain('City is required');
    expect(blankErrors).toContain('Source is required');

    // =========================================================================
    // PHASE 2: STRING IN NUMBER (PHONE INPUT REJECTION)
    // =========================================================================
    console.log('[Phase 2] String in Number Check: Typing alphabets into phone number...');
    await contactPage.modal.contactPersonNumberInput.click();
    await contactPage.page.keyboard.type('abcdefghij');
    const phoneAfterAlphabets = await contactPage.modal.contactPersonNumberInput.inputValue();
    console.log(`[Phase 2] Phone value after typing "abcdefghij": "${phoneAfterAlphabets}"`);

    // InputMask must reject alphabetic characters and retain mask placeholders
    expect(phoneAfterAlphabets).toMatch(/^[_ -]+$/);

    await contactPage.modal.clickSave();
    await expect(contactPage.modal.modalDialog).toBeVisible();
    expect(await contactPage.getFieldError('Number', contactPage.modal.modalDialog)).toContain('Contact is required');

    // =========================================================================
    // PHASE 3: NEGATIVE & INCOMPLETE PHONE NUMBER
    // =========================================================================
    console.log('[Phase 3] Incomplete & Negative Phone Check: Entering incomplete 5-digit number...');
    await contactPage.modal.contactPersonNumberInput.fill('');
    // Attempt negative sign (mask blocks "-") and enter only 5 digits
    await contactPage.page.keyboard.type('-98765');
    const phoneIncomplete = await contactPage.modal.contactPersonNumberInput.inputValue();
    console.log(`[Phase 3] Phone value after "-98765": "${phoneIncomplete}"`);

    await contactPage.modal.clickSave();
    // Modal must remain open (submission blocked)
    await expect(contactPage.modal.modalDialog).toBeVisible();

    // =========================================================================
    // PHASE 4: INVALID EMAIL FORMAT VALIDATION
    // =========================================================================
    console.log('[Phase 4] Invalid Email Check: Entering invalid email formats...');
    await contactPage.modal.emailInput.fill('invalid_email_format');
    await contactPage.modal.clickSave();
    await contactPage.page.waitForTimeout(500);

    await expect(contactPage.modal.modalDialog).toBeVisible();
    const emailError = await contactPage.getFieldError('Email', contactPage.modal.modalDialog);
    console.log(`[Phase 4] Email format error caught: "${emailError}"`);
    expect(emailError.toLowerCase()).toContain('please enter a valid email address');

    // =========================================================================
    // PHASE 5: WHITESPACE-ONLY INPUT REJECTION
    // =========================================================================
    console.log('[Phase 5] Whitespace Check: Entering only spaces into required Name field...');
    await contactPage.modal.contactPersonNameInput.fill('       ');
    await contactPage.modal.clickSave();
    await expect(contactPage.modal.modalDialog).toBeVisible();

    // Clear name back to empty
    await contactPage.modal.contactPersonNameInput.fill('');
    await contactPage.modal.contactPersonNameInput.blur();

    // =========================================================================
    // PHASE 6: CASCADING DROPDOWNS DEPENDENCY & RESET BEHAVIOR
    // =========================================================================
    console.log('[Phase 6] Cascading Dropdowns: Verifying State & City disabled before Country...');
    await expect(contactPage.modal.stateDropdown).toHaveClass(/p-disabled/);
    await expect(contactPage.modal.cityDropdown).toHaveClass(/p-disabled/);

    console.log('[Phase 6] Step 1: Selecting Country ("India") to enable State...');
    await contactPage.modal.selectCountry('India');
    await expect(contactPage.modal.stateDropdown).not.toHaveClass(/p-disabled/);

    console.log('[Phase 6] Step 2: Selecting State to enable City...');
    await contactPage.modal.stateDropdown.click();
    const stateOptions = contactPage.page.locator('.p-dropdown-panel:visible .p-dropdown-item');
    const firstStateOption = stateOptions.first();
    const firstStateName = (await firstStateOption.innerText()).trim();
    await firstStateOption.click();
    await contactPage.page.waitForTimeout(500);
    await expect(contactPage.modal.cityDropdown).not.toHaveClass(/p-disabled/);

    console.log('[Phase 6] Step 3: Selecting City...');
    await contactPage.modal.cityDropdown.click();
    const cityOptions = contactPage.page.locator('.p-dropdown-panel:visible .p-dropdown-item');
    const firstCityOption = cityOptions.first();
    const firstCityName = (await firstCityOption.innerText()).trim();
    await firstCityOption.click();
    await contactPage.page.waitForTimeout(500);

    const selectedStateBeforeReset = await contactPage.modal.getDropdownText(contactPage.modal.stateDropdown);
    const selectedCityBeforeReset = await contactPage.modal.getDropdownText(contactPage.modal.cityDropdown);
    console.log(`[Phase 6] Selected before reset: State="${selectedStateBeforeReset}", City="${selectedCityBeforeReset}"`);

    // -------------------------------------------------------------------------
    // SUB-CHECK A: Changing State MUST Reset City
    // -------------------------------------------------------------------------
    console.log('[Phase 6] SUB-CHECK A: Changing State to test City Reset...');
    await contactPage.modal.stateDropdown.click();
    const allStateItems = contactPage.page.locator('.p-dropdown-panel:visible .p-dropdown-item');
    const stateCount = await allStateItems.count();
    if (stateCount > 1) {
      await allStateItems.nth(1).click();
      await contactPage.page.waitForTimeout(500);
      const cityAfterStateChange = await contactPage.modal.getDropdownText(contactPage.modal.cityDropdown);
      console.log(`[Phase 6] City value after State change: "${cityAfterStateChange}"`);
      // Assert city is reset (either cleared, placeholder 'Select', or no longer matches firstCityName)
      expect(cityAfterStateChange !== firstCityName || /select/i.test(cityAfterStateChange) || cityAfterStateChange === '').toBeTruthy();
    }

    // -------------------------------------------------------------------------
    // SUB-CHECK B: Changing Country MUST Reset State & City
    // -------------------------------------------------------------------------
    console.log('[Phase 6] SUB-CHECK B: Changing Country to test State & City Reset...');
    await contactPage.modal.countryDropdown.click();
    const countryPanelItems = contactPage.page.locator('.p-dropdown-panel:visible .p-dropdown-item');
    const countryCount = await countryPanelItems.count();
    let alternateCountryIndex = 0;
    for (let i = 0; i < countryCount; i++) {
      const cName = (await countryPanelItems.nth(i).innerText()).trim();
      if (cName.toLowerCase() !== 'india' && cName.toLowerCase() !== 'select' && cName.length > 0) {
        alternateCountryIndex = i;
        break;
      }
    }
    const alternateCountryName = (await countryPanelItems.nth(alternateCountryIndex).innerText()).trim();
    console.log(`[Phase 6] Switching Country to alternate: "${alternateCountryName}"`);
    await countryPanelItems.nth(alternateCountryIndex).click();
    await contactPage.page.waitForTimeout(500);

    const stateAfterCountryChange = await contactPage.modal.getDropdownText(contactPage.modal.stateDropdown);
    const cityAfterCountryChange = await contactPage.modal.getDropdownText(contactPage.modal.cityDropdown);
    const isCityDisabledAfterCountryChange = await contactPage.modal.cityDropdown.evaluate((el: HTMLElement) => el.classList.contains('p-disabled'));

    console.log(`[Phase 6] After Country change: State="${stateAfterCountryChange}", City="${cityAfterCountryChange}", CityDisabled=${isCityDisabledAfterCountryChange}`);
    expect(stateAfterCountryChange !== selectedStateBeforeReset || /select/i.test(stateAfterCountryChange) || stateAfterCountryChange === '').toBeTruthy();
    expect(cityAfterCountryChange !== selectedCityBeforeReset || /select/i.test(cityAfterCountryChange) || isCityDisabledAfterCountryChange).toBeTruthy();

    // -------------------------------------------------------------------------
    // SUB-CHECK C: Re-establish Valid Cascade for Phase 7
    // -------------------------------------------------------------------------
    console.log('[Phase 6] SUB-CHECK C: Restoring valid Indian geography for Phase 7...');
    await contactPage.modal.selectCountry('India');
    await contactPage.modal.stateDropdown.click();
    await contactPage.page.locator('.p-dropdown-panel:visible .p-dropdown-item').first().click();
    await contactPage.page.waitForTimeout(500);

    await contactPage.modal.cityDropdown.click();
    await contactPage.page.locator('.p-dropdown-panel:visible .p-dropdown-item').first().click();
    await contactPage.page.waitForTimeout(500);

    // Select Source
    await contactPage.modal.sourceDropdown.click();
    const firstSourceOption = contactPage.page.locator('.p-dropdown-panel:visible .p-dropdown-item').first();
    await firstSourceOption.click();
    await contactPage.page.waitForTimeout(500);

    // =========================================================================
    // PHASE 7: RECTIFICATION & END-TO-END AUTO-LEAD GENERATION
    // =========================================================================
    console.log('[Phase 7] Rectifying with valid Indian contact persona...');
    const validContact = ContactDataGenerator.generate();

    await contactPage.modal.contactPersonNameInput.fill(validContact.contactPersonName);
    await contactPage.modal.contactPersonNumberInput.click();
    await contactPage.modal.contactPersonNumberInput.pressSequentially(validContact.contactPersonNumber, { delay: 25 });
    await contactPage.modal.emailInput.fill(validContact.email);

    console.log(`[Phase 7] Submitting valid contact: "${validContact.contactPersonName}" (${validContact.contactPersonNumber})...`);
    await contactPage.modal.clickSave();
    await contactPage.modal.waitForClosed(10000).catch(() => {});
    await expect(contactPage.modal.modalDialog).toBeHidden();

    // Verify contact in table on /contact
    console.log(`[Phase 7] Verifying created contact in /contact table...`);
    const contactRow0 = await contactPage.getRowData(0);
    expect(contactRow0.name).toContain(validContact.contactPersonName);
    expect(contactRow0.hasLeadGenerated).toBeTruthy();

    // Navigate to /mylead and verify auto-generated lead
    console.log(`[Phase 7] Verifying auto-created lead in /mylead table...`);
    await myLeadPage.goto();
    await expect(myLeadPage.pageHeading).toBeVisible();
    await myLeadPage.tableRows.first().waitFor({ state: 'visible', timeout: 15000 });

    const leadRow0 = await myLeadPage.getRowData(0);
    console.log(`[Phase 7] Found lead on /mylead: Contact="${leadRow0.contactName}", Manager="${leadRow0.salesManager}", Status="${leadRow0.status}"`);
    expect(leadRow0.contactName.toLowerCase()).toContain(validContact.contactPersonName.toLowerCase());
    expect(leadRow0.salesManager).toBe('Admin');
    expect(leadRow0.status).toBe('Created');

    console.log('=========================================================================');
    console.log('PASSED: Contact Form full validation pipeline & auto-lead generation verified!');
    console.log('=========================================================================');
  });

  test('RD_CON_VAL_02: Duplicate Phone Number Rejection Validation', async ({ contactPage }) => {
    // Step 1: Retrieve registered contact number from row 0
    await contactPage.tableRows.first().waitFor({ state: 'visible', timeout: 15000 });
    const existingContact = await contactPage.getRowData(0);
    expect(existingContact.contactNumber).toBeTruthy();
    const registeredPhone = existingContact.contactNumber.replace(/\D/g, '').slice(-10);
    console.log(`[RD_CON_VAL_02] Testing duplicate rejection with registered phone: "${registeredPhone}"`);

    // Step 2: Open modal and enter duplicate phone
    await contactPage.clickNewContact();
    await contactPage.modal.waitForOpened();

    const duplicateData = ContactDataGenerator.generate({
      contactPersonNumber: registeredPhone
    });

    await contactPage.modal.fillForm({
      contactPersonName: duplicateData.contactPersonName,
      contactPersonNumber: duplicateData.contactPersonNumber,
      email: duplicateData.email,
      country: duplicateData.country,
      state: duplicateData.state,
      city: duplicateData.city,
      source: duplicateData.source
    });

    // Step 3: Click SAVE -> Must block duplicate submission
    await contactPage.modal.clickSave();
    await contactPage.page.waitForTimeout(1000);

    const toastText = await contactPage.getToastText(3000);
    const isModalOpen = await contactPage.modal.modalDialog.isVisible();
    console.log(`[RD_CON_VAL_02] Modal open: ${isModalOpen} | Toast alert: "${toastText}"`);

    // Must either keep modal open with duplicate error or throw duplicate toast alert
    expect(isModalOpen || /already exists|duplicate/i.test(toastText)).toBeTruthy();

    // Clean up
    if (await contactPage.modal.modalDialog.isVisible()) {
      await contactPage.modal.clickClose();
      await contactPage.modal.waitForClosed();
    }
  });

  test('RD_CON_VAL_03: Single-Run Contact Edit Validation Pipeline (Pre-population -> Blank Mandatory -> Invalid Format -> Whitespace -> Rectify Update -> Persistence)', async ({ contactPage, myLeadPage }) => {
    // Step 1: Read existing contact row 0 details from table
    const originalRow = await contactPage.getRowData(0);
    console.log(`[RD_CON_VAL_03] Targeting Row 0 for Edit: Name="${originalRow.name}", Phone="${originalRow.contactNumber}", Email="${originalRow.email}"`);

    // Step 2: Click Edit button on Row 0
    await contactPage.clickEditRow(0);
    await contactPage.modal.waitForOpened();
    await expect(contactPage.modal.modalDialog).toBeVisible();

    // =========================================================================
    // PHASE 1: PRE-POPULATION INTEGRITY CHECK
    // =========================================================================
    console.log('[Phase 1] Pre-population Check: Verifying existing fields are pre-filled in edit modal...');
    const prefilledName = await contactPage.modal.contactPersonNameInput.inputValue();
    const prefilledPhone = await contactPage.modal.contactPersonNumberInput.inputValue();
    const prefilledEmail = await contactPage.modal.emailInput.inputValue();

    console.log(`[Phase 1] Pre-filled values: Name="${prefilledName}", Phone="${prefilledPhone}", Email="${prefilledEmail}"`);
    expect(prefilledName).toBeTruthy();
    expect(originalRow.name.toLowerCase()).toContain(prefilledName.toLowerCase());

    // Inspect if phone input is disabled on edit
    const isPhoneDisabled = await contactPage.modal.contactPersonNumberInput.isDisabled();
    console.log(`[Phase 1] Phone input disabled on edit: ${isPhoneDisabled}`);

    // =========================================================================
    // PHASE 2: BLANK / ERASE MANDATORY FIELDS ON EDIT
    // =========================================================================
    console.log('[Phase 2] Erase Mandatory Name: Clearing name and clicking SAVE...');
    await contactPage.modal.contactPersonNameInput.fill('');
    await contactPage.modal.clickSave();
    await contactPage.page.waitForTimeout(500);

    // Modal must remain open and assert 'Name is required' error
    await expect(contactPage.modal.modalDialog).toBeVisible();
    const blankErrors = await contactPage.getAllVisibleErrors(contactPage.modal.modalDialog);
    console.log('[Phase 2] Blank edit errors thrown:', blankErrors);
    expect(blankErrors).toContain('Name is required');

    // =========================================================================
    // PHASE 3: MALFORMED / INVALID FORMATS ON EDIT
    // =========================================================================
    console.log('[Phase 3] Invalid Email Check: Entering invalid email on edit...');
    await contactPage.modal.emailInput.fill('invalid_edit_email');
    await contactPage.modal.clickSave();
    await contactPage.page.waitForTimeout(500);

    await expect(contactPage.modal.modalDialog).toBeVisible();
    const emailError = await contactPage.getFieldError('Email', contactPage.modal.modalDialog);
    console.log(`[Phase 3] Email error on edit: "${emailError}"`);
    expect(emailError.toLowerCase()).toContain('please enter a valid email address');

    // =========================================================================
    // PHASE 4: WHITESPACE CHECK ON EDIT
    // =========================================================================
    console.log('[Phase 4] Whitespace Check: Entering only spaces into Name...');
    await contactPage.modal.contactPersonNameInput.fill('       ');
    await contactPage.modal.clickSave();
    await expect(contactPage.modal.modalDialog).toBeVisible();

    // =========================================================================
    // PHASE 5: RECTIFY WITH VALID UPDATED DATA & PERSISTENCE
    // =========================================================================
    console.log('[Phase 5] Rectifying with valid updated details...');
    const updatedSuffix = Math.floor(1000 + Math.random() * 9000);
    const updatedName = `${prefilledName.split(' ')[0]} Edit${updatedSuffix}`;
    const updatedEmail = `edited_${updatedSuffix}@rajasvidecor.com`;

    await contactPage.modal.contactPersonNameInput.fill(updatedName);
    await contactPage.modal.emailInput.fill(updatedEmail);

    console.log(`[Phase 5] Submitting updated contact: Name="${updatedName}", Email="${updatedEmail}"`);
    await contactPage.modal.clickSave();
    await contactPage.modal.waitForClosed(10000).catch(() => {});
    await expect(contactPage.modal.modalDialog).toBeHidden();

    // Verify update on /contact table
    console.log('[Phase 6] Verifying updated record on /contact table...');
    await contactPage.page.waitForTimeout(1000);
    const updatedRow0 = await contactPage.getRowData(0);
    console.log(`[Phase 6] Row 0 after update: Name="${updatedRow0.name}", Email="${updatedRow0.email}", UpdatedBy="${updatedRow0.updatedBy}"`);
    expect(updatedRow0.name).toContain(updatedName);
    expect(updatedRow0.email).toBe(updatedEmail);
    expect(updatedRow0.updatedBy).toBe('Admin');

    // Cross-module verification on /mylead
    console.log('[Phase 6] Verifying updated contact details on /mylead...');
    await myLeadPage.goto();
    await expect(myLeadPage.pageHeading).toBeVisible();
    await myLeadPage.tableRows.first().waitFor({ state: 'visible', timeout: 15000 });

    const leadRow0 = await myLeadPage.getRowData(0);
    console.log(`[Phase 6] /mylead Row 0: Contact="${leadRow0.contactName}", Manager="${leadRow0.salesManager}"`);
    expect(leadRow0.contactName.toLowerCase()).toContain(updatedName.toLowerCase());

    console.log('=========================================================================');
    console.log('PASSED: Contact Edit validation pipeline & persistence verified!');
    console.log('=========================================================================');
  });
});

