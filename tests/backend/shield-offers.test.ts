/// <reference types="vite/client" />
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineTestApp } from "convex-test";
import schema from "../../convex/schema";
import * as shieldOffers from "../../convex/shieldOffers";
import { CAMPAIGN, CONSENT_VERSION, VERIFICATION_TTL, normalizeEmail } from "../../convex/lib/validators";
import type { Id } from "../../convex/_generated/dataModel";

// Only synthetic fixtures are used. Timers stay paused: scheduled delivery actions
// are never executed, and any accidental network request makes a test fail.
const app = defineTestApp({ schema }).defineModules({ shieldOffers });
const { internal, createTest } = app;
type TestBackend = ReturnType<typeof createTest>;
type Plan = "annual" | "quarterly" | "monthly";
const NOW = Date.UTC(2026, 9, 13, 12);
const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const network = vi.fn(() => Promise.reject(new Error("Network is disabled in backend tests")));

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
  vi.stubGlobal("fetch", network);
});
afterEach(() => {
  expect(network).not.toHaveBeenCalled();
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

function unusedCode(code: string, expiresAt = NOW + 30 * DAY) {
  return { code, redeemUrl: `https://apps.apple.com/redeem?ctx=offercodes&id=0000000000&code=${code}`, expiresAt };
}
async function seed(t: TestBackend, options: { plans?: Plan[]; maxClaims?: number; active?: boolean; endsAt?: number } = {}) {
  return t.run(async ctx => {
    const campaignId = await ctx.db.insert("shieldFamilyCampaigns", { slug: CAMPAIGN, active: options.active ?? true, maxClaims: options.maxClaims ?? 500, allocated: 0, endsAt: options.endsAt ?? NOW + 7 * DAY });
    const codeIds: Id<"shieldFamilyCodes">[] = [];
    for (const [index, plan] of (options.plans ?? ["annual", "quarterly", "monthly"]).entries()) {
      codeIds.push(await ctx.db.insert("shieldFamilyCodes", { ...unusedCode(`SYNTHETIC${plan.toUpperCase()}${index}X`), plan, batch: "synthetic-tests", status: "available" }));
    }
    return { campaignId, codeIds };
  });
}
async function request(t: TestBackend, email = "person@example.test", plan: Plan = "annual", requestKey = "synthetic-client") {
  return t.mutation(internal.shieldOffers.requestVerification, { email, plan, termsAccepted: true, requestKey });
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
async function pendingVerification(t: TestBackend, email: string, plan: Plan = "annual", expiresAt = NOW + DAY) {
  return t.run(async ctx => {
    const emailId = await ctx.db.insert("shieldFamilyEmails", { email, plan, status: "pending", requestedAt: NOW, lastRequestedAt: NOW, termsAcceptedAt: NOW, consentVersion: CONSENT_VERSION });
    const verificationId = await ctx.db.insert("shieldFamilyVerifications", { emailId, plan, expiresAt, consentVersion: CONSENT_VERSION });
    return { emailId, verificationId };
  });
}

// These boundaries prevent storing a different person, consentless capture, or
// treating mere ownership of an unverified email address as a claimed offer.
describe("signup, verification, and privacy", () => {
  it("normalizes case and surrounding space while preserving plus tags", () => {
    expect(normalizeEmail("  Reader+Family@Example.TEST \n")).toBe("reader+family@example.test");
    for (const invalid of [null, 42, "", "missing-at", "a@b", "<a@example.test>", "a b@example.test", "a@@example.test", `${"a".repeat(250)}@example.test`]) expect(normalizeEmail(invalid)).toBeNull();
  });

  it("does not store an email or schedule a message without accepted terms", async () => {
    const t = createTest(); await seed(t);
    await expect(t.mutation(internal.shieldOffers.requestVerification, { email: "person@example.test", plan: "annual", termsAccepted: false, requestKey: "consent-test" })).resolves.toEqual({ result: "invalid" });
    const state = await records(t);
    expect(state.emails).toHaveLength(0); expect(state.verifications).toHaveLength(0); expect(state.jobs).toHaveLength(0);
    expect(state.codes.every(code => code.status === "available")).toBe(true);
  });

  it("captures normalized consent and schedules verification without allocating a code", async () => {
    const t = createTest(); await seed(t);
    await expect(request(t, " Person@EXAMPLE.test ")).resolves.toEqual({ result: "accepted" });
    const state = await records(t);
    expect(state.emails).toHaveLength(1);
    expect(state.emails[0]).toMatchObject({ email: "person@example.test", status: "pending", termsAcceptedAt: NOW, consentVersion: CONSENT_VERSION });
    expect(state.emails[0].verifiedAt).toBeUndefined(); expect(state.emails[0].codeId).toBeUndefined();
    expect(state.verifications).toHaveLength(1);
    expect(state.verifications[0]).toMatchObject({ plan: "annual", expiresAt: NOW + VERIFICATION_TTL, consentVersion: CONSENT_VERSION });
    expect(state.jobs).toHaveLength(1); expect(state.jobs[0]).toMatchObject({ kind: "verification", status: "queued", attempts: 0 });
    expect(state.codes.every(code => code.status === "available" && !code.emailId)).toBe(true);
    expect(state.campaigns[0].allocated).toBe(0);
  });

  it("deduplicates case variants and a repeated click within one minute", async () => {
    const t = createTest(); await seed(t);
    await Promise.all([request(t, "Person@example.test"), request(t, " person@EXAMPLE.test ")]);
    const state = await records(t);
    expect(state.emails).toHaveLength(1); expect(state.verifications).toHaveLength(1); expect(state.jobs).toHaveLength(1);
  });

  it("locks the plan to the confirmed link, then recovers the same assigned code", async () => {
    const t = createTest(); await seed(t);
    await request(t, "person@example.test", "annual");
    const first = (await records(t)).verifications[0];
    vi.setSystemTime(NOW + 61_000);
    await request(t, "person@example.test", "monthly");
    const second = (await records(t)).verifications.find(row => row._id !== first._id)!;
    expect(second.plan).toBe("monthly");
    const original = await t.mutation(internal.shieldOffers.confirmVerification, { verificationId: first._id });
    const recovery = await t.mutation(internal.shieldOffers.confirmVerification, { verificationId: second._id });
    expect(original).toMatchObject({ result: "confirmed", plan: "annual" });
    expect(recovery).toEqual(original);
    const state = await records(t);
    expect(state.campaigns[0].allocated).toBe(1);
    expect(state.codes.filter(code => code.status === "assigned")).toHaveLength(1);
    expect(state.emails[0]).toMatchObject({ status: "verified", plan: "annual", consentVersion: CONSENT_VERSION });
  });

  it("rejects a verification exactly at expiry without allocating or queuing a code", async () => {
    const t = createTest(); await seed(t);
    const { verificationId } = await pendingVerification(t, "expired@example.test");
    vi.setSystemTime(NOW + DAY);
    await expect(t.mutation(internal.shieldOffers.confirmVerification, { verificationId })).resolves.toEqual({ result: "expired" });
    const state = await records(t);
    expect(state.campaigns[0].allocated).toBe(0); expect(state.jobs).toHaveLength(0);
    expect(state.codes.every(code => code.status === "available")).toBe(true);
  });

  it("treats malformed or nonexistent verification references as missing", async () => {
    const t = createTest();
    await expect(t.query(internal.shieldOffers.getVerification, { id: "not-a-convex-id" })).resolves.toBeNull();
    const missing = await t.run(async ctx => { const id = await ctx.db.insert("shieldFamilyVerifications", { emailId: await ctx.db.insert("shieldFamilyEmails", { email: "missing@example.test", plan: "annual", status: "pending", requestedAt: NOW, lastRequestedAt: NOW, termsAcceptedAt: NOW, consentVersion: CONSENT_VERSION }), plan: "annual", expiresAt: NOW + DAY, consentVersion: CONSENT_VERSION }); await ctx.db.delete(id); return id; });
    await expect(t.mutation(internal.shieldOffers.confirmVerification, { verificationId: missing })).resolves.toEqual({ result: "expired" });
  });

  it("does not expose inventory, email records, or admin operations through public queries or mutations", () => {
    const registered = Object.entries(shieldOffers).filter(([, value]) => Boolean((value as { isQuery?: boolean; isMutation?: boolean }).isQuery || (value as { isMutation?: boolean }).isMutation));
    expect(registered.length).toBeGreaterThan(0);
    for (const [, value] of registered) {
      expect((value as { isInternal?: boolean }).isInternal).toBe(true);
      expect((value as { isPublic?: boolean }).isPublic).not.toBe(true);
    }
  });
});

describe("atomic code assignment", () => {
  it("makes double-clicked confirmations idempotent, including the code email job", async () => {
    const t = createTest(); await seed(t);
    const { verificationId } = await pendingVerification(t, "double-click@example.test");
    const results = await Promise.all([t.mutation(internal.shieldOffers.confirmVerification, { verificationId }), t.mutation(internal.shieldOffers.confirmVerification, { verificationId })]);
    expect(results[0]).toMatchObject({ result: "confirmed" }); expect(results[1]).toEqual(results[0]);
    const state = await records(t);
    expect(state.campaigns[0].allocated).toBe(1);
    expect(state.codes.filter(code => code.status === "assigned")).toHaveLength(1);
    expect(state.jobs.filter(job => job.kind === "code")).toHaveLength(1);
    expect(state.verifications[0].usedAt).toBe(NOW);
  });

  it("does not give the last available code to two competing verified people", async () => {
    const t = createTest(); await seed(t, { plans: ["annual"] });
    const first = await pendingVerification(t, "first@example.test");
    const second = await pendingVerification(t, "second@example.test");
    const results = await Promise.all([first, second].map(row => t.mutation(internal.shieldOffers.confirmVerification, { verificationId: row.verificationId })));
    expect(results.map(result => result.result).sort()).toEqual(["confirmed", "unavailable"]);
    const state = await records(t);
    expect(state.campaigns[0].allocated).toBe(1); expect(state.codes.filter(code => code.status === "assigned")).toHaveLength(1);
    expect(state.emails.filter(email => email.codeId)).toHaveLength(1);
  });

  it("enforces one campaign cap across competing claims on different plans", async () => {
    const t = createTest(); await seed(t, { plans: ["annual", "monthly"], maxClaims: 1 });
    const first = await pendingVerification(t, "yearly@example.test", "annual");
    const second = await pendingVerification(t, "monthly@example.test", "monthly");
    const results = await Promise.all([first, second].map(row => t.mutation(internal.shieldOffers.confirmVerification, { verificationId: row.verificationId })));
    expect(results.map(result => result.result).sort()).toEqual(["confirmed", "unavailable"]);
    const state = await records(t);
    expect(state.campaigns[0].allocated).toBe(1); expect(state.codes.filter(code => code.status === "assigned")).toHaveLength(1);
  });

  it.each([{ active: false }, { endsAt: NOW }])("never assigns a new code while the campaign is paused or expired: %j", async options => {
    const t = createTest(); await seed(t, options);
    const { verificationId } = await pendingVerification(t, "paused@example.test");
    await expect(t.mutation(internal.shieldOffers.confirmVerification, { verificationId })).resolves.toEqual({ result: "unavailable" });
    expect((await records(t)).campaigns[0].allocated).toBe(0);
  });
});

describe("request throttling", () => {
  it("caps a client at twelve requests per hour and resets after that window", async () => {
    const t = createTest(); await seed(t);
    for (let index = 0; index < 12; index++) await expect(request(t, `person-${index}@example.test`, "annual", "same-client")).resolves.toEqual({ result: "accepted" });
    await expect(request(t, "limited@example.test", "annual", "same-client")).resolves.toEqual({ result: "limited" });
    expect((await records(t)).emails).toHaveLength(12);
    vi.setSystemTime(NOW + HOUR + 1);
    await expect(request(t, "after-window@example.test", "annual", "same-client")).resolves.toEqual({ result: "accepted" });
    expect((await records(t)).emails).toHaveLength(13);
  });

  it("suppresses email floods while keeping the response indistinguishable from acceptance", async () => {
    const t = createTest(); await seed(t);
    for (let index = 0; index < 5; index++) {
      vi.setSystemTime(NOW + index * 61_000);
      await expect(request(t, "same-person@example.test", "annual", `client-${index}`)).resolves.toEqual({ result: "accepted" });
    }
    const state = await records(t);
    expect(state.emails).toHaveLength(1); expect(state.verifications).toHaveLength(4); expect(state.jobs).toHaveLength(4);
  });
});

describe("inventory import and campaign configuration", () => {
  it("imports a synthetic batch once and makes identical reimports harmless", async () => {
    const t = createTest(); const args = { plan: "annual" as const, batch: "synthetic-import", codes: [unusedCode("SYNTHETICIMPORT1")] };
    await expect(t.mutation(internal.shieldOffers.importUnusedCodes, args)).resolves.toEqual({ added: 1 });
    await expect(t.mutation(internal.shieldOffers.importUnusedCodes, args)).resolves.toEqual({ added: 0 });
    expect((await records(t)).codes).toHaveLength(1);
    await expect(t.mutation(internal.shieldOffers.importUnusedCodes, { ...args, plan: "monthly" })).rejects.toThrow(/different metadata/i);
  });

  it.each([
    { ...unusedCode("BAD-CODE"), description: "malformed code" },
    { ...unusedCode("SYNTHETICHTTP"), redeemUrl: "http://apps.apple.com/redeem?code=SYNTHETICHTTP", description: "insecure redemption URL" },
    { ...unusedCode("SYNTHETICHOST"), redeemUrl: "https://example.test/redeem?code=SYNTHETICHOST", description: "wrong redemption host" },
    { ...unusedCode("SYNTHETICPATH"), redeemUrl: "https://apps.apple.com/app?code=SYNTHETICPATH", description: "wrong Apple redemption path" },
    { ...unusedCode("SYNTHETICCREDENTIALS"), redeemUrl: "https://user:password@apps.apple.com/redeem?code=SYNTHETICCREDENTIALS", description: "credential-bearing redemption URL" },
    { ...unusedCode("SYNTHETICMATCH"), redeemUrl: "https://apps.apple.com/redeem?code=DIFFERENTCODE", description: "mismatched redemption code" },
    { ...unusedCode("SYNTHETICEXPIRE", NOW), description: "expired code" },
  ])("rejects $description without importing any part of the batch", async ({ description: _description, ...invalid }) => {
    const t = createTest();
    await expect(t.mutation(internal.shieldOffers.importUnusedCodes, { plan: "annual", batch: "synthetic-invalid", codes: [unusedCode("SYNTHETICVALID1"), invalid] })).rejects.toThrow();
    expect((await records(t)).codes).toHaveLength(0);
  });

  it.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])("rejects a non-finite expiration timestamp: %s", async expiresAt => {
    const t = createTest();
    await expect(t.mutation(internal.shieldOffers.importUnusedCodes, { plan: "annual", batch: "synthetic-finite", codes: [unusedCode("SYNTHETICFINITE", expiresAt)] })).rejects.toThrow();
    expect((await records(t)).codes).toHaveLength(0);
  });

  it("rejects conflicting metadata when a code is reimported", async () => {
    const t = createTest(); const row = unusedCode("SYNTHETICMETADATA");
    await t.mutation(internal.shieldOffers.importUnusedCodes, { plan: "annual", batch: "synthetic-original", codes: [row] });
    await expect(t.mutation(internal.shieldOffers.importUnusedCodes, { plan: "annual", batch: "synthetic-conflict", codes: [{ ...row, expiresAt: row.expiresAt + DAY }] })).rejects.toThrow();
    expect((await records(t)).codes[0].expiresAt).toBe(row.expiresAt);
  });

  it("requires a named batch and rejects batches above five hundred codes", async () => {
    const t = createTest();
    await expect(t.mutation(internal.shieldOffers.importUnusedCodes, { plan: "annual", batch: " ", codes: [unusedCode("SYNTHETICBATCH1")] })).rejects.toThrow();
    await expect(t.mutation(internal.shieldOffers.importUnusedCodes, { plan: "annual", batch: "synthetic-oversized", codes: Array.from({ length: 501 }, (_, index) => unusedCode(`SYNTHETICBATCH${index}`)) })).rejects.toThrow();
  });

  it("will not activate delivery without configured and verified sender infrastructure", async () => {
    const t = createTest();
    vi.stubEnv("RESEND_API_KEY", ""); vi.stubEnv("SHIELD_EMAIL_FROM", ""); vi.stubEnv("SHIELD_EMAIL_SENDER_VERIFIED", "false"); vi.stubEnv("SHIELD_SITE_URL", "https://example.test");
    await expect(t.mutation(internal.shieldOffers.configureCampaign, { active: true, maxClaims: 500, endsAt: NOW + DAY })).rejects.toThrow(/configure and verify/i);
    expect((await records(t)).campaigns).toHaveLength(0);
  });

  it.each(["SHIELD_API_SECRET", "SHIELD_TOKEN_SECRET"])("requires a strong %s before activating the campaign", async name => {
    const t = createTest();
    vi.stubEnv("RESEND_API_KEY", "synthetic-test-key"); vi.stubEnv("SHIELD_EMAIL_FROM", "offers@example.test"); vi.stubEnv("SHIELD_EMAIL_SENDER_VERIFIED", "true"); vi.stubEnv("SHIELD_SITE_URL", "https://portfolio.example.test");
    vi.stubEnv("SHIELD_API_SECRET", "synthetic-api-secret-at-least-thirty-two-characters");
    vi.stubEnv("SHIELD_TOKEN_SECRET", "synthetic-token-secret-at-least-thirty-two-characters");
    vi.stubEnv(name, "short");
    await expect(t.mutation(internal.shieldOffers.configureCampaign, { active: true, maxClaims: 500, endsAt: NOW + DAY })).rejects.toThrow();
    expect((await records(t)).campaigns).toHaveLength(0);
  });

  it("activates a campaign when verified delivery and both strong secrets are configured", async () => {
    const t = createTest();
    vi.stubEnv("RESEND_API_KEY", "synthetic-test-key"); vi.stubEnv("SHIELD_EMAIL_FROM", "offers@example.test"); vi.stubEnv("SHIELD_EMAIL_SENDER_VERIFIED", "true"); vi.stubEnv("SHIELD_SITE_URL", "https://portfolio.example.test");
    vi.stubEnv("SHIELD_API_SECRET", "synthetic-api-secret-at-least-thirty-two-characters");
    vi.stubEnv("SHIELD_TOKEN_SECRET", "synthetic-token-secret-at-least-thirty-two-characters");
    await t.mutation(internal.shieldOffers.configureCampaign, { active: true, maxClaims: 500, endsAt: NOW + DAY });
    expect((await records(t)).campaigns[0]).toMatchObject({ active: true, maxClaims: 500, allocated: 0, endsAt: NOW + DAY });
  });

  it.each([0, 501, 1.5])("rejects invalid global campaign capacity %s", async maxClaims => {
    const t = createTest();
    await expect(t.mutation(internal.shieldOffers.configureCampaign, { active: false, maxClaims, endsAt: NOW + DAY })).rejects.toThrow(/invalid campaign/i);
  });
});

describe("email jobs", () => {
  it("leases a job exclusively and permits retry only after an abandoned lease expires", async () => {
    const t = createTest(); await seed(t); await request(t);
    const job = (await records(t)).jobs[0];
    const lease = await t.mutation(internal.shieldOffers.leaseEmailJob, { jobId: job._id });
    expect(lease?.job.attempts).toBe(1);
    await expect(t.mutation(internal.shieldOffers.leaseEmailJob, { jobId: job._id })).resolves.toBeNull();
    vi.setSystemTime(NOW + 60_001);
    const retry = await t.mutation(internal.shieldOffers.leaseEmailJob, { jobId: job._id });
    expect(retry?.job.attempts).toBe(2);
  });

  it("backs off after delivery failure without allocating a code or leaking the failure text", async () => {
    const t = createTest(); await seed(t); await request(t);
    const job = (await records(t)).jobs[0];
    await t.mutation(internal.shieldOffers.leaseEmailJob, { jobId: job._id });
    await t.mutation(internal.shieldOffers.finishEmailJob, { jobId: job._id, delivered: false, errorCode: "provider_temporary" });
    const after = (await records(t)).jobs[0];
    expect(after).toMatchObject({ status: "queued", attempts: 1, errorCode: "provider_temporary" });
    expect(after.nextAttemptAt).toBeGreaterThan(NOW); expect(after.leaseUntil).toBeUndefined();
    await expect(t.mutation(internal.shieldOffers.leaseEmailJob, { jobId: job._id })).resolves.toBeNull();
    expect((await records(t)).campaigns[0].allocated).toBe(0);
    vi.setSystemTime(after.nextAttemptAt);
    expect((await t.mutation(internal.shieldOffers.leaseEmailJob, { jobId: job._id }))?.job.attempts).toBe(2);
  });

  it("marks successful code delivery once and does not undo sent state on a stale failure", async () => {
    const t = createTest(); await seed(t);
    const { verificationId } = await pendingVerification(t, "delivered@example.test");
    await t.mutation(internal.shieldOffers.confirmVerification, { verificationId });
    const job = (await records(t)).jobs[0];
    await t.mutation(internal.shieldOffers.leaseEmailJob, { jobId: job._id });
    await t.mutation(internal.shieldOffers.finishEmailJob, { jobId: job._id, delivered: true, providerId: "synthetic-provider-id" });
    await t.mutation(internal.shieldOffers.finishEmailJob, { jobId: job._id, delivered: false, errorCode: "late_worker_failure" });
    const state = await records(t);
    expect(state.jobs[0]).toMatchObject({ status: "sent", sentAt: NOW, providerId: "synthetic-provider-id" });
    expect(state.jobs[0].errorCode).toBeUndefined(); expect(state.emails[0].status).toBe("code_sent");
    await expect(t.mutation(internal.shieldOffers.leaseEmailJob, { jobId: job._id })).resolves.toBeNull();
  });

  it("stops retrying after eight unsuccessful attempts", async () => {
    const t = createTest(); await seed(t); await request(t);
    const job = (await records(t)).jobs[0];
    await t.run(async ctx => { await ctx.db.patch(job._id, { status: "sending", attempts: 8, leaseUntil: NOW + 60_000 }); });
    await t.mutation(internal.shieldOffers.finishEmailJob, { jobId: job._id, delivered: false, errorCode: "provider_failure" });
    expect((await records(t)).jobs[0]).toMatchObject({ status: "failed", attempts: 8 });
    vi.setSystemTime(NOW + DAY);
    await expect(t.mutation(internal.shieldOffers.leaseEmailJob, { jobId: job._id })).resolves.toBeNull();
  });

  it("does not lease expired verification messages", async () => {
    const t = createTest(); await seed(t); await request(t);
    const job = (await records(t)).jobs[0];
    vi.setSystemTime(NOW + VERIFICATION_TTL);
    await expect(t.mutation(internal.shieldOffers.leaseEmailJob, { jobId: job._id })).resolves.toBeNull();
    expect((await records(t)).jobs[0]).toMatchObject({ status: "failed", errorCode: "expired_or_missing" });
  });

  it("the retry sweep schedules eligible jobs without running deliveries or resetting active leases", async () => {
    const t = createTest(); await seed(t); await request(t);
    const job = (await records(t)).jobs[0];
    const countScheduled = () => t.run(async ctx => (await ctx.db.system.query("_scheduled_functions").collect()).length);
    const initial = await countScheduled();
    await t.mutation(internal.shieldOffers.leaseEmailJob, { jobId: job._id });
    await t.mutation(internal.shieldOffers.retryEmailJobs, {});
    expect(await countScheduled()).toBe(initial);
    vi.setSystemTime(NOW + 60_001);
    await t.mutation(internal.shieldOffers.retryEmailJobs, {});
    expect(await countScheduled()).toBe(initial + 1);
    expect((await records(t)).jobs[0]).toMatchObject({ status: "sending", attempts: 1 });
  });
});
