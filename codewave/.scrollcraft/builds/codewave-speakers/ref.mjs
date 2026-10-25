import { chromium } from 'playwright-core';
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const page = await ctx.newPage();
await page.goto('https://devfest.gdgtrabzon.com/', { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(2500);
// promosyon penceresini yalnızca görüntüden gizle (tıklama/gönderim yok)
await page.addStyleTag({ content: '[role=dialog], .fixed.inset-0 { display: none !important; }' });
await page.waitForTimeout(400);
await page.screenshot({ path: 'lab-hero/ref-devfest-390.png' });
await page.evaluate(() => scrollTo(0, innerHeight * 0.9));
await page.waitForTimeout(1200);
await page.screenshot({ path: 'lab-hero/ref-devfest-390-b.png' });
const t = await page.evaluate(() => [...document.querySelectorAll('h1,h2,p,a,button,span')].filter((e) => e.getBoundingClientRect().top < innerHeight * 1.9 && e.textContent.trim()).slice(0, 30).map((e) => `${e.tagName}:${e.textContent.trim().slice(0, 40)}`));
console.log(t.join('\n'));
await browser.close();
