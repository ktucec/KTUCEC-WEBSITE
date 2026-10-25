// Konuşmacı bölümünü gerçek kaydırma konumlarında fotoğraflar: masaüstü (sabit sahne), telefon, hareket azaltma.
import { chromium } from 'playwright-core';
import fs from 'node:fs';
const URL = process.argv[2] ?? 'http://localhost:3029/';
const OUT = process.argv[3] ?? 'lab';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: CHROME, args: ['--disable-features=PointerLock'] });
const report = {};

async function run(name, ctxOpts, steps) {
  const ctx = await browser.newContext(ctxOpts);
  await ctx.addInitScript(() => { try { sessionStorage.setItem('cw26-intro', '1'); } catch {} });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errors.push(m.text().slice(0, 200)); });
  page.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message.slice(0, 200)));
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  const info = await page.evaluate(() => {
    const s = document.getElementById('konusmacilar');
    const r = s.getBoundingClientRect();
    return { top: r.top + scrollY, height: s.offsetHeight, pinSpacer: s.parentElement?.classList.contains('pin-spacer') ? s.parentElement.offsetHeight : 0, vh: innerHeight };
  });
  const total = Math.max(info.height, info.pinSpacer);
  const shots = [];
  for (let i = 0; i <= steps; i++) {
    const y = Math.round(info.top - info.vh * 0.6 + (total + info.vh * 0.6) * (i / steps));
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(1300);
    const file = `${OUT}/${name}-${String(i).padStart(2, '0')}.png`;
    await page.screenshot({ path: file });
    shots.push(file);
  }
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  report[name] = { section: info, steps, overflow, errors: [...new Set(errors)] };
  await ctx.close();
}

await run('desktop', { viewport: { width: 1440, height: 900 } }, 16);
await run('mobile', { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }, 10);
await run('reduced', { viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' }, 3);
await run('reduced-mobile', { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' }, 4);
fs.writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
await browser.close();
