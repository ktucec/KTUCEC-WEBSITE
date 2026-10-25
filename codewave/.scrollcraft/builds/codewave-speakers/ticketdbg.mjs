import { chromium } from 'playwright-core';
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
await ctx.addInitScript(() => { try { sessionStorage.setItem('cw26-intro', '1'); } catch {} });
const page = await ctx.newPage();
await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);
// normal kaydırma ile bilet bölümüne in
const H = await page.evaluate(() => document.getElementById('bilet').getBoundingClientRect().top + scrollY);
for (let y = 0; y <= H; y += 500) { await page.evaluate((yy) => scrollTo(0, yy), y); await page.waitForTimeout(80); }
await page.evaluate((y) => scrollTo(0, y), H);
await page.waitForTimeout(1800);
await page.screenshot({ path: 'lab-hero2/tickets-390-a.png' });
await page.evaluate(() => scrollBy(0, 600));
await page.waitForTimeout(1500);
await page.screenshot({ path: 'lab-hero2/tickets-390-b.png' });
const info = await page.evaluate(() => {
  const sec = document.getElementById('bilet');
  const pass = sec.querySelector('.pass');
  const ph = pass?.closest('[data-io]');
  const cs = (el) => el && { op: getComputedStyle(el).opacity, tf: getComputedStyle(el).transform, cls: el.className.slice(0, 80), rect: el.getBoundingClientRect().toJSON() };
  return { section: sec.getBoundingClientRect().toJSON(), pass: cs(pass), placeholder: cs(ph), pending: [...sec.querySelectorAll('.io-pending')].map((e) => e.className.slice(0, 40)) };
});
console.log(JSON.stringify(info, null, 1));
await browser.close();
