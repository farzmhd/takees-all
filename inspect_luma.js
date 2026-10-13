const fs = require('fs');
const zlib = require('zlib');

const buf = fs.readFileSync('assets/logos/luma.png');
// Let's parse PNG chunks
let pos = 8;
let idatChunks = [];
let width = 0, height = 0, bitDepth = 0, colorType = 0;

while (pos < buf.length) {
  const len = buf.readUInt32BE(pos);
  const type = buf.toString('ascii', pos + 4, pos + 8);
  const data = buf.slice(pos + 8, pos + 8 + len);
  if (type === 'IHDR') {
    width = data.readUInt32BE(0);
    height = data.readUInt32BE(4);
    bitDepth = data[8];
    colorType = data[9];
    console.log({ width, height, bitDepth, colorType });
  } else if (type === 'IDAT') {
    idatChunks.push(data);
  }
  pos += 12 + len;
}

const idat = Buffer.concat(idatChunks);
const raw = zlib.inflateSync(idat);
console.log('Uncompressed raw bytes length:', raw.length, 'expected ~', height * (1 + width * 4));

// Sample some pixel RGBA values
const stride = 1 + width * 4;
let nonZeroCount = 0;
let colors = new Set();
for (let y = 0; y < height; y++) {
  const rowStart = y * stride + 1; // skip filter byte
  for (let x = 0; x < width; x++) {
    const idx = rowStart + x * 4;
    const r = raw[idx], g = raw[idx + 1], b = raw[idx + 2], a = raw[idx + 3];
    if (a > 0) {
      nonZeroCount++;
      colors.add(`${r},${g},${b},${a}`);
    }
  }
}
console.log('Non-transparent pixels:', nonZeroCount, 'out of', width * height);
console.log('Unique colors (sample 10):', Array.from(colors).slice(0, 10));
