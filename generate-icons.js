/**
 * Generates the PWA / home-screen icons in ./icons from the brand logo in assets.js.
 * Usage: node generate-icons.js   (requires: npm install --no-save @resvg/resvg-js sharp)
 */
const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');
const sharp = require('sharp');

global.window = {};
eval(fs.readFileSync(path.join(__dirname, 'assets.js'), 'utf8'));
const logo = window.MARALUXE_ASSETS.logo;

// Logo is wide. Keep it inside the maskable safe zone (~62% of width).
async function icon(size, widthRatio) {
  const w = Math.round(size * widthRatio);
  // resvg can't decode WebP, so convert the logo to PNG first.
  const logoPng = await sharp(Buffer.from(logo.split(',')[1], 'base64'))
    .resize({ width: w })
    .png()
    .toBuffer();
  const meta = await sharp(logoPng).metadata();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
<rect width="100%" height="100%" fill="#131B0E"/>
<image x="${(size - meta.width) / 2}" y="${(size - meta.height) / 2}" width="${meta.width}" height="${meta.height}" href="data:image/png;base64,${logoPng.toString('base64')}"/></svg>`;
  return new Resvg(svg).render().asPng();
}

(async function () {
  const out = path.join(__dirname, 'icons');
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(path.join(out, 'icon-192.png'), await icon(192, 0.62));
  fs.writeFileSync(path.join(out, 'icon-512.png'), await icon(512, 0.62));
  fs.writeFileSync(path.join(out, 'apple-touch-icon.png'), await icon(180, 0.66));
  console.log('icons written to', out);
})();
