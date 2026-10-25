// Dalga gerçekten hareket ediyor mu, gözlemci girişleri açılıyor mu, tüm sayfa kaydırılınca gizli öğe kalıyor mu?
import { chromium } from 'playwright-core';
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
for (const [name, opts] of [['phone 320', { viewport: { width: 320, height: 568 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }], ['phone 390', { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }], ['desktop 1440', { viewport: { width: 1440, height: 900 } }]]) {
  const ctx = await browser.newContext(opts);
  await ctx.addInitScript(() => { try { sessionStorage.setItem('cw26-intro', '1'); } catch {} });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errors.push(m.text().slice(0, 140)); });
  page.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message.slice(0, 140)));
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3500);
  const snap = () => page.evaluate(() => [...document.querySelectorAll('.hero-title .t-char')].map((c) => getComputedStyle(c).transform));
  const a = await snap(); await page.waitForTimeout(700); const b = await snap();
  const moving = a.filter((t, i) => t !== b[i]).length;
  const kicker = await page.evaluate(() => { const k = document.querySelector('.hero-kicker'); return k.scrollWidth <= k.clientWidth + 1 && k.getBoundingClientRect().right <= innerWidth; });
  const pendingAtStart = await page.evaluate(() => document.querySelectorAll('.io-pending').length);
  const H = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y <= H; y += 400) { await page.evaluate((yy) => scrollTo(0, yy), y); await page.waitForTimeout(90); }
  await page.waitForTimeout(1500);
  const after = await page.evaluate(() => ({ pending: document.querySelectorAll('.io-pending').length, revealed: document.querySelectorAll('.io-in').length, overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth }));
  console.log(`${name}: letters ${a.length}, moving in 0.7s ${moving}; kicker fits ${kicker}; reveals waiting ${pendingAtStart} → after full scroll revealed ${after.revealed}, still hidden ${after.pending}; overflow ${after.overflow}; errors ${JSON.stringify([...new Set(errors)])}`);
  await ctx.close();
}
await browser.close();
