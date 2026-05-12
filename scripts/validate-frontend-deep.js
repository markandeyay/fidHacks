// Deeper validation — inspect DOM for key collage elements
const puppeteer = require('puppeteer');

const BASE = 'http://localhost:3001';

const CHECKS = [
  {
    path: '/',
    name: 'Landing',
    expectations: [
      { selector: 'img[src="/mascot/forte-cat-idle.svg"]', desc: 'forte cat mascot present' },
      { selector: 'img[src*="lightning-star"]', desc: 'lightning star decorations present' },
      { selector: 'img[src="/textures/star-burst-black.svg"]', desc: 'black starburst frame present' },
      { textIncludes: 'MASTER YOUR', desc: 'hero headline present' },
      { textIncludes: 'COSTS TOO MUCH', desc: 'collage-style window card title present' },
      { textIncludes: 'NEGOTIATE', desc: 'negotiate window title present' },
      { fontFamilyIncludes: 'Permanent Marker', desc: 'marker font loaded somewhere' },
    ],
  },
  {
    path: '/negotiation',
    name: 'Negotiation Intro',
    expectations: [
      { selector: 'img[src*="lightning-star"]', desc: 'lightning star in intro hero' },
      { textIncludes: 'Negotiation Room', desc: 'page title' },
      { textIncludes: 'Select difficulty', desc: 'difficulty picker label' },
    ],
  },
  {
    path: '/budget-blitz',
    name: 'Budget Blitz Intro',
    expectations: [
      { textIncludes: 'Budget Blitz', desc: 'page title' },
      { textIncludes: 'Personal Mode', desc: 'personal mode toggle present' },
    ],
  },
  {
    path: '/market',
    name: 'Market Intro',
    expectations: [
      { textIncludes: 'The Market', desc: 'page title' },
    ],
  },
  {
    path: '/side-hustle',
    name: 'Side Hustle Intro',
    expectations: [
      { textIncludes: 'Side Hustle', desc: 'page title' },
    ],
  },
  {
    path: '/offer-faceoff',
    name: 'Offer Face-Off Intro',
    expectations: [
      { textIncludes: 'Offer Face-Off', desc: 'page title' },
    ],
  },
  {
    path: '/nonexistent',
    name: '404',
    expectations: [
      { textIncludes: '404', desc: '404 heading' },
      { textIncludes: 'PAGE NOT FOUND', desc: '404 sticker label' },
      { selector: 'img[src="/mascot/forte-cat-surprised.svg"]', desc: 'surprised mascot' },
    ],
  },
];

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const results = [];

  for (const check of CHECKS) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    const url = BASE + check.path;
    console.log(`\n=== ${check.name} (${check.path}) ===`);

    try {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 45000 });
      await new Promise((r) => setTimeout(r, 1000));

      const body = await page.evaluate(() => document.body.innerText);
      const html = await page.content();

      let pass = 0, fail = 0;
      const failures = [];

      for (const exp of check.expectations) {
        let found = false;
        if (exp.selector) {
          found = await page.evaluate((sel) => !!document.querySelector(sel), exp.selector);
        } else if (exp.textIncludes) {
          found = body.includes(exp.textIncludes) || html.includes(exp.textIncludes);
        } else if (exp.fontFamilyIncludes) {
          const fonts = await page.evaluate(() => {
            const all = document.querySelectorAll('*');
            const set = new Set();
            for (const el of all) {
              const ff = getComputedStyle(el).fontFamily;
              if (ff) set.add(ff);
            }
            return Array.from(set);
          });
          found = fonts.some((f) => f.includes(exp.fontFamilyIncludes));
          if (!found) console.log(`     fonts seen:`, fonts.slice(0, 5).join(' | '));
        }
        if (found) { pass++; console.log(`  PASS  ${exp.desc}`); }
        else { fail++; failures.push(exp.desc); console.log(`  FAIL  ${exp.desc}`); }
      }

      results.push({ name: check.name, path: check.path, pass, fail, failures });
    } catch (e) {
      console.log(`  ERROR: ${e.message}`);
      results.push({ name: check.name, path: check.path, pass: 0, fail: check.expectations.length, error: e.message });
    } finally {
      await page.close();
    }
  }

  await browser.close();

  console.log('\n\n========== SUMMARY ==========');
  let totalPass = 0, totalFail = 0;
  for (const r of results) {
    totalPass += r.pass;
    totalFail += r.fail;
    console.log(`${r.name.padEnd(28)} pass=${r.pass} fail=${r.fail}`);
  }
  console.log(`\nOVERALL: ${totalPass} pass, ${totalFail} fail`);
  process.exit(totalFail > 0 ? 1 : 0);
})();
