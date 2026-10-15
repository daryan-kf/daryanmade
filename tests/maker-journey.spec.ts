import { expect, test, type Page } from "@playwright/test";

test.use({ launchOptions: { args: ["--enable-unsafe-swiftshader"] } });

const stages = ["hero", "sarpoli", "vela", "wardrobe", "work", "kaizencv", "koebsklar", "about", "closing"] as const;
const canvas = (page: Page) => page.locator("canvas[data-maker-canvas]");

async function openJourney(page: Page) {
  await page.goto("/");
  await expect(page.locator("h1")).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator("html")).toHaveAttribute("data-maker-motion", "running");
  await expect(canvas(page)).toHaveCount(1);
}

async function expectFallback(page: Page) {
  for (const stage of stages) {
    const art = page.locator(`[data-maker-anchor='${stage}'] [data-maker-fallback='${stage}']`);
    await expect(art).toHaveCount(1);
    await expect(art).toHaveCSS("opacity", "1");
  }
}

// Preserve only the test's drawing buffer so we can inspect real rendered pixels
// after a settled frame. Production keeps the cheaper default WebGL buffer.
async function preserveDrawingBuffer(page: Page) {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, attributes?: WebGLContextAttributes) {
      return original.call(this, type, type.startsWith("webgl") ? { ...attributes, preserveDrawingBuffer: true } : attributes);
    } as typeof original;
  });
}

async function paintedBounds(page: Page) {
  return canvas(page).evaluate(async (element: HTMLCanvasElement) => {
    const image = new Image();
    image.src = element.toDataURL();
    await image.decode();
    const copy = document.createElement("canvas");
    copy.width = element.width;
    copy.height = element.height;
    const context = copy.getContext("2d")!;
    context.drawImage(image, 0, 0);
    const { data } = context.getImageData(0, 0, copy.width, copy.height);
    let left = copy.width, top = copy.height, right = -1, bottom = -1, count = 0;
    const sum = [0, 0, 0];
    for (let index = 0; index < data.length; index += 4) {
      // Orange surface pixels, excluding the transparent canvas and soft shadow.
      if (data[index + 3] < 100 || data[index] < data[index + 1] * 1.2 || data[index + 1] < data[index + 2] * 1.05) continue;
      const pixel = index / 4, x = pixel % copy.width, y = Math.floor(pixel / copy.width);
      left = Math.min(left, x); top = Math.min(top, y);
      right = Math.max(right, x); bottom = Math.max(bottom, y); count++;
      for (let channel = 0; channel < 3; channel++) sum[channel] += data[index + channel];
    }
    const scale = element.getBoundingClientRect().width / copy.width;
    return { left: left * scale, top: top * scale, right: right * scale, bottom: bottom * scale, width: (right - left) * scale, height: (bottom - top) * scale, count, color: sum.map(value => value / Math.max(1, count)) };
  });
}

async function jumpTo(page: Page, top: number) {
  await page.evaluate(value => window.scrollTo({ top: value, behavior: "instant" }), top);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeCloseTo(Math.round(top), 0);
}

for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
  test(`one brand-orange sculpture rests in every art slot and travels visibly within the margins at ${viewport.width}px`, async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize(viewport);
    await preserveDrawingBuffer(page);
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await openJourney(page);
    await expect(canvas(page)).toHaveCSS("pointer-events", "none");
    await expect(canvas(page).locator("..")).toHaveCSS("position", "fixed");
    const pigment = await paintedBounds(page);
    expect(pigment.count).toBeGreaterThan(1000);
    // Check actual output, not just a material's hexadecimal input. Warm HDR
    // plus filmic exposure used to turn this same brand input into pale coral.
    for (const [index, channel] of [189, 67, 39].entries()) expect(Math.abs(pigment.color[index] - channel)).toBeLessThan(18);

    const stops = await page.locator("[data-maker-anchor]").evaluateAll(elements => elements.map(element => {
      const bounds = element.getBoundingClientRect();
      return { stage: element.getAttribute("data-maker-anchor"), scroll: Math.min(document.documentElement.scrollHeight - innerHeight, Math.max(0, bounds.top + scrollY + bounds.height / 2 - innerHeight * 0.52)) };
    }));
    expect(stops.map(stop => stop.stage)).toEqual(stages);

    for (let index = 0; index < stops.length; index++) {
      const stop = stops[index];
      await jumpTo(page, stop.scroll);
      await expect.poll(async () => {
        const art = await paintedBounds(page);
        const slot = await page.locator(`[data-maker-anchor='${stop.stage}']`).boundingBox();
        if (!slot) return false;
        const size = Math.min(slot.width, slot.height);
        return art.count > 40 && art.width > size * 0.25 && art.left >= slot.x - size * 0.12 && art.right <= slot.x + slot.width + size * 0.12 && art.top >= slot.y - size * 0.12 && art.bottom <= slot.y + slot.height + size * 0.12;
      }, { message: `Orange sculpture is painted inside the ${stop.stage} art slot` }).toBe(true);
      await expect(canvas(page)).toHaveCount(1);

      const next = stops[index + 1];
      if (next) {
        await jumpTo(page, (stop.scroll + next.scroll) / 2);
        if (next.scroll - stop.scroll < (viewport.width < 700 ? 380 : 440)) {
          await expect.poll(async () => {
            const art = await paintedBounds(page);
            const first = await page.locator(`[data-maker-anchor='${stop.stage}']`).boundingBox();
            const second = await page.locator(`[data-maker-anchor='${next.stage}']`).boundingBox();
            return !!first && !!second && art.count > 40 && art.left >= Math.min(first.x, second.x) - 20 && art.right <= Math.max(first.x + first.width, second.x + second.width) + 20;
          }, { message: "Nearby art slots share one direct transition without a gutter detour" }).toBe(true);
          continue;
        }
        await expect.poll(async () => {
          const art = await paintedBounds(page);
          return art.count > 30 && art.width > 8 && art.width < 65 && art.left >= 0 && art.right < viewport.width && art.top >= 0 && art.bottom < viewport.height;
        }, { message: `The entire orange form stays visible during the transfer between ${stop.stage} and ${next.stage}` }).toBe(true);
      }
    }

    // Reversing a long scroll must recover the same art slot without rebuilding
    // the canvas or leaving a later morph stranded on top of the page content.
    await jumpTo(page, stops[1].scroll);
    await expect.poll(async () => {
      const art = await paintedBounds(page);
      const slot = await page.locator("[data-maker-anchor='sarpoli']").boundingBox();
      return !!slot && art.count > 40 && art.width > Math.min(slot.width, slot.height) * 0.25 && art.left >= slot.x - 20 && art.right <= slot.x + slot.width + 20;
    }).toBe(true);
    await expect(canvas(page)).toHaveCount(1);
    expect(errors).toEqual([]);
  });
}

test("rapid scroll reversals settle correctly, and resize or restored scroll seeks the current chapter", async ({ page }) => {
  await preserveDrawingBuffer(page);
  await openJourney(page);
  // Native scroll changes arrive faster than a full morph can play. The render
  // loop must retarget its current form rather than queue an animation per stop.
  const frames = await page.evaluate(async () => {
    const source = document.querySelector<HTMLCanvasElement>("canvas[data-maker-canvas]")!;
    const sample = document.createElement("canvas");
    sample.width = 240; sample.height = 167;
    const context = sample.getContext("2d")!;
    const frames: number[] = [];
    for (let frame = 0; frame < 48; frame++) {
      const progress = frame < 16 ? frame / 15 : frame < 32 ? 1 - (frame - 16) / 15 : (frame - 32) / 15;
      window.scrollTo({ top: progress * 780, behavior: "instant" });
      await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
      context.clearRect(0, 0, sample.width, sample.height);
      context.drawImage(source, 0, 0, sample.width, sample.height);
      const pixels = context.getImageData(0, 0, sample.width, sample.height).data;
      let painted = 0;
      for (let i = 0; i < pixels.length; i += 4) if (pixels[i + 3] > 100 && pixels[i] > pixels[i + 1] * 1.2) painted++;
      frames.push(painted);
    }
    return frames;
  });
  expect(Math.min(...frames), "The sculpture stays present during fast direction changes").toBeGreaterThan(5);
  await expect(canvas(page)).toHaveCount(1);

  await page.setViewportSize({ width: 1024, height: 900 });
  const destination = await page.locator("[data-maker-anchor='sarpoli']").evaluate(element => {
    const bounds = element.getBoundingClientRect();
    return bounds.top + scrollY + bounds.height / 2 - innerHeight * 0.52;
  });
  await jumpTo(page, destination);
  const fitsSarpoli = async () => {
    const bounds = await paintedBounds(page);
    const slot = await page.locator("[data-maker-anchor='sarpoli']").boundingBox();
    return !!slot && bounds.count > 100 && bounds.left >= slot.x - 20 && bounds.right <= slot.x + slot.width + 20 && bounds.top >= slot.y - 20 && bounds.bottom <= slot.y + slot.height + 20;
  };
  await expect.poll(fitsSarpoli).toBe(true);
  const restoredScroll = await page.evaluate(() => scrollY);
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-maker-motion", "running");
  await expect.poll(() => page.evaluate(() => scrollY)).toBeCloseTo(restoredScroll, 0);
  await expect.poll(fitsSarpoli).toBe(true);
  await expect(canvas(page)).toHaveCount(1);
});

test("keyboard pause stops page motion and restores the static artwork without losing focus", async ({ page }) => {
  await openJourney(page);
  const pause = page.getByRole("button", { name: "Pause motion", exact: true });
  await pause.focus();
  await page.keyboard.press("Enter");
  const play = page.getByRole("button", { name: "Play motion", exact: true });
  await expect(play).toHaveAttribute("aria-pressed", "true");
  await expect(play).toBeFocused();
  await expect(page.locator("html")).toHaveAttribute("data-maker-motion", "paused");
  await expect(page.locator("html")).not.toHaveClass(/lenis/);
  await expect(page.locator(".scroll-progress")).not.toBeVisible();
  await expectFallback(page);
  await page.keyboard.press("Enter");
  await expect(pause).toHaveAttribute("aria-pressed", "false");
  await expect(pause).toBeFocused();
  await expect(page.locator("html")).toHaveAttribute("data-maker-motion", "running");
  await expect(canvas(page)).toHaveCount(1);
});

test("reduced motion never requests WebGL, and changing the preference disposes and restores one canvas", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    let attempts = 0;
    Object.defineProperty(window, "__webglAttempts", { get: () => attempts });
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, attributes?: WebGLContextAttributes) {
      if (type.startsWith("webgl")) attempts++;
      return original.call(this, type, attributes);
    } as typeof original;
  });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-maker-motion", "fallback");
  await expect(canvas(page)).toHaveCount(0);
  await expectFallback(page);
  expect(await page.evaluate(() => (window as Window & { __webglAttempts?: number }).__webglAttempts)).toBe(0);
  await expect(page.getByRole("button", { name: "Pause motion", exact: true })).not.toBeVisible();
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(page.locator("html")).toHaveAttribute("data-maker-motion", "running");
  await expect(canvas(page)).toHaveCount(1);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(canvas(page)).toHaveCount(0);
  await expectFallback(page);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(page.locator("html")).toHaveAttribute("data-maker-motion", "running");
  await expect(canvas(page)).toHaveCount(1);
});

test("unavailable WebGL leaves complete artwork and working project navigation", async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, attributes?: WebGLContextAttributes) {
      return type.startsWith("webgl") ? null : original.call(this, type, attributes);
    } as typeof original;
  });
  await page.goto("/");
  await expect(page.locator("h1")).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("data-maker-motion", "fallback");
  await expectFallback(page);
  await expect(canvas(page)).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Pause motion", exact: true })).not.toBeVisible();
  await page.locator("[data-project-card='vela'] a[data-project-link]").click();
  await expect(page).toHaveURL(/\/vela$/);
  await expect(page.locator("h1")).toContainText(/Just\s*say it\./);
});

test("server-rendered artwork and app navigation work without JavaScript", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto(baseURL || "http://127.0.0.1:3000");
    await expect(page.locator("h1")).toHaveText(/Good ideas\.\s*Made real\./);
    await expectFallback(page);
    await expect(canvas(page)).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Pause motion", exact: true })).not.toBeVisible();
    await page.locator("[data-project-card='vela'] a[data-project-link]").click();
    await expect(page).toHaveURL(/\/vela$/);
    await expect(page.locator("h1")).toContainText(/Just\s*say it\./);
  } finally {
    await context.close();
  }
});

test("a lost WebGL context falls back and restores without duplicate canvases", async ({ page }) => {
  await openJourney(page);
  const supported = await canvas(page).evaluate(element => {
    const context = (element as HTMLCanvasElement).getContext("webgl2");
    const extension = context?.getExtension("WEBGL_lose_context");
    if (!extension) return false;
    (window as Window & { __restoreMakerContext?: () => void }).__restoreMakerContext = () => extension.restoreContext();
    extension.loseContext();
    return true;
  });
  expect(supported, "Chromium provides the context-loss extension").toBe(true);
  await expect(page.locator("html")).toHaveAttribute("data-maker-motion", "fallback");
  await expectFallback(page);
  await expect(page.getByRole("button", { name: "Pause motion", exact: true })).not.toBeVisible();
  await page.evaluate(() => (window as Window & { __restoreMakerContext?: () => void }).__restoreMakerContext?.());
  await expect(page.locator("html")).toHaveAttribute("data-maker-motion", "running");
  await expect(canvas(page)).toHaveCount(1);
  await expect(page.getByRole("button", { name: "Pause motion", exact: true })).toBeVisible();
});

test("client navigation releases the journey and returning home starts one fresh scene", async ({ page }) => {
  await openJourney(page);
  await page.getByRole("button", { name: "Pause motion", exact: true }).click();
  await page.locator("[data-project-card='vela'] a[data-project-link]").click();
  await expect(page).toHaveURL(/\/vela$/);
  await expect(canvas(page)).toHaveCount(0);
  await expect(page.locator("html")).not.toHaveAttribute("data-maker-motion");
  await page.getByRole("link", { name: "← daryanmade", exact: true }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator("html")).toHaveAttribute("data-maker-motion", "running");
  await expect(canvas(page)).toHaveCount(1);
  await expect(page.getByRole("button", { name: "Pause motion", exact: true })).toHaveAttribute("aria-pressed", "false");
  await expect(page.locator(".scroll-progress")).not.toHaveAttribute("hidden");
  await expect(page.locator("html")).toHaveClass(/lenis/);
});
