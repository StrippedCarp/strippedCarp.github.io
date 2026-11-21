/**
 * Regenerates the branded QR SVGs (light + dark) and updates the URL shown in qr.html.
 *
 * Usage:   node generate-qr.js https://your-final-domain.com/
 * Requires: npm install --no-save qrcode   (node_modules is git-ignored)
 *
 * Uses error-correction level H so the centre logo never breaks scanning.
 * Re-run this whenever the public address changes, then reprint.
 */
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');

const url = process.argv[2];
if (!url || !/^https:\/\/[^\s]+$/.test(url)) {
  console.error('Usage: node generate-qr.js https://your-final-domain.com/');
  process.exit(1);
}

const qr = QRCode.create(url, { errorCorrectionLevel: 'H' });
const n = qr.modules.size;
const SIZE = 984; // drawable area inside the 1100px frame (58px margin)
const m = SIZE / n;
const f = (v) => +v.toFixed(3);

// Merge horizontal runs of dark modules into single rects for a small, crisp path.
let d = '';
for (let y = 0; y < n; y++) {
  let x = 0;
  while (x < n) {
    if (!qr.modules.get(x, y)) { x++; continue; }
    let run = 1;
    while (x + run < n && qr.modules.get(x + run, y)) run++;
    d += `M ${f(x * m)},${f(y * m)} l ${f(run * m)},0 0,${f(m)} ${f(-run * m)},0 z `;
    x += run;
  }
}
d = d.trim();

['maraluxe-qr-light.svg', 'maraluxe-qr-dark.svg'].forEach((file) => {
  const p = path.join(__dirname, file);
  let svg = fs.readFileSync(p, 'utf8');
  const re = /(<path fill="[^"]+" d=")[^"]*(")/;
  if (!re.test(svg)) throw new Error('QR path not found in ' + file);
  svg = svg.replace(re, (_, a, b) => a + d + b);
  fs.writeFileSync(p, svg);
  console.log('updated', file, `(${n}x${n} modules)`);
});

const htmlPath = path.join(__dirname, 'qr.html');
let html = fs.readFileSync(htmlPath, 'utf8');
html = html.replace(
  /<a href="https:\/\/[^"]+" target="_blank">\s*<strong>[^<]*<\/strong>/,
  `<a href="${url}" target="_blank" rel="noopener noreferrer">\n<strong>${url}</strong>`
);
fs.writeFileSync(htmlPath, html);
console.log('updated qr.html ->', url);
