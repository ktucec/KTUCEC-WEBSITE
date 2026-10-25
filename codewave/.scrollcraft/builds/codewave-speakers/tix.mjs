import { chromium } from 'playwright-core';
const W = +(process.argv[2] || 390), Hh = +(process.argv[3] || 844);
const mobile = W < 900;
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const ctx = await browser.newContext({ viewport: { width: W, height: Hh }, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: 2 });
await ctx.addInitScript(() => { try { sessionStorage.setItem('cw26-intro', '1'); } catch {} });
const page = await ctx.newPage();
const errs = [];
page.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
page.on('pageerror', (e) => errs.push(String(e)));
await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
await page.waitForTimeout(2200);
// 1) hero CTA tıkla → SmartAnchors
const t0 = Date.now();
await page.locator('.hero-glass a[href="#bilet"]').first().click();
const samples = [];
for (let i = 0; i < 14; i++) { samples.push(await page.evaluate(() => Math.round(scrollY))); await page.waitForTimeout(100); }
await page.waitForTimeout(800);
const land = await page.evaluate(() => ({ y: Math.round(scrollY), top: Math.round(document.getElementById('bilet').getBoundingClientRect().top), spacer: (() => { const s = document.querySelector('#konusmacilar .pin-spacer'); if (!s) return null; const t = s.getBoundingClientRect().top + scrollY; return [Math.round(t), Math.round(t + s.offsetHeight)]; })() }));
console.log('samples', samples.join(','), 'land', JSON.stringify(land));
await page.waitForTimeout(1500);
await page.screenshot({ path: `lab-tix/${W}-a.png` });
await page.evaluate(() => scrollBy(0, innerHeight * 0.8)); await page.waitForTimeout(1500);
await page.screenshot({ path: `lab-tix/${W}-b.png` });
await page.evaluate(() => scrollBy(0, innerHeight * 0.8)); await page.waitForTimeout(1500);
await page.screenshot({ path: `lab-tix/${W}-c.png` });
const info = await page.evaluate(() => {
  const sec = document.getElementById('bilet');
  const pass = sec.querySelector('.pass'), shell = sec.querySelector('.pass-shell');
  const cs = (el) => el && { op: getComputedStyle(el).opacity, tf: getComputedStyle(el).transform, rect: el.getBoundingClientRect().toJSON() };
  return { pass: cs(pass), shell: cs(shell), sw: document.documentElement.scrollWidth, vw: innerWidth, pending: [...sec.querySelectorAll('.io-pending')].length,
    cta: sec.querySelector('.buy-cta')?.getBoundingClientRect().toJSON(), ctaText: sec.querySelector('.buy-cta')?.innerText };
});
console.log(JSON.stringify(info));
// isim yaz
await page.fill('#ticket-holder', 'Ayşe Yılmaz');
await page.waitForTimeout(700);
console.log('holder', await page.locator('.pass-holder').innerText());
await page.locator('.buy-cta').scrollIntoViewIfNeeded();
await page.screenshot({ path: `lab-tix/${W}-d.png` });
await page.locator('.buy-cta').click();
await page.waitForTimeout(1400);
await page.screenshot({ path: `lab-tix/${W}-dialog.png` });
console.log('dialog', await page.locator('[role=dialog]').count(), await page.locator('#ticket-dialog-title').innerText());
await page.keyboard.press('Escape');
await page.waitForTimeout(1200);
const after = await page.evaluate(() => { const p = document.querySelector('#bilet .pass'); return { n: document.querySelectorAll('[role=dialog]').length, tf: p && getComputedStyle(p.parentElement).transform, rect: p?.getBoundingClientRect().toJSON(), focus: document.activeElement?.className?.slice(0, 40) }; });
console.log('after', JSON.stringify(after));
await page.screenshot({ path: `lab-tix/${W}-e.png` });
console.log('errors', errs);
await browser.close();
