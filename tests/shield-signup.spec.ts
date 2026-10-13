import { test, expect, type Page } from "@playwright/test";

const signupForm = (page: Page) => page.locator("#offer").getByRole("form", { name: "A little more family time." });
const emailInput = (page: Page) => signupForm(page).getByRole("textbox", { name: "Your email address", exact: true });
const consentInput = (page: Page) => signupForm(page).getByRole("checkbox", { name: /^I accept the offer details/ });

test.beforeEach(async ({ page }) => { await page.emulateMedia({ reducedMotion: "reduce" }); });

test("signup validates email and unchecked consent before submitting anything", async ({ page }) => {
  let calls = 0;
  await page.route("**/api/shield-family/signup", async (route) => {
    calls += 1;
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) });
  });
  const response = await page.goto("/projects/shield-family#offer");
  expect(response?.status()).toBe(200);
  const form = signupForm(page);
  const submit = form.getByRole("button", { name: "Send my confirmation link" });
  await expect(consentInput(page)).not.toBeChecked();
  await expect(form.getByRole("radio", { name: /^Yearly/ })).toBeChecked();
  await submit.click();
  await expect(form.getByRole("alert")).toContainText("Please check these details");
  await expect(form.getByRole("alert")).toBeFocused();
  await expect(emailInput(page)).toHaveAttribute("aria-invalid", "true");
  await expect(consentInput(page)).toHaveAttribute("aria-invalid", "true");
  expect(calls).toBe(0);

  await emailInput(page).fill("not-an-email");
  await submit.click();
  await expect(form).toContainText("Use a complete email address");
  expect(calls).toBe(0);

  await emailInput(page).fill("family@example.com");
  await submit.click();
  await expect(form).toContainText("Accept the offer details before requesting your confirmation link.");
  await expect(emailInput(page)).toHaveValue("family@example.com");
  await expect(emailInput(page)).toHaveAttribute("aria-invalid", "false");
  await expect(consentInput(page)).not.toBeChecked();
  expect(calls).toBe(0);
});

test("the chosen plan and consent survive a transient signup failure, then retry succeeds", async ({ page }) => {
  const requests: { method: string; body: unknown }[] = [];
  await page.route("**/api/shield-family/signup", async (route) => {
    requests.push({ method: route.request().method(), body: route.request().postDataJSON() });
    await route.fulfill({ status: requests.length === 1 ? 503 : 200, contentType: "application/json", body: JSON.stringify(requests.length === 1 ? { ok: false, error: "Email confirmation is temporarily unavailable. Please try again." } : { ok: true }) });
  });
  await page.goto("/projects/shield-family#offer");
  const form = signupForm(page);
  await form.getByRole("radio", { name: /^Every 3 months/ }).check();
  await emailInput(page).fill("family@example.com");
  await consentInput(page).check();
  await form.getByRole("button", { name: "Send my confirmation link" }).click();
  await expect(form.getByRole("alert")).toContainText("temporarily unavailable");
  await expect(emailInput(page)).toHaveValue("family@example.com");
  await expect(form.getByRole("radio", { name: /^Every 3 months/ })).toBeChecked();
  await expect(consentInput(page)).toBeChecked();
  await form.getByRole("button", { name: "Try again" }).click();
  const success = page.locator("#offer").getByRole("status");
  await expect(success.getByRole("heading", { name: "Check your inbox." })).toBeVisible();
  await expect(success).toContainText("family@example.com");
  await expect(success).toContainText("Requesting a code doesn’t start a subscription.");
  await expect(success).toBeFocused();
  expect(requests).toEqual(Array.from({ length: 2 }, () => ({ method: "POST", body: { email: "family@example.com", plan: "quarterly", website: "", termsAccepted: true } })));
});

test("signup disables controls while sending and a double click produces one request", async ({ page }) => {
  let calls = 0;
  let release: (() => void) | undefined;
  const responseReady = new Promise<void>((resolve) => { release = resolve; });
  await page.route("**/api/shield-family/signup", async (route) => {
    calls += 1;
    expect(route.request().postDataJSON()).toEqual({ email: "family@example.com", plan: "monthly", website: "", termsAccepted: true });
    await responseReady;
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) });
  });
  await page.goto("/projects/shield-family#offer");
  const form = signupForm(page);
  await form.getByRole("radio", { name: /^Monthly/ }).check();
  await emailInput(page).fill("family@example.com");
  await consentInput(page).check();
  await form.getByRole("button", { name: "Send my confirmation link" }).click({ clickCount: 2, delay: 30 });
  await expect(form).toHaveAttribute("aria-busy", "true");
  await expect(form.getByRole("button", { name: "Requesting your link…" })).toBeDisabled();
  await expect(emailInput(page)).toBeDisabled();
  await expect(consentInput(page)).toBeDisabled();
  await expect.poll(() => calls).toBe(1);
  release?.();
  await expect(page.locator("#offer").getByRole("heading", { name: "Check your inbox." })).toBeVisible();
  expect(calls).toBe(1);
});
