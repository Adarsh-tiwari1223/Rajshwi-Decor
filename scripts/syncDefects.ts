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

const defects: DefectItem[] = [
  // 1. Dashboard
  {
    sheet: 'Dashboard',
    tcId: 'RD_DSH_06',
    module: 'Dashboard',
    subModule: 'Lead Funnel',
    feature: 'Metric Synchronization',
    scenario: 'Verify Lead Funnel and Follow-ups card count synchronization',
    type: 'UI / Functional',
    desc: 'Verify follow-up count matches across Lead Funnel widget and Follow-ups stat card.',
    steps: '1. Login to CRM\n2. Inspect Lead Funnel Follow-up count\n3. Inspect Follow-ups stat card count',
    precond: 'User on Dashboard with follow-up leads',
    expected: 'Follow-up count matches across Lead Funnel and stat cards.',
    actual: 'Follow-up count mismatch - Lead Funnel shows 2, Follow-ups card shows 0.',
    comments: 'Manual QA Finding'
  },
  {
    sheet: 'Dashboard',
    tcId: 'RD_DSH_07',
    module: 'Dashboard',
    subModule: 'Recent Enquiries',
    feature: 'Date Formatting',
    scenario: 'Verify Recent Enquiries table date display format',
    type: 'UI / Functional',
    desc: 'Verify date format follows standard DD/MM/YYYY in Recent Enquiries table.',
    steps: '1. Navigate to Dashboard\n2. Inspect Recent Enquiries table date column',
    precond: 'Enquiries present in table',
    expected: 'Standard localized date format displayed.',
    actual: 'Recent Enquiries date format incorrect.',
    comments: 'Manual QA Finding'
  },
  {
    sheet: 'Dashboard',
    tcId: 'RD_DSH_08',
    module: 'Dashboard',
    subModule: 'Recent Enquiries',
    feature: 'Navigation Controls',
    scenario: 'Verify View All button navigation in Recent Enquiries',
    type: 'UI / Functional',
    desc: 'Click View All button on Recent Enquiries and verify navigation to full enquiries list.',
    steps: '1. Navigate to Dashboard\n2. Click View All button in Recent Enquiries widget',
    precond: 'User on Dashboard',
    expected: 'Clicking View All navigates to full enquiries/leads page.',
    actual: 'View All button not working.',
    comments: 'Manual QA Finding'
  },
  {
    sheet: 'Dashboard',
    tcId: 'RD_DSH_09',
    module: 'Dashboard',
    subModule: 'Welcome Banner',
    feature: 'User Dynamic Greeting',
    scenario: 'Verify Welcome Banner displays logged-in user name dynamically',
    type: 'UI / Functional',
    desc: 'Verify welcome banner displays the active user name and not hardcoded Admin for non-admin users.',
    steps: '1. Login as standard user (e.g. Priya Patel)\n2. Inspect Welcome Banner text',
    precond: 'Non-admin user logged in',
    expected: 'Banner reflects current user display name.',
    actual: 'Welcome banner always shows "Welcome Back Admin" regardless of logged-in user.',
    comments: 'Manual QA Finding'
  },
  // 2. Contact
  {
    sheet: 'Contact',
    tcId: 'RD_CON_15',
    module: 'Lead',
    subModule: 'Contact',
    feature: 'Address Form Layout',
    scenario: 'Verify Add / New / Address button text formatting and layout',
    type: 'UI / Layout',
    desc: 'Verify Add/New Address button text renders cleanly on a single line.',
    steps: '1. Navigate to Contact page / Address modal\n2. Inspect Add New Address button text',
    precond: 'Contact or Address modal opened',
    expected: 'Button text fits neatly without unexpected line breaks.',
    actual: 'Add / New / Address text wrapping incorrectly.',
    comments: 'Manual QA Finding'
  },
  {
    sheet: 'Contact',
    tcId: 'RD_CON_16',
    module: 'Lead',
    subModule: 'Contact',
    feature: 'Address Modal Stability',
    scenario: 'Verify clicking Add Address does not crash page or render blank',
    type: 'UI / Functional',
    desc: 'Click Add Address button and verify address form modal renders properly without blank screen.',
    steps: '1. Click Add Address button\n2. Verify modal renders without page crashing',
    precond: 'User on Contact / Address section',
    expected: 'Address modal opens cleanly without crashing page.',
    actual: 'Add Address causes a blank page.',
    comments: 'Manual QA Finding'
  },
  {
    sheet: 'Contact',
    tcId: 'RD_CON_17',
    module: 'Lead',
    subModule: 'Contact',
    feature: 'Address State/City Validation',
    scenario: 'Verify existing State and City selections do not trigger false required validations',
    type: 'UI / Functional',
    desc: 'Select or edit State and City in address form and verify false validation errors are not triggered.',
    steps: '1. Open Address form with existing State/City\n2. Attempt save or edit\n3. Inspect validation messages',
    precond: 'Address form with State/City values populated',
    expected: 'No required validation triggered when values are present.',
    actual: 'Existing State/City values still trigger "State is required" / "City is required."',
    comments: 'Manual QA Finding'
  },
  {
    sheet: 'Contact',
    tcId: 'RD_CON_18',
    module: 'Lead',
    subModule: 'Contact',
    feature: 'Data Consistency',
    scenario: 'Verify Source field consistency between Lead and Contact',
    type: 'Integration / Data Integrity',
    desc: 'Verify Source value matches across Contact and linked Lead records.',
    steps: '1. Create contact with specific source\n2. Check Contact record\n3. Check linked Lead record source',
    precond: 'Contact created with specified Source',
    expected: 'Source field matches identically between Contact and Lead.',
    actual: 'Same record has different Source values between Lead and Contact.',
    comments: 'Manual QA Finding'
  },
  {
    sheet: 'Contact',
    tcId: 'RD_CON_19',
    module: 'Lead',
    subModule: 'Contact',
    feature: 'Bulk Upload Persistence',
    scenario: 'Verify bulk-uploaded contacts appear in Contact data table upon completion',
    type: 'Functional',
    desc: 'Upload CSV sample of contacts and verify rows are populated in table upon success.',
    steps: '1. Click Bulk Upload\n2. Upload valid CSV\n3. Check Contact table',
    precond: 'Valid CSV file prepared',
    expected: 'Uploaded contacts are inserted and displayed in table.',
    actual: 'Bulk contact upload shows success but contacts are not added to the table.',
    comments: 'Manual QA Finding'
  },
  {
    sheet: 'Contact',
    tcId: 'RD_CON_20',
    module: 'Lead',
    subModule: 'Contact',
    feature: 'Bulk Upload Assignment',
    scenario: 'Verify bulk-uploaded contacts assign to selected On Behalf Of user',
    type: 'Functional',
    desc: 'Select user in On Behalf Of during bulk upload and verify created contacts are assigned to that user.',
    steps: '1. Open Bulk Upload modal\n2. Select On Behalf Of user\n3. Complete upload\n4. Inspect contact owner',
    precond: 'Target user exists',
    expected: 'Contacts assigned to designated On Behalf Of user.',
    actual: 'Bulk-uploaded contacts are not assigned to the selected On Behalf Of user.',
    comments: 'Manual QA Finding'
  },
  {
    sheet: 'Contact',
    tcId: 'RD_CON_21',
    module: 'Lead',
    subModule: 'Contact',
    feature: 'Bulk Upload Lead Generation',
    scenario: 'Verify bulk-uploaded contacts auto-generate and link leads in My Lead',
    type: 'Integration / E2E',
    desc: 'Verify bulk-uploaded contacts generate corresponding leads on My Lead page.',
    steps: '1. Complete bulk upload on Contact\n2. Navigate to /mylead\n3. Verify corresponding leads exist',
    precond: 'Bulk upload completed',
    expected: 'Linked leads auto-created and visible in My Lead.',
    actual: 'Bulk-uploaded contacts do not subsequently appear correctly in Lead / My Lead.',
    comments: 'Manual QA Finding'
  },
  {
    sheet: 'Contact',
    tcId: 'RD_CON_22',
    module: 'Lead',
    subModule: 'Contact',
    feature: 'Bulk Upload Modal Dismissal',
    scenario: 'Verify upload modal closes automatically after successful submission',
    type: 'UI / UX',
    desc: 'Verify bulk upload modal dialog dismisses automatically on completion.',
    steps: '1. Upload valid CSV\n2. Wait for success toast / completion\n3. Verify modal closes',
    precond: 'Bulk upload dialog open',
    expected: 'Modal closes automatically upon success.',
    actual: 'Upload modal does not automatically close after successful submission.',
    comments: 'Manual QA Finding'
  },
  // 3. Lead & Lead Details
  {
    sheet: 'Lead',
    tcId: 'RD_MYL_09',
    module: 'Lead',
    subModule: 'My Lead',
    feature: 'Iconography & Design',
    scenario: 'Verify View History icon style and visual appropriateness',
    type: 'UI / Visual',
    desc: 'Verify View History icon aligns with enterprise CRM design system.',
    steps: '1. Navigate to /mylead\n2. Inspect action icons in data table',
    precond: 'Leads present in table',
    expected: 'View History icon is visually fitting and clear.',
    actual: 'View History icon is visually inappropriate.',
    comments: 'Manual QA Finding'
  },
  {
    sheet: 'Lead',
    tcId: 'RD_LDD_07',
    module: 'Lead',
    subModule: 'Lead Details',
    feature: 'Design System Theming',
    scenario: 'Verify Banner and Save button colors match global brand theme',
    type: 'UI / Styling',
    desc: 'Verify header banner and Save button conform to palette tokens.',
    steps: '1. Open Lead Details page\n2. Inspect banner and Save button CSS styling',
    precond: 'Lead details loaded',
    expected: 'Colors adhere to global theme palette.',
    actual: 'Banner and Save button colors do not match the global theme.',
    comments: 'Manual QA Finding'
  },
  {
    sheet: 'Lead',
    tcId: 'RD_LDD_08',
    module: 'Lead',
    subModule: 'Lead Details',
    feature: 'Validation Message Layout',
    scenario: 'Verify validation messages formatting and wrapping in forms',
    type: 'UI / Layout',
    desc: 'Verify form error messages fit naturally without excessive line wrapping.',
    steps: '1. Trigger field validation error on Lead Details form\n2. Inspect error text layout',
    precond: 'Lead Details form open',
    expected: 'Validation text fits container width smoothly.',
    actual: 'Validation messages wrap unnecessarily instead of fitting within a suitable width.',
    comments: 'Manual QA Finding'
  },
  {
    sheet: 'Lead',
    tcId: 'RD_LDD_09',
    module: 'Lead',
    subModule: 'Product',
    feature: 'Default Product Protection',
    scenario: 'Verify Delete action is disabled or hidden for default/first product',
    type: 'UI / Functional',
    desc: 'Verify initial default product cannot display delete button if deletion is unsupported.',
    steps: '1. Open Add Requirement Step 1\n2. Inspect first/default product line',
    precond: 'Requirement modal open',
    expected: 'Delete button hidden or disabled for mandatory first product.',
    actual: 'Delete button is displayed for the default/first product, although it cannot be deleted.',
    comments: 'Manual QA Finding'
  },
  {
    sheet: 'Lead',
    tcId: 'RD_LDD_10',
    module: 'Lead',
    subModule: 'Product',
    feature: 'Multi-Product State Integrity',
    scenario: 'Verify deleting a product line retains Channel selection on other products',
    type: 'Functional',
    desc: 'Add multiple products with distinct channels, delete one, and verify remaining channel remains.',
    steps: '1. Add Product A (Channel: Modern Trade)\n2. Add Product B (Channel: Retail)\n3. Delete Product A\n4. Inspect Product B Channel',
    precond: 'Multiple products configured',
    expected: 'Remaining products retain their configured Channel value.',
    actual: 'Deleting one product resets another product Channel.',
    comments: 'Manual QA Finding'
  },
  {
    sheet: 'Lead',
    tcId: 'RD_LDD_11',
    module: 'Lead',
    subModule: 'Product',
    feature: 'Action Placement',
    scenario: 'Verify Add Product button is rendered exclusively in designated section',
    type: 'UI / UX',
    desc: 'Verify Add Product button is removed from redundant/non-applicable sections.',
    steps: '1. Inspect Lead Details requirement/product views\n2. Check Add Product button location',
    precond: 'Lead details loaded',
    expected: 'Add Product button displayed only where architecturally appropriate.',
    actual: 'Add Product button should be removed from the specified section.',
    comments: 'Manual QA Finding'
  },
  {
    sheet: 'Lead',
    tcId: 'RD_LDD_12',
    module: 'Lead',
    subModule: 'Requirement',
    feature: 'Destructive Action Confirmation',
    scenario: 'Verify confirmation modal appears before deleting a requirement',
    type: 'UI / Functional',
    desc: 'Click delete icon on requirement and verify confirmation dialog is displayed.',
    steps: '1. Navigate to Requirements tab\n2. Click Delete icon on a requirement row',
    precond: 'Requirement exists',
    expected: 'Confirmation dialog prompts user before deletion.',
    actual: 'Requirement can be deleted without confirmation.',
    comments: 'Manual QA Finding'
  },
  {
    sheet: 'Lead',
    tcId: 'RD_LDD_13',
    module: 'Lead',
    subModule: 'Requirement',
    feature: 'Deletion Persistence',
    scenario: 'Verify deleted requirement remains deleted after page refresh',
    type: 'Functional / Data Persistence',
    desc: 'Delete requirement, refresh page, and verify deleted requirement does not reappear.',
    steps: '1. Delete requirement\n2. Confirm deletion in UI\n3. Refresh page (/leadDetails)\n4. Check Requirements table',
    precond: 'Requirement created',
    expected: 'Requirement remains permanently deleted across reload.',
    actual: 'Deleted requirement reappears after page refresh - deletion is not persisted.',
    comments: 'Manual QA Finding'
  },
  {
    sheet: 'Lead',
    tcId: 'RD_LDD_14',
    module: 'Lead',
    subModule: 'Customization',
    feature: 'Table State Reflection',
    scenario: 'Verify toggling customization to "No" updates table record dynamically',
    type: 'Functional / State Management',
    desc: 'Change existing Customization from Yes to No and verify table updates immediately.',
    steps: '1. Configure Customization = Yes\n2. Edit Customization and switch to No\n3. Save and inspect table',
    precond: 'Existing customization record in table',
    expected: 'Table updates immediately to reflect "No" customization status.',
    actual: 'Customization update is not reflected in the table: Table still shows the previous customization record.',
    comments: 'Manual QA Finding'
  },
  {
    sheet: 'Lead',
    tcId: 'RD_LDD_15',
    module: 'Lead',
    subModule: 'Upload / Display Name',
    feature: 'Upload Progress Indicator',
    scenario: 'Verify upload spinner/waiting message dismisses once upload finishes',
    type: 'UI / UX',
    desc: 'Verify waiting message clears after upload response.',
    steps: '1. Trigger file/display name upload\n2. Wait for server response\n3. Check progress message banner',
    precond: 'Upload triggered',
    expected: 'Waiting message banner clears once response completes.',
    actual: 'Upload is completed, but the UI still displays "Please wait a moment while the upload is completed."',
    comments: 'Manual QA Finding'
  },
  {
    sheet: 'Lead',
    tcId: 'RD_LDD_16',
    module: 'Lead',
    subModule: 'Step 6 - Address',
    feature: 'Address Form Stability',
    scenario: 'Verify clicking Add Address in Step 6 does not crash or cause blank screen',
    type: 'UI / Stability',
    desc: 'Click Add Address button in Address workflow and verify form displays cleanly.',
    steps: '1. Navigate to Address tab / Step 6\n2. Click Add Address button\n3. Verify page remains active and form opens',
    precond: 'Lead details loaded on Step 6 Address',
    expected: 'Address form opens cleanly without blank page.',
    actual: 'Clicking Add Address causes the page to become blank.',
    comments: 'Manual QA Finding'
  },
  {
    sheet: 'Lead',
    tcId: 'RD_LDD_17',
    module: 'Lead',
    subModule: 'Step 6 - Address',
    feature: 'State/City Retention and Validation',
    scenario: 'Verify selecting State and City retains values on edit without false required error',
    type: 'Functional',
    desc: 'Save address with State and City, reopen to edit, and verify values are retained without error.',
    steps: '1. Fill State and City in Address\n2. Save address\n3. Reopen/edit address\n4. Verify retention & submit without false error',
    precond: 'Address saved with State and City',
    expected: 'Values retained on edit and submit succeeds without required field errors.',
    actual: 'Existing State/City values still trigger "State is required" / "City is required."',
    comments: 'Manual QA Finding'
  },
  {
    sheet: 'Lead',
    tcId: 'RD_LDD_18',
    module: 'Lead',
    subModule: 'Step 6 - Address',
    feature: 'Button Text Alignment',
    scenario: 'Verify Add New Address button and text alignment in Step 6',
    type: 'UI / Alignment',
    desc: 'Verify Add New Address button text fits properly without text clipping or broken wrapping.',
    steps: '1. Inspect Add New Address button in Step 6 Address container',
    precond: 'Address tab open',
    expected: 'Button and text are properly aligned on single line.',
    actual: 'Add / New / Address text wraps incorrectly, causing UI alignment issues.',
    comments: 'Manual QA Finding'
  },
  // 4. Admin / RBAC
  {
    sheet: 'Dashboard',
    tcId: 'RD_ADM_01',
    module: 'Admin',
    subModule: 'RBAC / Navigation',
    feature: 'Navigation Route Builder',
    scenario: 'Verify Admin login does not crash due to unmapped menu permission urls',
    type: 'Functional / Routing',
    desc: 'Login as Admin and verify dashboard loads without undefined route push exception.',
    steps: '1. Login with Admin credentials\n2. Wait for redirect to Dashboard\n3. Check console and page render',
    precond: 'Admin user in staging',
    expected: 'Admin dashboard loads seamlessly without uncaught exceptions.',
    actual: 'Admin login redirects to a blank page. Cannot read properties of undefined (reading push).',
    comments: 'Manual QA Finding'
  },
  // 5. Customer
  {
    sheet: 'Lead',
    tcId: 'RD_CUST_01',
    module: 'Customer',
    subModule: 'Customer Profile',
    feature: 'API Error Handling',
    scenario: 'Verify Customer profile loads without Nullable object error',
    type: 'Functional / API',
    desc: 'Open Customer view and verify nullable properties do not cause crash.',
    steps: '1. Navigate to Customer module\n2. Open Customer record',
    precond: 'Customer records exist',
    expected: 'Customer profile opens cleanly without runtime error.',
    actual: 'Nullable object must have a value error.',
    comments: 'Manual QA Finding'
  },
  {
    sheet: 'Lead',
    tcId: 'RD_CUST_02',
    module: 'Customer',
    subModule: 'Customer Filters',
    feature: 'Filter Relevance',
    scenario: 'Verify Customer filters display only relevant attributes',
    type: 'UI / UX',
    desc: 'Inspect Customer table filter panel and verify extraneous Plan Status filter is removed.',
    steps: '1. Open Customer filter accordion\n2. Inspect available filters',
    precond: 'Customer page open',
    expected: 'Only relevant CRM customer filters are shown.',
    actual: 'Unnecessary Plan Status filter.',
    comments: 'Manual QA Finding'
  }
];

export async function syncDefects() {
  const creds = JSON.parse(fs.readFileSync('./credentials.json', 'utf8'));
  const auth = new JWT({
    email: creds.client_email,
    key: creds.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!, auth);
  await doc.loadInfo();

  const defectSheet = doc.sheetsByTitle['Defects Log'];
  console.log(`Starting sync of ${defects.length} manual bug findings...`);

  for (const def of defects) {
    const targetSheet = doc.sheetsByTitle[def.sheet];
    if (!targetSheet) {
      console.warn(`Sheet "${def.sheet}" not found!`);
      continue;
    }

    const rows = await targetSheet.getRows();
    const existingRow = rows.find(r => r.get('TC_ID') === def.tcId);

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
    const existingDefect = defectRows.find(r => r.get('TC_ID') === def.tcId);

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

  console.log('All 27 manual QA defects synced successfully into module sheets & Defects Log!');
}

if (require.main === module) {
  syncDefects().catch(console.error);
}
