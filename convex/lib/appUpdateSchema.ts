import { defineTable } from "convex/server";
import { v } from "convex/values";
import { emailLocale } from "./emailLocale";

export const updateMessage = v.object({ from: v.string(), to: v.string(), replyTo: v.optional(v.string()), subject: v.string(), text: v.string(), html: v.string() });

/** Same lifecycle, separately indexed records and typed references for each product. */
export function updateTables<E extends string, V extends string>(emailTable: E, verificationTable: V) {
  return {
    emails: defineTable({
      email: v.string(), locale: v.optional(emailLocale), status: v.union(v.literal("pending"), v.literal("subscribed"), v.literal("unsubscribed")),
      requestedAt: v.number(), lastRequestedAt: v.number(), consentAcceptedAt: v.number(), consentVersion: v.string(), generation: v.number(),
      verifiedAt: v.optional(v.number()), unsubscribedAt: v.optional(v.number()),
    }).index("by_email", ["email"]).index("by_status_requested", ["status", "lastRequestedAt"]),
    verifications: defineTable({
      emailId: v.id(emailTable), locale: v.optional(emailLocale), generation: v.number(), requestedAt: v.number(), consentAcceptedAt: v.number(), consentVersion: v.string(), expiresAt: v.number(), usedAt: v.optional(v.number()),
    }).index("by_email", ["emailId"]).index("by_expiry", ["expiresAt"]),
    jobs: defineTable({
      emailId: v.id(emailTable), verificationId: v.id(verificationTable),
      status: v.union(v.literal("queued"), v.literal("sending"), v.literal("sent"), v.literal("failed")),
      attempts: v.number(), createdAt: v.number(), nextAttemptAt: v.number(), leaseUntil: v.optional(v.number()),
      sentAt: v.optional(v.number()), providerId: v.optional(v.string()), errorCode: v.optional(v.string()), message: v.optional(updateMessage),
    }).index("by_status_attempt", ["status", "nextAttemptAt"]).index("by_email", ["emailId"]),
    limits: defineTable({ key: v.string(), count: v.number(), expiresAt: v.number() }).index("by_key", ["key"]).index("by_expiry", ["expiresAt"]),
  };
}
