import { chromium } from 'playwright-core';
const W = +(process.argv[2] || 390), H = +(process.argv[3] || 844);
const mobile = W < 900;
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const ctx = await browser.newContext({ viewport: { width: W, height: H }, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: 1 });
await ctx.addInitScript(() => { try { sessionStorage.setItem('cw26-intro', '1'); } catch {} });
const page = await ctx.newPage();
const errs = [];
page.on('pageerror', (e) => errs.push(String(e)));
page.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
const top = await page.evaluate(() => { const s = document.querySelector('#konusmacilar .pin-spacer') || document.querySelector('.st'); return s.getBoundingClientRect().top + scrollY; });
const introOp = () => page.evaluate(() => { const a = document.querySelector('.st-intro'), b = document.querySelector('.st-intro-inner'); return [+getComputedStyle(a).opacity, +getComputedStyle(b).opacity].map((x) => x.toFixed(2)).join('/'); });
// yaklaşırken
for (let y = top - H; y <= top; y += 120) { await page.evaluate((yy) => scrollTo(0, yy), y); await page.waitForTimeout(60); }
await page.waitForTimeout(1400);
console.log('at pin start intro', await introOp());
await page.screenshot({ path: `lab-sp/${W}-intro.png` });
await page.evaluate((y) => scrollTo(0, y + innerHeight * 0.9), top); await page.waitForTimeout(1500);
console.log('after ~0.9vh intro', await introOp(), 'rail live', await page.evaluate(() => document.querySelector('.st-rail').classList.contains('is-live')));
await page.evaluate((y) => scrollTo(0, y + innerHeight * 2.4), top); await page.waitForTimeout(1500);
console.log('rail live', await page.evaluate(() => document.querySelector('.st-rail').classList.contains('is-live')));
await page.screenshot({ path: `lab-sp/${W}-before.png` });
for (const i of [3, 1, 4, 5]) {
  const box = await page.locator('.st-slot').nth(i).boundingBox();
  if (mobile) await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2); else await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await page.waitForTimeout(500);
  const st = await page.evaluate((k) => {
    const pt = document.querySelectorAll('.st-portrait')[k], pl = document.querySelector(`.st-plate-${k}`);
    const cur = [...document.querySelectorAll('.st-slot')].findIndex((s) => s.classList.contains('is-current'));
    return { y: Math.round(scrollY), portrait: pt && getComputedStyle(pt).clipPath + ' op' + getComputedStyle(pt).opacity, plate: pl && (+getComputedStyle(pl).opacity).toFixed(2), name: pl?.querySelector('.st-plate-name')?.textContent, current: cur, cells: [...document.querySelectorAll('.st-cell-photo')].map((c) => getComputedStyle(c).opacity).join('') };
  }, i);
  console.log('click', i, JSON.stringify(st));
  await page.screenshot({ path: `lab-sp/${W}-jump-${i}.png` });
}
console.log('errors', errs);
await browser.close();
