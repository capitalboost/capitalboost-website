import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const puppeteer = require('C:/Users/lucia/AppData/Local/Temp/puppeteer-test/node_modules/puppeteer');
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1200px;
    height: 630px;
    background: radial-gradient(ellipse 80% 80% at 60% 40%, #243660 0%, transparent 70%),
                radial-gradient(ellipse 50% 60% at 10% 80%, rgba(199,91,42,0.18) 0%, transparent 60%),
                #1B2A4A;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  svg {
    width: 380px;
    height: 380px;
  }
</style>
</head>
<body>
<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <!-- Bar 1 (short) -->
  <rect x="5" y="20" width="6" height="7" rx="1.5" fill="#C75B2A"/>
  <!-- Bar 2 (medium) -->
  <rect x="13" y="15" width="6" height="12" rx="1.5" fill="#C75B2A"/>
  <!-- Bar 3 (tall) -->
  <rect x="21" y="10" width="6" height="17" rx="1.5" fill="#C75B2A"/>
</svg>
</body>
</html>`;

const browser = await puppeteer.launch({ executablePath: 'C:/Users/lucia/.cache/puppeteer/chrome/win64-146.0.7680.153/chrome-win64/chrome.exe', args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1200, height: 630 });
await page.setContent(html, { waitUntil: 'networkidle0' });
await page.screenshot({ path: path.join(__dirname, 'images/og-image.jpg'), type: 'jpeg', quality: 92 });
await browser.close();
console.log('Done: images/og-image.jpg');
