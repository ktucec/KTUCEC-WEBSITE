// Kök neden kontrolü: uçuşların kullandığı düzen ofseti (offsetLeft/Top zinciri) hedefin ekrandaki gerçek
// konumuna (getBoundingClientRect, sahneye göre) eşit mi? Eşitse her uçuş tam koltuğuna/hücresine iner.
import { chromium } from 'playwright-core';
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
for (const [name, opts] of [['phone 390', { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }], ['phone 360', { viewport: { width: 360, height: 780 }, isMobile: true, hasTouch: true }], ['tablet 768', { viewport: { width: 768, height: 1024 }, isMobile: true, hasTouch: true }], ['desktop 1440', { viewport: { width: 1440, height: 900 } }]]) {
  const ctx = await browser.newContext(opts);
  await ctx.addInitScript(() => { try { sessionStorage.setItem('cw26-intro', '1'); } catch {} });
  const page = await ctx.newPage();
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  // sahne sabitlenip ray görünür olduktan sonra (perde 1 sonu) ölç
  await page.evaluate(() => { const sp = document.querySelector('.st').closest('.pin-spacer'); scrollTo(0, sp.getBoundingClientRect().top + scrollY + innerHeight * 0.9); });
  await page.waitForTimeout(1200);
  const r = await page.evaluate(() => {
    const stage = document.querySelector('.st');
    const sr = stage.getBoundingClientRect();
    const offsetIn = (el) => { let x = 0, y = 0, n = el; while (n && n !== stage) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; } return { x, y }; };
    const check = (sel) => [...document.querySelectorAll(sel)].map((el) => { const o = offsetIn(el), b = el.getBoundingClientRect(); return Math.hypot(o.x - (b.left - sr.left), o.y - (b.top - sr.top)); });
    const slots = check('.st-slot'), cells = check('.st-cell-photo:not(.st-cell-pending)'), portraits = check('.st-portrait');
    return { slots: Math.max(...slots).toFixed(1), cells: Math.max(...cells).toFixed(1), portraitStart: Math.min(...portraits).toFixed(1) };
  });
  console.log(`${name}: max seat mismatch ${r.slots}px · max line-up cell mismatch ${r.cells}px`);
  await ctx.close();
}
await browser.close();
