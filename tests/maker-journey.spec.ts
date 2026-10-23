import { expect, test, type Locator } from "@playwright/test";

test.use({ launchOptions: { args: ["--enable-unsafe-swiftshader"] }, reducedMotion: "no-preference" });

async function waitForRest(canvas: Locator) {
  await expect.poll(async () => {
    const before = await canvas.getAttribute("data-draw-count");
    await new Promise(resolve => setTimeout(resolve, 180));
    return before === await canvas.getAttribute("data-draw-count");
  }, { message: "The sculpture stops rendering after the scroll settles" }).toBe(true);
}

for (const width of [390, 1440]) {
  test(`the fluid sculpture moves in its frame, responds to native scroll and pauses at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.goto("/");
    const anchor = page.locator('[data-maker-anchor="hero"]');
    await anchor.scrollIntoViewIfNeeded();
    const canvas = page.locator("canvas[data-maker-canvas]");
    await expect(page.locator("html")).toHaveAttribute("data-maker-motion", "running");
    await expect(canvas).toHaveCount(1);
    await expect(anchor.locator("canvas[data-maker-canvas]")).toHaveCount(1);
    await expect(canvas).toHaveAttribute("data-maker-form", "fluid");
    await expect(canvas).toHaveAttribute("data-maker-topology", "trefoil");
    const frame = (await anchor.boundingBox())!;
    const artwork = (await canvas.boundingBox())!;
    expect(Math.abs(frame.x - artwork.x)).toBeLessThan(2);
    expect(Math.abs(frame.y - artwork.y)).toBeLessThan(2);
    expect(Math.abs(frame.width - artwork.width)).toBeLessThan(2);
    expect(Math.abs(frame.height - artwork.height)).toBeLessThan(2);
    expect(await canvas.evaluate(element => {
      for (let ancestor: Element | null = element; ancestor; ancestor = ancestor.parentElement) {
        if (getComputedStyle(ancestor).position === "fixed") return true;
      }
      return false;
    })).toBe(false);
    // Wheel input targets the document at a real reading position, away from
    // the browser viewport corner and any overlaid development controls.
    await page.mouse.move(width * .4, 420);
    const initialDraws = await canvas.getAttribute("data-draw-count");
    await expect.poll(() => canvas.getAttribute("data-draw-count")).not.toBe(initialDraws);
    const phase = await canvas.getAttribute("data-flow-phase");
    const beforeScroll = await page.evaluate(() => window.scrollY);
    await page.mouse.wheel(0, 100);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(beforeScroll + 50);
    await expect.poll(() => canvas.getAttribute("data-flow-phase")).not.toBe(phase);
    await page.getByRole("button", { name: "Pause motion", exact: true }).click();
    await expect(page.locator("html")).toHaveAttribute("data-maker-motion", "paused");
    const pausedDraws = await canvas.getAttribute("data-draw-count");
    const pausedPhase = await canvas.getAttribute("data-flow-phase");
    await page.mouse.wheel(0, 80);
    await page.waitForTimeout(300);
    expect(await canvas.getAttribute("data-draw-count")).toBe(pausedDraws);
    expect(await canvas.getAttribute("data-flow-phase")).toBe(pausedPhase);
    await page.getByRole("button", { name: "Play motion", exact: true }).click();
    await expect(page.locator("html")).toHaveAttribute("data-maker-motion", "running");

    await page.locator('[data-project-card="wardrobe"]').scrollIntoViewIfNeeded();
    await expect(canvas).not.toBeInViewport();
    await waitForRest(canvas);
    const offscreenDraws = await canvas.getAttribute("data-draw-count");
    await page.mouse.wheel(0, 180);
    await page.waitForTimeout(300);
    expect(await canvas.getAttribute("data-draw-count")).toBe(offscreenDraws);
    await expect(page.locator('[data-project-card="wardrobe"] [data-project-link]')).toBeVisible();
    const closing = page.locator('[data-maker-anchor="closing"]');
    await closing.scrollIntoViewIfNeeded();
    await expect(closing.locator("canvas[data-maker-canvas]")).toHaveCount(1);
    await expect(canvas).toHaveAttribute("data-maker-stage", "closing");
    await expect(canvas).toBeInViewport();
    await expect(page.locator("canvas[data-maker-canvas]")).toHaveCount(1);
    await expect(anchor.locator('[data-maker-fallback="hero"]')).toHaveCSS("opacity", "1");
    expect(errors).toEqual([]);
  });
}

test("reduced motion retains static artwork and direct keyboard access to projects", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("canvas[data-maker-canvas]")).toHaveCount(0);
  await expect(page.locator('[data-maker-fallback="hero"]')).toBeVisible();
  await expect(page.locator('[data-maker-fallback="hero"]')).toHaveCSS("opacity", "1");
  const link = page.locator('[data-project-card="wardrobe"] [data-project-link]');
  await link.focus();
  await expect(link).toBeVisible();
  await expect(link).toBeFocused();
  await expect(page.getByRole("button", { name: "Pause motion", exact: true })).toBeHidden();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL("/projects/wardrobe");
});

test("unavailable WebGL preserves the static artwork, product previews and direct links", async ({ page }) => {
  await page.addInitScript(() => {
    const get = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...args: unknown[]) {
      if (type.startsWith("webgl")) return null;
      return get.apply(this, [type, ...args] as Parameters<typeof get>);
    } as typeof get;
  });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-maker-motion", "fallback");
  await expect(page.locator("canvas[data-maker-canvas]")).toHaveCount(0);
  await expect(page.locator('[data-maker-fallback="hero"]')).toBeVisible();
  await expect(page.locator('[data-maker-fallback="hero"]')).toHaveCSS("opacity", "1");
  const project = page.locator('[data-project-card="wardrobe"]');
  await expect(project.locator("figure").first()).toBeVisible();
  await expect(project.locator("[data-project-link]")).toBeVisible();
  await expect(page.getByRole("button", { name: "Pause motion", exact: true })).toBeHidden();
});
