import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

export const Config = {
  baseUrl: process.env.BASE_URL || 'https://reqres.in',
  apiBaseUrl: process.env.API_BASE_URL || 'https://reqres.in',
  googleSheetId: process.env.GOOGLE_SHEET_ID || '',
  googleServiceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '',
  googlePrivateKeyPath: process.env.GOOGLE_PRIVATE_KEY_PATH || './credentials.json',
  env: process.env.ENV || 'staging',
  logLevel: process.env.LOG_LEVEL || 'info',
  headless: process.env.HEADLESS !== 'false',
  adminEmail: process.env.ADMIN_EMAIL || '',
  adminPassword: process.env.ADMIN_PASSWORD || ''
};
