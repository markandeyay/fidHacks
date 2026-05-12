// Puppeteer validation script for Forte frontend
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const SHOTS_DIR = path.join(__dirname, '..', 'frontend-screenshots');
if (!fs.existsSync(SHOTS_DIR)) fs.mkdirSync(SHOTS_DIR, { recursive: true });

const BASE = 'http://localhost:3001';

const ROUTES = [
  { path: '/', name: '01-landing' },
  { path: '/?judge=true', name: '02-landing-judge-mode' },
  { path: '/negotiation', name: '03-negotiation-intro' },
  { path: '/offer-faceoff', name: '04-offer-faceoff-intro' },
  { path: '/budget-blitz', name: '05-budget-blitz-intro' },
  { path: '/side-hustle', name: '06-side-hustle-intro' },
  { path: '/market', name: '07-market-intro' },
  { path: '/debrief/negotiation', name: '08-debrief-empty' },
  { path: '/nonexistent', name: '09-not-found' },
];

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1440, height: 900 },
  });

  const results = [];

  for (const route of ROUTES) {
    const page = await browser.newPage();
    const consoleErrors = [];
    const pageErrors = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', (err) => pageErrors.push(err.message));

    const url = BASE + route.path;
    console.log(`\nVisiting ${url}`);
    try {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 45000 });
      await new Promise((r) => setTimeout(r, 1500)); // settle animations
      const shot = path.join(SHOTS_DIR, `${route.name}.png`);
      await page.screenshot({ path: shot, fullPage: true });
      console.log(`  Saved ${shot}`);
      results.push({
        route: route.path,
        name: route.name,
        ok: true,
        screenshot: shot,
        consoleErrors,
        pageErrors,
      });
    } catch (e) {
      console.log(`  FAILED: ${e.message}`);
      results.push({
        route: route.path,
        name: route.name,
        ok: false,
        error: e.message,
        consoleErrors,
        pageErrors,
      });
    } finally {
      await page.close();
    }
  }

  await browser.close();

  // Write a report
  const report = path.join(SHOTS_DIR, 'report.json');
  fs.writeFileSync(report, JSON.stringify(results, null, 2));

  console.log('\n=== SUMMARY ===');
  let totalErrors = 0;
  for (const r of results) {
    const errs = (r.consoleErrors?.length || 0) + (r.pageErrors?.length || 0);
    totalErrors += errs;
    console.log(`${r.ok ? 'OK ' : 'FAIL'}  ${r.route.padEnd(30)}  errors=${errs}`);
    if (r.pageErrors?.length) {
      r.pageErrors.forEach((e) => console.log(`     [pageerror] ${e}`));
    }
    if (r.consoleErrors?.length) {
      r.consoleErrors.slice(0, 5).forEach((e) => console.log(`     [console]   ${e.substring(0, 200)}`));
    }
  }
  console.log(`\nTotal errors across pages: ${totalErrors}`);
  console.log(`Report written to: ${report}`);
})();
