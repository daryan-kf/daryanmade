import { v } from "convex/values";

export const offerPlan = v.union(v.literal("annual"), v.literal("quarterly"), v.literal("monthly"));
export const CONSENT_VERSION = "shield-free-code-2026-10-13";
export const CAMPAIGN = "founding-families";
export const VERIFICATION_TTL = 24 * 60 * 60 * 1000;
export function normalizeEmail(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  return email.length <= 254 && /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email) ? email : null;
}
