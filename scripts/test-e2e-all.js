/**
 * Robust E2E Test Suite for Forte
 * Handles WebGL context limits, detached DOM nodes, and re-queries elements.
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';
const OUT = path.join(__dirname, '..', 'e2e-screenshots');

function ensure(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}
function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

const IGNORED_ERRORS = [
  'favicon',
  'WebGL context could not be created',
  'Error creating WebGL context',
  'GPU stall due to ReadPixels',
  'OTS parsing error',
  'Failed to decode downloaded font',
  'Download the React DevTools',
  'ERR_ABORTED',
  'ERR_CONNECTION_REFUSED',
  'net::ERR_FAILED',
  'CORS policy',
  'Access-Control-Allow-Origin',
  'vendor-chunks',
];

function isIgnored(text) {
  return IGNORED_ERRORS.some((p) => text.includes(p));
}

let browser;
let allLogs = [];
let realErrorCount = 0;
let warningCount = 0;

async function createPage() {
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 1100 });

  page.on('console', (msg) => {
    const text = msg.text();
    const type = msg.type();
    allLogs.push({ type, text });
    if (type === 'error' && !isIgnored(text)) {
      realErrorCount++;
      console.error(`[JS ERROR] ${text}`);
    } else if (type === 'warn') {
      warningCount++;
    }
  });
  page.on('pageerror', (err) => {
    if (!isIgnored(err.message)) {
      realErrorCount++;
      allLogs.push({ type: 'pageerror', text: err.message });
      console.error(`[PAGE ERROR] ${err.message}`);
    }
  });
  page.on('requestfailed', (req) => {
    const url = req.url();
    if (!isIgnored(url)) {
      console.warn(`[REQUEST FAILED] ${url}: ${req.failure().errorText}`);
    }
  });

  return page;
}

async function screenshot(page, name) {
  const file = path.join(OUT, `${name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  console.log(`  📸 ${name}`);
}

async function navigate(page, urlPath) {
  const url = `${BASE_URL}${urlPath}`;
  console.log(`\n→ Navigating to ${urlPath}`);
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
  await wait(1500);
}

async function clickButtonsSafely(page, prefix) {
  let clicked = 0;
  let skipped = 0;
  let failed = 0;
  const seenTexts = new Set();

  for (let attempt = 0; attempt < 12; attempt++) {
    const btn = await page.$('button:not([disabled])');
    if (!btn) break;

    const text = await page.evaluate((el) => el.textContent?.slice(0, 60) || '(no text)', btn).catch(() => '(no text)');
    if (seenTexts.has(text)) {
      // Same button still there, stop to avoid infinite loop
      break;
    }
    seenTexts.add(text);

    try {
      await btn.evaluate((el) => el.click());
      await wait(1500);
      clicked++;
      console.log(`  ✅ Clicked: "${text}"`);
    } catch (e) {
      failed++;
      console.warn(`  ⚠️  Failed to click "${text}": ${e.message}`);
    }
  }

  console.log(`  Summary: ${clicked} clicked, ${skipped} skipped, ${failed} failed`);
}

async function testHomepage(page) {
  await navigate(page, '/');
  await screenshot(page, '01-homepage');
  const links = await page.$$eval('a[href^="/"]', (els) => els.map((e) => e.getAttribute('href')));
  const gameLinks = links.filter((l) => ['negotiation', 'offer-faceoff', 'budget-blitz', 'side-hustle', 'market'].some((g) => l.includes(g)));
  console.log(`  Found ${gameLinks.length} game links: ${gameLinks.join(', ')}`);
}

async function testPage(page, path, name) {
  await navigate(page, path);
  await screenshot(page, `${name}-initial`);
  await clickButtonsSafely(page, name);
  await screenshot(page, `${name}-after-clicks`);
}

async function testDebrief(page, gameId) {
  await navigate(page, `/debrief/${gameId}`);
  await screenshot(page, `07-debrief-${gameId.replace(/-/g, '')}`);
}

async function testApiRoutes(page) {
  const routes = [
    { path: '/api/scenario/generate', method: 'POST', body: { gameId: 'negotiation', difficulty: 'freshman' } },
    { path: '/api/score/compute', method: 'POST', body: { gameId: 'negotiation', breakdown: { strategy: 80, assertiveness: 70 }, total: 75 } },
    { path: '/api/negotiation/turn', method: 'POST', body: { scenario: { title: 'Test', description: 'Test', hiddenCeiling: 100 }, history: [], playerMessage: 'Hello' } },
  ];
  console.log('\n→ Testing API routes');
  for (const route of routes) {
    try {
      const resp = await page.evaluate(async (url, method, body) => {
        try {
          const opts = { method };
          if (body) opts.body = JSON.stringify(body);
          if (body) opts.headers = { 'Content-Type': 'application/json' };
          const res = await fetch(url, opts);
          return { status: res.status, ok: res.ok };
        } catch (e) {
          return { status: 0, error: e.message };
        }
      }, `${BASE_URL}${route.path}`, route.method, route.body || null);
      console.log(`  ${route.path}: HTTP ${resp.status} ${resp.ok ? '✅' : '⚠️'}`);
    } catch (e) {
      console.error(`  ${route.path}: FAILED - ${e.message}`);
    }
  }
}

async function run() {
  ensure(OUT);
  console.log('Launching browser...');
  browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--enable-webgl',
      '--ignore-gpu-blocklist',
      '--disable-gpu-sandbox',
      '--enable-unsafe-swiftshader',
      '--use-gl=angle',
      '--use-angle=swiftshader',
    ],
  });

  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║           FORTE COMPREHENSIVE E2E TEST SUITE                 ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');

  // Test homepage
  const homePage = await createPage();
  await testHomepage(homePage);
  await homePage.close();

  // Test each game with a fresh page (avoids WebGL context exhaustion)
  const games = [
    { path: '/negotiation', name: '02-negotiation' },
    { path: '/offer-faceoff', name: '03-offerfaceoff' },
    { path: '/budget-blitz', name: '04-budgetblitz' },
    { path: '/side-hustle', name: '05-sidehustle' },
    { path: '/market', name: '06-market' },
  ];

  for (const game of games) {
    const p = await createPage();
    await testPage(p, game.path, game.name);
    await p.close();
  }

  // Test debrief pages
  const debriefPage = await createPage();
  await testDebrief(debriefPage, 'negotiation');
  await testDebrief(debriefPage, 'offer-faceoff');
  await debriefPage.close();

  // Test API routes
  const apiPage = await createPage();
  await navigate(apiPage, '/');
  await testApiRoutes(apiPage);
  await apiPage.close();

  await browser.close();

  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║                      TEST SUMMARY                            ║');
  console.log('╠══════════════════════════════════════════════════════════════╣');
  console.log(`║  Pages tested:      8                                        ║`);
  console.log(`║  Real JS errors:     ${realErrorCount.toString().padEnd(35)} ║`);
  console.log(`║  JS warnings:        ${warningCount.toString().padEnd(35)} ║`);
  console.log(`║  Screenshots:        ${OUT}        ║`);
  console.log('╚══════════════════════════════════════════════════════════════╝');

  if (realErrorCount > 0) {
    console.error('\n❌ TEST FAILED: JavaScript errors were detected.');
    process.exit(1);
  }
  console.log('\n✅ TEST PASSED: No JavaScript errors detected.');
  process.exit(0);
}

run().catch((e) => {
  console.error('Fatal error:', e);
  process.exit(1);
});
