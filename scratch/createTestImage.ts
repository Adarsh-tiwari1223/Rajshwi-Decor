import fs from 'fs';
import path from 'path';

// Valid 1x1 transparent PNG buffer
const pngBuffer = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);

const targetDir = path.resolve(__dirname, '../../testdata/masters');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const targetFile = path.join(targetDir, 'sampleCandle.png');
fs.writeFileSync(targetFile, pngBuffer);
console.log('Sample candle image written to:', targetFile);
