import { v } from "convex/values";
import { emailLocale, type EmailLocale } from "./lib/emailLocale";
import { internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { CAMPAIGN, CONSENT_VERSION, VERIFICATION_TTL, normalizeEmail, offerPlan } from "./lib/validators";
import type { MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

async function rateLimit(ctx: MutationCtx, key: string, max: number, now: number) {
  const current = await ctx.db.query("shieldFamilyRateLimits").withIndex("by_key", q => q.eq("key", key)).unique();
  if (!current) { await ctx.db.insert("shieldFamilyRateLimits", { key, count: 1, expiresAt: now + 3600000 }); return true; }
  if (current.expiresAt <= now) { await ctx.db.patch(current._id, { count: 1, expiresAt: now + 3600000 }); return true; }
  if (current.count >= max) return false;
  await ctx.db.patch(current._id, { count: current.count + 1 });
  return true;
}

async function queueEmail(ctx: MutationCtx, emailId: Id<"shieldFamilyEmails">, kind: "verification" | "code", verificationId?: Id<"shieldFamilyVerifications">, locale?: EmailLocale) {
  const id = await ctx.db.insert("shieldFamilyEmailJobs", { emailId, kind, ...(locale ? { locale } : {}), ...(verificationId ? { verificationId } : {}), status: "queued", attempts: 0, nextAttemptAt: Date.now() });
  await ctx.scheduler.runAfter(0, internal.shieldEmailDelivery.deliver, { jobId: id });
  return id;
}

export const requestVerification = internalMutation({
  args: { email: v.string(), plan: offerPlan, termsAccepted: v.boolean(), locale: v.optional(emailLocale), requestKey: v.string() },
  handler: async (ctx, args) => {
    const now = Date.now();
    const email = normalizeEmail(args.email);
    if (!email || !args.termsAccepted) return { result: "invalid" as const };
    if (!await rateLimit(ctx, `ip:${args.requestKey}`, 12, now)) return { result: "limited" as const };
    // Email-specific throttling uses the same response as a successful request.
    if (!await rateLimit(ctx, `email:${email}`, 4, now)) return { result: "accepted" as const };
    const campaign = await ctx.db.query("shieldFamilyCampaigns").withIndex("by_slug", q => q.eq("slug", CAMPAIGN)).unique();
    if (!campaign?.active || campaign.endsAt <= now) return { result: "unavailable" as const };
    // Availability is public campaign state, never evidence that an email has a code.
    const code = await ctx.db.query("shieldFamilyCodes").withIndex("by_plan_status_expiry", q => q.eq("plan", args.plan).eq("status", "available").gt("expiresAt", now)).first();
    if (!code || campaign.allocated >= campaign.maxClaims) return { result: "unavailable" as const };
    const existing = await ctx.db.query("shieldFamilyEmails").withIndex("by_email", q => q.eq("email", email)).unique();
    if (existing && now - existing.lastRequestedAt < 60000) return { result: "accepted" as const };
    let emailId: Id<"shieldFamilyEmails">;
    if (existing) {
      emailId = existing._id;
      await ctx.db.patch(emailId, { lastRequestedAt: now });
    } else {
      emailId = await ctx.db.insert("shieldFamilyEmails", { email, locale: args.locale ?? "en", plan: args.plan, status: "pending", requestedAt: now, lastRequestedAt: now, termsAcceptedAt: now, consentVersion: CONSENT_VERSION });
    }
    // Keep the requested plan on this specific link. A later request cannot alter it.
    const verificationId = await ctx.db.insert("shieldFamilyVerifications", { emailId, locale: args.locale ?? "en", plan: existing?.codeId ? existing.plan : args.plan, expiresAt: now + VERIFICATION_TTL, consentVersion: CONSENT_VERSION });
    await queueEmail(ctx, emailId, "verification", verificationId, args.locale ?? "en");
    return { result: "accepted" as const };
  },
});

export const getVerification = internalQuery({
  args: { id: v.string() },
  handler: async (ctx, { id }) => {
    const documentId = ctx.db.normalizeId("shieldFamilyVerifications", id);
    return documentId ? ctx.db.get(documentId) : null;
  },
});

// Called only after the Node action has authenticated the signed verification link.
export const confirmVerification = internalMutation({
  args: { verificationId: v.id("shieldFamilyVerifications") },
  handler: async (ctx, { verificationId }) => {
    const now = Date.now();
    const verification = await ctx.db.get(verificationId);
    if (!verification || verification.expiresAt <= now) return { result: "expired" as const };
    const signup = await ctx.db.get(verification.emailId);
    if (!signup) return { result: "expired" as const };
    if (signup.codeId) {
      const code = await ctx.db.get(signup.codeId);
      if (!code || code.expiresAt <= now) return { result: "expired" as const };
      if (!verification.usedAt) { await ctx.db.patch(verificationId, { usedAt: now }); await queueEmail(ctx, signup._id, "code", undefined, verification.locale ?? "en"); }
      return { result: "confirmed" as const, code: code.code, redeemUrl: code.redeemUrl, expiresAt: code.expiresAt, plan: code.plan };
    }
    const campaign = await ctx.db.query("shieldFamilyCampaigns").withIndex("by_slug", q => q.eq("slug", CAMPAIGN)).unique();
    if (!campaign?.active || campaign.endsAt <= now || campaign.allocated >= campaign.maxClaims) return { result: "unavailable" as const };
    const code = await ctx.db.query("shieldFamilyCodes").withIndex("by_plan_status_expiry", q => q.eq("plan", verification.plan).eq("status", "available").gt("expiresAt", now)).first();
    if (!code) return { result: "unavailable" as const };
    // Reservation, verified email, campaign cap and email scheduling are one transaction.
    await ctx.db.patch(code._id, { status: "assigned", emailId: signup._id, assignedAt: now });
    await ctx.db.patch(signup._id, { locale: verification.locale ?? "en", codeId: code._id, plan: code.plan, status: "verified", verifiedAt: now, consentVersion: verification.consentVersion });
    await ctx.db.patch(verificationId, { usedAt: now });
    await ctx.db.patch(campaign._id, { allocated: campaign.allocated + 1 });
    await queueEmail(ctx, signup._id, "code", undefined, verification.locale ?? "en");
    return { result: "confirmed" as const, code: code.code, redeemUrl: code.redeemUrl, expiresAt: code.expiresAt, plan: code.plan };
  },
});

export const leaseEmailJob = internalMutation({
  args: { jobId: v.id("shieldFamilyEmailJobs") },
  handler: async (ctx, { jobId }) => {
    const now = Date.now(); const job = await ctx.db.get(jobId);
    if (!job || job.status === "sent" || job.status === "failed" || job.nextAttemptAt > now || (job.status === "sending" && (job.leaseUntil ?? 0) > now)) return null;
    const signup = await ctx.db.get(job.emailId);
    const verification = job.verificationId ? await ctx.db.get(job.verificationId) : null;
    const code = signup?.codeId ? await ctx.db.get(signup.codeId) : null;
    if (!signup || (job.kind === "verification" && (!verification || verification.expiresAt <= now)) || (job.kind === "code" && (!code || code.expiresAt <= now))) {
      await ctx.db.patch(jobId, { status: "failed", errorCode: "expired_or_missing" }); return null;
    }
    await ctx.db.patch(jobId, { status: "sending", leaseUntil: now + 60000, attempts: job.attempts + 1 });
    return { job: { ...job, attempts: job.attempts + 1 }, signup, verification: verification ?? undefined, code: code ?? undefined };
  },
});

export const finishEmailJob = internalMutation({
  args: { jobId: v.id("shieldFamilyEmailJobs"), delivered: v.boolean(), providerId: v.optional(v.string()), errorCode: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId); if (!job || job.status === "sent") return;
    if (args.delivered) {
      await ctx.db.patch(job._id, { status: "sent", sentAt: Date.now(), providerId: args.providerId, leaseUntil: undefined, errorCode: undefined });
      if (job.kind === "code") await ctx.db.patch(job.emailId, { status: "code_sent" });
    } else {
      await ctx.db.patch(job._id, { status: job.attempts >= 8 ? "failed" : "queued", nextAttemptAt: Date.now() + Math.min(3600000, 60000 * 2 ** job.attempts), leaseUntil: undefined, errorCode: (args.errorCode || "delivery_failed").slice(0, 80) });
    }
  },
});

export const retryEmailJobs = internalMutation({
  args: {}, handler: async ctx => {
    const now = Date.now();
    for (const status of ["queued", "sending"] as const) {
      const jobs = await ctx.db.query("shieldFamilyEmailJobs").withIndex("by_status_attempt", q => q.eq("status", status).lte("nextAttemptAt", now)).take(50);
      for (const job of jobs) if (status === "queued" || (job.leaseUntil ?? 0) <= now) await ctx.scheduler.runAfter(0, internal.shieldEmailDelivery.deliver, { jobId: job._id });
    }
    // Retain only the active rate-limit window, never a long-lived IP history.
    const expired = await ctx.db.query("shieldFamilyRateLimits").withIndex("by_expiry", q => q.lt("expiresAt", now - 86400000)).take(100);
    for (const row of expired) await ctx.db.delete(row._id);
  },
});

// These admin operations are internal: accessible through authenticated Convex tooling only.
export const configureCampaign = internalMutation({
  args: { active: v.boolean(), maxClaims: v.number(), endsAt: v.number() },
  handler: async (ctx, args) => {
    if (!Number.isInteger(args.maxClaims) || args.maxClaims < 1 || args.maxClaims > 500 || !Number.isFinite(args.endsAt)) throw new Error("Invalid campaign limits");
    if (args.active && (!process.env.RESEND_API_KEY || !process.env.SHIELD_EMAIL_FROM || process.env.SHIELD_EMAIL_SENDER_VERIFIED !== "true" || !process.env.SHIELD_SITE_URL?.startsWith("https://") || (process.env.SHIELD_API_SECRET?.length ?? 0) < 32 || (process.env.SHIELD_TOKEN_SECRET?.length ?? 0) < 32)) throw new Error("Configure and verify email delivery, API and token secrets, and the public site URL before activating");
    const existing = await ctx.db.query("shieldFamilyCampaigns").withIndex("by_slug", q => q.eq("slug", CAMPAIGN)).unique();
    if (existing) { if (args.maxClaims < existing.allocated) throw new Error("Limit cannot be less than issued codes"); await ctx.db.patch(existing._id, args); }
    else await ctx.db.insert("shieldFamilyCampaigns", { ...args, slug: CAMPAIGN, allocated: 0 });
  },
});

export const importUnusedCodes = internalMutation({
  args: { plan: offerPlan, batch: v.string(), codes: v.array(v.object({ code: v.string(), redeemUrl: v.string(), expiresAt: v.number() })) },
  handler: async (ctx, args) => {
    if (args.codes.length > 500 || !args.batch.trim()) throw new Error("Use a named batch of at most 500 unused codes");
    let added = 0;
    for (const item of args.codes) {
      const url = new URL(item.redeemUrl);
      if (!/^[A-Za-z0-9]{6,64}$/.test(item.code) || url.protocol !== "https:" || url.hostname !== "apps.apple.com" || url.pathname !== "/redeem" || url.username || url.password || url.searchParams.get("code") !== item.code || !Number.isSafeInteger(item.expiresAt) || item.expiresAt <= Date.now()) throw new Error("Invalid or expired Apple offer code");
      const existing = await ctx.db.query("shieldFamilyCodes").withIndex("by_code", q => q.eq("code", item.code)).unique();
      if (existing) { if (existing.plan !== args.plan || existing.expiresAt !== item.expiresAt || existing.redeemUrl !== item.redeemUrl) throw new Error("Code already exists with different metadata"); continue; }
      await ctx.db.insert("shieldFamilyCodes", { ...item, plan: args.plan, batch: args.batch, status: "available" }); added++;
    }
    return { added };
  },
});

export const inventory = internalQuery({
  args: {}, handler: async ctx => {
    const campaign = await ctx.db.query("shieldFamilyCampaigns").withIndex("by_slug", q => q.eq("slug", CAMPAIGN)).unique();
    const counts: Record<string, number> = {};
    for (const plan of ["annual", "quarterly", "monthly"] as const) counts[plan] = (await ctx.db.query("shieldFamilyCodes").withIndex("by_plan_status_expiry", q => q.eq("plan", plan).eq("status", "available").gt("expiresAt", Date.now())).take(501)).length;
    return { campaign, available: counts };
  },
});
