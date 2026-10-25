import { chromium } from 'playwright-core';
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
async function probe(label, url, opts) {
  const ctx = await browser.newContext(opts);
  await ctx.addInitScript(() => { try { sessionStorage.setItem('cw26-intro', '1'); } catch {} });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  const cdp = await ctx.newCDPSession(page);
  const res = {};
  for (const src of ['touch', 'mouse', 'default']) {
    const y0 = await page.evaluate(() => scrollY);
    try { await cdp.send('Input.synthesizeScrollGesture', { x: 180, y: 500, yDistance: -400, gestureSourceType: src, speed: 1200 }); } catch (e) { res[src] = 'ERR ' + e.message.slice(0, 80); continue; }
    await page.waitForTimeout(500);
    res[src] = (await page.evaluate(() => scrollY)) - y0;
  }
  // tarayıcı düzeyinde dokunmatik sürükleme: CDP touch olayları
  const y1 = await page.evaluate(() => scrollY);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 180, y: 600 }] });
  for (let k = 1; k <= 12; k++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 180, y: 600 - k * 30 }] }); await page.waitForTimeout(16); }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await page.waitForTimeout(600);
  res.touchEvents = (await page.evaluate(() => scrollY)) - y1;
  const css = await page.evaluate(() => ({ htmlOverflow: getComputedStyle(document.documentElement).overflow, bodyOverflow: getComputedStyle(document.body).overflowY, touchAction: getComputedStyle(document.body).touchAction, docH: document.documentElement.scrollHeight }));
  console.log(label, JSON.stringify(res), JSON.stringify(css));
  await ctx.close();
}
const mobile = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true };
await probe('plain-page mobile', 'data:text/html,<body style="height:5000px;margin:0;background:linear-gradient(red,blue)">x</body>', mobile);
await probe('codewave mobile ', 'http://localhost:3029/', mobile);
await probe('codewave desktop', 'http://localhost:3029/', { viewport: { width: 1440, height: 900 } });
await browser.close();
