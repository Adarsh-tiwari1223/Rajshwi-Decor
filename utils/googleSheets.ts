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
}
