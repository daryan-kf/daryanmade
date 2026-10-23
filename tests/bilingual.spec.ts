import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.use({ reducedMotion: "reduce" });
const products = [
  { path: "/vela", da: "Bare sig det.", en: "Just say it." },
  { path: "/iqra", da: "Du behøver ikke at kunne arabisk for at begynde.", en: "You don’t have to know Arabic to begin." },
  { path: "/projects/shield-family", da: "Et bedre svar", en: "A better answer" },
];

test("Danish and English are server-rendered with matching language metadata", async ({ request }) => {
  for (const path of ["", ...products.map(p => p.path), "/privacy", "/vela/updates/privacy", "/projects/shield-family/privacy", "/projects/kaizencv"]) {
    for (const locale of ["en", "da"]) {
      const url = locale === "da" ? `/da${path}` : path || "/";
      const response = await request.get(url);
      expect(response.status(), url).toBe(200);
      const html = await response.text();
      expect(html, url).toMatch(new RegExp(`<html[^>]*lang="${locale}"`));
      expect(html, url).toContain('id="main-content"');
      if (["", ...products.map(p => p.path)].includes(path)) {
        expect(html).toContain('hrefLang="en"');
        expect(html).toContain('hrefLang="da"');
        const canonical = html.match(/rel="canonical" href="([^"]+)"/);
        expect(canonical).not.toBeNull();
        expect(new URL(canonical![1]).pathname).toBe(url);
      }
    }
  }
});

test("Danish home preserves collection order and enabled Twillby", async ({ page }) => {
  await page.goto("/da");
  await expect(page.locator("h1")).toContainText("Gode idéer.");
  expect(await page.locator("[data-project-card]").evaluateAll(cards => cards.map(card => (card as HTMLElement).dataset.projectCard))).toEqual(["sarpoli", "vela", "wardrobe", "kaizencv", "koebsklar", "shield-family", "iqra", "next-project"]);
  const wardrobe = page.locator('[data-project-card="wardrobe"]');
  await expect(wardrobe).toContainText("Kommer snart");
  await expect(wardrobe.getByRole("heading", { name: "Twillby", exact: true })).toBeVisible();
  await expect(wardrobe.locator("[data-project-link]")).toHaveAttribute("href", "/da/projects/wardrobe");
  await expect(page.locator('[data-project-card="vela"] [data-project-link]')).toHaveAttribute("href", "/da/vela");
  await expect(page.locator('[data-project-card="shield-family"] [data-project-link]')).toHaveAttribute("href", "/da/projects/shield-family");
  await expect(page.locator('[data-project-card="sarpoli"] [data-project-link]')).toHaveAttribute("href", "https://sarpoli.com");
});

for (const product of products) {
  test(`${product.path} keeps its page when switching language`, async ({ page }) => {
    await page.goto(`/da${product.path}`);
    await expect.poll(async () => (await page.locator("h1").innerText()).replace(/\s/g, "")).toContain(product.da.replace(/\s/g, ""));
    await page.getByRole("link", { name: "English", exact: true }).first().click();
    await expect(page).toHaveURL(new RegExp(`${product.path}$`));
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect.poll(async () => (await page.locator("h1").innerText()).replace(/\s/g, "")).toContain(product.en.replace(/\s/g, ""));
    await page.getByRole("link", { name: "Dansk", exact: true }).first().click();
    await expect(page).toHaveURL(new RegExp(`/da${product.path}$`));
    await expect(page.locator("html")).toHaveAttribute("lang", "da");
  });
}

test("Danish product previews open at the top after leaving the home collection", async ({ page }) => {
  for (const slug of ["vela", "shield-family"]) {
    await page.goto("/da");
    await expect(page.locator(`[data-project-card="${slug}"] details`)).not.toHaveAttribute("open");
    await expect(page.locator(`[data-project-card="${slug}"] figure`).first()).toBeVisible();
    await page.locator(`[data-project-card="${slug}"] [data-project-link]`).click();
    await expect(page.locator("h1")).toBeVisible();
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(4);
  }
});

test("Danish redirects preserve canonical product destinations", async ({ request }) => {
  for (const [from, to] of [["/da/villa", "/da/vela"], ["/da/projects/vela", "/da/vela"], ["/da/projects/iqra", "/da/iqra"]]) {
    const response = await request.get(from, { maxRedirects: 0 });
    expect(response.status()).toBe(308);
    expect(response.headers().location).toBe(to);
  }
});

test("Danish app films have Danish and English caption tracks", async ({ page, request }) => {
  for (const { path } of products) {
    await page.goto(`/da${path}`);
    const tracks = page.locator('video track[srclang="da"]');
    expect(await tracks.count()).toBeGreaterThan(0);
    await expect(tracks.first()).toHaveAttribute("default", "");
    for (const src of await tracks.evaluateAll(elements => elements.map(element => element.getAttribute("src")!))) {
      const caption = await request.get(src);
      expect(caption.ok()).toBeTruthy();
      expect(await caption.text()).toContain("WEBVTT");
    }
  }
});

for (const width of [390, 768, 1440]) {
  test(`Danish layouts and language controls fit at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    for (const path of ["/da", ...products.map(p => `/da${p.path}`)]) {
      await page.goto(path);
      await expect(page.getByRole("link", { name: "English", exact: true }).first()).toBeVisible();
      await expect(page.getByRole("link", { name: "Dansk", exact: true }).first()).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), path).toBeLessThanOrEqual(1);
      const title = await page.locator("h1").boundingBox();
      expect(title!.x).toBeGreaterThanOrEqual(0);
      expect(title!.x + title!.width).toBeLessThanOrEqual(width + 1);
    }
  });
}

test("Danish home and product pages retain accessible names and contrast", async ({ page }) => {
  for (const path of ["/da", ...products.map(p => `/da${p.path}`)]) {
    await page.goto(path);
    const result = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    expect(result.violations, `${path}: ${JSON.stringify(result.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) })))}`).toEqual([]);
  }
});

test("language changes keep the current document and reading position", async ({ page }) => {
  await page.goto("/");
  const vela = page.locator('[data-project-card="vela"]');
  await vela.scrollIntoViewIfNeeded();
  const before = await vela.boundingBox();
  await page.evaluate(() => { (window as Window & { localeDocument?: string }).localeDocument = "same-document"; });
  let navigations = 0;
  page.on("request", request => { if (request.isNavigationRequest() && request.frame() === page.mainFrame()) navigations++; });
  // Dispatch the same explicit click without moving the reading position to the header.
  await page.locator('[data-language-switch] a[lang="da"]').first().evaluate((link: HTMLAnchorElement) => link.click());
  await expect(page).toHaveURL(/\/da$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "da");
  expect(await page.evaluate(() => (window as Window & { localeDocument?: string }).localeDocument)).toBe("same-document");
  expect(navigations).toBe(0);
  expect(Math.abs((await vela.boundingBox())!.y - before!.y)).toBeLessThan(8);
});

test("language controls stay in the same place when translated navigation changes", async ({ page }) => {
  for (const width of [320, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const path of ["/", "/vela", "/iqra", "/projects/shield-family", "/vela/updates/privacy"]) {
      await page.goto(path);
      const control = page.locator("[data-language-switch]").first();
      const before = await control.boundingBox();
      await control.getByRole("link", { name: "Dansk", exact: true }).click();
      await expect(page.locator("html")).toHaveAttribute("lang", "da");
      await expect(control).toHaveAttribute("aria-busy", "false");
      const after = await control.boundingBox();
      expect(Math.abs(after!.x - before!.x), `${path} at ${width}: horizontal control jump`).toBeLessThan(1);
      expect(Math.abs(after!.y - before!.y), `${path} at ${width}: vertical control jump`).toBeLessThan(1);
      expect(Math.abs(after!.width - before!.width), `${path} at ${width}: control resize`).toBeLessThan(1);
    }
  }
});
