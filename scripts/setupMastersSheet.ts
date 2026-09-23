import { JWT } from 'google-auth-library';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const today = new Date().toISOString().split('T')[0];

const masterTcIds = [
  'RD_PRD_01',
  'RD_PRD_02',
  'RD_PRD_03',
  'RD_PRD_04',
  'RD_PRD_05',
  'RD_PRD_06',
  'RD_PRD_07',
  'RD_DEP_01',
  'RD_GEO_01',
  'RD_GEO_02',
  'RD_GEO_03'
];

async function setupMastersSheet() {
  const creds = JSON.parse(fs.readFileSync('./credentials.json', 'utf8'));
  const auth = new JWT({
    email: creds.client_email,
    key: creds.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!, auth);
  await doc.loadInfo();

  console.log('Spreadsheet loaded:', doc.title);

  // 1. Create or get "Masters" sheet
  let mastersSheet = doc.sheetsByTitle['Masters'];
  const headers = [
    'Date',
    'TC_ID',
    'Module',
    'Sub Module',
    'Feature / Component',
    'Test Scenario',
    'Test Type',
    'Test Case Description',
    'Steps to Execute',
    'Precondition',
    'Expected Result',
    'Actual Result',
    'Status',
    'Comments'
  ];

  if (!mastersSheet) {
    console.log('Creating new sheet: "Masters"...');
    mastersSheet = await doc.addSheet({
      title: 'Masters',
      headerValues: headers
    });
    console.log('Sheet "Masters" created successfully.');
  } else {
    console.log('Sheet "Masters" already exists.');
  }

  // 2. Collect all Master test cases from Lead, Contact, Dashboard, and Defects Log
  const masterDataMap = new Map<string, any>();

  // Extract from existing sheets
  for (const sheetName of ['Lead', 'Contact', 'Dashboard', 'Defects Log']) {
    const sheet = doc.sheetsByTitle[sheetName];
    if (!sheet) continue;
    const rows = await sheet.getRows();
    for (const r of rows) {
      const tcId = r.get('TC_ID');
      if (masterTcIds.includes(tcId) && !masterDataMap.has(tcId)) {
        masterDataMap.set(tcId, {
          Date: r.get('Date') || today,
          TC_ID: tcId,
          Module: 'Masters',
          'Sub Module': r.get('Sub Module') || 'Masters',
          'Feature / Component': r.get('Feature / Component') || '',
          'Test Scenario': r.get('Test Scenario') || '',
          'Test Type': r.get('Test Type') || 'Functional',
          'Test Case Description': r.get('Test Case Description') || '',
          'Steps to Execute': r.get('Steps to Execute') || '',
          Precondition: r.get('Precondition') || '',
          'Expected Result': r.get('Expected Result') || '',
          'Actual Result': r.get('Actual Result') || '',
          Status: 'FAILED',
          Comments: r.get('Comments') || 'Active / Reported Bug'
        });
      }
    }
  }

  console.log(`Found ${masterDataMap.size} master test cases to transfer.`);

  // 3. Add rows into "Masters" sheet
  const existingMasterRows = await mastersSheet.getRows();
  const existingMasterIds = new Set(existingMasterRows.map(r => r.get('TC_ID')));

  for (const tcId of masterTcIds) {
    const data = masterDataMap.get(tcId);
    if (!data) {
      console.warn(`No data found for ${tcId}!`);
      continue;
    }
    if (existingMasterIds.has(tcId)) {
      console.log(`[Masters] ${tcId} already present.`);
    } else {
      await mastersSheet.addRow(data);
      console.log(`[Masters] Added ${tcId} (${data['Sub Module']} - ${data['Feature / Component']})`);
    }
  }

  // 4. Remove these TC_IDs from Lead, Contact, and Dashboard sheets
  for (const sheetName of ['Lead', 'Contact', 'Dashboard']) {
    const sheet = doc.sheetsByTitle[sheetName];
    if (!sheet) continue;
    const rows = await sheet.getRows();
    for (const r of rows) {
      const tcId = r.get('TC_ID');
      if (masterTcIds.includes(tcId)) {
        console.log(`[Removing from ${sheetName}] ${tcId}`);
        await r.delete();
      }
    }
  }

  // 5. Update Defects Log to reflect Module = "Masters"
  const defectSheet = doc.sheetsByTitle['Defects Log'];
  if (defectSheet) {
    const defectRows = await defectSheet.getRows();
    for (const r of defectRows) {
      const tcId = r.get('TC_ID');
      if (masterTcIds.includes(tcId)) {
        r.set('Module', 'Masters');
        await r.save();
        console.log(`[Defects Log Updated] ${tcId} Module -> Masters`);
      }
    }
  }

  console.log('\n--- VERIFICATION OF ALL SHEETS ---');
  await doc.loadInfo();
  for (const sTitle of Object.keys(doc.sheetsByTitle)) {
    const s = doc.sheetsByTitle[sTitle];
    const r = await s.getRows();
    console.log(sTitle.padEnd(15), 'Rows:', r.length);
  }
}

setupMastersSheet().catch(console.error);
