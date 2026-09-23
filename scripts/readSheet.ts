import { GoogleSheetsService } from '../utils/googleSheets';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function inspectSpreadsheet() {
  const service = new GoogleSheetsService();
  console.log('Initializing Google Sheets Service...');
  const success = await service.initialize();
  if (!success) {
    console.error('Failed to initialize Google Sheets service.');
    return;
  }

  const doc = (service as any).doc;
  console.log(`\nSpreadsheet Title: "${doc.title}"`);
  console.log(`Spreadsheet ID: ${doc.spreadsheetId}`);
  
  const sheets = Object.values(doc.sheetsByTitle) as any[];
  console.log(`\nFound ${sheets.length} sheet(s):`);

  for (const sheet of sheets) {
    console.log(`--------------------------------------------------`);
    console.log(`Sheet Name: "${sheet.title}" (Rows: ${sheet.rowCount}, Cols: ${sheet.columnCount})`);
    try {
      const rows = await sheet.getRows({ limit: 5 });
      console.log(`Sample Rows Count: ${rows.length}`);
      if (rows.length > 0) {
        console.log('Columns:', sheet.headerValues || Object.keys(rows[0].toObject()));
        rows.slice(0, 3).forEach((r: any, idx: number) => {
          console.log(` Row ${idx + 1}:`, JSON.stringify(r.toObject()));
        });
      } else {
        console.log(' [Empty sheet or header only]');
      }
    } catch (err: any) {
      console.log(` (Could not fetch rows: ${err.message})`);
    }
  }
}

inspectSpreadsheet().catch(console.error);
