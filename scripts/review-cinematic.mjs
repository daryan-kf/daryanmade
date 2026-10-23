import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';

const directory = 'artifacts/cinematic';
await fs.mkdir(directory, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--enable-unsafe-swiftshader'] });
const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3000';
const results = [];
try {
  for (const width of [1440, 768, 390]) {
    const page = await browser.newPage({ viewport: { width, height: width === 390 ? 844 : 1000 }, reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(baseURL, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: `${directory}/home-${width}-hero.png` });
    for (const target of ['sarpoli', 'vela', 'wardrobe', 'kaizencv', 'koebsklar', 'shield-family', 'iqra']) {
      const project = page.locator(`[data-project-card="${target}"]`);
      await project.scrollIntoViewIfNeeded();
      await project.locator('figure').first().scrollIntoViewIfNeeded();
      for (const image of await project.locator('img').all()) {
        await image.evaluate(image => image.decode().catch(() => {}));
      }
      await project.screenshot({ path: `${directory}/home-${width}-${target}.png` });
    }
    await page.locator('#about').scrollIntoViewIfNeeded();
    await page.waitForTimeout(250);
    await page.locator('#about').screenshot({ path: `${directory}/home-${width}-about.png` });
    for (let y = 0; y < await page.evaluate(() => document.documentElement.scrollHeight); y += 700) {
      await page.evaluate(y => window.scrollTo(0, y), y);
      await page.waitForTimeout(70);
    }
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${directory}/home-${width}-full.png`, fullPage: true });
    results.push({ width, errors, ...await page.evaluate(() => ({ overflow: document.documentElement.scrollWidth > innerWidth, brokenImages: [...document.images].filter(img => img.complete && img.naturalWidth === 0).map(img => img.src), height: document.documentElement.scrollHeight })) });
    await page.close();
  }
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await page.goto(baseURL, { waitUntil: 'networkidle' });
  await page.locator('html[data-maker-motion="running"]').waitFor();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${directory}/home-1440-animated.png` });
  await page.mouse.wheel(0, 220);
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${directory}/home-1440-sculpture-scroll.png` });
  await page.locator('#work').scrollIntoViewIfNeeded();
  await page.screenshot({ path: `${directory}/home-1440-exhibition.png` });
  await page.locator('[data-maker-anchor="closing"]').scrollIntoViewIfNeeded();
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${directory}/home-1440-closing.png` });
  await page.close();
} finally {
  await browser.close();
}
await fs.writeFile(`${directory}/review.json`, JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
