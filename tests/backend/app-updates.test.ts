import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineTestApp } from "convex-test";
import schema from "../../convex/schema";
import * as appUpdates from "../../convex/appUpdates";
import * as appUpdateActions from "../../convex/appUpdateActions";
import * as appUpdateDelivery from "../../convex/appUpdateDelivery";
import * as http from "../../convex/http";
import { UPDATE_APPS, UPDATE_TTL, updateConfig, consentVersion, type UpdateApp } from "../../convex/lib/appUpdateConfig";
import { signUpdateToken } from "../../convex/lib/appUpdateTokens";

const { createTest, internal } = defineTestApp({ schema }).defineModules({ appUpdates, appUpdateActions, appUpdateDelivery, http });
type Backend = ReturnType<typeof createTest>;
const NOW = Date.UTC(2026, 9, 15, 12);
const API_SECRET = "synthetic-app-updates-http-secret-at-least-32";
const TOKEN_SECRET = "synthetic-app-updates-token-secret-at-least-32";
const provider = vi.fn<typeof fetch>();

beforeEach(() => {
  vi.useFakeTimers(); vi.setSystemTime(NOW);
  vi.stubEnv("APP_UPDATES_API_SECRET", API_SECRET);
  vi.stubEnv("APP_UPDATES_TOKEN_SECRET", TOKEN_SECRET);
  vi.stubEnv("APP_UPDATES_SITE_URL", "https://portfolio.example.test");
  vi.stubEnv("RESEND_API_KEY", "synthetic-provider-key");
  for (const app of UPDATE_APPS) {
    const prefix = updateConfig[app].env;
    vi.stubEnv(`${prefix}_EMAIL_FROM`, `${updateConfig[app].name} <${app}@example.test>`);
    vi.stubEnv(`${prefix}_EMAIL_REPLY_TO`, "support@example.test");
    vi.stubEnv(`${prefix}_EMAIL_SENDER_VERIFIED`, "true");
  }
  provider.mockReset();
  provider.mockImplementation(async url => {
    expect(url).toBe("https://api.resend.com/emails");
    return Response.json({ id: "synthetic-email-delivery" });
  });
  vi.stubGlobal("fetch", provider);
});
afterEach(() => {
  for (const [url] of provider.mock.calls) expect(url).toBe("https://api.resend.com/emails");
  vi.clearAllTimers(); vi.useRealTimers(); vi.unstubAllEnvs(); vi.unstubAllGlobals();
});

function post(t: Backend, app: UpdateApp, action: "signup" | "verify" | "unsubscribe", body: unknown, secret = API_SECRET) {
  return t.fetch(`/app-updates/${app}/${action}`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${secret}` }, body: JSON.stringify(body) });
}
const signup = (t: Backend, app: UpdateApp, email = "person@example.test") => post(t, app, "signup", { email, consentAccepted: true, requestKey: "a".repeat(64) });
function records(t: Backend, app: UpdateApp) {
  const tables = updateConfig[app];
  return t.run(async ctx => ({ emails: await ctx.db.query(tables.emails).collect(), verifications: await ctx.db.query(tables.verifications).collect(), jobs: await ctx.db.query(tables.jobs).collect() }));
}
async function tokens(t: Backend, app: UpdateApp) {
  const state = await records(t, app), email = state.emails[0], verification = state.verifications[state.verifications.length - 1];
  return {
    verify: signUpdateToken(app, "verify", { id: verification._id, generation: verification.generation, expiresAt: verification.expiresAt }),
    unsubscribe: signUpdateToken(app, "unsubscribe", { id: email._id, generation: email.generation, expiresAt: 0 }),
  };
}

describe("independent app consent", () => {
  it("fails closed with missing or short secrets and never captures an address", async () => {
    const t = createTest();
    vi.stubEnv("APP_UPDATES_API_SECRET", "short");
    expect((await signup(t, "vela")).status).toBe(401);
    vi.stubEnv("APP_UPDATES_API_SECRET", API_SECRET);
    vi.stubEnv("APP_UPDATES_TOKEN_SECRET", "short");
    expect((await signup(t, "vela")).status).toBe(503);
    vi.stubEnv("APP_UPDATES_TOKEN_SECRET", TOKEN_SECRET);
    vi.stubEnv("RESEND_API_KEY", "");
    expect((await signup(t, "vela")).status).toBe(503);
    expect(await records(t, "vela")).toEqual({ emails: [], verifications: [], jobs: [] });
    expect(provider).not.toHaveBeenCalled();
  });
  it.each(UPDATE_APPS)("requires consent, a valid email, configured sender and authenticated caller for %s", async app => {
    const t = createTest();
    for (const body of [{ email: "person@example.test", consentAccepted: false }, { email: "invalid", consentAccepted: true }]) {
      expect((await post(t, app, "signup", { ...body, requestKey: "a".repeat(64) })).status).toBe(400);
    }
    expect((await post(t, app, "signup", {}, "wrong-secret")).status).toBe(401);
    vi.stubEnv(`${updateConfig[app].env}_EMAIL_SENDER_VERIFIED`, "false");
    expect((await signup(t, app)).status).toBe(503);
    expect((await records(t, app)).emails).toHaveLength(0);
    expect(provider).not.toHaveBeenCalled();
  });

  it("stores the same address independently, with product-specific consent, without touching Shield offers", async () => {
    const t = createTest();
    const offer = await t.run(async ctx => {
      const emailId = await ctx.db.insert("shieldFamilyEmails", { email: "person@example.test", plan: "annual", status: "pending", requestedAt: NOW, lastRequestedAt: NOW, termsAcceptedAt: NOW, consentVersion: "offer-only" });
      const campaignId = await ctx.db.insert("shieldFamilyCampaigns", { slug: "founding-families", active: true, maxClaims: 500, allocated: 0, endsAt: NOW + UPDATE_TTL });
      return { emailId, campaignId };
    });
    for (const app of UPDATE_APPS) {
      expect((await signup(t, app, " Person+News@EXAMPLE.test ")).status).toBe(200);
      const state = await records(t, app);
      expect(state.emails).toHaveLength(1);
      expect(state.emails[0]).toMatchObject({ email: "person+news@example.test", status: "pending", consentAcceptedAt: NOW, consentVersion: consentVersion(app), generation: 1 });
      expect(state.verifications[0].expiresAt).toBe(NOW + UPDATE_TTL);
      expect(state.jobs).toHaveLength(1);
      const link = await tokens(t, app);
      expect((await post(t, app, "verify", { token: link.verify })).status).toBe(200);
    }
    const shield = await t.run(async ctx => ({ email: await ctx.db.get(offer.emailId), campaign: await ctx.db.get(offer.campaignId), codes: await ctx.db.query("shieldFamilyCodes").collect(), jobs: await ctx.db.query("shieldFamilyEmailJobs").collect() }));
    expect(shield.email).toMatchObject({ status: "pending", consentVersion: "offer-only" });
    expect(shield.campaign?.allocated).toBe(0); expect(shield.codes).toHaveLength(0); expect(shield.jobs).toHaveLength(0);
  });

  it("deduplicates simultaneous case variants and returns the same response for an existing subscriber", async () => {
    const t = createTest();
    const responses = await Promise.all([signup(t, "vela", " Person@example.test "), signup(t, "vela", "person@EXAMPLE.test")]);
    expect(await responses[0].json()).toEqual(await responses[1].json());
    let state = await records(t, "vela");
    expect(state.emails).toHaveLength(1); expect(state.verifications).toHaveLength(1); expect(state.jobs).toHaveLength(1);
    await post(t, "vela", "verify", { token: (await tokens(t, "vela")).verify });
    vi.setSystemTime(NOW + 61_000);
    expect((await signup(t, "vela")).status).toBe(200);
    state = await records(t, "vela");
    expect(state.emails[0].status).toBe("subscribed"); expect(state.jobs).toHaveLength(1);
  });

  it("rejects oversized and malformed HTTP payloads before storing records", async () => {
    const t = createTest();
    expect((await post(t, "vela", "signup", { email: "x".repeat(5000) })).status).toBe(413);
    expect((await post(t, "vela", "signup", null)).status).toBe(400);
    expect((await t.fetch("/app-updates/wardrobe/signup", { method: "POST" })).status).toBe(404);
    expect((await records(t, "vela")).emails).toHaveLength(0);
  });
});

describe("signed confirmation and unsubscribe", () => {
  it.each(UPDATE_APPS)("confirms %s only after a deliberate signed POST and makes repeats harmless", async app => {
    const t = createTest(); await signup(t, app);
    const { verify } = await tokens(t, app);
    expect((await records(t, app)).emails[0].status).toBe("pending");
    const responses = await Promise.all([post(t, app, "verify", { token: verify }), post(t, app, "verify", { token: verify })]);
    for (const response of responses) expect(await response.json()).toEqual({ ok: true, status: "confirmed" });
    const state = await records(t, app);
    expect(state.emails[0]).toMatchObject({ status: "subscribed", verifiedAt: NOW });
    expect(state.verifications[0].usedAt).toBe(NOW);
    expect(state.jobs).toHaveLength(1); // Confirmation alone sends no extra welcome email.
  });

  it("rejects tampered, wrong-app, wrong-purpose, and expired tokens", async () => {
    const t = createTest(); await signup(t, "vela");
    const links = await tokens(t, "vela");
    expect((await post(t, "iqra", "verify", { token: links.verify })).status).toBe(410);
    expect((await post(t, "vela", "unsubscribe", { token: links.verify })).status).toBe(410);
    expect((await post(t, "vela", "verify", { token: links.unsubscribe })).status).toBe(410);
    const tampered = `${links.verify.slice(0, -1)}${links.verify.endsWith("A") ? "B" : "A"}`;
    expect((await post(t, "vela", "verify", { token: tampered })).status).toBe(410);
    vi.setSystemTime(NOW + UPDATE_TTL);
    expect((await post(t, "vela", "verify", { token: links.verify })).status).toBe(410);
    expect((await records(t, "vela")).emails[0].status).toBe("pending");
  });

  it("keeps unsubscribe available without sender configuration, invalidates old links, and requires fresh consent to rejoin", async () => {
    const t = createTest(); await signup(t, "vela"); await signup(t, "iqra");
    const old = await tokens(t, "vela");
    await post(t, "vela", "verify", { token: old.verify });
    vi.stubEnv("RESEND_API_KEY", "");
    expect((await post(t, "vela", "unsubscribe", { token: old.unsubscribe })).status).toBe(200);
    expect((await post(t, "vela", "unsubscribe", { token: old.unsubscribe })).status).toBe(200);
    expect((await post(t, "vela", "verify", { token: old.verify })).status).toBe(410);
    expect((await records(t, "iqra")).emails[0].status).toBe("pending");
    vi.stubEnv("RESEND_API_KEY", "synthetic-provider-key"); vi.setSystemTime(NOW + 61_000);
    await signup(t, "vela");
    expect((await records(t, "vela")).emails[0].status).toBe("pending");
    const fresh = await tokens(t, "vela");
    expect((await post(t, "vela", "verify", { token: fresh.verify })).status).toBe(200);
    expect((await post(t, "vela", "unsubscribe", { token: old.unsubscribe })).status).toBe(410);
    expect((await post(t, "vela", "verify", { token: old.verify })).status).toBe(410);
    expect((await records(t, "vela")).emails[0]).toMatchObject({ status: "subscribed", generation: 2, verifiedAt: NOW + 61_000 });
  });

  it("validates an id against the app’s table even when a token is authentically signed for the wrong record", async () => {
    const t = createTest(); await signup(t, "vela");
    const row = (await records(t, "vela")).verifications[0];
    const token = signUpdateToken("iqra", "verify", { id: row._id, generation: row.generation, expiresAt: row.expiresAt });
    expect((await post(t, "iqra", "verify", { token })).status).toBe(410);
    expect((await records(t, "vela")).emails[0].status).toBe("pending");
  });
});

describe("delivery, throttling and cleanup", () => {
  it.each(UPDATE_APPS)("uses the independent %s sender and its own confirmation route", async app => {
    const t = createTest(); await signup(t, app);
    const jobId = (await records(t, app)).jobs[0]._id;
    await t.action(internal.appUpdateDelivery.deliver, { app, jobId });
    const message = JSON.parse(String(provider.mock.calls[0][1]?.body));
    expect(message.from).toBe(`${updateConfig[app].name} <${app}@example.test>`);
    expect(message.text).toContain(`${updateConfig[app].base}/verify#token=`);
    expect(message.reply_to).toBe("support@example.test");
  });

  it("does not send an already queued message when sender readiness is withdrawn", async () => {
    const t = createTest(); await signup(t, "vela");
    const jobId = (await records(t, "vela")).jobs[0]._id;
    vi.stubEnv("VELA_EMAIL_SENDER_VERIFIED", "false");
    await t.action(internal.appUpdateDelivery.deliver, { app: "vela", jobId });
    expect(provider).not.toHaveBeenCalled();
    expect((await records(t, "vela")).jobs[0]).toMatchObject({ status: "queued", errorCode: "missing_configuration" });
  });
  it("sends app-branded links with fragment tokens, stable idempotency and a frozen payload on retry", async () => {
    const t = createTest(); await signup(t, "vela");
    const jobId = (await records(t, "vela")).jobs[0]._id;
    provider.mockResolvedValueOnce(Response.json({ error: "temporary" }, { status: 503 }));
    await t.action(internal.appUpdateDelivery.deliver, { app: "vela", jobId });
    const first = provider.mock.calls[0][1]!;
    expect(String(first.body)).toContain("/vela/updates/verify#token=");
    expect(String(first.body)).toContain("/vela/updates/unsubscribe#token=");
    expect(String(first.body)).not.toContain("/iqra/");
    expect(String(first.body)).toContain("news, new features, and product updates");
    expect(String(first.body)).not.toContain("launch updates");
    expect((first.headers as Record<string, string>)["Idempotency-Key"]).toBe(`app-updates-vela-${jobId}`);
    const failed = (await records(t, "vela")).jobs[0];
    expect(failed).toMatchObject({ status: "queued", attempts: 1, errorCode: "provider_503" });
    vi.stubEnv("VELA_EMAIL_FROM", "Changed sender <changed@example.test>"); vi.setSystemTime(failed.nextAttemptAt);
    await t.action(internal.appUpdateDelivery.deliver, { app: "vela", jobId });
    expect(provider.mock.calls[1][1]?.body).toBe(first.body);
    expect(provider.mock.calls[1][1]?.headers).toEqual(first.headers);
    expect((await records(t, "vela")).jobs[0]).toMatchObject({ status: "sent", attempts: 2, providerId: "synthetic-email-delivery" });
  });

  it("leases once across competing workers and rejects stale completion", async () => {
    const t = createTest(); await signup(t, "vela");
    const jobId = (await records(t, "vela")).jobs[0]._id;
    await Promise.all([t.action(internal.appUpdateDelivery.deliver, { app: "vela", jobId }), t.action(internal.appUpdateDelivery.deliver, { app: "vela", jobId })]);
    expect(provider).toHaveBeenCalledTimes(1);
    await t.mutation(internal.appUpdates.finishJob, { app: "vela", jobId, attempt: 1, delivered: false, errorCode: "late_failure" });
    expect((await records(t, "vela")).jobs[0].status).toBe("sent");
  });

  it("rejects completion from an expired lease and stops after eight failures", async () => {
    const t = createTest(); await signup(t, "vela");
    const jobId = (await records(t, "vela")).jobs[0]._id;
    await t.mutation(internal.appUpdates.leaseJob, { app: "vela", jobId });
    vi.setSystemTime(NOW + 60_001);
    await t.mutation(internal.appUpdates.leaseJob, { app: "vela", jobId });
    await t.mutation(internal.appUpdates.finishJob, { app: "vela", jobId, attempt: 1, delivered: true, providerId: "stale-provider-id" });
    expect((await records(t, "vela")).jobs[0]).toMatchObject({ status: "sending", attempts: 2 });
    for (let attempt = 2; attempt <= 8; attempt++) {
      await t.mutation(internal.appUpdates.finishJob, { app: "vela", jobId, attempt, delivered: false, errorCode: "provider_503" });
      if (attempt < 8) {
        vi.setSystemTime((await records(t, "vela")).jobs[0].nextAttemptAt);
        await t.mutation(internal.appUpdates.leaseJob, { app: "vela", jobId });
      }
    }
    expect((await records(t, "vela")).jobs[0]).toMatchObject({ status: "failed", attempts: 8 });
    expect(await t.mutation(internal.appUpdates.leaseJob, { app: "vela", jobId })).toBeNull();
    expect(provider).not.toHaveBeenCalled();
  });

  it("does not deliver a suppressed or expired confirmation, or a job from another app", async () => {
    const t = createTest(); await signup(t, "vela");
    const jobId = (await records(t, "vela")).jobs[0]._id;
    await t.action(internal.appUpdateDelivery.deliver, { app: "iqra", jobId });
    await post(t, "vela", "unsubscribe", { token: (await tokens(t, "vela")).unsubscribe });
    await t.action(internal.appUpdateDelivery.deliver, { app: "vela", jobId });
    await signup(t, "iqra"); vi.setSystemTime(NOW + UPDATE_TTL);
    await t.action(internal.appUpdateDelivery.deliver, { app: "iqra", jobId: (await records(t, "iqra")).jobs[0]._id });
    expect(provider).not.toHaveBeenCalled();
    expect((await records(t, "vela")).jobs[0].errorCode).toBe("expired_or_suppressed");
  });

  it("limits requests per app without disclosing an address’s enrollment", async () => {
    const t = createTest();
    for (let i = 0; i < 4; i++) { vi.setSystemTime(NOW + i * 61_000); expect((await signup(t, "vela")).status).toBe(200); }
    vi.setSystemTime(NOW + 5 * 61_000);
    expect((await signup(t, "vela")).status).toBe(200);
    expect((await records(t, "vela")).verifications).toHaveLength(4);
    for (let i = 0; i < 7; i++) expect((await signup(t, "vela", `person${i}@example.test`)).status).toBe(200);
    expect((await signup(t, "vela", "overflow@example.test")).status).toBe(429);
    expect((await signup(t, "iqra", "overflow@example.test")).status).toBe(200);
  });

  it("removes 30-day pending records while retaining subscribed and unsubscribed choices", async () => {
    const t = createTest(); await signup(t, "vela"); await signup(t, "iqra"); await signup(t, "shield-family");
    await post(t, "iqra", "verify", { token: (await tokens(t, "iqra")).verify });
    await post(t, "shield-family", "unsubscribe", { token: (await tokens(t, "shield-family")).unsubscribe });
    vi.setSystemTime(NOW + 31 * UPDATE_TTL);
    await t.mutation(internal.appUpdates.retryAndCleanup, {});
    expect(await records(t, "vela")).toEqual({ emails: [], verifications: [], jobs: [] });
    expect((await records(t, "iqra")).emails[0].status).toBe("subscribed");
    expect((await records(t, "shield-family")).emails[0].status).toBe("unsubscribed");
  });

  it("exposes every data operation only through internal Convex functions", () => {
    for (const module of [appUpdates, appUpdateActions, appUpdateDelivery]) {
      for (const value of Object.values(module)) {
        const registered = value as { isQuery?: boolean; isMutation?: boolean; isAction?: boolean; isInternal?: boolean; isPublic?: boolean };
        if (registered.isQuery || registered.isMutation || registered.isAction) { expect(registered.isInternal).toBe(true); expect(registered.isPublic).not.toBe(true); }
      }
    }
  });
});

describe("English and Danish audiences", () => {
  it.each(UPDATE_APPS)("delivers Danish confirmation and private links for %s, without changing consent scope", async app => {
    const t = createTest();
    expect((await post(t, app, "signup", { email: "reader@example.test", consentAccepted: true, locale: "da", requestKey: "b".repeat(64) })).status).toBe(200);
    let state = await records(t, app);
    expect(state.emails[0]).toMatchObject({ locale: "da", consentVersion: consentVersion(app) });
    expect(state.verifications[0].locale).toBe("da");
    await t.action(internal.appUpdateDelivery.deliver, { app, jobId: state.jobs[0]._id });
    const message = JSON.parse(String(provider.mock.calls[0][1]?.body));
    expect(message.subject).toBe(`Bekræft nyheder fra ${updateConfig[app].name}`);
    expect(message.html).toContain('<html lang="da">');
    expect(message.html).toContain("Bekræft min e-mail");
    expect(message.text).toContain(`https://portfolio.example.test/da${updateConfig[app].base}/verify#token=`);
    expect(message.text).toContain(`/da${updateConfig[app].base}/unsubscribe#token=`);
    expect(message.text).toContain("24 timer");
    expect(message.text).toContain("starter ikke et betalt abonnement");
    const links = await tokens(t, app);
    expect((await post(t, app, "verify", { token: links.verify })).status).toBe(200);
    state = await records(t, app);
    expect(state.emails[0]).toMatchObject({ status: "subscribed", locale: "da" });
    for (const other of UPDATE_APPS.filter(value => value !== app)) expect((await records(t, other)).emails).toEqual([]);
  });

  it("keeps each pending link’s chosen language stable across later requests and delivery retries", async () => {
    const t = createTest();
    await post(t, "vela", "signup", { email: "reader@example.test", consentAccepted: true, locale: "da", requestKey: "b".repeat(64) });
    const first = (await records(t, "vela")).jobs[0];
    vi.setSystemTime(NOW + 61_000);
    await post(t, "vela", "signup", { email: "reader@example.test", consentAccepted: true, locale: "en", requestKey: "b".repeat(64) });
    provider.mockResolvedValueOnce(new Response("Synthetic outage", { status: 503 }));
    await t.action(internal.appUpdateDelivery.deliver, { app: "vela", jobId: first._id });
    let state = await records(t, "vela");
    const original = provider.mock.calls[0][1]?.body;
    expect(JSON.parse(String(original)).subject).toBe("Bekræft nyheder fra Vela");
    vi.setSystemTime(state.jobs[0].nextAttemptAt);
    await t.action(internal.appUpdateDelivery.deliver, { app: "vela", jobId: first._id });
    expect(provider.mock.calls[1][1]?.body).toBe(original);
    state = await records(t, "vela");
    const verification = state.verifications[0];
    const token = signUpdateToken("vela", "verify", { id: verification._id, generation: verification.generation, expiresAt: verification.expiresAt });
    expect((await post(t, "vela", "verify", { token })).status).toBe(200);
    expect((await records(t, "vela")).emails[0].locale).toBe("da");
  });

  it.each(["fr", "DA", "../en", null, {}, 1])("rejects unsupported locale %j without records", async locale => {
    const t = createTest();
    expect((await post(t, "iqra", "signup", { email: "reader@example.test", consentAccepted: true, locale, requestKey: "b".repeat(64) })).status).toBe(400);
    expect((await records(t, "iqra")).emails).toEqual([]);
    expect(provider).not.toHaveBeenCalled();
  });
});
