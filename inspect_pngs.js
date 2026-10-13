const fs = require('fs');
const zlib = require('zlib');

function checkPng(file) {
  try {
    const buf = fs.readFileSync(file);
    let pos = 8;
    let idatChunks = [];
    let width = 0, height = 0;
    while (pos < buf.length) {
      const len = buf.readUInt32BE(pos);
      const type = buf.toString('ascii', pos + 4, pos + 8);
      const data = buf.slice(pos + 8, pos + 8 + len);
      if (type === 'IHDR') {
        width = data.readUInt32BE(0);
        height = data.readUInt32BE(4);
      } else if (type === 'IDAT') {
        idatChunks.push(data);
      }
      pos += 12 + len;
    }
    const raw = zlib.inflateSync(Buffer.concat(idatChunks));
    const stride = 1 + width * 4;
    let sample = [];
    for (let y = 0; y < height && sample.length < 5; y++) {
      for (let x = 0; x < width && sample.length < 5; x++) {
        const idx = y * stride + 1 + x * 4;
        if (raw[idx + 3] > 100) {
          sample.push(`rgb(${raw[idx]},${raw[idx+1]},${raw[idx+2]})`);
        }
      }
    }
    console.log(file, 'dim:', `${width}x${height}`, 'sample visible pixel colors:', sample);
  } catch (e) {
    console.log(file, 'error:', e.message);
  }
}

['chatgpt.png', 'dalle.png', 'elevenlabs.png', 'runway.png', 'opusclip.png', 'midjourney.png', 'luma.png'].forEach(f => {
  checkPng('assets/logos/' + f);
});
