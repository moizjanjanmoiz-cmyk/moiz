const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function processLogo() {
  const inputPath = path.join(process.cwd(), 'public', 'logo.png');
  const outputPath = path.join(process.cwd(), 'public', 'logo.png');
  const transparentPath = path.join(process.cwd(), 'public', 'logo-transparent.png');
  const faviconPath = path.join(process.cwd(), 'public', 'favicon.ico');

  if (!fs.existsSync(inputPath)) {
    console.error('Input logo.png not found!');
    return;
  }

  console.log('Processing logo to make background fully transparent...');

  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const channels = info.channels;
  const width = info.width;
  const height = info.height;

  for (let i = 0; i < data.length; i += channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    if (r > 230 && g > 230 && b > 230) {
      const whiteness = (r + g + b) / 3;
      if (whiteness > 240) {
        data[i + 3] = 0;
      } else {
        const alphaFactor = 255 - (whiteness - 230) * (255 / 25);
        data[i + 3] = Math.min(a, Math.max(0, Math.floor(alphaFactor)));
      }
    }
  }

  const transparentBuffer = await sharp(data, {
    raw: {
      width,
      height,
      channels,
    },
  })
    .png()
    .toBuffer();

  fs.writeFileSync(outputPath, transparentBuffer);
  fs.writeFileSync(transparentPath, transparentBuffer);
  console.log('Successfully saved transparent logo.png and logo-transparent.png');

  const faviconBuffer = await sharp(transparentBuffer)
    .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  fs.writeFileSync(faviconPath, faviconBuffer);
  console.log('Successfully generated transparent favicon.ico');
}

processLogo().catch(err => {
  console.error('Error processing logo:', err);
  process.exit(1);
});
