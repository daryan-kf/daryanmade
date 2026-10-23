import { expect, test } from "@playwright/test";

test("product previews, destinations and stories remain available before JavaScript loads", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  try {
    await page.goto(baseURL || "http://127.0.0.1:3000");
    for (const slug of ["sarpoli", "vela", "wardrobe", "kaizencv", "koebsklar", "shield-family", "iqra"]) {
      const card = page.locator(`[data-project-card="${slug}"]`);
      await expect(card.locator("details")).not.toHaveAttribute("open");
      await expect(card.locator("[data-project-link]")).toBeVisible();
      const preview = card.locator("figure").first();
      await expect(preview).toBeVisible();
      await preview.scrollIntoViewIfNeeded();
      const image = preview.locator("img").first();
      await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0)).toBe(true);
    }
    const twillby = page.locator('[data-project-card="wardrobe"]');
    await expect(twillby.locator("[data-project-link]")).toHaveAttribute("href", "/projects/wardrobe");
    await twillby.locator("summary").click();
    await expect(twillby.getByRole("heading", { name: "A little more you.", exact: true })).toBeVisible();
    await expect(twillby.locator("details li").first()).toBeVisible();
    const vela = page.locator('[data-project-card="vela"]');
    await vela.locator("summary").click();
    await expect(twillby.locator("details")).toHaveAttribute("open", "");
    await expect(vela.locator("details")).toHaveAttribute("open", "");
    await page.getByRole("navigation", { name: "Jump to a project" }).getByRole("link", { name: /Vela$/ }).click();
    await expect(page).toHaveURL(/#project-vela$/);
    await expect(vela).toBeInViewport();
  } finally {
    await context.close();
  }
});

for (const width of [390, 1440]) {
  test(`reading another project does not close an earlier story or shift its trigger at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/da");
    await page.evaluate(() => document.fonts.ready);
    const twillby = page.locator('[data-project-card="wardrobe"] details');
    await twillby.locator("summary").click();
    const next = page.locator('[data-project-card="iqra"] summary');
    await next.scrollIntoViewIfNeeded();
    const before = (await next.boundingBox())!;
    await next.click();
    await expect.poll(async () => Math.abs((await next.boundingBox())!.y - before.y)).toBeLessThan(3);
    await expect(twillby).toHaveAttribute("open", "");
    await expect(page.locator("#work details[open]")).toHaveCount(2);
    await expect(page.locator('[data-project-card="iqra"] [data-project-link]')).toHaveAttribute("href", "/da/iqra");
    await expect(page.locator('[data-project-card="iqra"] [data-project-link]')).toBeVisible();
    const widths = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth }));
    expect(widths.document).toBeLessThanOrEqual(widths.viewport + 1);
  });
}
