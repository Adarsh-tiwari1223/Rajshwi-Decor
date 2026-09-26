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
  adminPassword: process.env.ADMIN_PASSWORD || '',
  users: [
    { name: 'Admin', email: process.env.ADMIN_EMAIL || '', password: process.env.ADMIN_PASSWORD || '' },
    { name: 'Rahul Sharma', email: process.env.USER_RAHUL_EMAIL || '', password: process.env.USER_RAHUL_PASSWORD || '' },
    { name: 'Priya Patel', email: process.env.USER_PRIYA_EMAIL || '', password: process.env.USER_PRIYA_PASSWORD || '' },
    { name: 'Amit Verma', email: process.env.USER_AMIT_EMAIL || '', password: process.env.USER_AMIT_PASSWORD || '' },
    { name: 'Sneha Joshi', email: process.env.USER_SNEHA_EMAIL || '', password: process.env.USER_SNEHA_PASSWORD || '' },
    { name: 'Vikas Mehta', email: process.env.USER_VIKAS_EMAIL || '', password: process.env.USER_VIKAS_PASSWORD || '' },
    { name: 'Uday', email: process.env.USER_UDAY_EMAIL || '', password: process.env.USER_UDAY_PASSWORD || '' },
    { name: 'Aakhnsha shrivastav', email: process.env.USER_AKANKSHA_EMAIL || 'aakanshashrivastava12@gmail.com', password: process.env.USER_AKANKSHA_PASSWORD || '1wPKPZj44z' }
  ]
};

export * from './userResolver';

