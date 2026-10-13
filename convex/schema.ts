import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { offerPlan } from "./lib/validators";

// Each product owns its own email table and related records. Do not mix audiences.
export default defineSchema({
  shieldFamilyEmails: defineTable({
    email: v.string(), plan: offerPlan,
    status: v.union(v.literal("pending"), v.literal("verified"), v.literal("code_sent")),
    requestedAt: v.number(), lastRequestedAt: v.number(), termsAcceptedAt: v.number(), consentVersion: v.string(),
    verifiedAt: v.optional(v.number()), codeId: v.optional(v.id("shieldFamilyCodes")),
  }).index("by_email", ["email"]).index("by_status", ["status"]),
  shieldFamilyVerifications: defineTable({
    emailId: v.id("shieldFamilyEmails"), plan: offerPlan, expiresAt: v.number(),
    usedAt: v.optional(v.number()), consentVersion: v.string(),
  }).index("by_email", ["emailId"]).index("by_expiry", ["expiresAt"]),
  shieldFamilyCodes: defineTable({
    code: v.string(), redeemUrl: v.string(), plan: offerPlan, expiresAt: v.number(), batch: v.string(),
    status: v.union(v.literal("available"), v.literal("assigned")),
    emailId: v.optional(v.id("shieldFamilyEmails")), assignedAt: v.optional(v.number()),
  }).index("by_code", ["code"]).index("by_plan_status_expiry", ["plan", "status", "expiresAt"]),
  shieldFamilyEmailJobs: defineTable({
    emailId: v.id("shieldFamilyEmails"), verificationId: v.optional(v.id("shieldFamilyVerifications")),
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
