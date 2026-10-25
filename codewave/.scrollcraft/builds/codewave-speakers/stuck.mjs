import { chromium } from 'playwright-core';
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
await ctx.addInitScript(() => { try { sessionStorage.setItem('cw26-intro', '1'); } catch {} });
const page = await ctx.newPage();
await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);
const H = await page.evaluate(() => document.documentElement.scrollHeight);
for (let y = 0; y <= H; y += 400) { await page.evaluate((yy) => scrollTo(0, yy), y); await page.waitForTimeout(90); }
await page.waitForTimeout(1500);
console.log(await page.evaluate(() => [...document.querySelectorAll('.io-pending')].map((el) => { const r = el.getBoundingClientRect(); return `${el.tagName.toLowerCase()} data-io=${el.dataset.io} "${(el.textContent || '').trim().slice(0, 30)}" top=${Math.round(r.top + scrollY)} h=${Math.round(r.height)} docH=${document.documentElement.scrollHeight}`; }).join('\n')));
console.log('kicker', await page.evaluate(() => { const k = document.querySelector('.hero-kicker'); return [k.scrollWidth, k.clientWidth, getComputedStyle(k).fontSize, getComputedStyle(k).whiteSpace]; }));
await browser.close();
