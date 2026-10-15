import { test, expect } from "@playwright/test";

async function switchWithoutMovingFocus(page: import("@playwright/test").Page, language: "en" | "da") {
  await page.locator(`[data-language-switch] a[lang="${language}"]`).first().evaluate((link: HTMLAnchorElement) => link.click());
}

test("animated language changes preserve the About section, hash, query and browser history", async ({ page }) => {
  await page.goto("/?source=language-test#about");
  const about = page.locator("#about");
  await expect(about).toBeInViewport();
  const before = (await about.boundingBox())!.y;
  await page.evaluate(() => { (window as Window & { languageIdentity?: string }).languageIdentity = "same-document"; });
  let documentRequests = 0;
  page.on("request", request => { if (request.isNavigationRequest() && request.frame() === page.mainFrame()) documentRequests++; });
  await switchWithoutMovingFocus(page, "da");
  await expect(page).toHaveURL(/\/da\?source=language-test#about$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "da");
  await expect(page.locator("html")).not.toHaveAttribute("data-language-changing", "true");
  expect(Math.abs((await about.boundingBox())!.y - before)).toBeLessThan(12);
  expect(await page.evaluate(() => (window as Window & { languageIdentity?: string }).languageIdentity)).toBe("same-document");
  await page.goBack();
  await expect(page).toHaveURL(/\/\?source=language-test#about$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(about).toBeInViewport();
  expect(documentRequests).toBe(0);
});

test("a slow language response keeps content readable and preserves the anchor while ignoring repeated clicks", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  let release: () => void = () => {};
  const gate = new Promise<void>(resolve => { release = resolve; });
  let heldRequests = 0;
  await page.route(url => url.pathname === "/da", async route => {
    heldRequests++;
    await gate;
    await route.continue();
  });
  await page.goto("/");
  const project = page.locator('[data-project-card="vela"]');
  await project.scrollIntoViewIfNeeded();
  const before = (await project.boundingBox())!.y;
  await page.locator('[data-language-switch] a[lang="da"]').first().evaluate((link: HTMLAnchorElement) => { link.click(); link.click(); link.click(); });
  await expect.poll(() => heldRequests).toBeGreaterThan(0);
  // Simulate a slow response beyond the previous five-second transition deadline.
  await new Promise(resolve => setTimeout(resolve, 5200));
  await expect(page.locator("[data-language-switch]").first()).toHaveAttribute("aria-busy", "true");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("html")).toHaveAttribute("data-language-phase", "loading");
  expect(await project.evaluate(element => getComputedStyle(element).opacity)).toBe("1");
  release();
  await expect(page).toHaveURL(/\/da$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "da");
  await expect(page.locator("[data-language-switch]").first()).toHaveAttribute("aria-busy", "false");
  expect(Math.abs((await project.boundingBox())!.y - before)).toBeLessThan(8);
  await page.goBack();
  await expect(page).toHaveURL(/:\d+\/$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});
