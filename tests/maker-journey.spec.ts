import { expect, test, type Page } from "@playwright/test";

test.use({ launchOptions: { args: ["--enable-unsafe-swiftshader"] } });

const stages = ["hero", "sarpoli", "vela", "wardrobe", "kaizencv", "koebsklar", "shield-family", "iqra", "work", "about", "closing"] as const;
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

async function paintedBounds(page: Page, stage?: string) {
  return canvas(page).evaluate(async (element: HTMLCanvasElement, stage) => {
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
    const scale = element.getBoundingClientRect().width / copy.width;
    const slot = stage ? document.querySelector(`[data-maker-anchor="${stage}"]`)?.getBoundingClientRect() : undefined;
    for (let index = 0; index < data.length; index += 4) {
      // All brand colors, excluding the transparent canvas and soft shadow.
      if (data[index + 3] < 100) continue;
      const pixel = index / 4, x = pixel % copy.width, y = Math.floor(pixel / copy.width);
      if (slot && (x * scale < slot.left - 10 || x * scale > slot.right + 10 || y * scale < slot.top - 10 || y * scale > slot.bottom + 10)) continue;
      left = Math.min(left, x); top = Math.min(top, y);
      right = Math.max(right, x); bottom = Math.max(bottom, y); count++;
      for (let channel = 0; channel < 3; channel++) sum[channel] += data[index + channel];
    }
    return { left: left * scale, top: top * scale, right: right * scale, bottom: bottom * scale, width: (right - left) * scale, height: (bottom - top) * scale, count, color: sum.map(value => value / Math.max(1, count)) };
  }, stage);
}

async function jumpTo(page: Page, top: number) {
  await page.evaluate(value => window.scrollTo({ top: value, behavior: "instant" }), top);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeCloseTo(Math.round(top), 0);
}

for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
  test(`one sculpture travels to and settles in each project slot at ${viewport.width}px`, async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize(viewport);
    await preserveDrawingBuffer(page);
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await openJourney(page);
    await expect(canvas(page)).toHaveCSS("pointer-events", "none");
    await expect(canvas(page).locator("..")).toHaveCSS("position", "fixed");
    await expect(canvas(page).locator("..")).toHaveCSS("z-index", "2147483646");
    expect(await canvas(page).evaluate(element => element.parentElement?.parentElement === document.body)).toBe(true);
    const pigment = await paintedBounds(page, "hero");
    expect(pigment.color[0]).toBeGreaterThan(200);
    expect(pigment.color[0]).toBeGreaterThan(pigment.color[1] * 1.8);
    expect(pigment.count).toBeGreaterThan(1000);
    for (const stage of stages) {
      const slot = page.locator(`[data-maker-anchor='${stage}']`);
      const destination = await slot.evaluate(element => {
        const bounds = element.getBoundingClientRect();
        return Math.min(document.documentElement.scrollHeight - innerHeight, Math.max(0, bounds.top + scrollY + bounds.height / 2 - innerHeight * (
          element.getAttribute("data-maker-anchor") === "shield-family" && innerWidth > 700 ? .76 :
          element.getAttribute("data-maker-anchor") === "iqra" && innerWidth > 700 ? .28 : .52)));
      });
      await jumpTo(page, destination);
      await expect(canvas(page)).toHaveAttribute("data-maker-stage", stage);
      await expect(canvas(page)).toHaveAttribute("data-maker-form", "settled");
      await expect(canvas(page)).toHaveAttribute("data-maker-location", "docked");
      const art = await paintedBounds(page, stage);
      const bounds = (await slot.boundingBox())!;
      expect(art.count).toBeGreaterThan(30);
      expect(art.width).toBeGreaterThan(Math.min(bounds.width, bounds.height) * .20);
      expect(art.left).toBeGreaterThanOrEqual(bounds.x - 10);
      expect(art.right).toBeLessThanOrEqual(bounds.x + bounds.width + 10);

      await expect(canvas(page)).toHaveCount(1);
    }
    expect(errors).toEqual([]);
  });
}

test("mobile morph unfolds before arrival, survives toolbar resize, and docks as a complete logo", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openJourney(page);
  const slotScroll = (stage: string) => page.locator(`[data-maker-anchor='${stage}']`).evaluate(element => element.getBoundingClientRect().top + scrollY + element.clientHeight / 2 - innerHeight * .52);
  const from = await slotScroll("sarpoli");
  const to = await slotScroll("vela");
  await jumpTo(page, from);
  await expect(canvas(page)).toHaveAttribute("data-maker-stage", "sarpoli");
  await expect(canvas(page)).toHaveAttribute("data-maker-location", "docked");
  await jumpTo(page, from + (to - from) * .58);
  await expect(canvas(page)).toHaveAttribute("data-maker-form", "forming");
  await expect(canvas(page)).toHaveAttribute("data-maker-location", "travelling");
  await page.waitForTimeout(250);
  await expect(canvas(page)).toHaveAttribute("data-maker-form", "forming");
  // A mobile toolbar can change the viewport height while a logo unfolds.
  // Updating its placement must not snap the geometry to the finished target.
  await page.setViewportSize({ width: 390, height: 900 });
  await page.waitForTimeout(150);
  await expect(canvas(page)).toHaveAttribute("data-maker-form", "forming");
  await jumpTo(page, await slotScroll("vela"));
  await expect(canvas(page)).toHaveAttribute("data-maker-location", "docked");
  expect(await canvas(page).getAttribute("data-maker-stage")).toBe("vela");
  expect(await canvas(page).getAttribute("data-maker-form")).toBe("settled");
  await page.evaluate(() => scrollBy({ top: 150, behavior: "instant" }));
  await expect(canvas(page)).toHaveAttribute("data-maker-stage", "vela");
  await expect(canvas(page)).toHaveAttribute("data-maker-form", "settled");
});

test("continuous mobile travel completes the morph before docking in both scroll directions", async ({ page }) => {
  test.setTimeout(45_000);
  await page.setViewportSize({ width: 390, height: 844 });
  await openJourney(page);
  const [from, to] = await page.locator("[data-maker-anchor='sarpoli'], [data-maker-anchor='vela']").evaluateAll(elements => elements.map(element => {
    const bounds = element.getBoundingClientRect();
    return bounds.top + scrollY + bounds.height / 2 - innerHeight * .52;
  }));
  await jumpTo(page, from);
  await expect(canvas(page)).toHaveAttribute("data-maker-stage", "sarpoli");
  await expect(canvas(page)).toHaveAttribute("data-maker-location", "docked");
  for (const [start, end, stage] of [[from, to, "vela"], [to, from, "sarpoli"]] as const) {
    const result = await page.evaluate(async ({ start, end }) => {
      const element = document.querySelector<HTMLCanvasElement>("canvas[data-maker-canvas]")!;
      let sawForming = false;
      let unfinishedDock = false;
      const started = performance.now();
      await new Promise<void>(resolve => {
        function step(now: number) {
          const progress = Math.min(1, (now - started) * .4 / Math.abs(end - start));
          scrollTo({ top: start + (end - start) * progress, behavior: "instant" });
          sawForming ||= element.dataset.makerLocation === "travelling" && element.dataset.makerForm === "forming";
          unfinishedDock ||= element.dataset.makerLocation === "docked" && element.dataset.makerForm !== "settled";
          if (progress < 1) requestAnimationFrame(step); else resolve();
        }
        requestAnimationFrame(step);
      });
      return { sawForming, unfinishedDock };
    }, { start, end });
    expect(result).toEqual({ sawForming: true, unfinishedDock: false });
    await expect(canvas(page)).toHaveAttribute("data-maker-location", "docked");
    expect(await canvas(page).getAttribute("data-maker-stage")).toBe(stage);
    expect(await canvas(page).getAttribute("data-maker-form")).toBe("settled");
  }
});

test("a toolbar resize during fast arrival preserves travel until the new logo is complete", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openJourney(page);
  const destination = await page.locator("[data-maker-anchor='vela']").evaluate(element => element.getBoundingClientRect().top + scrollY + element.clientHeight / 2 - innerHeight * .52);
  await jumpTo(page, destination);
  await expect(canvas(page)).toHaveAttribute("data-maker-form", "forming");
  await expect(canvas(page)).toHaveAttribute("data-maker-location", "travelling");
  await page.setViewportSize({ width: 390, height: 900 });
  const arrival = await canvas(page).evaluate(async element => {
    let unfinishedDock = false;
    const started = performance.now();
    return new Promise<{ unfinishedDock: boolean; arrived: boolean }>(resolve => {
      function frame() {
        const docked = element.dataset.makerLocation === "docked";
        unfinishedDock ||= docked && element.dataset.makerForm !== "settled";
        if (docked || performance.now() - started > 4000) resolve({ unfinishedDock, arrived: docked });
        else requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    });
  });
  expect(arrival).toEqual({ unfinishedDock: false, arrived: true });
  expect(await canvas(page).getAttribute("data-maker-stage")).toBe("vela");
  expect(await canvas(page).getAttribute("data-maker-form")).toBe("settled");
});

test("resize and restored scroll preserve the current project artwork", async ({ page }) => {
  await preserveDrawingBuffer(page);
  await openJourney(page);
  await page.setViewportSize({ width: 1024, height: 900 });
  const destination = await page.locator("[data-maker-anchor='sarpoli']").evaluate(element => {
    const bounds = element.getBoundingClientRect();
    return bounds.top + scrollY + bounds.height / 2 - innerHeight * 0.52;
  });
  await jumpTo(page, destination);
  const fitsSarpoli = async () => {
    const bounds = await paintedBounds(page, "sarpoli");
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
