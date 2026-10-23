import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { emailLocale } from "./lib/emailLocale";
import { offerPlan } from "./lib/validators";
import { updateTables } from "./lib/appUpdateSchema";

const vela = updateTables("velaEmails", "velaVerifications");
const iqra = updateTables("iqraEmails", "iqraVerifications");
const shieldUpdates = updateTables("shieldFamilyUpdateEmails", "shieldFamilyUpdateVerifications");

const twillBuy = updateTables("twillBuyEmails", "twillBuyVerifications");
const kaizenCV = updateTables("kaizenCVEmails", "kaizenCVVerifications");
const koebsklar = updateTables("koebsklarEmails", "koebsklarVerifications");
const sarpoli = updateTables("sarpoliEmails", "sarpoliVerifications");

// Each product owns its own email table and related records. Do not mix audiences.
export default defineSchema({
  twillBuyEmails: twillBuy.emails,
  twillBuyVerifications: twillBuy.verifications,
  twillBuyEmailJobs: twillBuy.jobs,
  twillBuyRateLimits: twillBuy.limits,
  kaizenCVEmails: kaizenCV.emails,
  kaizenCVVerifications: kaizenCV.verifications,
  kaizenCVEmailJobs: kaizenCV.jobs,
  kaizenCVRateLimits: kaizenCV.limits,
  koebsklarEmails: koebsklar.emails,
  koebsklarVerifications: koebsklar.verifications,
  koebsklarEmailJobs: koebsklar.jobs,
  koebsklarRateLimits: koebsklar.limits,
  sarpoliEmails: sarpoli.emails,
  sarpoliVerifications: sarpoli.verifications,
  sarpoliEmailJobs: sarpoli.jobs,
  sarpoliRateLimits: sarpoli.limits,

  velaEmails: vela.emails,
  velaVerifications: vela.verifications,
  velaEmailJobs: vela.jobs,
  velaRateLimits: vela.limits,
  iqraEmails: iqra.emails,
  iqraVerifications: iqra.verifications,
  iqraEmailJobs: iqra.jobs,
  iqraRateLimits: iqra.limits,
  shieldFamilyUpdateEmails: shieldUpdates.emails,
  shieldFamilyUpdateVerifications: shieldUpdates.verifications,
  shieldFamilyUpdateEmailJobs: shieldUpdates.jobs,
  shieldFamilyUpdateRateLimits: shieldUpdates.limits,
  shieldFamilyEmails: defineTable({
    email: v.string(), locale: v.optional(emailLocale), plan: offerPlan,
    status: v.union(v.literal("pending"), v.literal("verified"), v.literal("code_sent")),
    requestedAt: v.number(), lastRequestedAt: v.number(), termsAcceptedAt: v.number(), consentVersion: v.string(),
    verifiedAt: v.optional(v.number()), codeId: v.optional(v.id("shieldFamilyCodes")),
  }).index("by_email", ["email"]).index("by_status", ["status"]),
  shieldFamilyVerifications: defineTable({
    emailId: v.id("shieldFamilyEmails"), locale: v.optional(emailLocale), plan: offerPlan, expiresAt: v.number(),
    usedAt: v.optional(v.number()), consentVersion: v.string(),
  }).index("by_email", ["emailId"]).index("by_expiry", ["expiresAt"]),
  shieldFamilyCodes: defineTable({
    code: v.string(), redeemUrl: v.string(), plan: offerPlan, expiresAt: v.number(), batch: v.string(),
    status: v.union(v.literal("available"), v.literal("assigned")),
    emailId: v.optional(v.id("shieldFamilyEmails")), assignedAt: v.optional(v.number()),
  }).index("by_code", ["code"]).index("by_plan_status_expiry", ["plan", "status", "expiresAt"]),
  shieldFamilyEmailJobs: defineTable({
    emailId: v.id("shieldFamilyEmails"), locale: v.optional(emailLocale), verificationId: v.optional(v.id("shieldFamilyVerifications")),
    kind: v.union(v.literal("verification"), v.literal("code")),
    status: v.union(v.literal("queued"), v.literal("sending"), v.literal("sent"), v.literal("failed")),
    attempts: v.number(), nextAttemptAt: v.number(), leaseUntil: v.optional(v.number()),
    sentAt: v.optional(v.number()), providerId: v.optional(v.string()), errorCode: v.optional(v.string()),
  }).index("by_status_attempt", ["status", "nextAttemptAt"]).index("by_email", ["emailId"]),
  shieldFamilyRateLimits: defineTable({ key: v.string(), count: v.number(), expiresAt: v.number() })
    .index("by_key", ["key"]).index("by_expiry", ["expiresAt"]),
  shieldFamilyCampaigns: defineTable({
    slug: v.string(), active: v.boolean(), maxClaims: v.number(), allocated: v.number(), endsAt: v.number(),
  }).index("by_slug", ["slug"]),
});
