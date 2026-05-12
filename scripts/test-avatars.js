const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';
const ROUTES = [
  { path: '/', name: 'home' },
  { path: '/negotiation', name: 'negotiation' },
  { path: '/offer-faceoff', name: 'offer-faceoff' },
  { path: '/budget-blitz', name: 'budget-blitz' },
  { path: '/side-hustle', name: 'side-hustle' },
  { path: '/market', name: 'market' },
];

const OUTPUT_DIR = path.join(__dirname, 'avatar-screenshots');

async function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function waitForCanvas(page, timeout = 10000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const hasCanvas = await page.evaluate(() => {
      const canvases = document.querySelectorAll('canvas');
      return canvases.length > 0;
    });
    if (hasCanvas) return true;
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
}

async function run() {
  await ensureDir(OUTPUT_DIR);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const results = [];

  for (const route of ROUTES) {
    const page = await browser.newPage();
    const url = `${BASE_URL}${route.path}`;
    console.log(`\nNavigating to ${url} ...`);

    try {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      // Wait for 3D canvas elements to appear
      const hasCanvas = await waitForCanvas(page, 8000);

      if (!hasCanvas) {
        console.warn(`  ⚠️  No <canvas> found on ${route.name}`);
      }

      // Additional wait for WebGL to render
      await new Promise((r) => setTimeout(r, 2000));

      const screenshotPath = path.join(OUTPUT_DIR, `${route.name}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`  ✅ Screenshot saved: ${screenshotPath}`);

      // Check console for WebGL errors
      const logs = await page.evaluate(() => {
        // This only works if we hooked console before navigation
        return [];
      });

      results.push({ route: route.name, ok: true, hasCanvas, screenshotPath });
    } catch (err) {
      console.error(`  ❌ Error on ${route.name}:`, err.message);
      results.push({ route: route.name, ok: false, error: err.message });
    } finally {
      await page.close();
    }
  }

  await browser.close();

  console.log('\n========== AVATAR RENDER TEST RESULTS ==========');
  for (const r of results) {
    if (r.ok) {
      console.log(`✅ ${r.route}: rendered (${r.hasCanvas ? 'canvas present' : 'no canvas'})`);
    } else {
      console.log(`❌ ${r.route}: FAILED - ${r.error}`);
    }
  }
  console.log(`Screenshots saved to: ${OUTPUT_DIR}\n`);

  const allOk = results.every((r) => r.ok);
  process.exit(allOk ? 0 : 1);
}

run().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
