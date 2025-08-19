const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const yarnsDir = path.join(__dirname, 'yarns');
const outputFile = path.join(__dirname, 'yarnColors.json');

async function getAverageColor(image) {
  const metadata = await image.metadata();
  const { width, height, channels } = metadata;
  const { data } = await image.raw().toBuffer({ resolveWithObject: true });

  const squareSize = Math.floor(width * 0.3);
  const x0 = Math.floor((width - squareSize) / 2);
  const y0 = Math.floor(height * 0.3);
  const yLimit = Math.floor(height / 3);

  let rSum = 0, gSum = 0, bSum = 0, count = 0;
  for (let y = y0; y < y0 + squareSize && y < height && y < yLimit; y++) {
    for (let x = x0; x < x0 + squareSize && x < width; x++) {
      const idx = (y * width + x) * channels;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const a = channels === 4 ? data[idx + 3] : 255;
      // Ignore almost-white pixels (tolerance: 245)
      if (
        a > 0 &&
        !(r > 245 && g > 245 && b > 245)
      ) {
        rSum += r;
        gSum += g;
        bSum += b;
        count++;
      }
    }
  }
  if (count === 0) return null;
  const rAvg = Math.round(rSum / count);
  const gAvg = Math.round(gSum / count);
  const bAvg = Math.round(bSum / count);
  return `#${[rAvg, gAvg, bAvg].map(x => x.toString(16).padStart(2, '0')).join('')}`;
}

async function processYarnImages() {
  const result = {};
  const files = fs.readdirSync(yarnsDir).filter(f =>
    /\.(png|jpg|jpeg)$/i.test(f)
  );
  for (const file of files) {
    const filePath = path.join(yarnsDir, file);
    try {
      const image = sharp(filePath);
      const color = await getAverageColor(image);
      result[file] = color;
      console.log(`${file}: ${color}`);
    } catch (e) {
      console.error(`Error processing ${file}:`, e.message);
    }
  }
  fs.writeFileSync(outputFile, JSON.stringify(result, null, 2));
  console.log('Result saved to yarnColors.json');
}

processYarnImages().then(r => r);