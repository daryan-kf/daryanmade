import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { appUpdates, updateApps } from "../src/lib/app-updates";

test.beforeEach(async ({ page }) => { await page.emulateMedia({ reducedMotion: "reduce" }); });

for (const app of updateApps) {
  const product = appUpdates[app];
  test(`${product.name} updates accept one email and preserve it after an error`, async ({ page }) => {
    const bodies: unknown[] = [];
    await page.route(`**/api/apps/${app}/signup`, async route => {
      bodies.push(route.request().postDataJSON());
      await route.fulfill({ status: bodies.length === 1 ? 503 : 200, contentType: "application/json", body: JSON.stringify(bodies.length === 1 ? { ok: false, error: "Email is temporarily unavailable. Please try again." } : { ok: true }) });
    });
    await page.goto(`${product.home}#updates`);
    const section = page.locator(`#updates[data-updates-app="${app}"]`), form = section.getByRole("form", { name: `${product.name} email updates`, exact: true });
    const email = form.getByRole("textbox", { name: "Your email address", exact: true });
    await expect(form.getByRole("checkbox")).toHaveCount(0);
    await expect(form).toContainText("By choosing “Keep me in the loop”");
    await form.getByRole("button", { name: /Keep me in the loop/ }).click();
    await expect(form.getByRole("alert")).toBeFocused();
    await expect(email).toHaveAttribute("aria-invalid", "true");
    expect(bodies).toEqual([]);
    await email.fill("reader@example.test");
    await form.getByRole("button", { name: /Keep me in the loop/ }).click();
    await expect(form.getByRole("alert")).toContainText("temporarily unavailable");
    await expect(email).toHaveValue("reader@example.test");
    await form.getByRole("button", { name: /Try again/ }).click();
    await expect(section.getByRole("status")).toBeFocused();
    await expect(section.getByRole("heading", { name: "Check your inbox." })).toBeVisible();
    expect(bodies).toEqual(Array.from({ length: 2 }, () => ({ locale: "en", email: "reader@example.test", consentAccepted: true, website: "" })));
  });

  test(`${product.name} confirmation removes the token, waits for a click, and restores retry`, async ({ page }) => {
    const token = `synthetic.1.9999999999999.${"A".repeat(43)}`;
    let calls = 0;
    await page.route(`**/api/apps/${app}/verify`, async route => {
      calls++;
      expect(route.request().postDataJSON()).toEqual({ locale: "en", token });
      await route.fulfill({ status: calls === 1 ? 503 : 200, contentType: "application/json", body: JSON.stringify(calls === 1 ? { ok: false, error: "Please try again." } : { ok: true, status: "confirmed" }) });
    });
    await page.goto(`${product.base}/verify#token=${token}`);
    await expect(page).toHaveURL(new RegExp(`${product.base}/verify$`));
    await expect(page.getByRole("button", { name: "Confirm my email" })).toBeVisible();
    expect(calls).toBe(0);
    await page.getByRole("button", { name: "Confirm my email" }).click();
    await expect(page.locator("main").getByRole("alert")).toBeFocused();
    await page.getByRole("button", { name: "Confirm my email" }).click();
    await expect(page.getByRole("heading", { name: "You’re on the list." })).toBeFocused();
    expect(calls).toBe(2);
  });

  test(`${product.name} unsubscribe and missing links are clear and accessible`, async ({ page }) => {
    const token = `synthetic.1.0.${"A".repeat(43)}`;
    let calls = 0;
    await page.route(`**/api/apps/${app}/unsubscribe`, async route => {
      calls++;
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, status: "unsubscribed" }) });
    });
    await page.goto(`${product.base}/unsubscribe#token=${token}`);
    await expect(page).toHaveURL(new RegExp(`${product.base}/unsubscribe$`));
    expect(calls).toBe(0);
    await page.getByRole("button", { name: "Unsubscribe from this list" }).click();
    await expect(page.getByRole("heading", { name: "You’re unsubscribed." })).toBeFocused();
    expect(calls).toBe(1);
    await page.goto(`${product.base}/verify`);
    await expect(page.getByRole("heading", { name: "Open the link from your email." })).toBeVisible();
    await expect(page.getByRole("link", { name: "Request a new link" })).toHaveAttribute("href", `${product.home}#updates`);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${product.base}/privacy`);
    await expect(page.locator("main")).toContainText("Each app has its own list");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    expect(results.violations.map(item => ({ id: item.id, targets: item.nodes.map(node => node.target) }))).toEqual([]);
  });
}

test("updates signup disables controls and prevents repeated submissions while sending", async ({ page }) => {
  let calls = 0, release: (() => void) | undefined;
  const pending = new Promise<void>(resolve => { release = resolve; });
  await page.route("**/api/apps/vela/signup", async route => {
    calls++; await pending;
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) });
  });
  await page.goto("/vela#updates");
  const section = page.locator('#updates[data-updates-app="vela"]'), form = section.getByRole("form");
  await form.getByRole("textbox", { name: "Your email address" }).fill("reader@example.test");
  await form.getByRole("button", { name: /Keep me in the loop/ }).click({ clickCount: 2, delay: 30 });
  await expect(form).toHaveAttribute("aria-busy", "true");
  await expect(form.getByRole("textbox", { name: "Your email address" })).toBeDisabled();
  await expect.poll(() => calls).toBe(1);
  release?.();
  await expect(section.getByRole("heading", { name: "Check your inbox." })).toBeVisible();
});

test("updates API rejects unknown apps and cross-origin submissions", async ({ request }) => {
  expect((await request.post("/api/apps/unknown-app/signup", { data: {} })).status()).toBe(404);
  expect((await request.post("/api/apps/vela/inventory", { data: {} })).status()).toBe(404);
  expect((await request.post("/api/apps/vela/signup", { headers: { Origin: "https://unrelated.example.test" }, data: { email: "reader@example.test", consentAccepted: true } })).status()).toBe(403);
});

test("story updates open with the keyboard and keep their email separate from the closing form", async ({ page }) => {
  const bodies: unknown[] = [];
  await page.route("**/api/apps/vela/signup", async route => {
    bodies.push(route.request().postDataJSON());
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) });
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/vela");
  const disclosure = page.locator('details[data-updates-inline="vela"]');
  const story = disclosure.locator("#story-updates");
  await expect(disclosure).not.toHaveAttribute("open");
  await expect(story).not.toBeVisible();
  expect(bodies).toEqual([]);
  await disclosure.locator("summary").focus();
  await page.keyboard.press("Enter");
  const form = story.getByRole("form", { name: "Vela email updates (story updates)", exact: true });
  await expect(form).toBeVisible();
  expect(bodies).toEqual([]);
  await expect(form.getByRole("checkbox")).toHaveCount(0);
  await form.getByRole("textbox", { name: "Your email address" }).fill("story-reader@example.test");
  await form.getByRole("button", { name: /Keep me in the loop/ }).click();
  await expect(story.getByRole("status")).toBeFocused();
  expect(bodies).toEqual([{ locale: "en", email: "story-reader@example.test", consentAccepted: true, website: "" }]);
  const closing = page.locator("#updates").getByRole("form", { name: "Vela email updates", exact: true });
  await expect(closing.getByRole("checkbox")).toHaveCount(0);
  await expect(closing.getByRole("textbox", { name: "Your email address" })).toHaveValue("");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
});

for (const app of updateApps) {
  const product = appUpdates[app];
  test(`${product.name} Danish signup validates the email and submits its language`, async ({ page }) => {
    let body: unknown;
    await page.route(`**/api/apps/${app}/signup`, async route => {
      body = route.request().postDataJSON();
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) });
    });
    await page.goto(`/da${product.home}#updates`);
    await expect(page.locator("html")).toHaveAttribute("lang", "da");
    const section = page.locator(`#updates[data-updates-app="${app}"]`), form = section.getByRole("form");
    await form.getByRole("button", { name: /Hold mig opdateret/ }).click();
    await expect(form.getByRole("alert")).toContainText("Tjek disse oplysninger");
    expect(body).toBeUndefined();
    await form.getByRole("textbox", { name: "Din e-mailadresse", exact: true }).fill("danish@example.test");
    await expect(form.getByRole("checkbox")).toHaveCount(0);
    await expect(form.getByRole("link", { name: "Sådan bruger vi dine oplysninger" })).toHaveAttribute("href", `/da${product.base}/privacy`);
    await form.getByRole("button", { name: /Hold mig opdateret/ }).click();
    await expect(section.getByRole("heading", { name: "Tjek din indbakke." })).toBeVisible();
    expect(body).toEqual({ locale: "da", email: "danish@example.test", consentAccepted: true, website: "" });
  });
}

test("changing confirmation language preserves the private token only for the explicit action", async ({ page }) => {
  const token = `synthetic.1.9999999999999.${"A".repeat(43)}`;
  let calls = 0;
  await page.route("**/api/apps/vela/verify", async route => {
    calls++;
    expect(route.request().postDataJSON()).toEqual({ locale: "da", token });
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, status: "confirmed" }) });
  });
  await page.goto(`/vela/updates/verify#token=${token}`);
  await expect(page).toHaveURL(/\/vela\/updates\/verify$/);
  await expect(page.getByRole("button", { name: "Confirm my email" })).toBeVisible();
  await page.evaluate(() => { (window as Window & { privateFlowDocument?: string }).privateFlowDocument = "preserved"; });
  let documentRequests = 0;
  page.on("request", request => { if (request.isNavigationRequest() && request.frame() === page.mainFrame()) documentRequests++; });
  await page.getByRole("link", { name: "Dansk", exact: true }).click();
  await expect(page).toHaveURL(/\/da\/vela\/updates\/verify$/);
  await expect(page.getByRole("button", { name: "Bekræft min e-mail" })).toBeVisible();
  expect(await page.evaluate(() => (window as Window & { privateFlowDocument?: string }).privateFlowDocument)).toBe("preserved");
  expect(documentRequests).toBe(0);
  expect(calls).toBe(0);
  await page.getByRole("button", { name: "Bekræft min e-mail" }).click();
  await expect(page.getByRole("heading", { name: "Du er på listen." })).toBeFocused();
  expect(calls).toBe(1);
});
