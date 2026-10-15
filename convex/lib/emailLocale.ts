import { v } from "convex/values";

/** Optional on stored records so existing audiences and offer requests migrate additively. */
export const emailLocale = v.union(v.literal("en"), v.literal("da"));
export type EmailLocale = "en" | "da";
export const isEmailLocale = (value: unknown): value is EmailLocale => value === "en" || value === "da";
