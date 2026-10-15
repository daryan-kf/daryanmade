import { test, expect, type Page } from "@playwright/test";

const TOKEN = "browser_test_confirmation_token_123456";
const CODE = "BROWSER-TEST-CODE";
const VERIFY = "/projects/shield-family/verify";
const OFFER = "/projects/shield-family#offer";
const APPLE_REDEEM = `https://apps.apple.com/redeem?ctx=offercodes&id=6782042659&code=${CODE}`;
const result = (plan: "annual" | "quarterly" | "monthly" = "annual") => ({ ok: true, code: CODE, redeemUrl: APPLE_REDEEM, expiresAt: Date.UTC(2027, 0, 31, 12), plan });
const main = (page: Page) => page.locator("#main-content");

test("verification removes the private fragment and waits for an explicit confirmation", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  const calls: { method: string; body: unknown }[] = [];
  await page.route("**/api/shield-family/verify", async (route) => {
    calls.push({ method: route.request().method(), body: route.request().postDataJSON() });
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(result()) });
  });

  const response = await page.goto(`${VERIFY}#token=${TOKEN}`);
  expect(response?.status()).toBe(200);
  const confirm = main(page).getByRole("button", { name: "Confirm my email", exact: true });
  await expect(confirm).toBeVisible();
  await expect(page).toHaveURL(new RegExp(`${VERIFY}$`));
  expect(calls).toHaveLength(0);
  await expect(page.locator('meta[name="referrer"]')).toHaveAttribute("content", "no-referrer");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  const storage = await page.evaluate(() => JSON.stringify({ local: { ...localStorage }, session: { ...sessionStorage } }));
  expect(storage).not.toContain(TOKEN);

  await confirm.click();
  await expect(main(page).getByRole("heading", { name: "Your code is ready." })).toBeVisible();
  expect(calls).toEqual([{ method: "POST", body: { locale: "en", token: TOKEN } }]);
  await expect(main(page).locator("code")).toHaveText(CODE);
  await expect(main(page)).toContainText("We’re also sending a copy to your inbox.");
  await expect(main(page)).toContainText("full annual price");
  await expect(main(page)).toContainText("do not start a subscription or charge you");
  const redeem = main(page).getByRole("link", { name: "Redeem with Apple" });
  await expect(redeem).toHaveAttribute("href", APPLE_REDEEM);
  await expect(redeem).toHaveAttribute("referrerpolicy", "no-referrer");
  await main(page).getByRole("button", { name: "Copy code" }).click();
  await expect(main(page).getByRole("status")).toContainText("Copied.");
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(CODE);
});

test("a failed confirmation keeps the request available for a deliberate retry", async ({ page }) => {
  let calls = 0;
  await page.route("**/api/shield-family/verify", async (route) => {
    calls += 1;
    expect(route.request().postDataJSON()).toEqual({ locale: "en", token: TOKEN });
    await route.fulfill({ status: calls === 1 ? 503 : 200, contentType: "application/json", body: JSON.stringify(calls === 1 ? { ok: false, error: "Confirmation is temporarily unavailable. Please try again." } : result("monthly")) });
  });
  await page.goto(`${VERIFY}#token=${TOKEN}`);
  const confirm = main(page).getByRole("button", { name: "Confirm my email", exact: true });
  await confirm.click();
  await expect(main(page).getByRole("alert")).toContainText("temporarily unavailable");
  await expect(confirm).toBeEnabled();
  expect(calls).toBe(1);
  await confirm.click();
  await expect(main(page).getByRole("heading", { name: "Your code is ready." })).toBeVisible();
  await expect(main(page)).toContainText("Your monthly offer");
  await expect(main(page)).toContainText("charged each month unless cancelled");
  expect(calls).toBe(2);
});

test("expired and missing links provide recovery without revealing or allocating a code", async ({ page }) => {
  let calls = 0;
  await page.route("**/api/shield-family/verify", async (route) => {
    calls += 1;
    await route.fulfill({ status: 410, contentType: "application/json", body: JSON.stringify({ ok: false, error: "This verification link has expired." }) });
  });
  await page.goto(`${VERIFY}#token=${TOKEN}`);
  await main(page).getByRole("button", { name: "Confirm my email", exact: true }).click();
  await expect(main(page).getByRole("alert")).toContainText("expired");
  await expect(main(page).getByRole("link", { name: "Need a fresh link? Return to the offer." })).toHaveAttribute("href", OFFER);
  await expect(main(page).locator("code")).toHaveCount(0);
  await expect(main(page).getByRole("link", { name: "Redeem with Apple" })).toHaveCount(0);
  expect(calls).toBe(1);

  await page.goto(VERIFY);
  await expect(main(page).getByRole("heading", { name: "Open the link from your email." })).toBeVisible();
  await expect(main(page).getByRole("link", { name: "Return to the offer" })).toHaveAttribute("href", OFFER);
  await expect(main(page).getByRole("button", { name: "Confirm my email", exact: true })).toHaveCount(0);
  expect(calls).toBe(1);
});

test("Shield privacy and redemption help remain internal and fit a phone screen", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of ["privacy", "redeem"]) {
    const response = await page.goto(`/projects/shield-family/${path}`);
    expect(response?.status(), path).toBe(200);
    await expect(page.getByRole("link", { name: "Shield Family home" })).toBeVisible();
    await expect(page.getByRole("link", { name: "← daryanmade" })).toHaveAttribute("href", "/");
    await expect(page.locator('a[href*="shieldfamily.vercel.app"]')).toHaveCount(0);
    const sizes = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth }));
    expect(sizes.document, `${path} horizontal overflow`).toBeLessThanOrEqual(sizes.viewport + 1);
  }
  await expect(main(page).getByRole("link", { name: "Read Apple’s cancellation instructions" })).toHaveAttribute("href", "https://support.apple.com/en-us/118428");
  await expect(main(page)).toContainText("24 hours before it ends");
});

test("Shield offer confirmation keeps its private link when changing to Danish", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  let calls = 0;
  await page.route("**/api/shield-family/verify", async route => {
    calls++;
    expect(route.request().postDataJSON()).toEqual({ locale: "da", token: TOKEN });
    await route.fulfill({ status: 410, contentType: "application/json", body: JSON.stringify({ ok: false, error: "This confirmation link has expired or is invalid. Request a new link to continue." }) });
  });
  await page.goto(`/projects/shield-family/verify#token=${TOKEN}`);
  await expect(page.getByRole("button", { name: "Confirm my email" })).toBeVisible();
  await page.evaluate(() => { (window as Window & { privateFlowDocument?: string }).privateFlowDocument = "preserved"; });
  let documentRequests = 0;
  page.on("request", request => { if (request.isNavigationRequest() && request.frame() === page.mainFrame()) documentRequests++; });
  await page.getByRole("link", { name: "Dansk", exact: true }).click();
  await expect(page).toHaveURL(/\/da\/projects\/shield-family\/verify$/);
  await expect(page.getByRole("button", { name: "Bekræft min e-mail" })).toBeVisible();
  expect(await page.evaluate(() => (window as Window & { privateFlowDocument?: string }).privateFlowDocument)).toBe("preserved");
  expect(documentRequests).toBe(0);
  expect(calls).toBe(0);
  await page.getByRole("button", { name: "Bekræft min e-mail" }).click();
  await expect(page.locator("main").getByRole("alert")).toContainText("Bekræftelseslinket er udløbet");
  expect(calls).toBe(1);
  await expect(page.getByRole("link", { name: "Brug for et nyt link? Gå tilbage til tilbuddet." })).toHaveAttribute("href", "/da/projects/shield-family#offer");
});
