import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';
import { fakerEN_IN as faker } from '@faker-js/faker';

export interface BulkContactRecord {
  name: string;
  email: string;
  number: number;
}

export interface UserFileInfo {
  userKey: string;
  displayName: string;
  email: string;
  filePath: string;
  records: BulkContactRecord[];
}

export const USERS_CONFIG = [
  { key: 'admin', displayName: 'Admin', email: 'admin@rajasvidecor.com' },
  { key: 'rahul', displayName: 'Rahul Sharma', email: 'rahul.sharma@gmail.com' },
  { key: 'priya', displayName: 'Priya Patel', email: 'priya.patel@gmail.com' },
  { key: 'amit', displayName: 'Amit Verma', email: 'amit.verma@gmail.com' },
  { key: 'sneha', displayName: 'Sneha Joshi', email: 'sneha.joshi@gmail.com' },
  { key: 'vikas', displayName: 'Vikas Mehta', email: 'vikas.mehta@gmail.com' },
  { key: 'uday', displayName: 'Uday', email: 'uday12@gmail.com' }
];

export function generateUserContactRecords(count = 5): BulkContactRecord[] {
  const records: BulkContactRecord[] = [];
  for (let i = 0; i < count; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const name = `${firstName} ${lastName}`;
    const cleanFirst = firstName.toLowerCase().replace(/[^a-z]/g, '');
    const cleanLast = lastName.toLowerCase().replace(/[^a-z]/g, '');
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const email = `${cleanFirst}.${cleanLast}${randomSuffix}@gmail.com`;

    // Indian 10-digit number starting with 6-9
    const prefixes = ['98', '97', '96', '99', '88', '87', '70', '79', '63'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const remaining8 = Math.floor(10000000 + Math.random() * 90000000);
    const number = parseInt(`${prefix}${remaining8}`, 10);

    records.push({ name, email, number });
  }
  return records;
}

export function createExcelFile(filePath: string, records: BulkContactRecord[]): void {
  const ws = XLSX.utils.json_to_sheet(records, { header: ['name', 'email', 'number'] });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  XLSX.writeFile(wb, filePath);
}

export function generateAllUserContactFiles(): UserFileInfo[] {
  const outputDir = path.resolve(__dirname, 'bulk_upload');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const generatedFiles: UserFileInfo[] = [];

  for (const user of USERS_CONFIG) {
    const fileName = `${user.key}_contact.xlsx`;
    const filePath = path.join(outputDir, fileName);
    const records = generateUserContactRecords(5);
    createExcelFile(filePath, records);

    generatedFiles.push({
      userKey: user.key,
      displayName: user.displayName,
      email: user.email,
      filePath,
      records
    });
    console.log(`Generated: ${fileName} with ${records.length} records for ${user.displayName}`);
  }

  return generatedFiles;
}

// Execute if run directly
if (require.main === module) {
  generateAllUserContactFiles();
}
