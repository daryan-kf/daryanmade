import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.beforeEach(async ({ page }) => { await page.emulateMedia({ reducedMotion: "reduce" }); });

test("Shield replaces the promotion with an email-only signup, including old offer anchors", async ({ page }) => {
  await page.goto("/projects/shield-family#offer");
  const form = page.locator("#updates").getByRole("form", { name: "Shield Family email updates", exact: true });
  await expect(form).toBeVisible();
  await expect(form.getByRole("textbox", { name: "Your email address" })).toBeVisible();
  await expect(page.getByRole("radio")).toHaveCount(0);
  await expect(page.getByRole("checkbox")).toHaveCount(0);
  await expect(page.locator("body")).not.toContainText(/3 months free|Founding Families|Choose your plan|Redeem your Apple code|The offer/i);
  await expect(page.locator('a[href="#offer"]')).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Keep me updated" }).first()).toHaveAttribute("href", "#updates");
  await form.scrollIntoViewIfNeeded();
  const results = await new AxeBuilder({ page }).include("#updates").withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(results.violations).toEqual([]);
});

for (const locale of ["en", "da"] as const) {
  test(`Twillby has a complete ${locale} preview with upcoming stores and mobile images`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${locale === "da" ? "/da" : ""}/projects/wardrobe`);
    await expect(page.locator("h1")).toHaveText(locale === "da" ? /Lidt mere\s*dig\./ : /A little more\s*you\./);
    await expect(page.getByRole("img", { name: "Twillby", exact: true }).first()).toBeVisible();
    await expect(page.locator('main img[src*="twillby-site"][src*="mascot.png"]')).toBeVisible();
    await expect(page.locator("main")).not.toContainText("Twill Buy");
    const stores = page.getByLabel(locale === "da" ? "Appens tilgængelighed" : "App availability");
    await expect(stores).toContainText("App Store");
    await expect(stores).toContainText("Google Play");
    await expect(stores.locator("small")).toHaveText(Array(2).fill(locale === "da" ? "Kommer snart" : "Coming soon"));
    await expect(page.locator('a[href*="apps.apple.com"], a[href*="play.google.com"]')).toHaveCount(0);
    for (const image of await page.locator("main img").all()) {
      await image.scrollIntoViewIfNeeded();
      await expect.poll(() => image.evaluate((node: HTMLImageElement) => node.complete && node.naturalWidth > 0)).toBe(true);
    }
    await expect(page.locator('#updates[data-updates-app="wardrobe"]')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    expect(results.violations.map(item => ({ id: item.id, targets: item.nodes.map(node => node.target) }))).toEqual([]);
  });
}
