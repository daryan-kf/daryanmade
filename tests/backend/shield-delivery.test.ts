/// <reference types="vite/client" />
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineTestApp } from "convex-test";
import schema from "../../convex/schema";
import * as shieldOffers from "../../convex/shieldOffers";
import * as shieldActions from "../../convex/shieldActions";
import * as shieldEmailDelivery from "../../convex/shieldEmailDelivery";
import * as http from "../../convex/http";
import { signToken } from "../../convex/lib/tokens";
import { CAMPAIGN } from "../../convex/lib/validators";

// Run real HTTP handlers and Node actions against an isolated Convex database.
// All emails and offer codes below are synthetic; only a local Resend mock can
// receive a fetch. Scheduled deliveries stay paused and are invoked explicitly.
const { createTest, internal } = defineTestApp({ schema }).defineModules({ shieldOffers, shieldActions, shieldEmailDelivery, http });
type TestBackend = ReturnType<typeof createTest>;
type Plan = "annual" | "quarterly" | "monthly";
type Mail = { from: string; to: string[]; reply_to?: string; subject: string; text: string; html: string };
const NOW = Date.UTC(2026, 9, 13, 12);
const DAY = 86_400_000;
const API_SECRET = "synthetic-http-authentication-secret-for-tests";
const TOKEN_SECRET = "synthetic-verification-signing-secret-for-tests";
const requestKey = "a".repeat(64);
const provider = vi.fn<typeof fetch>();

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
  vi.stubEnv("SHIELD_API_SECRET", API_SECRET);
  vi.stubEnv("SHIELD_TOKEN_SECRET", TOKEN_SECRET);
  vi.stubEnv("RESEND_API_KEY", "synthetic-resend-key-not-a-real-credential");
  vi.stubEnv("SHIELD_EMAIL_FROM", "Shield Family <offers@example.test>");
  vi.stubEnv("SHIELD_EMAIL_REPLY_TO", "support@example.test");
  vi.stubEnv("SHIELD_EMAIL_SENDER_VERIFIED", "true");
  vi.stubEnv("SHIELD_SITE_URL", "https://portfolio.example.test");
  provider.mockReset();
  provider.mockImplementation(async (url, init) => {
    expect(url).toBe("https://api.resend.com/emails");
    expect(init?.method).toBe("POST");
    return Response.json({ id: "synthetic-message-1" });
  });
  vi.stubGlobal("fetch", provider);
});
afterEach(() => {
  for (const [url] of provider.mock.calls) expect(url).toBe("https://api.resend.com/emails");
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

async function seed(t: TestBackend) {
  await t.run(async ctx => {
    await ctx.db.insert("shieldFamilyCampaigns", { slug: CAMPAIGN, active: true, maxClaims: 500, allocated: 0, endsAt: NOW + 7 * DAY });
    for (const plan of ["annual", "quarterly", "monthly"] as const) {
      const code = `SYNTHETIC${plan.toUpperCase()}CODE`;
      await ctx.db.insert("shieldFamilyCodes", { code, redeemUrl: `https://apps.apple.com/redeem?ctx=offercodes&id=0000000000&code=${code}`, plan, expiresAt: NOW + 30 * DAY, batch: "synthetic-tests", status: "available" });
    }
  });
}
function post(t: TestBackend, path: string, body: unknown, authorization: string | null = `Bearer ${API_SECRET}`) {
  return t.fetch(path, { method: "POST", headers: { "Content-Type": "application/json", ...(authorization ? { Authorization: authorization } : {}) }, body: JSON.stringify(body) });
}
function signup(t: TestBackend, plan: Plan = "annual", email = "person@example.test") {
  return post(t, "/shield-family/signup", { email, plan, termsAccepted: true, requestKey });
}
async function records(t: TestBackend) {
  return t.run(async ctx => ({
    emails: await ctx.db.query("shieldFamilyEmails").collect(),
    verifications: await ctx.db.query("shieldFamilyVerifications").collect(),
    codes: await ctx.db.query("shieldFamilyCodes").collect(),
    jobs: await ctx.db.query("shieldFamilyEmailJobs").collect(),
    campaigns: await ctx.db.query("shieldFamilyCampaigns").collect(),
  }));
}
function mail(index = 0): Mail {
  return JSON.parse(String(provider.mock.calls[index][1]?.body)) as Mail;
}
function verificationToken(message: Mail) {
  const match = message.text.match(/https:\/\/portfolio\.example\.test\/projects\/shield-family\/verify#token=([A-Za-z0-9_-]+\.[A-Za-z0-9_-]{43})/);
  expect(match, "verification email must contain a signed first-party URL with the token in its fragment").not.toBeNull();
  return match![1];
}
async function setupRequest(t: TestBackend, plan: Plan = "annual") {
  await seed(t);
  expect((await signup(t, plan)).status).toBe(200);
  const state = await records(t);
  return { job: state.jobs[0], verification: state.verifications[0] };
}

describe("protected HTTP boundaries", () => {
  it.each(["/shield-family/signup", "/shield-family/verify"])("requires the server secret before processing %s", async path => {
    const t = createTest(); await seed(t);
    for (const auth of [null, "Bearer wrong-secret", "Basic synthetic", `Bearer ${API_SECRET}extra`]) {
      const response = await post(t, path, { email: "person@example.test", token: "invalid" }, auth);
      expect(response.status).toBe(401);
      expect(response.headers.get("cache-control")).toBe("no-store");
      expect(await response.json()).toEqual({ ok: false, error: "Unauthorized" });
    }
    expect((await records(t)).emails).toHaveLength(0);
    expect(provider).not.toHaveBeenCalled();
  });

  it("fails closed when authentication or verified email delivery is not configured", async () => {
    const t = createTest(); await seed(t);
    vi.stubEnv("SHIELD_API_SECRET", "short");
    expect((await signup(t)).status).toBe(401);
    vi.stubEnv("SHIELD_API_SECRET", API_SECRET);
    vi.stubEnv("SHIELD_EMAIL_SENDER_VERIFIED", "false");
    expect((await signup(t)).status).toBe(503);
    expect((await records(t)).emails).toHaveLength(0);
    expect(provider).not.toHaveBeenCalled();
  });

  it("rejects capture when verification signing has only a short secret", async () => {
    const t = createTest(); await seed(t);
    vi.stubEnv("SHIELD_TOKEN_SECRET", "short");
    expect((await signup(t)).status).toBe(503);
    expect((await records(t)).emails).toHaveLength(0);
    expect(provider).not.toHaveBeenCalled();
  });

  it.each(["campaign capacity", "selected-plan stock"])("does not disclose an existing recipient when %s is exhausted", async gate => {
    const t = createTest(); const { verification } = await setupRequest(t);
    if (gate === "campaign capacity") await t.run(async ctx => {
      const campaign = (await ctx.db.query("shieldFamilyCampaigns").collect())[0];
      await ctx.db.patch(campaign._id, { maxClaims: 1 });
    });
    const token = signToken(verification._id, verification.expiresAt);
    expect((await post(t, "/shield-family/verify", { token })).status).toBe(200);
    vi.setSystemTime(NOW + 61_000);
    const known = await signup(t, "annual", "person@example.test");
    const unknown = await signup(t, "annual", "other@example.test");
    expect(known.status).toBe(409);
    expect(unknown.status).toBe(known.status);
    expect(await unknown.json()).toEqual(await known.json());
    // An existing signed link can still recover its original assignment.
    expect((await post(t, "/shield-family/verify", { token })).status).toBe(200);
    const state = await records(t);
    expect(state.emails).toHaveLength(1);
    expect(state.verifications).toHaveLength(1);
    expect(state.campaigns[0].allocated).toBe(1);
    expect(provider).not.toHaveBeenCalled();
  });

  it.each([
    { email: "not-an-email", plan: "annual", termsAccepted: true, requestKey },
    { email: "person@example.test", plan: "free", termsAccepted: true, requestKey },
    { email: "person@example.test", plan: "annual", termsAccepted: false, requestKey },
    { email: "person@example.test", plan: "annual", termsAccepted: true, requestKey: "untrusted-client-key" },
  ])("rejects invalid signup input without storing it: %j", async input => {
    const t = createTest(); await seed(t);
    expect((await post(t, "/shield-family/signup", input)).status).toBe(400);
    expect((await records(t)).emails).toHaveLength(0);
    expect(provider).not.toHaveBeenCalled();
  });

  it("bounds incoming request bodies before any mutation", async () => {
    const t = createTest(); await seed(t);
    expect((await post(t, "/shield-family/signup", { email: "x".repeat(5000) })).status).toBe(413);
    expect((await post(t, "/shield-family/verify", { token: "x".repeat(1100) })).status).toBe(400);
    expect((await records(t)).emails).toHaveLength(0);
  });

  it("exposes email actions only internally", () => {
    for (const action of [shieldActions.request, shieldActions.verify, shieldEmailDelivery.deliver]) {
      expect((action as unknown as { isInternal: boolean }).isInternal).toBe(true);
      expect((action as unknown as { isPublic?: boolean }).isPublic).not.toBe(true);
    }
  });
});

describe("signed verification through real HTTP and Node actions", () => {
  it("delivers a signed link, allocates only after confirmation, then emails the same Apple code", async () => {
    const t = createTest();
    const { job } = await setupRequest(t);
    let state = await records(t);
    expect(state.codes.every(code => code.status === "available")).toBe(true);
    expect(state.campaigns[0].allocated).toBe(0);
    expect(provider).not.toHaveBeenCalled();

    await t.action(internal.shieldEmailDelivery.deliver, { jobId: job._id });
    expect(provider).toHaveBeenCalledTimes(1);
    const verificationMail = mail();
    expect(verificationMail).toMatchObject({ from: "Shield Family <offers@example.test>", to: ["person@example.test"], reply_to: "support@example.test", subject: "Confirm your email for Shield Family" });
    expect(verificationMail.text).toContain("does not start a subscription");
    expect(verificationMail.text).not.toContain("SYNTHETICANNUALCODE");
    const token = verificationToken(verificationMail);
    state = await records(t);
    expect(state.campaigns[0].allocated).toBe(0);
    expect(state.emails[0].verifiedAt).toBeUndefined();

    const response = await post(t, "/shield-family/verify", { token });
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    const confirmed = await response.json();
    expect(confirmed).toMatchObject({ ok: true, plan: "annual", code: "SYNTHETICANNUALCODE" });
    state = await records(t);
    expect(state.campaigns[0].allocated).toBe(1);
    expect(state.codes.filter(code => code.status === "assigned")).toHaveLength(1);
    const codeJob = state.jobs.find(row => row.kind === "code")!;
    await t.action(internal.shieldEmailDelivery.deliver, { jobId: codeJob._id });
    expect(provider).toHaveBeenCalledTimes(2);
    expect(mail(1)).toMatchObject({ subject: "Your Shield Family offer code", to: ["person@example.test"] });
    expect(mail(1).text).toContain(confirmed.code);
    expect(mail(1).text).toContain(confirmed.redeemUrl);
    expect(mail(1).text).toContain("full annual price for the following year");
    expect(mail(1).text).toContain("https://portfolio.example.test/projects/shield-family/redeem");
    expect(mail(1).text).toContain("Receiving this code does not start a subscription");
    state = await records(t);
    expect(state.emails[0].status).toBe("code_sent");
    expect(state.jobs.every(row => row.status === "sent" && row.providerId === "synthetic-message-1")).toBe(true);

    const again = await post(t, "/shield-family/verify", { token });
    expect(await again.json()).toEqual(confirmed);
    expect((await records(t)).jobs).toHaveLength(2);
    expect(provider).toHaveBeenCalledTimes(2);
  });

  it.each(["signature", "expiry", "secret", "missing-record", "malformed"] as const)("rejects %s token tampering without allocating a code", async variant => {
    const t = createTest();
    const { verification } = await setupRequest(t);
    const valid = signToken(verification._id, verification.expiresAt, TOKEN_SECRET);
    const token = variant === "signature" ? `${valid.slice(0, -1)}${valid.endsWith("A") ? "B" : "A"}`
      : variant === "expiry" ? signToken(verification._id, verification.expiresAt + DAY, TOKEN_SECRET)
      : variant === "secret" ? signToken(verification._id, verification.expiresAt, `${TOKEN_SECRET}-other`)
      : variant === "missing-record" ? `notarecord.${valid.split(".")[1]}` : "not.a.valid.token";
    expect((await post(t, "/shield-family/verify", { token })).status).toBe(410);
    const state = await records(t);
    expect(state.campaigns[0].allocated).toBe(0);
    expect(state.codes.every(row => row.status === "available")).toBe(true);
    expect(state.jobs.some(row => row.kind === "code")).toBe(false);
    expect(provider).not.toHaveBeenCalled();
  });

  it("rejects an authentic token exactly at expiry", async () => {
    const t = createTest();
    const { verification } = await setupRequest(t);
    const token = signToken(verification._id, verification.expiresAt, TOKEN_SECRET);
    vi.setSystemTime(verification.expiresAt);
    expect((await post(t, "/shield-family/verify", { token })).status).toBe(410);
    expect((await records(t)).campaigns[0].allocated).toBe(0);
    expect(provider).not.toHaveBeenCalled();
  });

  it("uses the requested verification plan when the unverified signup has an older plan", async () => {
    const t = createTest();
    await setupRequest(t, "annual");
    vi.setSystemTime(NOW + 61_000);
    expect((await signup(t, "monthly")).status).toBe(200);
    let state = await records(t);
    expect(state.emails[0].plan).toBe("annual");
    const verification = state.verifications.find(row => row.plan === "monthly")!;
    const job = state.jobs.find(row => row.verificationId === verification._id)!;
    await t.action(internal.shieldEmailDelivery.deliver, { jobId: job._id });
    expect(mail().text).toContain("on the Monthly plan");
    expect(mail().text).not.toContain("on the Yearly plan");
    const response = await post(t, "/shield-family/verify", { token: verificationToken(mail()) });
    expect(await response.json()).toMatchObject({ ok: true, plan: "monthly", code: "SYNTHETICMONTHLYCODE" });
    state = await records(t);
    await t.action(internal.shieldEmailDelivery.deliver, { jobId: state.jobs.find(row => row.kind === "code")!._id });
    expect(mail(1).text).toContain("the monthly price each month");
    expect((await records(t)).emails[0]).toMatchObject({ plan: "monthly", status: "code_sent" });
  });
});

describe("mocked Resend delivery and retry safety", () => {
  it("retries a provider failure with exactly the same message and idempotency key", async () => {
    const t = createTest(); const { job } = await setupRequest(t);
    provider.mockResolvedValueOnce(new Response("Unavailable", { status: 503 }));
    await t.action(internal.shieldEmailDelivery.deliver, { jobId: job._id });
    let state = await records(t);
    expect(state.jobs[0]).toMatchObject({ status: "queued", attempts: 1, errorCode: "provider_503" });
    expect(state.jobs[0].nextAttemptAt).toBeGreaterThan(Date.now());
    await t.action(internal.shieldEmailDelivery.deliver, { jobId: job._id });
    expect(provider).toHaveBeenCalledTimes(1);
    vi.setSystemTime(state.jobs[0].nextAttemptAt);
    await t.action(internal.shieldEmailDelivery.deliver, { jobId: job._id });
    expect(provider).toHaveBeenCalledTimes(2);
    const first = provider.mock.calls[0][1]!;
    const second = provider.mock.calls[1][1]!;
    expect(new Headers(first.headers).get("Idempotency-Key")).toBe(`shield-family-${job._id}`);
    expect(new Headers(second.headers).get("Idempotency-Key")).toBe(`shield-family-${job._id}`);
    expect(first.body).toBe(second.body);
    expect(new Headers(second.headers).get("Authorization")).toBe("Bearer synthetic-resend-key-not-a-real-credential");
    state = await records(t);
    expect(state.jobs[0]).toMatchObject({ status: "sent", attempts: 2, providerId: "synthetic-message-1" });
    expect(state.jobs[0].errorCode).toBeUndefined();
    expect(state.campaigns[0].allocated).toBe(0);
  });

  it("sends a job once when workers compete, then ignores repeated delivery of a sent job", async () => {
    const t = createTest(); const { job } = await setupRequest(t);
    await Promise.all([
      t.action(internal.shieldEmailDelivery.deliver, { jobId: job._id }),
      t.action(internal.shieldEmailDelivery.deliver, { jobId: job._id }),
    ]);
    await t.action(internal.shieldEmailDelivery.deliver, { jobId: job._id });
    expect(provider).toHaveBeenCalledTimes(1);
    expect((await records(t)).jobs[0]).toMatchObject({ status: "sent", attempts: 1 });
  });

  it("preserves an assigned code while retrying its failed delivery", async () => {
    const t = createTest(); const { verification } = await setupRequest(t);
    const response = await post(t, "/shield-family/verify", { token: signToken(verification._id, verification.expiresAt) });
    expect(response.status).toBe(200);
    let state = await records(t);
    const job = state.jobs.find(row => row.kind === "code")!;
    const codeId = state.emails[0].codeId;
    provider.mockRejectedValueOnce(new Error("Synthetic provider connection failure"));
    await t.action(internal.shieldEmailDelivery.deliver, { jobId: job._id });
    state = await records(t);
    expect(state.jobs.find(row => row._id === job._id)).toMatchObject({ status: "queued", errorCode: "delivery_unavailable" });
    expect(state.emails[0]).toMatchObject({ status: "verified", codeId });
    vi.setSystemTime(state.jobs.find(row => row._id === job._id)!.nextAttemptAt);
    await t.action(internal.shieldEmailDelivery.deliver, { jobId: job._id });
    state = await records(t);
    expect(state.emails[0]).toMatchObject({ status: "code_sent", codeId });
    expect(state.campaigns[0].allocated).toBe(1);
    expect(mail(0).text).toBe(mail(1).text);
    expect(new Headers(provider.mock.calls[0][1]?.headers).get("Idempotency-Key")).toBe(new Headers(provider.mock.calls[1][1]?.headers).get("Idempotency-Key"));
  });

  it.each([null, {}, { id: "" }, { id: "contains spaces" }])("does not mark a malformed provider acknowledgement as delivered: %j", async result => {
    const t = createTest(); const { job } = await setupRequest(t);
    provider.mockResolvedValueOnce(Response.json(result));
    await t.action(internal.shieldEmailDelivery.deliver, { jobId: job._id });
    expect((await records(t)).jobs[0]).toMatchObject({ status: "queued", errorCode: "provider_invalid_response" });
  });

  it("does not send an expired verification job or claim any code", async () => {
    const t = createTest(); const { job, verification } = await setupRequest(t);
    vi.setSystemTime(verification.expiresAt);
    await t.action(internal.shieldEmailDelivery.deliver, { jobId: job._id });
    expect(provider).not.toHaveBeenCalled();
    const state = await records(t);
    expect(state.jobs[0]).toMatchObject({ status: "failed", errorCode: "expired_or_missing" });
    expect(state.campaigns[0].allocated).toBe(0);
  });

  it.each([
    ["RESEND_API_KEY", "", "missing_configuration"],
    ["SHIELD_SITE_URL", "https://attacker:password@portfolio.example.test", "invalid_configuration"],
    ["SHIELD_SITE_URL", "https://portfolio.example.test?redirect=external", "invalid_configuration"],
    ["SHIELD_EMAIL_FROM", "offers@example.test\r\nBcc: other@example.test", "invalid_configuration"],
  ])("does not contact the provider for invalid %s configuration", async (name, value, errorCode) => {
    const t = createTest(); const { job } = await setupRequest(t);
    vi.stubEnv(name, value);
    await t.action(internal.shieldEmailDelivery.deliver, { jobId: job._id });
    expect(provider).not.toHaveBeenCalled();
    expect((await records(t)).jobs[0]).toMatchObject({ status: "queued", errorCode });
  });
});

describe("Danish Shield offer delivery", () => {
  it("keeps verification, code email and redemption guide Danish without changing inventory behavior", async () => {
    const t = createTest(); await seed(t);
    expect((await post(t, "/shield-family/signup", { email: "family@example.test", plan: "annual", termsAccepted: true, locale: "da", requestKey })).status).toBe(200);
    let state = await records(t);
    await t.action(internal.shieldEmailDelivery.deliver, { jobId: state.jobs[0]._id });
    expect(mail().subject).toBe("Bekræft din e-mail til Shield Family");
    expect(mail().html).toContain('<html lang="da">');
    expect(mail().text).toContain("https://portfolio.example.test/da/projects/shield-family/verify#token=");
    const token = mail().text.match(/#token=([^\s]+)/)![1];
    expect(state.campaigns[0].allocated).toBe(0);
    expect((await post(t, "/shield-family/verify", { token })).status).toBe(200);
    state = await records(t);
    expect(state.emails[0].locale).toBe("da");
    expect(state.campaigns[0].allocated).toBe(1);
    await t.action(internal.shieldEmailDelivery.deliver, { jobId: state.jobs.find(job => job.kind === "code")!._id });
    expect(mail(1).subject).toBe("Din Shield Family-tilbudskode");
    expect(mail(1).text).toContain("den fulde årspris for det efterfølgende år");
    expect(mail(1).text).toContain("https://portfolio.example.test/da/projects/shield-family/redeem");
    expect(mail(1).text).toContain("Modtagelse af koden starter ikke et abonnement");
  });
});
