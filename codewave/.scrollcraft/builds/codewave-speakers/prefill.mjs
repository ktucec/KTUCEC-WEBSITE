import { chromium } from 'playwright-core';
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
await ctx.addInitScript(() => { try { sessionStorage.setItem('cw26-intro', '1'); } catch {} });
const page = await ctx.newPage();
const errs = [];
page.on('pageerror', (e) => errs.push(String(e)));
page.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);
console.log('cta', await page.locator('.buy-cta').innerText());
for (const name of ['Barış Demir', 'Ali Can Yılmaz', 'Mehmet', '  Ayşe   Nur  Kaya  ']) {
  await page.fill('#ticket-holder', name);
  await page.locator('.buy-cta').click();
  await page.waitForTimeout(1000);
  const v = await page.evaluate(() => [document.getElementById('ticket-firstName')?.value, document.getElementById('ticket-lastName')?.value]);
  console.log(JSON.stringify(name), '→', JSON.stringify(v));
  if (name === 'Barış Demir') await page.screenshot({ path: 'lab-tix/prefill.png' });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(900);
}
console.log('errors', errs);
await browser.close();
