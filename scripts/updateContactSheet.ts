import { JWT } from 'google-auth-library';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const currentDate = '2026-09-24';

const newAtomicTestCases = [
  {
    Date: currentDate,
    TC_ID: 'RD_CON_23',
    Module: 'Lead',
    'Sub Module': 'Contact',
    'Feature / Component': 'Phone InputMask',
    'Test Scenario': 'Validate non-numeric and alphabet characters are rejected by Contact Person Number input mask',
    'Test Type': 'UI / Validation',
    'Test Case Description': 'Type alphabetic characters ("abcdefghij") into the Contact Person Number field and verify that the PrimeReact InputMask filters them out immediately.',
    'Steps to Execute': '1. Navigate to /contact\n2. Click "New" to open Add/Edit Contact modal\n3. Focus Contact Person Number input\n4. Type "abcdefghij"\n5. Read input value and attempt SAVE',
    Precondition: 'Admin user logged in; Add/Edit Contact modal opened',
    'Expected Result': 'Input mask rejects non-numeric characters completely and preserves mask placeholders ("__________"); blank error remains active.',
    'Actual Result': 'Verified live: Typed "abcdefghij" was rejected and field retained "__________".',
    Status: 'PASSED',
    Comments: 'Automated in tests/ui/lead/contactValidation.ui.spec.ts (Phase 2)'
  },
  {
    Date: currentDate,
    TC_ID: 'RD_CON_24',
    Module: 'Lead',
    'Sub Module': 'Contact',
    'Feature / Component': 'Phone InputMask',
    'Test Scenario': 'Validate negative sign is rejected and incomplete phone number blocks form submission',
    'Test Type': 'Functional / Validation',
    'Test Case Description': 'Attempt entering negative sign ("-") and an incomplete 5-digit number into Contact Person Number, then click SAVE.',
    'Steps to Execute': '1. Open Add/Edit Contact modal\n2. Focus Contact Person Number input\n3. Type "-98765"\n4. Click SAVE button\n5. Verify modal remains open',
    Precondition: 'Add/Edit Contact modal open',
    'Expected Result': 'Negative sign is rejected by mask; incomplete number ("98765_____") is blocked from submission and modal remains open.',
    'Actual Result': 'Verified live: Negative sign blocked, incomplete value "98765_____" was retained and submission was prevented.',
    Status: 'PASSED',
    Comments: 'Automated in tests/ui/lead/contactValidation.ui.spec.ts (Phase 3)'
  },
  {
    Date: currentDate,
    TC_ID: 'RD_CON_25',
    Module: 'Lead',
    'Sub Module': 'Contact',
    'Feature / Component': 'Email Field Validation',
    'Test Scenario': 'Validate entering invalid email format triggers field validation error',
    'Test Type': 'UI / Validation',
    'Test Case Description': 'Enter a malformed email string without domain/TLD ("invalid_email_format") and click SAVE.',
    'Steps to Execute': '1. Open Add/Edit Contact modal\n2. Enter "invalid_email_format" into Email input\n3. Click SAVE button\n4. Assert inline validation error message',
    Precondition: 'Add/Edit Contact modal open',
    'Expected Result': 'System displays inline validation error: "Please enter a valid email address" and keeps modal open.',
    'Actual Result': 'Verified live: Caught inline error "Please enter a valid email address"; form submission blocked.',
    Status: 'PASSED',
    Comments: 'Automated in tests/ui/lead/contactValidation.ui.spec.ts (Phase 4)'
  },
  {
    Date: currentDate,
    TC_ID: 'RD_CON_26',
    Module: 'Lead',
    'Sub Module': 'Contact',
    'Feature / Component': 'Cascading Dropdown (State -> City)',
    'Test Scenario': 'Verify selecting State enables the dependent City dropdown',
    'Test Type': 'UI / Functional',
    'Test Case Description': 'Select a valid Country ("India"), then select a State from the dropdown, and verify City dropdown transitions from disabled to active.',
    'Steps to Execute': '1. Select Country "India"\n2. Open State dropdown and select first option\n3. Inspect City dropdown element',
    Precondition: 'Country selected in Add/Edit Contact modal',
    'Expected Result': 'City dropdown removes the .p-disabled CSS class and becomes clickable/selectable.',
    'Actual Result': 'Verified live: Selecting State enabled City dropdown (removed .p-disabled class).',
    Status: 'PASSED',
    Comments: 'Automated in tests/ui/lead/contactValidation.ui.spec.ts (Phase 6)'
  },
  {
    Date: currentDate,
    TC_ID: 'RD_CON_27',
    Module: 'Lead',
    'Sub Module': 'Contact',
    'Feature / Component': 'Cascading Dropdown Reset (State -> City)',
    'Test Scenario': 'Validate changing State automatically resets the dependent City dropdown',
    'Test Type': 'Data Integrity / Functional',
    'Test Case Description': 'Select a State and a City, then change the State to a different option and verify the City dropdown resets to placeholder.',
    'Steps to Execute': '1. Select State (e.g. Andaman and Nicobar Islands)\n2. Select City (e.g. Bombuflat)\n3. Change State to a different state\n4. Inspect City dropdown label',
    Precondition: 'Country, State, and City selected in Add/Edit Contact modal',
    'Expected Result': 'City dropdown is immediately reset to "Select City" placeholder, preventing impossible geographical pairings.',
    'Actual Result': 'Verified live: City dropdown reset immediately to "Select City" placeholder upon State change.',
    Status: 'PASSED',
    Comments: 'Automated in tests/ui/lead/contactValidation.ui.spec.ts (Phase 6 Sub-Check A)'
  },
  {
    Date: currentDate,
    TC_ID: 'RD_CON_28',
    Module: 'Lead',
    'Sub Module': 'Contact',
    'Feature / Component': 'Cascading Dropdown Reset (Country -> State & City)',
    'Test Scenario': 'Validate changing Country automatically resets both State and City, and disables City',
    'Test Type': 'Data Integrity / Functional',
    'Test Case Description': 'Select Country, State, and City. Then switch Country to an alternate option and verify both State and City are cleared and City is disabled.',
    'Steps to Execute': '1. Select Country "India", State, and City\n2. Open Country dropdown and select alternate country\n3. Inspect State and City dropdown labels and classes',
    Precondition: 'Active geographic cascade selected in modal',
    'Expected Result': 'State resets to "Select State", City resets to "Select City", and City dropdown is disabled (.p-disabled).',
    'Actual Result': 'Verified live: State="Select State", City="Select City", and CityDisabled=true after Country switch.',
    Status: 'PASSED',
    Comments: 'Automated in tests/ui/lead/contactValidation.ui.spec.ts (Phase 6 Sub-Check B)'
  },
  {
    Date: currentDate,
    TC_ID: 'RD_CON_29',
    Module: 'Lead',
    'Sub Module': 'Contact',
    'Feature / Component': 'Contact to Lead Generation Bridge',
    'Test Scenario': 'Verify saving valid contact automatically creates and assigns a Lead in My Lead (/mylead)',
    'Test Type': 'Integration / E2E',
    'Test Case Description': 'Submit a complete valid contact form and verify the contact appears in /contact, then navigate to /mylead and verify the newly generated lead.',
    'Steps to Execute': '1. Fill all valid contact fields (Name, Phone, Email, Country, State, City, Source)\n2. Click SAVE\n3. Verify contact in /contact table\n4. Navigate to /mylead\n5. Inspect row 0 contact name, sales manager, and status',
    Precondition: 'Admin user logged in',
    'Expected Result': 'Lead is auto-created in /mylead with matching Contact Name, Sales Manager="Admin", and Status="Created".',
    'Actual Result': 'Verified live: Lead created on /mylead with Contact Name matched, Sales Manager="Admin", Status="Created".',
    Status: 'PASSED',
    Comments: 'Automated in tests/ui/lead/contactValidation.ui.spec.ts (Phase 7)'
  },
  {
    Date: currentDate,
    TC_ID: 'RD_CON_30',
    Module: 'Lead',
    'Sub Module': 'Contact',
    'Feature / Component': 'Edit Contact Modal',
    'Test Scenario': 'Verify clicking Edit button accurately pre-populates existing contact data in modal',
    'Test Type': 'UI / Functional',
    'Test Case Description': 'Click the Edit (.pi-pencil) icon on row 0 and verify that Name, Phone Number, and Email fields contain the exact existing record values.',
    'Steps to Execute': '1. Read Name, Phone, and Email from /contact table row 0\n2. Click Edit button on row 0\n3. Wait for modal to open\n4. Read input values from Name, Phone, and Email fields',
    Precondition: 'Contacts present in /contact table',
    'Expected Result': 'Modal opens in edit mode with Name, Phone, and Email inputs matching table row 0 data.',
    'Actual Result': 'Verified live: Pre-filled values matched row 0 existing data accurately.',
    Status: 'PASSED',
    Comments: 'Automated in tests/ui/lead/contactValidation.ui.spec.ts (RD_CON_VAL_03 Phase 1)'
  },
  {
    Date: currentDate,
    TC_ID: 'RD_CON_31',
    Module: 'Lead',
    'Sub Module': 'Contact',
    'Feature / Component': 'Edit Field Permissibility',
    'Test Scenario': 'Verify Phone Number input field remains interactable and editable during contact edit',
    'Test Type': 'UI / Field State',
    'Test Case Description': 'Open an existing contact in edit mode and verify whether the phone input is disabled or editable.',
    'Steps to Execute': '1. Click Edit on row 0\n2. Inspect Contact Person Number input disabled attribute',
    Precondition: 'Add/Edit Contact modal open in edit mode',
    'Expected Result': 'Contact Person Number input is not locked or disabled (isDisabled() returns false).',
    'Actual Result': 'Verified live: Phone input disabled attribute evaluated to false (field is editable).',
    Status: 'PASSED',
    Comments: 'Automated in tests/ui/lead/contactValidation.ui.spec.ts (RD_CON_VAL_03 Phase 1)'
  },
  {
    Date: currentDate,
    TC_ID: 'RD_CON_32',
    Module: 'Lead',
    'Sub Module': 'Contact',
    'Feature / Component': 'Edit Contact Validation',
    'Test Scenario': 'Validate clearing mandatory Name field on edit triggers validation error and blocks SAVE',
    'Test Type': 'Functional / Validation',
    'Test Case Description': 'Clear the pre-filled Name input on an existing contact and click SAVE to verify records cannot be blanked out.',
    'Steps to Execute': '1. Open existing contact in edit mode\n2. Clear Contact Person Name input (fill(""))\n3. Click SAVE button\n4. Assert validation error and modal visibility',
    Precondition: 'Contact open in edit modal',
    'Expected Result': 'System displays "Name is required" validation error and keeps modal open.',
    'Actual Result': 'Verified live: Erasing Name threw ["Name is required"] and prevented form update.',
    Status: 'PASSED',
    Comments: 'Automated in tests/ui/lead/contactValidation.ui.spec.ts (RD_CON_VAL_03 Phase 2)'
  },
  {
    Date: currentDate,
    TC_ID: 'RD_CON_33',
    Module: 'Lead',
    'Sub Module': 'Contact',
    'Feature / Component': 'Edit Contact Validation',
    'Test Scenario': 'Validate entering invalid email format during contact edit triggers validation error',
    'Test Type': 'Functional / Validation',
    'Test Case Description': 'Enter an invalid email format into an existing contact and click SAVE.',
    'Steps to Execute': '1. Open contact in edit mode\n2. Enter "invalid_edit_email" into Email input\n3. Click SAVE button\n4. Assert inline email error',
    Precondition: 'Contact open in edit modal',
    'Expected Result': 'System throws "Please enter a valid email address" and blocks modal update.',
    'Actual Result': 'Verified live: Caught inline error "Please enter a valid email address"; update blocked.',
    Status: 'PASSED',
    Comments: 'Automated in tests/ui/lead/contactValidation.ui.spec.ts (RD_CON_VAL_03 Phase 3)'
  },
  {
    Date: currentDate,
    TC_ID: 'RD_CON_34',
    Module: 'Lead',
    'Sub Module': 'Contact',
    'Feature / Component': 'Contact Edit Persistence',
    'Test Scenario': 'Verify submitting valid updated Name and Email persists changes and updates Updated By column',
    'Test Type': 'Functional / Persistence',
    'Test Case Description': 'Enter updated Name and Email, save contact, and verify updated record in /contact table displays new values and Updated By="Admin".',
    'Steps to Execute': '1. Edit contact Name and Email with valid updated values\n2. Click SAVE\n3. Wait for modal to close\n4. Inspect /contact table row 0',
    Precondition: 'Valid updated data entered in edit modal',
    'Expected Result': 'Modal closes; /contact table row 0 displays updated Name, updated Email, and Updated By = "Admin".',
    'Actual Result': 'Verified live: Table row 0 updated with new Name, Email, and UpdatedBy="Admin".',
    Status: 'PASSED',
    Comments: 'Automated in tests/ui/lead/contactValidation.ui.spec.ts (RD_CON_VAL_03 Phase 5 & 6)'
  },
  {
    Date: currentDate,
    TC_ID: 'RD_CON_35',
    Module: 'Lead',
    'Sub Module': 'Contact',
    'Feature / Component': 'Lead Synchronization Bridge',
    'Test Scenario': 'Verify editing contact information on /contact automatically synchronizes with linked lead in /mylead',
    'Test Type': 'Integration / E2E',
    'Test Case Description': 'Update contact name in /contact, save, navigate to /mylead, and verify that the corresponding lead record reflects the updated name.',
    'Steps to Execute': '1. Update contact name on /contact\n2. Save and verify modal closes\n3. Navigate to /mylead\n4. Inspect row 0 contact name',
    Precondition: 'Contact successfully updated on /contact',
    'Expected Result': 'Lead on /mylead table reflects the updated Contact Name.',
    'Actual Result': 'Verified live: /mylead row 0 Contact Name updated to match edited contact name.',
    Status: 'PASSED',
    Comments: 'Automated in tests/ui/lead/contactValidation.ui.spec.ts (RD_CON_VAL_03 Phase 6)'
  }
];

async function updateContactSheet() {
  const creds = JSON.parse(fs.readFileSync('./credentials.json', 'utf8'));
  const auth = new JWT({
    email: creds.client_email,
    key: creds.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });

  const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!, auth);
  await doc.loadInfo();

  console.log(`Connected to Google Spreadsheet: "${doc.title}"`);
  const sheet = doc.sheetsByTitle['Contact'];
  if (!sheet) {
    throw new Error('Sheet "Contact" not found!');
  }

  const existingRows = await sheet.getRows();
  console.log(`Current Contact rows count: ${existingRows.length}`);

  // 1. Update existing verified test cases
  const verifiedTcUpdates: { [tcId: string]: { actual: string; status: string } } = {
    RD_CON_06: {
      actual: 'Verified live: State and City dropdowns possess .p-disabled class before Country selection',
      status: 'PASSED'
    },
    RD_CON_07: {
      actual: 'Verified live: Selecting Country removes .p-disabled and enables State dropdown',
      status: 'PASSED'
    },
    RD_CON_08: {
      actual: 'Verified live: Blank SAVE triggered all 6 mandatory field errors simultaneously (Name, Contact, Country, State, City, Source)',
      status: 'PASSED'
    },
    RD_CON_09: {
      actual: 'Verified live: Whitespace-only name ("       ") was rejected and blocked form submission',
      status: 'PASSED'
    },
    RD_CON_11: {
      actual: 'Verified live: Duplicate phone number submission triggered alert "Phone number already exists" and kept modal open',
      status: 'PASSED'
    },
    RD_CON_12: {
      actual: 'Verified live: Authentic Indian contact created successfully, row updated in table and active lead provisioned in /mylead',
      status: 'PASSED'
    }
  };

  let updatedCount = 0;
  for (const row of existingRows) {
    const tcId = row.get('TC_ID');
    if (verifiedTcUpdates[tcId]) {
      row.set('Date', currentDate);
      row.set('Actual Result', verifiedTcUpdates[tcId].actual);
      row.set('Status', verifiedTcUpdates[tcId].status);
      row.set('Comments', 'Automated via Playwright (contactValidation.ui.spec.ts)');
      await row.save();
      updatedCount++;
      console.log(`Updated existing test case: ${tcId}`);
    }
  }

  // 2. Add new atomic test cases (skip any if already present)
  const existingTcIds = new Set(existingRows.map(r => r.get('TC_ID')));
  const toAdd = newAtomicTestCases.filter(tc => !existingTcIds.has(tc.TC_ID));

  if (toAdd.length > 0) {
    console.log(`Appending ${toAdd.length} new atomic test cases...`);
    await sheet.addRows(toAdd);
    console.log(`Successfully appended ${toAdd.length} new atomic test cases!`);
  } else {
    console.log('All new atomic test cases already exist in the sheet.');
  }

  console.log(`\n=========================================================`);
  console.log(`Summary: ${updatedCount} existing rows updated, ${toAdd.length} new rows added.`);
  console.log(`=========================================================`);
}

updateContactSheet().catch(console.error);
