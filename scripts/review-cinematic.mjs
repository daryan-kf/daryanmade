import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';

const directory = 'artifacts/cinematic';
await fs.mkdir(directory, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const results = [];
try {
  for (const width of [1440, 768, 390]) {
    const page = await browser.newPage({ viewport: { width, height: width === 390 ? 844 : 1000 }, reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('http://127.0.0.1:3000', { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: `${directory}/home-${width}-hero.png` });
    for (const target of ['sarpoli', 'vela', 'wardrobe', 'kaizencv', 'koebsklar']) {
      await page.locator(`[data-project-card="${target}"]`).scrollIntoViewIfNeeded();
      await page.waitForTimeout(250);
      await page.locator(`[data-project-card="${target}"]`).screenshot({ path: `${directory}/home-${width}-${target}.png` });
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
  await page.goto('http://127.0.0.1:3000', { waitUntil: 'networkidle' });
  await page.locator('html[data-maker-motion="running"]').waitFor();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${directory}/home-1440-animated.png` });
  for (const story of ['sarpoli', 'kaizencv', 'koebsklar']) {
    const scene = page.locator(`[data-project-story="${story}"]`);
    await scene.scrollIntoViewIfNeeded();
    await page.waitForTimeout(4000);
    await scene.getByRole('button', { name: /^Replay / }).click();
    await page.waitForTimeout(900);
    await scene.screenshot({ path: `${directory}/home-1440-${story}-motion-start.png` });
    await page.waitForTimeout(3200);
    await scene.screenshot({ path: `${directory}/home-1440-${story}-motion-complete.png` });
  }
  await page.close();
} finally {
  await browser.close();
}
await fs.writeFile(`${directory}/review.json`, JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
