import { v } from "convex/values";
import { internalMutation, internalQuery, type MutationCtx } from "./_generated/server";
import { internal } from "./_generated/api";
import { updateApp, updateConfig, UPDATE_APPS, UPDATE_TTL, consentVersion, type UpdateApp } from "./lib/appUpdateConfig";
import { updateMessage } from "./lib/appUpdateSchema";
import { emailLocale, type EmailLocale } from "./lib/emailLocale";
import { normalizeEmail } from "./lib/validators";

async function limit(ctx: MutationCtx, app: UpdateApp, key: string, max: number, now: number) {
  const table = updateConfig[app].limits;
  const current = await ctx.db.query(table).withIndex("by_key", q => q.eq("key", key)).unique();
  if (!current) { await ctx.db.insert(table, { key, count: 1, expiresAt: now + 3_600_000 }); return true; }
  if (current.expiresAt <= now) { await ctx.db.patch(current._id, { count: 1, expiresAt: now + 3_600_000 }); return true; }
  if (current.count >= max) return false;
  await ctx.db.patch(current._id, { count: current.count + 1 });
  return true;
}

async function queueVerification(ctx: MutationCtx, app: UpdateApp, emailId: string, details: { locale?: EmailLocale; generation: number; requestedAt: number; consentAcceptedAt: number; consentVersion: string; expiresAt: number }) {
  const job = { status: "queued" as const, attempts: 0, createdAt: details.requestedAt, nextAttemptAt: details.requestedAt };
  // Explicit adapters keep each foreign key tied to its own product table.
  if (app === "vela") {
    const id = ctx.db.normalizeId("velaEmails", emailId); if (!id) throw new Error("Invalid app email reference");
    const verificationId = await ctx.db.insert("velaVerifications", { emailId: id, ...details });
    return ctx.db.insert("velaEmailJobs", { emailId: id, verificationId, ...job });
  }
  if (app === "iqra") {
    const id = ctx.db.normalizeId("iqraEmails", emailId); if (!id) throw new Error("Invalid app email reference");
    const verificationId = await ctx.db.insert("iqraVerifications", { emailId: id, ...details });
    return ctx.db.insert("iqraEmailJobs", { emailId: id, verificationId, ...job });
  }
  if (app === "wardrobe") {
    const id = ctx.db.normalizeId("twillBuyEmails", emailId); if (!id) throw new Error("Invalid app email reference");
    const verificationId = await ctx.db.insert("twillBuyVerifications", { emailId: id, ...details });
    return ctx.db.insert("twillBuyEmailJobs", { emailId: id, verificationId, ...job });
  }
  if (app === "kaizencv") {
    const id = ctx.db.normalizeId("kaizenCVEmails", emailId); if (!id) throw new Error("Invalid app email reference");
    const verificationId = await ctx.db.insert("kaizenCVVerifications", { emailId: id, ...details });
    return ctx.db.insert("kaizenCVEmailJobs", { emailId: id, verificationId, ...job });
  }
  if (app === "koebsklar") {
    const id = ctx.db.normalizeId("koebsklarEmails", emailId); if (!id) throw new Error("Invalid app email reference");
    const verificationId = await ctx.db.insert("koebsklarVerifications", { emailId: id, ...details });
    return ctx.db.insert("koebsklarEmailJobs", { emailId: id, verificationId, ...job });
  }
  if (app === "sarpoli") {
    const id = ctx.db.normalizeId("sarpoliEmails", emailId); if (!id) throw new Error("Invalid app email reference");
    const verificationId = await ctx.db.insert("sarpoliVerifications", { emailId: id, ...details });
    return ctx.db.insert("sarpoliEmailJobs", { emailId: id, verificationId, ...job });
  }
  const id = ctx.db.normalizeId("shieldFamilyUpdateEmails", emailId); if (!id) throw new Error("Invalid app email reference");
  const verificationId = await ctx.db.insert("shieldFamilyUpdateVerifications", { emailId: id, ...details });
  return ctx.db.insert("shieldFamilyUpdateEmailJobs", { emailId: id, verificationId, ...job });
}

export const requestVerification = internalMutation({
  args: { app: updateApp, email: v.string(), consentAccepted: v.boolean(), locale: v.optional(emailLocale), requestKey: v.string() },
  handler: async (ctx, args) => {
    const email = normalizeEmail(args.email), now = Date.now();
    if (!email || !args.consentAccepted) return { result: "invalid" as const };
    if (!await limit(ctx, args.app, `ip:${args.requestKey}`, 12, now)) return { result: "limited" as const };
    if (!await limit(ctx, args.app, `email:${email}`, 4, now)) return { result: "accepted" as const };
    const tables = updateConfig[args.app];
    const existing = await ctx.db.query(tables.emails).withIndex("by_email", q => q.eq("email", email)).unique();
    if (existing && (existing.status === "subscribed" || now - existing.lastRequestedAt < 60_000)) return { result: "accepted" as const };
    const locale = args.locale ?? "en";
    const version = consentVersion(args.app), generation = existing?.generation ?? 1;
    const emailId = existing?._id ?? await ctx.db.insert(tables.emails, { email, locale, status: "pending", requestedAt: now, lastRequestedAt: now, consentAcceptedAt: now, consentVersion: version, generation });
    if (existing) await ctx.db.patch(existing._id, { status: "pending", locale, lastRequestedAt: now, consentAcceptedAt: now, consentVersion: version });
    const jobId = await queueVerification(ctx, args.app, emailId, { locale, generation, requestedAt: now, consentAcceptedAt: now, consentVersion: version, expiresAt: now + UPDATE_TTL });
    await ctx.scheduler.runAfter(0, internal.appUpdateDelivery.deliver, { app: args.app, jobId });
    return { result: "accepted" as const };
  },
});

export const getVerification = internalQuery({
  args: { app: updateApp, id: v.string() },
  handler: async (ctx, { app, id }) => {
    const key = ctx.db.normalizeId(updateConfig[app].verifications, id);
    return key ? ctx.db.get(key) : null;
  },
});

export const confirmVerification = internalMutation({
  args: { app: updateApp, id: v.string(), generation: v.number(), expiresAt: v.number() },
  handler: async (ctx, args) => {
    const id = ctx.db.normalizeId(updateConfig[args.app].verifications, args.id);
    const verification = id ? await ctx.db.get(id) : null;
    const now = Date.now();
    if (!verification || verification.expiresAt <= now || verification.expiresAt !== args.expiresAt || verification.generation !== args.generation) return { result: "expired" as const };
    const email = await ctx.db.get(verification.emailId);
    if (!email || email.generation !== verification.generation || email.status === "unsubscribed") return { result: "expired" as const };
    if (email.status !== "subscribed") await ctx.db.patch(email._id, { status: "subscribed", locale: verification.locale ?? "en", verifiedAt: now, consentAcceptedAt: verification.consentAcceptedAt, consentVersion: verification.consentVersion });
    if (!verification.usedAt) await ctx.db.patch(verification._id, { usedAt: now });
    return { result: "confirmed" as const };
  },
});

export const unsubscribe = internalMutation({
  args: { app: updateApp, id: v.string(), generation: v.number() },
  handler: async (ctx, { app, id, generation }) => {
    const key = ctx.db.normalizeId(updateConfig[app].emails, id);
    const email = key ? await ctx.db.get(key) : null;
    if (!email) return { result: "expired" as const };
    // The immediately previous generation is valid only for an idempotent retry.
    if (email.status === "unsubscribed" && email.generation === generation + 1) return { result: "unsubscribed" as const };
    if (email.generation !== generation) return { result: "expired" as const };
    await ctx.db.patch(email._id, { status: "unsubscribed", unsubscribedAt: Date.now(), generation: email.generation + 1 });
    return { result: "unsubscribed" as const };
  },
});

export const leaseJob = internalMutation({
  args: { app: updateApp, jobId: v.string() },
  handler: async (ctx, { app, jobId }) => {
    const id = ctx.db.normalizeId(updateConfig[app].jobs, jobId);
    const job = id ? await ctx.db.get(id) : null, now = Date.now();
    if (!job || job.status === "sent" || job.status === "failed" || job.nextAttemptAt > now || (job.status === "sending" && (job.leaseUntil ?? 0) > now)) return null;
    const email = await ctx.db.get(job.emailId), verification = await ctx.db.get(job.verificationId);
    if (!email || !verification || email.status !== "pending" || verification.generation !== email.generation || verification.expiresAt <= now || verification.usedAt) {
      await ctx.db.patch(job._id, { status: "failed", errorCode: "expired_or_suppressed", leaseUntil: undefined });
      return null;
    }
    const attempt = job.attempts + 1;
    await ctx.db.patch(job._id, { status: "sending", leaseUntil: now + 60_000, attempts: attempt });
    return { job: { ...job, attempts: attempt }, email, verification };
  },
});

export const freezeMessage = internalMutation({
  args: { app: updateApp, jobId: v.string(), attempt: v.number(), message: updateMessage },
  handler: async (ctx, args) => {
    const id = ctx.db.normalizeId(updateConfig[args.app].jobs, args.jobId);
    const job = id ? await ctx.db.get(id) : null;
    if (!job || job.status !== "sending" || job.attempts !== args.attempt) return null;
    const email = await ctx.db.get(job.emailId), verification = await ctx.db.get(job.verificationId);
    if (!email || email.status !== "pending" || !verification || verification.generation !== email.generation || verification.expiresAt <= Date.now()) return null;
    if (job.message) return job.message;
    await ctx.db.patch(job._id, { message: args.message });
    return args.message;
  },
});

export const finishJob = internalMutation({
  args: { app: updateApp, jobId: v.string(), attempt: v.number(), delivered: v.boolean(), providerId: v.optional(v.string()), errorCode: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const id = ctx.db.normalizeId(updateConfig[args.app].jobs, args.jobId);
    const job = id ? await ctx.db.get(id) : null;
    if (!job || job.status !== "sending" || job.attempts !== args.attempt) return;
    if (args.delivered) await ctx.db.patch(job._id, { status: "sent", sentAt: Date.now(), providerId: args.providerId, leaseUntil: undefined, errorCode: undefined });
    else await ctx.db.patch(job._id, { status: job.attempts >= 8 ? "failed" : "queued", nextAttemptAt: Date.now() + Math.min(3_600_000, 60_000 * 2 ** job.attempts), leaseUntil: undefined, errorCode: (args.errorCode ?? "delivery_unavailable").slice(0, 80) });
  },
});

export const retryAndCleanup = internalMutation({
  args: {},
  handler: async ctx => {
    const now = Date.now();
    for (const app of UPDATE_APPS) {
      const tables = updateConfig[app];
      for (const status of ["queued", "sending"] as const) {
        const jobs = await ctx.db.query(tables.jobs).withIndex("by_status_attempt", q => q.eq("status", status).lte("nextAttemptAt", now)).take(25);
        for (const job of jobs) if (status === "queued" || (job.leaseUntil ?? 0) <= now) await ctx.scheduler.runAfter(0, internal.appUpdateDelivery.deliver, { app, jobId: job._id });
      }
      const limits = await ctx.db.query(tables.limits).withIndex("by_expiry", q => q.lt("expiresAt", now - UPDATE_TTL)).take(100);
      for (const row of limits) await ctx.db.delete(row._id);
      // Clear unconfirmed requests after 30 days, with bounded related-record batches.
      const pending = await ctx.db.query(tables.emails).withIndex("by_status_requested", q => q.eq("status", "pending").lt("lastRequestedAt", now - 30 * UPDATE_TTL)).take(10);
      for (const email of pending) {
        const verifications = await ctx.db.query(tables.verifications).withIndex("by_email", q => q.eq("emailId", email._id)).take(100);
        const jobs = await ctx.db.query(tables.jobs).withIndex("by_email", q => q.eq("emailId", email._id)).take(100);
        for (const row of [...verifications, ...jobs]) await ctx.db.delete(row._id);
        if (verifications.length < 100 && jobs.length < 100) await ctx.db.delete(email._id);
      }
    }
  },
});
