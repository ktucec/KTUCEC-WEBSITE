// Mobil viewport'ta gerçek dokunmatik kaydırma hareketleriyle konuşmacı sahnesini test eder.
// CDP Input.dispatchTouchEvent ile parmak sürüklemesi: tarayıcının kendi dokunmatik kaydırma yolu.
import { chromium } from 'playwright-core';
import fs from 'node:fs';

const URL = process.argv[2] ?? 'http://localhost:3000/';
const OUT = process.argv[3] ?? 'lab-touch';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: CHROME });
const report = {};

async function device(name, width, height, dpr) {
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: dpr, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Mobile Safari/537.36' });
  await ctx.addInitScript(() => {
    try { sessionStorage.setItem('cw26-intro', '1'); } catch {}
    // kare süreleri: uzun kareleri say
    window.__frames = [];
    let last = performance.now();
    const loop = (t) => { window.__frames.push(t - last); last = t; requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errors.push(m.text().slice(0, 200)); });
  page.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message.slice(0, 200)));
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  const cdp = await ctx.newCDPSession(page);

  // Bölümün hemen üstüne gel (normal kaydırma), sonra dokunmatik hareketlerle içinden geç.
  const sectionTop = await page.evaluate(() => document.getElementById('konusmacilar').getBoundingClientRect().top + scrollY);
  await page.evaluate((y) => window.scrollTo(0, y - innerHeight * 0.5), sectionTop);
  await page.waitForTimeout(600);
  await page.evaluate(() => (window.__frames = []));

  const frames = [];
  const swipe = Math.round(height * 0.55);
  let i = 0;
  let guard = 0;
  while (guard++ < 60) {
    // gerçek parmak sürüklemesi: touchStart → touchMove (16 ms aralıklarla) → touchEnd
    const x0 = Math.round(width / 2), y0 = Math.round(height * 0.8), steps = 14;
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x0, y: y0 }] });
    for (let k = 1; k <= steps; k++) {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x0, y: Math.round(y0 - (swipe * k) / steps) }] });
      await page.waitForTimeout(16);
    }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await page.waitForTimeout(700); // scrub yumuşatmasının yerine oturması
    const state = await page.evaluate(() => {
      const st = document.querySelector('.st');
      const r = st.getBoundingClientRect();
      const op = (sel) => [...document.querySelectorAll(sel)].map((e) => +getComputedStyle(e).opacity.slice(0, 4));
      return {
        y: Math.round(scrollY),
        stageTop: Math.round(r.top),
        portraitOpacity: op('.st-portrait'),
        thumbs: op('.st-thumb').filter((o) => o > 0.5).length,
        cells: op('.st-cell-photo').filter((o) => o > 0.5).length,
        pinned: !!st.closest('.pin-spacer'),
        // uçuş isabeti: neredeyse oturmuş portre ↔ koltuğu, neredeyse inmiş küçük resim ↔ kadro hücresi (px)
        dockError: (() => {
          const P = [...document.querySelectorAll('.st-portrait')], T = [...document.querySelectorAll('.st-thumb')], C = [...document.querySelectorAll('.st-cell-photo')];
          const dist = (a, b) => Math.round(Math.hypot(a.left - b.left, a.top - b.top));
          let worst = null;
          P.forEach((el, i) => { const r = el.getBoundingClientRect(), t = T[i].parentElement.getBoundingClientRect(); if (+getComputedStyle(el).opacity > 0.5 && r.width < t.width * 1.4) worst = Math.max(worst ?? 0, dist(r, t)); });
          T.forEach((el, i) => { const r = el.getBoundingClientRect(), c = C[i].getBoundingClientRect(); if (+getComputedStyle(el).opacity > 0.5 && r.width > c.width * 0.8) worst = Math.max(worst ?? 0, dist(r, c)); });
          return worst;
        })(),
      };
    });
    const file = `${OUT}/${name}-${String(i).padStart(2, '0')}.png`;
    await page.screenshot({ path: file });
    frames.push({ file, ...state });
    i++;
    const sec = await page.evaluate(() => { const s = document.getElementById('konusmacilar'); const sp = s.querySelector('.st').closest('.pin-spacer'); const box = (sp ?? s).getBoundingClientRect(); return box.bottom; });
    if (sec < 0) break;
  }

  // Adres çubuğu benzetimi: sahne sabitliyken yükseklik değişir; sayfa zıplamamalı.
  await page.evaluate((y) => window.scrollTo(0, y + innerHeight * 2.5), sectionTop);
  await page.waitForTimeout(800);
  const before = await page.evaluate(() => ({ y: scrollY, top: document.querySelector('.st').getBoundingClientRect().top }));
  await page.setViewportSize({ width, height: height - 64 });
  await page.waitForTimeout(800);
  const after = await page.evaluate(() => ({ y: scrollY, top: document.querySelector('.st').getBoundingClientRect().top }));
  await page.setViewportSize({ width, height });

  const ft = await page.evaluate(() => window.__frames);
  const long = ft.filter((d) => d > 50).length;
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  report[name] = {
    gestures: frames.length,
    frames: frames.map(({ file, ...s }) => s),
    longFrames: long,
    totalFrames: ft.length,
    addressBarResize: { before, after },
    overflow,
    errors: [...new Set(errors)],
  };
  await ctx.close();
}

await device('iphone', 390, 844, 3);
await device('android', 360, 780, 2.75);
fs.writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 2));
for (const [k, v] of Object.entries(report)) {
  console.log(`\n== ${k}: ${v.gestures} touch gestures, long frames ${v.longFrames}/${v.totalFrames}, overflow ${v.overflow}, errors ${JSON.stringify(v.errors)}`);
  console.log('address-bar resize:', JSON.stringify(v.addressBarResize));
  for (const f of v.frames) console.log(`  y=${f.y} stageTop=${f.stageTop} docked=${f.thumbs} lineup=${f.cells} landingError=${f.dockError ?? '-'}px`);
}
await browser.close();
