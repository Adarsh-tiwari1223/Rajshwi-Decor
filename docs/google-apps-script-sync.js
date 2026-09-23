/**
 * Google Apps Script: Centralized Defects Log Bi-Directional Synchronization
 * 
 * Instructions:
 * 1. Open your Google Sheet: "Rajshwi-Decor-testcase"
 * 2. Go to: Extensions -> Apps Script
 * 3. Delete any existing default code in Code.gs
 * 4. Paste this entire file into Code.gs
 * 5. Click the Save icon (Disk)
 * 6. (Optional) Run "syncDefectsReconciliation" once to grant permissions if prompted.
 */

const DEFECT_SHEET_NAME = 'Defects Log';

// Column Indices in Test Case sheets (1-based for Apps Script)
const TC_COL_TC_ID = 2;        // Col B
const TC_COL_MODULE = 3;       // Col C
const TC_COL_SUBMODULE = 4;    // Col D
const TC_COL_FEATURE = 5;      // Col E
const TC_COL_SCENARIO = 6;     // Col F
const TC_COL_TYPE = 7;         // Col G
const TC_COL_DESCRIPTION = 8;  // Col H
const TC_COL_STEPS = 9;        // Col I
const TC_COL_PRECOND = 10;     // Col J
const TC_COL_EXPECTED = 11;    // Col K
const TC_COL_ACTUAL = 12;      // Col L
const TC_COL_STATUS = 13;      // Col M
const TC_COL_COMMENTS = 14;    // Col N

// Column Indices in Defects Log (1-based)
const DEF_COL_DATE = 1;        // Col A
const DEF_COL_TC_ID = 2;       // Col B
const DEF_COL_MODULE = 3;      // Col C
const DEF_COL_SUBMODULE = 4;   // Col D
const DEF_COL_FEATURE = 5;     // Col E
const DEF_COL_SCENARIO = 6;    // Col F
const DEF_COL_TYPE = 7;        // Col G
const DEF_COL_DESCRIPTION = 8; // Col H
const DEF_COL_STEPS = 9;       // Col I
const DEF_COL_PRECOND = 10;    // Col J
const DEF_COL_EXPECTED = 11;   // Col K
const DEF_COL_ACTUAL = 12;     // Col L
const DEF_COL_STATUS = 13;     // Col M
const DEF_COL_ASSIGNED = 14;   // Col N
const DEF_COL_DEV_STATUS = 15; // Col O
const DEF_COL_RETEST = 16;     // Col P
const DEF_COL_COMMENTS = 17;   // Col Q

/**
 * Fires automatically when ANY user manually edits a cell in the spreadsheet UI.
 */
function onEdit(e) {
  if (!e || !e.range) return;
  const sheet = e.range.getSheet();
  const sheetName = sheet.getName();
  const row = e.range.getRow();
  const col = e.range.getColumn();
  const value = String(e.value || '').trim();

  // Rule 1: Human edits "Retest Status" (Col 16) in "Defects Log" to "Pass"
  if (sheetName === DEFECT_SHEET_NAME && col === DEF_COL_RETEST && row > 1) {
    if (value.toLowerCase() === 'pass') {
      const tcId = sheet.getRange(row, DEF_COL_TC_ID).getValue();
      const subModule = sheet.getRange(row, DEF_COL_SUBMODULE).getValue();
      reconcilePassedTestCase(tcId, subModule);
    }
    return;
  }

  // Rule 2: Human changes Status (Col 13) in ANY test case sheet to "FAILED"
  if (sheetName !== DEFECT_SHEET_NAME && col === TC_COL_STATUS && row > 1) {
    if (value.toUpperCase() === 'FAILED') {
      copyFailedTestCaseToDefects(sheet, row);
    }
  }
}

/**
 * Copies a failed test case row into the centralized Defects Log sheet.
 */
function copyFailedTestCaseToDefects(sourceSheet, row) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const defectSheet = ss.getSheetByName(DEFECT_SHEET_NAME);
  if (!defectSheet) return;

  const tcData = sourceSheet.getRange(row, 1, 1, 14).getValues()[0];
  const tcId = tcData[TC_COL_TC_ID - 1];
  if (!tcId) return;

  const today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  const defectData = defectSheet.getDataRange().getValues();

  // Check if this TC_ID already exists in Defects Log
  let existingRowIndex = -1;
  for (let i = 1; i < defectData.length; i++) {
    if (defectData[i][DEF_COL_TC_ID - 1] === tcId) {
      existingRowIndex = i + 1;
      break;
    }
  }

  if (existingRowIndex > 1) {
    // Update existing defect entry
    defectSheet.getRange(existingRowIndex, DEF_COL_DATE).setValue(today);
    defectSheet.getRange(existingRowIndex, DEF_COL_ACTUAL).setValue(tcData[TC_COL_ACTUAL - 1]);
    defectSheet.getRange(existingRowIndex, DEF_COL_STATUS).setValue('FAILED');
    defectSheet.getRange(existingRowIndex, DEF_COL_DEV_STATUS).setValue('New');
    defectSheet.getRange(existingRowIndex, DEF_COL_RETEST).setValue('Pending');
  } else {
    // Append new defect row
    defectSheet.appendRow([
      today,
      tcId,
      tcData[TC_COL_MODULE - 1] || 'Lead',
      tcData[TC_COL_SUBMODULE - 1] || sourceSheet.getName(),
      tcData[TC_COL_FEATURE - 1],
      tcData[TC_COL_SCENARIO - 1],
      tcData[TC_COL_TYPE - 1],
      tcData[TC_COL_DESCRIPTION - 1],
      tcData[TC_COL_STEPS - 1],
      tcData[TC_COL_PRECOND - 1],
      tcData[TC_COL_EXPECTED - 1],
      tcData[TC_COL_ACTUAL - 1] || 'Test validation failed',
      'FAILED',
      'Unassigned',
      'New',
      'Pending',
      tcData[TC_COL_COMMENTS - 1] || ''
    ]);
  }
}

/**
 * Flips the source test case status to "PASSED" when Retest Status is marked "Pass".
 */
function reconcilePassedTestCase(tcId, subModule) {
  if (!tcId) return;
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Try submodule sheet first, or scan all test sheets
  let sheets = [];
  if (subModule && ss.getSheetByName(subModule)) {
    sheets.push(ss.getSheetByName(subModule));
  } else {
    sheets = ss.getSheets().filter(s => s.getName() !== DEFECT_SHEET_NAME);
  }

  for (let s = 0; s < sheets.length; s++) {
    const sheet = sheets[s];
    const data = sheet.getDataRange().getValues();
    for (let r = 1; r < data.length; r++) {
      if (data[r][TC_COL_TC_ID - 1] === tcId) {
        sheet.getRange(r + 1, TC_COL_STATUS).setValue('PASSED');
        sheet.getRange(r + 1, TC_COL_ACTUAL).setValue('Verified and resolved upon retest.');
        return;
      }
    }
  }
}

/**
 * Full reconciliation job (can be triggered manually or via Time-Driven Trigger).
 */
function syncDefectsReconciliation() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const defectSheet = ss.getSheetByName(DEFECT_SHEET_NAME);
  if (!defectSheet) return;

  const defectData = defectSheet.getDataRange().getValues();
  for (let i = 1; i < defectData.length; i++) {
    const retest = String(defectData[i][DEF_COL_RETEST - 1] || '').trim();
    if (retest.toLowerCase() === 'pass') {
      const tcId = defectData[i][DEF_COL_TC_ID - 1];
      const subModule = defectData[i][DEF_COL_SUBMODULE - 1];
      reconcilePassedTestCase(tcId, subModule);
    }
  }
}
