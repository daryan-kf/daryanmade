import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { contactEmail, projectPath, projects } from "../src/lib/projects";

const projectCards = (page: Page) => page.locator("#work article[data-project-card]");
const expectedPaths = () => ["/", "/privacy", ...projects.map(projectPath)].sort();
const expectedCardLinks = [
  ["sarpoli", "https://sarpoli.com"],
  ["vela", "/vela"],
  ["wardrobe", null],
  ["kaizencv", "https://www.kaizencv.com"],
  ["koebsklar", "https://koebsklar.vercel.app/"],
  ["shield-family", "/projects/shield-family"],
  ["iqra", "/iqra"],
  ["next-project", "/projects/next-project"],
] as const;
async function loadPage(page: Page, path: string) {
  const response = await page.goto(path);
  expect(response?.status(), `${path} response status`).toBe(200);
  await page.locator("h1").waitFor({ state: "visible" });
  await page.evaluate(() => document.fonts.ready);
}
async function revealAndCheckImages(page: Page) {
  const images = page.locator("main img");
  for (const image of await images.all()) {
    if (!(await image.isVisible())) continue;
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0), { message: `Image loads: ${await image.getAttribute("src")}` }).toBe(true);
  }
}
async function assertNoOverflow(page: Page) {
  const widths = await page.evaluate(() => ({ viewport: window.innerWidth, document: document.documentElement.scrollWidth, body: document.body.scrollWidth }));
  expect(widths.document, JSON.stringify(widths)).toBeLessThanOrEqual(widths.viewport + 1);
  expect(widths.body, JSON.stringify(widths)).toBeLessThanOrEqual(widths.viewport + 1);
}

test("homepage presents eight full project cards with the intended live destinations", async ({ page }) => {
  await loadPage(page, "/");
  await expect(page).toHaveTitle(/daryanmade/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/Good ideas\.\s*Made real\./);
  await expect(page.getByText("DARYAN KAMALIFAR", { exact: true }).first()).toBeVisible();
  await expect(page.locator("header .founder-link")).toHaveAttribute("href", "https://sarpoli.com");
  await expect(projectCards(page)).toHaveCount(8);
  expect(await projectCards(page).evaluateAll(cards => cards.map(card => card.getAttribute("data-project-card")))).toEqual(expectedCardLinks.map(([slug]) => slug));
  for (const [slug, href] of expectedCardLinks) {
    const card = page.locator(`#work article[data-project-card='${slug}']`);
    const project = projects.find(item => item.slug === slug)!;
    await expect(card.getByRole("heading", { name: project.name, exact: true })).toBeVisible();
    if (!["sarpoli", "vela", "wardrobe", "kaizencv", "koebsklar"].includes(slug)) await expect(card).toContainText(project.summary);
    await expect(card).toContainText(project.status);
    if (href === null) {
      await expect(card).toHaveAttribute("aria-disabled", "true");
      await expect(card.locator("a, button, [tabindex='0']")).toHaveCount(0);
      await expect(card).toContainText("Coming soon");
      continue;
    }
    const primaryLink = card.locator("a[data-project-link]");
    if (href.startsWith("https://")) {
      expect(new URL((await primaryLink.getAttribute("href"))!).href).toBe(new URL(href).href);
      await expect(card.locator("a[data-project-link]")).toHaveAttribute("target", "_blank");
      await expect(card.locator("a[data-project-link]")).toHaveAttribute("rel", /noopener/);
    } else {
      await expect(primaryLink).toHaveAttribute("href", href);
    }
    if (project.storeUrl && slug !== "vela") await expect(card.getByRole("link", { name: `Download ${project.name} on the App Store` })).toHaveAttribute("href", project.storeUrl);
  }
  await expect(page.locator("[data-project-card='vela']")).toContainText("Vela 2.0 · Available for iPhone & iPad");
  await expect(page.locator("[data-project-card='sarpoli']")).toContainText("I founded Sarpoli");
  await expect(page.locator("[data-project-card='kaizencv']")).toContainText("review suggestions before they become your words");
  await expect(page.locator("[data-project-card='koebsklar']")).toContainText("Estimated reduction, depending on the case");
  await expect(page.locator("[data-project-card='koebsklar']")).toContainText("Professional review remains essential");
  await expect(page.locator("main")).not.toContainText(/co-founder/i);
  await expect(page.locator("#work").getByRole("link", { name: /^Download .+ on the App Store$/ })).toHaveCount(2);
  await expect(page.getByRole("button", { name: /^(Live|All work|In the making)/ })).toHaveCount(0);
});

test("the public portfolio omits discontinued projects and keeps the next project a surprise", async ({ page }) => {
  await loadPage(page, "/");
  for (const slug of ["anubal", "marzline", "rd-revision"]) {
    await expect(page.locator(`a[href='/projects/${slug}']`)).toHaveCount(0);
  }
  await expect(page.locator("main")).not.toContainText(/Anubal|Marzline|RD Revision/i);
  await loadPage(page, "/projects/next-project");
  await expect(page.locator("h1")).toHaveText(/Something good\s*is taking shape\./);
  await expect(page.locator(".teaser-content > p")).toHaveText(/A new project, quietly in the making\.\s*I’ll share more in 2027\./);
  await expect(page.locator("main img, .product-features, .screenshot-section")).toHaveCount(0);
  await expect(page).toHaveTitle(/Next project/);
  await expect(page.locator("main")).toContainText(/2027|next year/i);
});

test("social previews render PNGs, the sitemap lists current projects, and removed routes return 404", async ({ request }) => {
  for (const path of ["/opengraph-image", "/vela/opengraph-image", "/iqra/opengraph-image"]) {
    const response = await request.get(path);
    expect(response.status(), path).toBe(200);
    expect(response.headers()["content-type"]).toContain("image/png");
    expect([...((await response.body()).subarray(0, 8))]).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
  }
  const icon = await request.get("/icon.svg");
  expect(icon.status()).toBe(200);
  expect(icon.headers()["content-type"]).toContain("image/svg+xml");
  const iconSvg = await icon.text();
  expect(iconSvg).toContain('stroke-linecap="round"');
  expect(iconSvg).toContain('stroke-width="4.7"');
  expect(iconSvg).toContain('<svg');
  const sitemapResponse = await request.get("/sitemap.xml");
  expect(sitemapResponse.status()).toBe(200);
  const sitemap = await sitemapResponse.text();
  const projectPaths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => new URL(match[1]).pathname).sort();
  expect(projectPaths).toEqual(expectedPaths());
  expect(projectPaths).not.toContain("/projects/vela");
  expect(projectPaths).not.toContain("/projects/iqra");
  expect(sitemap).not.toMatch(/anubal|marzline|rd-revision/i);
  const removed = await request.get("/projects/marzline");
  expect(removed.status()).toBe(404);
});

test("project category navigation reaches each complete collection without filtering cards", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await loadPage(page, "/");
  const directory = page.getByRole("navigation", { name: "Project categories" });
  for (const [label, id, count] of [["Agency", "agency", 1], ["A new chapter", "featured", 2], ["Web apps", "web-apps", 2], ["Mobile apps", "mobile-apps", 2], ["Next chapter", "next-chapter", 1]] as const) {
    await directory.getByRole("link", { name: new RegExp(`^${label}`) }).click();
    await expect(page).toHaveURL(new RegExp(`#${id}$`));
    await expect(page.locator(`#${id} article[data-project-card]`)).toHaveCount(count);
    await expect(page.locator(`#${id}`).getByRole("heading", { name: new RegExp(`^${label}`) }).first()).toBeVisible();
    await expect(projectCards(page)).toHaveCount(8);
  }
});

test("older app URLs permanently redirect to their branded homes", async ({ request, page }) => {
  for (const [source, destination] of [["/projects/vela", "/vela"], ["/projects/iqra", "/iqra"], ["/villa", "/vela"]]) {
    const response = await request.get(source, { maxRedirects: 0 });
    expect(response.status()).toBe(308);
    expect(new URL(response.headers().location, response.url()).pathname).toBe(destination);
    await loadPage(page, source);
    await expect(page).toHaveURL(new RegExp(`${destination}$`));
    await expect(page.locator("link[rel='canonical']")).toHaveAttribute("href", new RegExp(`${destination}$`));
  }
});

test("the footer gives clients, collaborators and contributors a direct way to get in touch", async ({ page }) => {
  await loadPage(page, "/");
  const invitations = page.locator("footer [aria-label='Ways to work together']");
  const subjects: string[] = [];
  for (const label of ["Build it for me.", "Build it with me.", "Be part of a project."]) {
    const link = invitations.getByRole("link").filter({ has: page.getByRole("heading", { name: label, exact: true }) });
    await expect(link).toBeVisible();
    const href = new URL((await link.getAttribute("href"))!);
    expect(href.protocol).toBe("mailto:");
    expect(href.pathname).toBe(contactEmail);
    expect(href.searchParams.get("subject")).toBeTruthy();
    subjects.push(href.searchParams.get("subject")!);
  }
  expect(new Set(subjects).size).toBe(3);
  await expect(invitations.getByRole("link")).toHaveCount(3);
  await expect(page.locator("footer").getByRole("link", { name: "Privacy", exact: true })).toHaveAttribute("href", "/privacy");
});

test("all project pages load with owner attribution, useful actions, and working local imagery", async ({ page }) => {
  test.setTimeout(180_000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("response", (response) => {
    if (response.url().includes("127.0.0.1") && response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
  });
  for (const project of projects) {
    await loadPage(page, projectPath(project));
    await expect(page).toHaveTitle(new RegExp(project.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    if (project.slug === "vela" || project.slug === "iqra") {
      await expect(page.locator("h1")).toContainText(project.slug === "vela" ? /Just\s*say it\./ : /You don’t have\s*to know Arabic\s*to begin\./);
      await expect(page.getByRole("link", { name: "Made by Daryan ↗", exact: true })).toHaveAttribute("href", "/");
      await expect(page.locator(`a[href^='https://apps.apple.com/'][href*='${project.storeUrl!.split("/").pop()}']`).first()).toBeVisible();
      await expect(page.locator("link[rel='canonical']")).toHaveAttribute("href", new RegExp(`${projectPath(project)}$`));
      await revealAndCheckImages(page);
      await assertNoOverflow(page);
      continue;
    }
    if (project.slug === "shield-family") {
      await expect(page.locator("h1")).toHaveText(/A better answer\s*to “five more\s*minutes\.”/);
      await expect(page.getByText("An independent project by Daryan Kamalifar", { exact: true })).toBeVisible();
      await expect(page.getByRole("link", { name: "Back to daryanmade", exact: true })).toHaveAttribute("href", "/");
      await expect(page.locator(`a[href^='https://apps.apple.com/'][href*='${project.storeUrl!.split("/").pop()}']`).first()).toBeVisible();
      await revealAndCheckImages(page);
      await assertNoOverflow(page);
      continue;
    }
    if (project.slug === "next-project") {
      await expect(page.locator("h1")).toHaveText(/Something good\s*is taking shape\./);
      await expect(page.locator("main")).toContainText("2027");
      await expect(page.locator("main a[href='https://www.linkedin.com/in/daryan-kf/']")).toBeVisible();
      await assertNoOverflow(page);
      continue;
    }
    await expect(page.locator("h1")).toHaveText(project.headline);
    await expect(page.locator(".project-breadcrumb .status")).toHaveText(project.status);
    await expect(page.locator(".maker-trust")).toContainText("Daryan Kamalifar");
    await expect(page.locator(".maker-trust a").first()).toHaveAttribute("href", "https://www.linkedin.com/in/daryan-kf/");
    const action = page.locator(".product-actions > a").first();
    await expect(action).toHaveAttribute("href", project.storeUrl || project.url || new RegExp(`mailto:${contactEmail.replace(/\./g, "\\.")}\\?subject=`));
    if (!project.url) await expect(page.locator(".availability-note")).toHaveText(/Coming soon|in the making|Public access is not available yet/);
    await revealAndCheckImages(page);
    await assertNoOverflow(page);
  }
  expect(errors).toEqual([]);
});

test("screenshot dialog supports keyboard navigation, Escape, and focus return", async ({ page }) => {
  await loadPage(page, "/projects/kaizencv");
  const preview = page.getByRole("button", { name: "Enlarge KaizenCV: Nova résumé template", exact: true });
  await preview.scrollIntoViewIfNeeded();
  await preview.focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog", { name: "KaizenCV enlarged preview" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Close enlarged preview" })).toBeFocused();
  await expect(dialog.getByRole("button", { name: /Previous/ })).toBeDisabled();
  await dialog.getByRole("button", { name: /Next/ }).click();
  await expect(dialog.locator(".image-dialog-toolbar > span")).toHaveText("Flux résumé template");
  await expect(dialog.getByRole("button", { name: /Previous/ })).toBeEnabled();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(preview).toBeFocused();
});

test("mobile menu closes on Escape, restores focus, and reaches section anchors", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await loadPage(page, "/");
  const toggle = page.locator("header .menu-button");
  const navigation = page.getByRole("navigation", { name: "Main navigation" });
  const founder = page.locator("header .founder-link");
  await expect(founder).toBeVisible();
  const founderBox = await founder.boundingBox();
  const brandBox = await page.locator("header .brand").boundingBox();
  const menuBox = await toggle.boundingBox();
  expect(founderBox).not.toBeNull();
  for (const box of [brandBox, menuBox]) {
    expect(box).not.toBeNull();
    const overlapWidth = Math.min(founderBox!.x + founderBox!.width, box!.x + box!.width) - Math.max(founderBox!.x, box!.x);
    const overlapHeight = Math.min(founderBox!.y + founderBox!.height, box!.y + box!.height) - Math.max(founderBox!.y, box!.y);
    expect(overlapWidth <= 0 || overlapHeight <= 0, "Founder link does not overlap the brand or menu").toBe(true);
  }
  await expect(navigation).not.toBeVisible();
  await toggle.click();
  await expect(navigation).toBeVisible();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Escape");
  await expect(navigation).not.toBeVisible();
  await expect(toggle).toBeFocused();
  await toggle.click();
  await navigation.getByRole("link", { name: /The work/ }).click();
  await expect(page).toHaveURL(/\/#work$/);
  await expect(navigation).not.toBeVisible();
  await expect.poll(() => page.locator("#work").evaluate((element) => Math.abs(element.getBoundingClientRect().top))).toBeLessThan(130);
});

test("keyboard users can skip the header and navigate project categories", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await loadPage(page, "/");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main-content$/);
  const mobile = page.getByRole("navigation", { name: "Project categories" }).getByRole("link", { name: /^Mobile apps/ });
  await mobile.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#mobile-apps$/);
  await expect(page.locator("#mobile-apps article[data-project-card]")).toHaveCount(2);
});

test("FAQ answers animate open and closed, and expose keyboard controls correctly", async ({ page }) => {
  await loadPage(page, "/");
  const question = page.locator(".home-faq [data-faq-trigger]").first();
  await question.scrollIntoViewIfNeeded();
  const answerId = await question.getAttribute("aria-controls");
  const panel = page.locator(`[id="${answerId}"]`);
  await expect(question).toHaveAttribute("aria-expanded", "false");
  await expect(panel).toHaveAttribute("aria-hidden", "true");
  await expect(panel).toHaveAttribute("inert", "");
  const duration = await panel.evaluate(element => getComputedStyle(element).transitionDuration.split(",").map(value => parseFloat(value)));
  expect(Math.max(...duration)).toBeGreaterThan(0);
  await question.click();
  await expect(question).toHaveAttribute("aria-expanded", "true");
  await expect(panel).toHaveAttribute("aria-hidden", "false");
  await expect(panel).toBeVisible();
  await expect.poll(() => panel.evaluate(element => element.getBoundingClientRect().height)).toBeGreaterThan(20);
  await question.click();
  await expect(question).toHaveAttribute("aria-expanded", "false");
  await expect.poll(() => panel.evaluate(element => element.getBoundingClientRect().height)).toBe(0);
  await question.focus();
  await page.keyboard.press("Enter");
  await expect(question).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("ArrowDown");
  await expect(page.locator(".home-faq [data-faq-trigger]").nth(1)).toBeFocused();
  await page.keyboard.press("End");
  await expect(page.locator(".home-faq [data-faq-trigger]").last()).toBeFocused();
  await page.keyboard.press("Home");
  await expect(question).toBeFocused();
});

test("reduced motion preserves readable content without optional scroll motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await loadPage(page, "/");
  expect(await page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches)).toBe(true);
  await expect(page.locator(".scroll-progress")).not.toBeVisible();
  for (const line of await page.locator("[data-hero-line]").all()) {
    await expect(line).toBeVisible();
    expect(await line.evaluate((element) => getComputedStyle(element).transform)).toBe("none");
  }
  expect(await page.locator("html").getAttribute("class")).not.toContain("lenis");
  await page.getByRole("heading", { name: /There’s a person/ }).scrollIntoViewIfNeeded();
  await expect(page.getByRole("heading", { name: /There’s a person/ })).toBeVisible();
});

for (const viewport of [{ width: 390, height: 844 }, { width: 768, height: 1024 }, { width: 1440, height: 1000 }]) {
  test(`home and project layouts do not overflow at ${viewport.width}px and have loaded imagery`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: "reduce" });
    for (const path of ["/", "/projects/shield-family", "/vela", "/iqra", "/projects/next-project"]) {
      await loadPage(page, path);
      await revealAndCheckImages(page);
      await assertNoOverflow(page);
      await page.evaluate(() => scrollTo(0, 0));
      const label = path === "/" ? "home" : path.split("/").pop();
      await page.screenshot({ path: `artifacts/${label}-${viewport.width}.png`, fullPage: true, animations: "disabled" });
    }
  });
}

for (const [name, path] of [["home", "/"], ["Shield Family", "/projects/shield-family"], ["Vela", "/vela"], ["Iqra", "/iqra"]]) {
  test(`axe accessibility: ${name}`, async ({ page }, testInfo) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await loadPage(page, path);
    await revealAndCheckImages(page);
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    await testInfo.attach("axe-results", { body: JSON.stringify(results, null, 2), contentType: "application/json" });
    expect(results.violations.map((violation) => ({ id: violation.id, impact: violation.impact, description: violation.description, nodes: violation.nodes.map((node) => ({ target: node.target, summary: node.failureSummary })) }))).toEqual([]);
  });
}
