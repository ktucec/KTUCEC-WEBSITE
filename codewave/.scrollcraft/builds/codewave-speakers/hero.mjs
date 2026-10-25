// Kahraman alanını telefon genişliklerinde ilk ekran olarak fotoğraflar ve taşmaları ölçer.
import { chromium } from 'playwright-core';
import fs from 'node:fs';
const URL = process.argv[2] ?? 'http://localhost:3000/';
const OUT = process.argv[3] ?? 'lab-hero';
fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const sizes = [[320, 568], [360, 740], [375, 667], [390, 844], [414, 896], [430, 932], [768, 1024], [1440, 900]];
for (const [w, h] of sizes) {
  const mobile = w < 1024;
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, isMobile: mobile, hasTouch: mobile });
  await ctx.addInitScript(() => { try { sessionStorage.setItem('cw26-intro', '1'); } catch {} });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message.slice(0, 160)));
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3500);
  await page.screenshot({ path: `${OUT}/hero-${w}x${h}.png` });
  const m = await page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const out = [];
    for (const el of document.querySelectorAll('#top *')) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      if (r.right > vw + 1 || r.left < -1) out.push(`${el.tagName.toLowerCase()}.${String(el.className).split(' ')[0]} [${Math.round(r.left)}→${Math.round(r.right)}]`);
    }
    const g = (sel) => { const e = document.querySelector(sel); if (!e) return null; const r = e.getBoundingClientRect(); return { top: Math.round(r.top), bottom: Math.round(r.bottom), left: Math.round(r.left), right: Math.round(r.right) }; };
    return { vw, vh: innerHeight, docOverflow: document.documentElement.scrollWidth - vw, title: g('.hero-title'), wave: g('.t-wave'), glass: g('.hero-glass'), cta: g('.hero-glass .btn'), heroBottom: g('#top'), offenders: out.slice(0, 8) };
  });
  console.log(`\n${w}x${h}`, JSON.stringify(m), errors.length ? 'ERR ' + errors.join(' | ') : '');
  await ctx.close();
}
await browser.close();
