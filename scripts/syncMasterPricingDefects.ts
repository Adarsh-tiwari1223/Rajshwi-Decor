import { JWT } from 'google-auth-library';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const today = new Date().toISOString().split('T')[0];

export interface DefectItem {
  sheet: 'Dashboard' | 'Contact' | 'Lead';
  tcId: string;
  module: string;
  subModule: string;
  feature: string;
  scenario: string;
  type: string;
  desc: string;
  steps: string;
  precond: string;
  expected: string;
  actual: string;
  comments: string;
}

const newBatchDefects: DefectItem[] = [
  // 1. Customization (Lead Tab)
  {
    sheet: 'Lead',
    tcId: 'RD_LDD_14',
    module: 'Lead',
    subModule: 'Customization',
    feature: 'Sample Configuration Toggle',
    scenario: 'Verify table updates dynamically when Sample is switched from Yes to No',
    type: 'Functional / State Management',
    desc: 'Add customization with Sample = Yes, Label, and Details. Edit same customization, switch Sample to No, save, and check table.',
    steps: '1. Open Customization tab\n2. Add customization with Sample = Yes, Label, Details\n3. Edit same customization and change Sample = No\n4. Click Save and inspect table',
    precond: 'Lead details loaded on Customization tab',
    expected: 'Table reflects latest saved configuration. Previous Sample-related data removed/updated when Sample changed to No.',
    actual: 'Customization Update Not Reflected: Previous customization record/details are still displayed in the table.',
    comments: 'Active / Reported Bug #1'
  },

  // 2. Product Master (Lead Tab)
  {
    sheet: 'Lead',
    tcId: 'RD_PRD_01',
    module: 'Product Master',
    subModule: 'Product Details',
    feature: 'Mandatory Whitespace Validation',
    scenario: 'Validate Product Name and SKU reject whitespace-only inputs',
    type: 'UI / Validation',
    desc: 'Verify whitespace-only entries in Product Name and SKU fields are rejected with proper validation message.',
    steps: '1. Navigate to Product Master\n2. Enter whitespace-only ("     ") in Product Name & SKU\n3. Attempt to save',
    precond: 'Product Master form open',
    expected: 'Whitespace-only values should be rejected with an appropriate validation message ("Product ABC" -> Valid).',
    actual: 'Product Name and SKU are mandatory fields, but the system accepts only spaces as valid input.',
    comments: 'Active / Reported Bug #2'
  },
  {
    sheet: 'Lead',
    tcId: 'RD_PRD_02',
    module: 'Product Master',
    subModule: 'Product Details',
    feature: 'Dimensions / Weight UI Layout',
    scenario: 'Verify input field widths and spacing consistency across Dimensions and Weight sections',
    type: 'UI / Layout & Alignment',
    desc: 'Verify consistent input widths, spacing, and alignment across Product Dimensions, Weight, and Package Dimensions.',
    steps: '1. Open Product Master form\n2. Inspect Product Dimensions, Weight, and Package Dimensions input fields',
    precond: 'Product Master form open',
    expected: 'Standardized input widths, spacing, and alignment across all related fields for consistent UI presentation.',
    actual: 'Input field widths and spacing are inconsistent across Product Dimensions, Weight, and Package Dimensions.',
    comments: 'Active / Reported Bug #2'
  },

  // 3. Retail Pricing (Lead Tab)
  {
    sheet: 'Lead',
    tcId: 'RD_PRD_03',
    module: 'Product Master',
    subModule: 'Retail Pricing',
    feature: 'Numeric Input Bounds',
    scenario: 'Verify negative values are rejected in Min Qty, Max Qty, Min Discount, and Max Discount',
    type: 'Functional / Validation',
    desc: 'Attempt entering negative numbers in retail pricing quantity and discount fields.',
    steps: '1. Open Retail Pricing section\n2. Enter negative values (e.g. Min Qty: -1, Max Qty: -10, Min Discount: -5, Max Discount: -10)\n3. Attempt save',
    precond: 'Retail Pricing section open',
    expected: 'Negative values should be rejected with field-level validation errors.',
    actual: 'Negative values can be entered and accepted in Min Qty, Max Qty, Min Discount, and Max Discount.',
    comments: 'Active / Reported Bug #3'
  },
  {
    sheet: 'Lead',
    tcId: 'RD_PRD_04',
    module: 'Product Master',
    subModule: 'Retail Pricing',
    feature: 'Quantity Range Validation',
    scenario: 'Verify Max Qty must be greater than or equal to Min Qty',
    type: 'Functional / Business Logic',
    desc: 'Enter Min Qty greater than Max Qty (e.g. Min: 20, Max: 10) and verify validation error.',
    steps: '1. Enter Min Qty = 20\n2. Enter Max Qty = 10\n3. Attempt save or blur field',
    precond: 'Retail Pricing section open',
    expected: 'Validation should enforce Max Qty >= Min Qty.',
    actual: 'There is no validation ensuring that Max Qty >= Min Qty; system accepts Min Qty greater than Max Qty.',
    comments: 'Active / Reported Bug #3'
  },
  {
    sheet: 'Lead',
    tcId: 'RD_PRD_05',
    module: 'Product Master',
    subModule: 'Retail Pricing',
    feature: 'Button Layout & Text Wrapping',
    scenario: 'Verify + Add Retail Price button alignment and single-line text label display',
    type: 'UI / Alignment',
    desc: 'Inspect + Add Retail Price button for proper alignment and ensure text does not wrap into multiple lines.',
    steps: '1. Navigate to Retail Pricing section\n2. Inspect + Add Retail Price button placement and text wrapping',
    precond: 'Retail pricing section rendered',
    expected: 'Button remains properly aligned with the pricing section and displays label on a single line.',
    actual: 'The + Add Retail Price button is not properly aligned, and its text wraps into multiple lines.',
    comments: 'Active / Reported Bug #3'
  },

  // 4. Wholesale / B2B Pricing (Lead Tab)
  {
    sheet: 'Lead',
    tcId: 'RD_PRD_06',
    module: 'Product Master',
    subModule: 'Wholesale / B2B Pricing',
    feature: 'Design System Uniformity',
    scenario: 'Verify B2B Pricing section UI consistency with surrounding pricing components',
    type: 'UI / Styling',
    desc: 'Verify field widths, spacing, button alignment, labels, section spacing, and input heights match global pricing UI.',
    steps: '1. Open B2B Pricing section\n2. Compare layout tokens and spacing with Retail Pricing section',
    precond: 'Product pricing view open',
    expected: 'Standardized field widths, spacing, button alignment, labels, and heights consistent with existing pricing UI.',
    actual: 'The UI of the B2B Pricing section is inconsistent with the surrounding pricing sections.',
    comments: 'Active / Reported Bug #4'
  },
  {
    sheet: 'Lead',
    tcId: 'RD_PRD_07',
    module: 'Product Master',
    subModule: 'Wholesale / B2B Pricing',
    feature: 'Error Message Clarity',
    scenario: 'Verify pricing validation errors are explicit and user-friendly',
    type: 'UI / UX Validation',
    desc: 'Verify error messages identify invalid field, expected value, and clear remediation guidance.',
    steps: '1. Trigger validation errors in B2B Pricing\n2. Inspect displayed error text',
    precond: 'B2B pricing form open',
    expected: 'Validation clearly identifies invalid field and remedy (e.g. "Max Qty must be greater than or equal to Min Qty") instead of generic errors.',
    actual: 'Validation errors are not displayed in a user-friendly manner; generic/technical messages shown.',
    comments: 'Active / Reported Bug #4'
  },

  // 5. Department Master (Dashboard Tab)
  {
    sheet: 'Dashboard',
    tcId: 'RD_DEP_01',
    module: 'Master Settings',
    subModule: 'Department Master',
    feature: 'Default Entity Status',
    scenario: 'Verify newly created Department has Active status by default',
    type: 'Functional / Business Rule',
    desc: 'Create new Department record and verify initial status is Active so it is immediately usable.',
    steps: '1. Navigate to Department Master\n2. Add new Department with required details\n3. Save and inspect status in table',
    precond: 'Admin user in Master Settings',
    expected: 'Newly created department should have Active default status for immediate usability.',
    actual: 'A newly added Department is created with Inactive status by default.',
    comments: 'Active / Reported Bug #5'
  },

  // 6. Country Master (Contact Tab)
  {
    sheet: 'Contact',
    tcId: 'RD_GEO_01',
    module: 'Master Settings',
    subModule: 'Country Master',
    feature: 'Mandatory Field Enforcement',
    scenario: 'Verify Country record cannot be saved with blank mandatory fields',
    type: 'Functional / Validation',
    desc: 'Attempt saving Country record with empty name/code and verify validation blocks submission.',
    steps: '1. Navigate to Country Master\n2. Click Add Country\n3. Leave mandatory fields blank and click Save',
    precond: 'Add Country modal open',
    expected: 'Mandatory-field validation should prevent submission and display appropriate validation messages.',
    actual: 'Country record can be saved while mandatory fields are blank.',
    comments: 'Active / Reported Bug #6'
  },

  // 7. State Master (Contact Tab)
  {
    sheet: 'Contact',
    tcId: 'RD_GEO_02',
    module: 'Master Settings',
    subModule: 'State Master',
    feature: 'Save Form Action & Feedback',
    scenario: 'Verify clicking Save in State Master triggers request and provides visible feedback',
    type: 'Functional / UI Feedback',
    desc: 'Click Save on Add State form, verify request executes, success/error toast appears, and record updates in table.',
    steps: '1. Open Add/Edit State form\n2. Fill valid state details\n3. Click Save button',
    precond: 'State form open with valid input',
    expected: 'Save request triggered, success toast displayed, and newly created State appears in table.',
    actual: 'Clicking Save produces no visible response and the State record is not saved.',
    comments: 'Active / Reported Bug #7'
  },

  // 8. City Master (Contact Tab)
  {
    sheet: 'Contact',
    tcId: 'RD_GEO_03',
    module: 'Master Settings',
    subModule: 'City Master',
    feature: 'Cascading Dropdown Reset',
    scenario: 'Verify changing Country resets dependent State and City fields',
    type: 'Functional / Cascading State',
    desc: 'Select Country A, State A, City A; then change Country to B; verify State and City selections reset to prevent invalid combinations.',
    steps: '1. Open Add/Edit City form\n2. Select Country, State, and City\n3. Change Country to a different option\n4. Inspect State and City dropdown values',
    precond: 'City form open with cascading dropdowns populated',
    expected: 'Changing Country resets State and City selections, and loads State options belonging to the newly selected Country.',
    actual: 'When Country is changed in Add/Edit City form, dependent fields are not cleared/reset, allowing invalid cross-country state submission.',
    comments: 'Active / Reported Bug #8'
  }
];

export async function syncNewBatchDefects() {
  const creds = JSON.parse(fs.readFileSync('./credentials.json', 'utf8'));
  const auth = new JWT({
    email: creds.client_email,
    key: creds.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!, auth);
  await doc.loadInfo();

  const defectSheet = doc.sheetsByTitle['Defects Log'];
  console.log(`Starting sync of ${newBatchDefects.length} active master/pricing defects...`);

  for (const def of newBatchDefects) {
    const targetSheet = doc.sheetsByTitle[def.sheet];
    if (!targetSheet) {
      console.warn(`Sheet "${def.sheet}" not found!`);
      continue;
    }

    const rows = await targetSheet.getRows();
    const existingRow = rows.find((r) => r.get('TC_ID') === def.tcId);

    if (existingRow) {
      existingRow.set('Status', 'FAILED');
      existingRow.set('Actual Result', def.actual);
      existingRow.set('Comments', def.comments);
      await existingRow.save();
      console.log(`[Updated in ${def.sheet}] ${def.tcId} -> FAILED`);
    } else {
      await targetSheet.addRow({
        Date: today,
        TC_ID: def.tcId,
        Module: def.module,
        'Sub Module': def.subModule,
        'Feature / Component': def.feature,
        'Test Scenario': def.scenario,
        'Test Type': def.type,
        'Test Case Description': def.desc,
        'Steps to Execute': def.steps,
        Precondition: def.precond,
        'Expected Result': def.expected,
        'Actual Result': def.actual,
        Status: 'FAILED',
        Comments: def.comments
      });
      console.log(`[Added to ${def.sheet}] ${def.tcId} -> FAILED`);
    }

    // Direct synchronization into "Defects Log"
    const defectRows = await defectSheet.getRows();
    const existingDefect = defectRows.find((r) => r.get('TC_ID') === def.tcId);

    if (existingDefect) {
      existingDefect.set('Date', today);
      existingDefect.set('Actual Result', def.actual);
      existingDefect.set('Status', 'FAILED');
      existingDefect.set('Dev Status', 'New');
      existingDefect.set('Retest Status', 'Pending');
      await existingDefect.save();
      console.log(`  -> [Updated in Defects Log] ${def.tcId}`);
    } else {
      await defectSheet.addRow({
        Date: today,
        TC_ID: def.tcId,
        Module: def.module,
        'Sub Module': def.subModule,
        'Feature / Component': def.feature,
        'Test Scenario': def.scenario,
        'Test Type': def.type,
        'Test Case Description': def.desc,
        'Steps to Execute': def.steps,
        Precondition: def.precond,
        'Expected Result': def.expected,
        'Actual Result': def.actual,
        Status: 'FAILED',
        'Assigned To (Developer)': 'Unassigned',
        'Dev Status': 'New',
        'Retest Status': 'Pending',
        Comments: def.comments
      });
      console.log(`  -> [Added to Defects Log] ${def.tcId}`);
    }
  }

  console.log('All active master/pricing defects synced successfully into module sheets & Defects Log!');
}

if (require.main === module) {
  syncNewBatchDefects().catch(console.error);
}
