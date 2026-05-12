// Interactive flow validation — click into games and capture mid-game state
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const SHOTS_DIR = path.join(__dirname, '..', 'frontend-screenshots');
const BASE = 'http://localhost:3001';

const FLOWS = [
  {
    name: '10-difficulty-selected',
    path: '/negotiation',
    actions: async (page) => {
      // Find and click "Freshman" difficulty card
      await page.waitForSelector('button', { timeout: 10000 });
      const clicked = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const target = buttons.find((b) => b.innerText.toLowerCase().includes('freshman'));
        if (target) { target.click(); return true; }
        return false;
      });
      if (!clicked) console.log('  (could not find freshman button)');
      await new Promise((r) => setTimeout(r, 800));
    },
  },
  {
    name: '11-budget-blitz-personal-mode',
    path: '/budget-blitz',
    actions: async (page) => {
      // Click the toggle for personal mode
      await new Promise((r) => setTimeout(r, 600));
      const toggled = await page.evaluate(() => {
        const tracks = Array.from(document.querySelectorAll('.toggle-track'));
        if (tracks.length > 0) { tracks[0].click(); return true; }
        // fallback: any button containing "Personal"
        const btns = Array.from(document.querySelectorAll('button, [role="switch"]'));
        const t = btns.find((b) => b.getAttribute('aria-checked') !== null);
        if (t) { t.click(); return true; }
        return false;
      });
      if (!toggled) console.log('  (could not toggle personal mode)');
      await new Promise((r) => setTimeout(r, 600));
    },
  },
  {
    name: '12-judge-mode-radar',
    path: '/?judge=true',
    actions: async (page) => {
      // Just scroll to the bottom so the radar is in view
      await new Promise((r) => setTimeout(r, 1500));
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await new Promise((r) => setTimeout(r, 800));
    },
  },
];

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox'],
    defaultViewport: { width: 1440, height: 900 },
  });

  for (const flow of FLOWS) {
    const page = await browser.newPage();
    const errors = [];
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', (e) => errors.push('[pageerror] ' + e.message));

    console.log(`\n=== ${flow.name} ===`);
    try {
      await page.goto(BASE + flow.path, { waitUntil: 'networkidle2', timeout: 45000 });
      await new Promise((r) => setTimeout(r, 1500));
      await flow.actions(page);
      const shot = path.join(SHOTS_DIR, `${flow.name}.png`);
      await page.screenshot({ path: shot, fullPage: true });
      console.log(`  Saved ${shot}`);
      if (errors.length) {
        console.log(`  errors=${errors.length}`);
        errors.slice(0, 3).forEach((e) => console.log(`     ${e.substring(0, 200)}`));
      } else {
        console.log(`  no errors`);
      }
    } catch (e) {
      console.log(`  FAIL: ${e.message}`);
    } finally {
      await page.close();
    }
  }

  await browser.close();
  console.log('\nDone.');
})();
