import { chromium } from 'playwright-core';
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const ctx = await browser.newContext({ viewport: { width: 320, height: 640 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
await ctx.addInitScript(() => { try { sessionStorage.setItem('cw26-intro', '1'); } catch {} });
const page = await ctx.newPage();
await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
await page.evaluate(() => document.querySelector('.price-panel').scrollIntoView({ block: 'center' }));
await page.waitForTimeout(2600);
await page.screenshot({ path: 'lab-tix/320-price.png' });
// satış açıkken etiket sığıyor mu (metni geçici olarak değiştirerek ölç)
const r = await page.evaluate(() => {
  const b = document.querySelector('.buy-cta');
  b.querySelectorAll(':scope > span')[1].textContent = 'Hemen satın al';
  const p = document.createElement('span'); p.className = 'price'; p.textContent = '100 TL'; b.querySelector('svg').before(p);
  b.style.animation = 'none';
  return { sw: b.scrollWidth, cw: b.clientWidth };
});
console.log(JSON.stringify(r));
await page.evaluate(() => document.querySelector('.buy-cta').scrollIntoView({ block: 'center' })); await page.waitForTimeout(1800);
await page.screenshot({ path: 'lab-tix/320-open.png' });
await browser.close();
