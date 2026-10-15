import { expect, test } from "@playwright/test";

test.use({ launchOptions: { args: ["--enable-unsafe-swiftshader"] } });

test("project stories remain complete and readable with reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const agency = page.locator('[data-project-card="sarpoli"]');
  await expect(agency.getByText("Judgment stays human.")).toBeVisible();
  await expect(agency.getByText("Schedule 2", { exact: true })).toBeVisible();
  const career = page.locator('[data-project-card="kaizencv"]');
  await expect(career.getByText("Led day-to-day operations", { exact: false })).toBeVisible();
  const property = page.locator('[data-project-card="koebsklar"]');
  await expect(property.getByText("Estimated reduction, depending on the case.", { exact: false })).toBeVisible();
  await expect(property.getByText("Professional review remains essential.", { exact: false })).toBeVisible();
  await expect(property.getByText("10–20% remaining", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Replay Sarpoli workflow" })).toBeHidden();
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    const coachReview = await career.getByText("Review before you apply", { exact: true }).boundingBox();
    const careerOutcome = await career.locator("[data-story-outcome]").boundingBox();
    expect(coachReview).not.toBeNull();
    expect(careerOutcome!.y, "Career outcome does not cover the review instruction").toBeGreaterThan(coachReview!.y + coachReview!.height);
    const deliverables = await property.getByText("Analysis report", { exact: true }).boundingBox();
    const propertyOutcome = await property.locator("[data-story-outcome]").boundingBox();
    expect(deliverables).not.toBeNull();
    expect(propertyOutcome!.y, "Property outcome does not cover the deliverable labels").toBeGreaterThan(deliverables!.y + deliverables!.height);
  }
});

test("Danish scene copy fits the same readable surfaces", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/da");
  await expect(page.locator('[data-project-story="sarpoli"]')).toContainText("Beslutningen er stadig din.");
  await expect(page.locator('[data-project-story="kaizencv"]')).toContainText("Ledte den daglige drift");
  await expect(page.locator('[data-project-story="koebsklar"]')).toContainText("10–20% tilbage");
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const story of ["kaizencv", "koebsklar"]) {
      const scene = page.locator(`[data-project-story="${story}"]`);
      const surface = await scene.locator("[data-story-result]").boundingBox();
      const outcome = await scene.locator("[data-story-outcome]").boundingBox();
      expect(outcome!.y, `${story} Danish outcome leaves the reading surface clear at ${width}px`).toBeGreaterThan(surface!.y + surface!.height);
    }
  }
});

for (const width of [390, 768, 1440]) {
  test(`paper stays opaque and correctly stacked throughout every workflow at ${width}px`, async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width, height: 1000 });
    await page.clock.install();
    await page.goto("/");
    for (const story of ["sarpoli", "kaizencv", "koebsklar"]) {
      const scene = page.locator(`[data-project-story="${story}"]`);
      await scene.scrollIntoViewIfNeeded();
      const replay = scene.getByRole("button", { name: /^Replay / });
      await expect(replay).toBeEnabled();
      await expect(scene).toHaveAttribute("data-story-state", "complete");
      await page.clock.pauseAt(await page.evaluate(() => Date.now() + 2000));
      await replay.click({ force: true });
      let checkedOverlaps = 0;
      // Sample actual painted stacking during the entire entrance, processing,
      // and approval sequence. Final screenshots alone missed the original bug.
      for (let frame = 0; frame <= 40; frame++) {
        await page.clock.runFor(frame === 0 ? 1 : 120);
        const rendered = await scene.evaluate(element => {
          const surfaces = [...element.querySelectorAll<HTMLElement>("[data-story-surface]")];
          const violations: string[] = [];
          let overlaps = 0;
          const rank = (surface: Element) => ({ back: 0, source: 1, result: 2 })[surface.getAttribute("data-story-surface") as "back" | "source" | "result"];
          for (const surface of surfaces) {
            for (let node: HTMLElement | null = surface; node && node !== element; node = node.parentElement) {
              const style = getComputedStyle(node);
              if (Number(style.opacity) < .999) violations.push(`${surface.dataset.storySurface} becomes translucent`);
              if (style.transform !== "none" && !new DOMMatrix(style.transform).is2D) violations.push(`${surface.dataset.storySurface} rotates through a reading plane`);
            }
          }
          for (let a = 0; a < surfaces.length; a++) for (let b = a + 1; b < surfaces.length; b++) {
            if (rank(surfaces[a]) === rank(surfaces[b])) continue;
            const first = surfaces[a].getBoundingClientRect(), second = surfaces[b].getBoundingClientRect();
            const left = Math.max(first.left, second.left, 0), right = Math.min(first.right, second.right, innerWidth);
            const top = Math.max(first.top, second.top, 0), bottom = Math.min(first.bottom, second.bottom, innerHeight);
            if (right <= left || bottom <= top) continue;
            for (let x = 1; x <= 5; x++) for (let y = 1; y <= 5; y++) {
              const layers = [...new Set(document.elementsFromPoint(left + (right - left) * x / 6, top + (bottom - top) * y / 6).map(node => node.closest("[data-story-surface]")))];
              const aIndex = layers.indexOf(surfaces[a]), bIndex = layers.indexOf(surfaces[b]);
              if (aIndex < 0 || bIndex < 0) continue; // Rotated corners and unrevealed areas do not count.
              overlaps++;
              if ((rank(surfaces[a]) > rank(surfaces[b])) !== (aIndex < bIndex)) violations.push("The rear page paints above its foreground surface");
            }
          }
          return { count: surfaces.length, overlaps, violations };
        });
        expect(rendered.count).toBeGreaterThan(2);
        expect(rendered.violations, `${story}, frame ${frame} at ${width}px`).toEqual([]);
        checkedOverlaps += rendered.overlaps;
      }
      expect(checkedOverlaps, `${story} exercised real overlapping painted regions`).toBeGreaterThan(0);
      await expect(scene).toHaveAttribute("data-story-state", "complete");
      await page.clock.resume();
    }
  });
}

test.describe("explanatory motion", () => {
  test("a glimpse does not start a demonstration before there is room to read it", async ({ page }) => {
    await page.goto("/");
    const scene = page.locator('[data-project-story="sarpoli"]');
    await expect(scene).toHaveAttribute("data-story-state", "waiting");
    await page.evaluate(() => {
      const scene = document.querySelector('[data-project-story="sarpoli"]')!;
      window.scrollTo({ top: scene.getBoundingClientRect().top + scrollY - innerHeight + 120, behavior: "instant" });
    });
    await page.waitForTimeout(500);
    await expect(scene).toHaveAttribute("data-story-state", "waiting");
    await scene.scrollIntoViewIfNeeded();
    await expect(scene).toHaveAttribute("data-story-state", "playing");
    await expect(scene).toHaveAttribute("data-story-state", "complete");
  });

  test("a fast pass settles skipped stories without replaying on reverse scroll", async ({ page }) => {
    await page.goto("/");
    const scene = page.locator('[data-project-story="sarpoli"]');
    await expect(scene.getByRole("button", { name: /^Replay / })).toBeEnabled();
    await page.evaluate(() => {
      const scene = document.querySelector('[data-project-story="sarpoli"]')!;
      window.scrollTo({ top: scene.getBoundingClientRect().bottom + scrollY + 80, behavior: "instant" });
    });
    await expect(scene).toHaveAttribute("data-story-state", "complete");
    await scene.scrollIntoViewIfNeeded();
    await page.waitForTimeout(250);
    await expect(scene).toHaveAttribute("data-story-state", "complete");
    await expect(scene).toHaveAttribute("data-story-phase", "complete");
  });

  test("a completed story stays settled on return and replay honors the global pause", async ({ page }) => {
    await page.goto("/");
    const scene = page.locator('[data-project-story="sarpoli"]');
    await scene.scrollIntoViewIfNeeded();
    await expect(scene).toHaveAttribute("data-story-state", "complete");
    const replay = page.getByRole("button", { name: "Replay Sarpoli workflow" });
    await expect(replay).toBeEnabled();
    await replay.click();
    await expect(scene).toHaveAttribute("data-story-state", "playing");
    await page.getByRole("button", { name: "Pause motion", exact: true }).click();
    await expect(scene).toHaveAttribute("data-story-state", "complete");
    await expect(replay).toBeDisabled();
    await page.getByRole("button", { name: "Play motion", exact: true }).click();
    await expect(replay).toBeEnabled();
    await expect(scene).toHaveAttribute("data-story-state", "complete");
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await scene.scrollIntoViewIfNeeded();
    await expect(scene).toHaveAttribute("data-story-state", "complete");
  });
});
