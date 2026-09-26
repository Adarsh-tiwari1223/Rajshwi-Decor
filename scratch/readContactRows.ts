import { GoogleSheetsService } from '../utils/googleSheets';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function run() {
  const service = new GoogleSheetsService();
  await service.initialize();
  const doc = (service as any).doc;
  const sheet = doc.sheetsByTitle['Contact'];
  const rows = await sheet.getRows();
  console.log(`Total Contact rows: ${rows.length}`);
  for (let i = 0; i < rows.length; i++) {
    const o = rows[i].toObject();
    console.log(`${i + 1}. [${o.TC_ID}] [${o['Feature / Component']}] - ${o['Test Scenario']} -> Status: ${o.Status}`);
  }
}

run().catch(console.error);
