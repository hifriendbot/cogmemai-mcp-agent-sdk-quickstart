import { chromium } from 'playwright';
import { fileURLToPath, pathToFileURL } from 'url';
import { dirname, join } from 'path';

const here = dirname(fileURLToPath(import.meta.url));
const html = join(here, 'hero-banner.html');
const png = join(here, 'hero-banner.png');

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1280, height: 480 },
  deviceScaleFactor: 2, // retina-quality for crisp display on github.com
});
const page = await ctx.newPage();
await page.goto(pathToFileURL(html).href, { waitUntil: 'networkidle' });
await page.waitForTimeout(900);
await page.screenshot({
  path: png,
  type: 'png',
  clip: { x: 0, y: 0, width: 1280, height: 480 },
});
await browser.close();
console.log('wrote', png);
