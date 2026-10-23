import { v } from "convex/values";

export const updateApp = v.union(v.literal("vela"), v.literal("iqra"), v.literal("shield-family"), v.literal("wardrobe"), v.literal("kaizencv"), v.literal("koebsklar"), v.literal("sarpoli"));
export type UpdateApp = "vela" | "iqra" | "shield-family" | "wardrobe" | "kaizencv" | "koebsklar" | "sarpoli";
export const UPDATE_APPS: UpdateApp[] = ["vela", "iqra", "shield-family", "wardrobe", "kaizencv", "koebsklar", "sarpoli"];
export const UPDATE_TTL = 86_400_000;
export const UPDATE_CONSENT_DATE = "2026-10-22";

export const updateConfig = {
  vela: { name: "Vela", base: "/vela/updates", env: "VELA", emails: "velaEmails", verifications: "velaVerifications", jobs: "velaEmailJobs", limits: "velaRateLimits" },
  iqra: { name: "Iqra", base: "/iqra/updates", env: "IQRA", emails: "iqraEmails", verifications: "iqraVerifications", jobs: "iqraEmailJobs", limits: "iqraRateLimits" },
  "shield-family": { name: "Shield Family", base: "/projects/shield-family/updates", env: "SHIELD_UPDATES", emails: "shieldFamilyUpdateEmails", verifications: "shieldFamilyUpdateVerifications", jobs: "shieldFamilyUpdateEmailJobs", limits: "shieldFamilyUpdateRateLimits" },
  wardrobe: { name: "Twillby", base: "/projects/wardrobe/updates", env: "TWILL_BUY", emails: "twillBuyEmails", verifications: "twillBuyVerifications", jobs: "twillBuyEmailJobs", limits: "twillBuyRateLimits" },
  kaizencv: { name: "KaizenCV", base: "/projects/kaizencv/updates", env: "KAIZENCV", emails: "kaizenCVEmails", verifications: "kaizenCVVerifications", jobs: "kaizenCVEmailJobs", limits: "kaizenCVRateLimits" },
  koebsklar: { name: "Købsklar", base: "/projects/koebsklar/updates", env: "KOEBSKLAR", emails: "koebsklarEmails", verifications: "koebsklarVerifications", jobs: "koebsklarEmailJobs", limits: "koebsklarRateLimits" },
  sarpoli: { name: "Sarpoli", base: "/projects/sarpoli/updates", env: "SARPOLI", emails: "sarpoliEmails", verifications: "sarpoliVerifications", jobs: "sarpoliEmailJobs", limits: "sarpoliRateLimits" },
} as const;

export const consentVersion = (app: UpdateApp) => `${app}-updates-and-testing-${UPDATE_CONSENT_DATE}`;
export const updateTopics = (_app: UpdateApp) => "app updates, launch news, and invitations to test future versions";

export function emailConfiguration(app: UpdateApp) {
  const prefix = updateConfig[app].env;
  const from = process.env[`${prefix}_EMAIL_FROM`]?.trim();
  const replyTo = process.env[`${prefix}_EMAIL_REPLY_TO`]?.trim();
  const site = process.env.APP_UPDATES_SITE_URL?.trim();
  const secret = process.env.APP_UPDATES_TOKEN_SECRET;
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!from || !site || !apiKey || !secret || secret.length < 32 || process.env[`${prefix}_EMAIL_SENDER_VERIFIED`] !== "true") return null;
  try {
    const url = new URL(site);
    if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash || /[\r\n]/.test(from) || (replyTo && /[\r\n]/.test(replyTo))) return null;
    return { from, replyTo, site: url.origin, secret, apiKey };
  } catch { return null; }
}
