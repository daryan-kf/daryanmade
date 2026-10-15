import { expect, test, type Page } from "@playwright/test";

const apps = [
  ["vela", "/vela"],
  ["shield-family", "/projects/shield-family"],
  ["iqra", "/iqra"],
] as const;

async function openProject(page: Page, slug: string, path: string) {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  const link = page.locator(`[data-project-card="${slug}"] a[data-project-link]`);
  await link.scrollIntoViewIfNeeded();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(1000);
  const previousPosition = await page.evaluate(() => window.scrollY);
  await link.click();
  await expect(page).toHaveURL(path);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThanOrEqual(1);
  await expect(page.locator("h1")).toBeInViewport();
  return previousPosition;
}

test.describe("app navigation with full motion", () => {
  test.use({ reducedMotion: "no-preference" });

  for (const [slug, path] of apps) {
    test(`${slug} opens at the top from its homepage showcase`, async ({ page }) => {
      await openProject(page, slug, path);
      // A delayed animation refresh must not restore the departing page's position.
      await page.waitForTimeout(600);
      expect(await page.evaluate(() => window.scrollY)).toBeLessThanOrEqual(1);
    });
  }

  test("browser back and forward preserve their own page positions", async ({ page }) => {
    const homepagePosition = await openProject(page, "vela", "/vela");
    await page.evaluate(() => window.scrollTo({ top: 1800, behavior: "instant" }));
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(1800);
    await page.goBack();
    await expect(page).toHaveURL("/");
    await expect.poll(async () => Math.abs(await page.evaluate(() => window.scrollY) - homepagePosition)).toBeLessThan(10);
    await page.goForward();
    await expect(page).toHaveURL("/vela");
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(1800);
  });

  test("refresh retains the current position", async ({ page }) => {
    await page.goto("/vela");
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() => window.scrollTo({ top: 1800, behavior: "instant" }));
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(1800);
    await page.reload();
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(1800);
  });

  test("direct and in-page anchors continue to reach their sections", async ({ page }) => {
    await page.goto("/vela#updates");
    // This form is near the footer, so the document can reach its bottom before
    // the anchor reaches the viewport's top edge.
    await expect(page.locator("#updates")).toBeInViewport();
    await page.locator("footer a[href='#top']").click();
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThanOrEqual(1);
    await page.getByRole("navigation", { name: "Vela navigation" }).getByRole("link", { name: "Your day", exact: true }).click();
    await expect.poll(() => page.locator("#your-day").evaluate(element => Math.abs(element.getBoundingClientRect().top))).toBeLessThan(100);
  });

  test("navigation to another page preserves its explicit anchor", async ({ page }) => {
    await page.goto("/projects/next-project");
    await page.getByRole("link", { name: "← All projects", exact: true }).click();
    await expect(page).toHaveURL("/#work");
    await expect.poll(() => page.locator("#work").evaluate(element => Math.abs(element.getBoundingClientRect().top))).toBeLessThan(100);
  });
});

test.describe("native mobile scrolling", () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: "no-preference" });

  for (const [slug, path] of apps.slice(0, 2)) {
    test(`${slug} opens at the top on mobile`, async ({ page }) => {
      await openProject(page, slug, path);
    });
  }
});

test("app navigation also starts at the top with reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openProject(page, "shield-family", "/projects/shield-family");
});
