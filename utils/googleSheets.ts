import { JWT } from 'google-auth-library';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import * as fs from 'fs';
import * as path from 'path';
import { Config } from './env';
import { logger } from './logger';

export interface TestResultRow {
  testName: string;
  suite: string;
  status: 'PASSED' | 'FAILED' | 'SKIPPED';
  durationMs: number;
  timestamp: string;
  errorMessage?: string;
}

export interface SheetTestData {
  testId: string;
  username: string;
  email: string;
  expectedStatus: string;
  [key: string]: string;
}

export class GoogleSheetsService {
  private doc: GoogleSpreadsheet | null = null;
  private isInitialized = false;

  constructor(
    private sheetId: string = Config.googleSheetId,
    private keyPath: string = Config.googlePrivateKeyPath
  ) {}

  /**
   * Initialize Google Spreadsheet connection using Service Account credentials
   */
  async initialize(): Promise<boolean> {
    try {
      const absoluteKeyPath = path.resolve(process.cwd(), this.keyPath);
      
      if (!fs.existsSync(absoluteKeyPath)) {
        logger.warn(`Google service account credentials file not found at: ${absoluteKeyPath}. Operating in mock/dry-run mode.`);
        return false;
      }

      const creds = JSON.parse(fs.readFileSync(absoluteKeyPath, 'utf8'));
      const serviceAccountAuth = new JWT({
        email: creds.client_email || Config.googleServiceAccountEmail,
        key: creds.private_key,
        scopes: ['https://www.googleapis.com/auth/spreadsheets']
      });

      this.doc = new GoogleSpreadsheet(this.sheetId, serviceAccountAuth);
      await this.doc.loadInfo();
      this.isInitialized = true;
      logger.info(`Google Sheets initialized successfully: "${this.doc.title}"`);
      return true;
    } catch (error) {
      logger.error(`Failed to initialize Google Sheets service: ${(error as Error).message}`);
      return false;
    }
  }

  /**
   * Read test data rows from a specified sheet tab
   */
  async readTestData(sheetName = 'TestData'): Promise<SheetTestData[]> {
    if (!this.isInitialized || !this.doc) {
      logger.warn('Google Sheets service not connected. Returning default mock test data.');
      return [
        { testId: 'TC-001', username: 'eve.holt@reqres.in', email: 'eve.holt@reqres.in', expectedStatus: '200' },
        { testId: 'TC-002', username: 'george.bluth@reqres.in', email: 'george.bluth@reqres.in', expectedStatus: '200' }
      ];
    }

    try {
      const sheet = this.doc.sheetsByTitle[sheetName];
      if (!sheet) {
        throw new Error(`Sheet tab "${sheetName}" not found in document.`);
      }

      const rows = await sheet.getRows();
      return rows.map((row) => row.toObject() as SheetTestData);
    } catch (error) {
      logger.error(`Error reading data from sheet ${sheetName}: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * Append test result execution log to Google Sheet
   */
  async appendTestResult(result: TestResultRow, sheetName = 'ExecutionResults'): Promise<void> {
    if (!this.isInitialized || !this.doc) {
      logger.info(`[Mock Sheets Log] Recorded result for ${result.testName}: ${result.status}`);
      return;
    }

    try {
      let sheet = this.doc.sheetsByTitle[sheetName];
      if (!sheet) {
        sheet = await this.doc.addSheet({
          title: sheetName,
          headerValues: ['testName', 'suite', 'status', 'durationMs', 'timestamp', 'errorMessage']
        });
      }

      await sheet.addRow({
        testName: result.testName,
        suite: result.suite,
        status: result.status,
        durationMs: result.durationMs,
        timestamp: result.timestamp,
        errorMessage: result.errorMessage || ''
      });

      logger.info(`Test result appended to Google Sheet "${sheetName}": ${result.testName} [${result.status}]`);
    } catch (error) {
      logger.error(`Failed to write test result to Google Sheet: ${(error as Error).message}`);
    }
  }

  /**
   * Synchronize a failed test case into the centralized "Defects Log" sheet.
   * If the defect already exists, updates the actual result and resets Retest Status to 'Pending'.
   */
  async syncDefectFailure(
    sourceSheetTitle: string,
    tcId: string,
    actualResult?: string,
    assignedTo = 'Unassigned'
  ): Promise<void> {
    if (!this.isInitialized || !this.doc) return;

    try {
      const sourceSheet = this.doc.sheetsByTitle[sourceSheetTitle];
      const defectSheet = this.doc.sheetsByTitle['Defects Log'];
      if (!sourceSheet || !defectSheet) {
        logger.warn(`Source sheet "${sourceSheetTitle}" or "Defects Log" sheet not found.`);
        return;
      }

      const sourceRows = await sourceSheet.getRows();
      const targetRow = sourceRows.find((r) => r.get('TC_ID') === tcId);
      if (!targetRow) {
        logger.warn(`TC_ID "${tcId}" not found in sheet "${sourceSheetTitle}".`);
        return;
      }

      // Update source test case status to FAILED
      targetRow.set('Status', 'FAILED');
      if (actualResult) {
        targetRow.set('Actual Result', actualResult);
      }
      await targetRow.save();

      // Check if defect entry already exists in Defects Log
      const defectRows = await defectSheet.getRows();
      const existingDefect = defectRows.find((r) => r.get('TC_ID') === tcId);
      const today = new Date().toISOString().split('T')[0];

      if (existingDefect) {
        existingDefect.set('Date', today);
        existingDefect.set('Actual Result', actualResult || targetRow.get('Actual Result'));
        existingDefect.set('Status', 'FAILED');
        existingDefect.set('Dev Status', 'New');
        existingDefect.set('Retest Status', 'Pending');
        await existingDefect.save();
        logger.info(`Updated existing defect entry in Defects Log for [${tcId}].`);
      } else {
        await defectSheet.addRow({
          'Date': today,
          'TC_ID': tcId,
          'Module': targetRow.get('Module') || 'Lead',
          'Sub Module': targetRow.get('Sub Module') || sourceSheetTitle,
          'Feature / Component': targetRow.get('Feature / Component') || '',
          'Test Scenario': targetRow.get('Test Scenario') || '',
          'Test Type': targetRow.get('Test Type') || 'UI / Functional',
          'Test Case Description': targetRow.get('Test Case Description') || '',
          'Steps to Execute': targetRow.get('Steps to Execute') || '',
          'Precondition': targetRow.get('Precondition') || '',
          'Expected Result': targetRow.get('Expected Result') || '',
          'Actual Result': actualResult || targetRow.get('Actual Result') || 'Test assertion failed',
          'Status': 'FAILED',
          'Assigned To (Developer)': assignedTo,
          'Dev Status': 'New',
          'Retest Status': 'Pending',
          'Comments': targetRow.get('Comments') || ''
        });
        logger.info(`Logged new defect into Defects Log for [${tcId}].`);
      }
    } catch (error) {
      logger.error(`Failed to synchronize defect for ${tcId}: ${(error as Error).message}`);
    }
  }

  /**
   * Reconciles Defects Log back to source test case sheets.
   * If a defect in "Defects Log" has Retest Status = "Pass", flips the corresponding
   * test case in the source sheet back to "PASSED".
   */
  async syncRetestStatusFromDefectsLog(): Promise<{ syncedCount: number }> {
    if (!this.isInitialized || !this.doc) return { syncedCount: 0 };

    let syncedCount = 0;
    try {
      const defectSheet = this.doc.sheetsByTitle['Defects Log'];
      if (!defectSheet) return { syncedCount: 0 };

      const defectRows = await defectSheet.getRows();
      const passedDefects = defectRows.filter((r) => (r.get('Retest Status') || '').toLowerCase() === 'pass');

      for (const defect of passedDefects) {
        const tcId = defect.get('TC_ID');
        const subModule = defect.get('Sub Module');
        if (!tcId) continue;

        // Try subModule first, or search across test sheets
        const targetSheets = subModule && this.doc.sheetsByTitle[subModule]
          ? [this.doc.sheetsByTitle[subModule]]
          : Object.values(this.doc.sheetsByTitle).filter((s) => s.title !== 'Defects Log');

        for (const sheet of targetSheets) {
          const rows = await sheet.getRows();
          const matchingRow = rows.find((r) => r.get('TC_ID') === tcId);
          if (matchingRow && matchingRow.get('Status') !== 'PASSED') {
            matchingRow.set('Status', 'PASSED');
            matchingRow.set('Actual Result', 'Verified and fixed upon retest.');
            await matchingRow.save();
            syncedCount++;
            logger.info(`Reconciled test case [${tcId}] in sheet "${sheet.title}" to PASSED.`);
            break;
          }
        }
      }
    } catch (error) {
      logger.error(`Error during retest status reconciliation: ${(error as Error).message}`);
    }
    return { syncedCount };
  }
}

