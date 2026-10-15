import { expect, test, type Page } from "@playwright/test";

test.use({ launchOptions: { args: ["--enable-unsafe-swiftshader"] }, reducedMotion: "no-preference" });

const headingLines = "[data-home-line], [data-home-heading-line]";

async function expectSettledText(page: Page, selector = headingLines) {
  await expect.poll(() => page.locator(selector).evaluateAll(elements => elements
    .filter(element => {
      const style = getComputedStyle(element);
      return style.transform !== "none" || style.opacity !== "1" || style.visibility !== "visible";
    })
    .map(element => element.textContent?.trim())), { message: "Presented text stays fully visible and untransformed" }).toEqual([]);
}

async function expectUnclippedHeadingInk(page: Page) {
  const clipped = await page.locator(headingLines).evaluateAll(lines => {
    const context = document.createElement("canvas").getContext("2d")!;
    const issues: string[] = [];
    for (const line of lines) {
      const mask = line.parentElement!.getBoundingClientRect();
      const walker = document.createTreeWalker(line, NodeFilter.SHOW_TEXT);
      let node: Node | null;
      while ((node = walker.nextNode())) {
        const text = node.textContent || "";
        if (!text.trim()) continue;
        const range = document.createRange();
        range.selectNodeContents(node);
        const bounds = range.getBoundingClientRect();
        const style = getComputedStyle(node.parentElement!);
        context.font = style.font;
        const metrics = context.measureText(text);
        // DOM text rectangles include unused font leading. Measure the actual
        // painted ascenders/descenders instead, including italic text and wraps.
        const inkTop = bounds.top + metrics.fontBoundingBoxAscent - metrics.actualBoundingBoxAscent;
        const inkBottom = bounds.bottom - metrics.fontBoundingBoxDescent + metrics.actualBoundingBoxDescent;
        if (bounds.left < mask.left - 2 || bounds.right > mask.right + 2 || inkTop < mask.top - 2 || inkBottom > mask.bottom + 2) {
          issues.push(`${text.trim()}: left=${(bounds.left - mask.left).toFixed(1)}, right=${(mask.right - bounds.right).toFixed(1)}, top=${(inkTop - mask.top).toFixed(1)}, bottom=${(mask.bottom - inkBottom).toFixed(1)}`);
        }
      }
    }
    return issues;
  });
  expect(clipped, "Heading masks contain every word, punctuation mark and descender").toEqual([]);
}

for (const width of [1440, 390]) {
  test(`fast section jumps reveal headings once and reverse scrolling keeps them stable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/#about");
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator("#about-title")).toBeInViewport();
    await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));
    await expectSettledText(page);

    // Jump directly past whole sections, then reverse before lingering on one.
    // None of the already-presented reading text should scrub out or replay.
    for (const id of ["work", "about", "work"]) {
      await page.locator(`#${id}`).evaluate(element => element.scrollIntoView({ behavior: "instant" }));
      await expectSettledText(page);
    }
    await page.waitForTimeout(250);
    await expectSettledText(page);
    await expectUnclippedHeadingInk(page);
  });
}

test("pausing during the opening sequence immediately restores all reading text", async ({ page }) => {
  await page.clock.install();
  await page.clock.pauseAt(new Date());
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("[data-home-line]").first()).toHaveAttribute("style", /105%/);
  const pause = page.getByRole("button", { name: "Pause motion", exact: true });
  await expect(pause).toBeVisible();
  // Dispatch through the real control while the animation clock is frozen;
  // Playwright's click stability frames would otherwise wait for that clock.
  await pause.dispatchEvent("click");
  await expect(page.getByRole("button", { name: "Play motion", exact: true })).toBeVisible();
  await expectSettledText(page, `${headingLines}, [data-home-note]`);
  await page.clock.runFor(2000);
  await expectSettledText(page, `${headingLines}, [data-home-note]`);
  await expectUnclippedHeadingInk(page);
});

test("reduced motion leaves headline punctuation and italic descenders fully readable", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    await expectSettledText(page);
    await expectUnclippedHeadingInk(page);
  }
});

test("server-rendered heading masks remain readable without JavaScript", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 1000 } });
  try {
    const page = await context.newPage();
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(baseURL || "http://127.0.0.1:3000");
      await page.evaluate(() => document.fonts.ready);
      await expect(page.locator("h1")).toHaveText(/Good ideas\.\s*Made real\./);
      await expectSettledText(page);
      await expectUnclippedHeadingInk(page);
    }
  } finally {
    await context.close();
  }
});
