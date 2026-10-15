"use node";

import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { signToken } from "./lib/tokens";

type Plan = "annual" | "quarterly" | "monthly";
type EmailLease = {
  job: { _id: string; kind: "verification" | "code"; attempts: number; verificationId?: string; locale?: "en" | "da" };
  signup: { email: string; plan: Plan; locale?: "en" | "da" };
  verification?: { _id: string; expiresAt: number; plan: Plan; locale?: "en" | "da" };
  code?: { code: string; redeemUrl: string; expiresAt: number; plan: Plan };
};
type Message = { subject: string; text: string; html: string };

const planNames: Record<Plan, string> = { annual: "Yearly", quarterly: "Every 3 months", monthly: "Monthly" };
const renewalDescriptions: Record<Plan, string> = {
  annual: "the full annual price for the following year",
  quarterly: "the three-month price every three months",
  monthly: "the monthly price each month",
};

function escapeHtml(text: string) {
  return text.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]!);
}

function expiryLabel(expiresAt: number, locale: "en" | "da" = "en") {
  return `${new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }).format(new Date(expiresAt))} UTC`;
}

function htmlMessage(heading: string, content: string, button: { label: string; href: string }, footer: string, locale: "en" | "da" = "en") {
  return `<!doctype html><html lang="${locale}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#f5f1ea;color:#211e1a;font-family:Arial,sans-serif"><div style="max-width:560px;margin:0 auto;padding:40px 24px"><p style="margin:0 0 24px;color:#332c9e;font-size:17px;font-weight:700">Shield Family</p><div style="background:#fbf8f3;border:1px solid #e3dcd0;border-radius:20px;padding:32px 28px"><h1 style="margin:0 0 18px;font-size:28px;line-height:1.15;letter-spacing:-.6px">${escapeHtml(heading)}</h1>${content}<p style="margin:26px 0"><a href="${escapeHtml(button.href)}" style="display:inline-block;padding:16px 22px;background:#5856d6;color:#fff;border-radius:12px;text-decoration:none;font-size:16px;font-weight:700">${escapeHtml(button.label)}</a></p><p style="margin:24px 0 0;color:#6a625a;font-size:12px;line-height:1.7">${footer}</p></div><p style="margin:22px 0 0;color:#6a625a;font-size:12px;line-height:1.6">${locale === "da" ? "Shield Family · Et uafhængigt projekt af Daryan Kamalifar.<br>Denne e-mail handler om det tilbud, du har bedt om." : "Shield Family · An independent project by Daryan Kamalifar.<br>This is an email about your requested offer."}</p></div></body></html>`;
}

function verificationMessage(lease: EmailLease, siteOrigin: string): Message | null {
  const verification = lease.verification;
  if (!verification || !Number.isSafeInteger(verification.expiresAt) || verification.expiresAt <= Date.now()) return null;
  const token = signToken(verification._id, verification.expiresAt);
  const da = verification.locale === "da";
  const url = `${siteOrigin}${da ? "/da" : ""}/projects/shield-family/verify#token=${token}`;
  const expires = expiryLabel(verification.expiresAt, da ? "da" : "en");
  const plan = planNames[verification.plan];
  if (da) {
    const planDa = { annual: "årlige", quarterly: "3-måneders", monthly: "månedlige" }[verification.plan];
    return {
      subject: "Bekræft din e-mail til Shield Family",
      text: `Bekræft din e-mail\n\nDu har bedt om Shield Familys tilbud med tre gratis måneder på det ${planDa} abonnement.\n\nÅbn linket, og bekræft din e-mail på næste side:\n${url}\n\nLinket udløber 24 timer efter din anmodning, den ${expires}. Når du bekræfter din e-mail, kan vi sende din kode; det starter ikke et abonnement.\n\nHvis du ikke har bedt om tilbuddet, kan du ignorere denne mail.\n\nShield Family · Et uafhængigt projekt af Daryan Kamalifar.`,
      html: htmlMessage("En roligere start, sammen.", `<p style="font-size:16px;line-height:1.7;color:#6a625a">Du har bedt om Shield Familys tilbud med tre gratis måneder på det <strong style="color:#211e1a">${planDa}</strong> abonnement.</p><p style="font-size:16px;line-height:1.7;color:#6a625a">Åbn linket, og bekræft din e-mail på næste side for at få din kode.</p>`, { label: "Bekræft min e-mail", href: url }, `Linket udløber 24 timer efter din anmodning, den ${escapeHtml(expires)}. Bekræftelse af din e-mail starter ikke et abonnement.<br><br>Hvis du ikke har bedt om tilbuddet, kan du ignorere denne mail.`, "da"),
    };
  }
  return {
    subject: "Confirm your email for Shield Family",
    text: `Confirm your email\n\nYou requested the Shield Family three-month offer on the ${plan} plan.\n\nOpen this link, then confirm your email on the next page:\n${url}\n\nThe link expires 24 hours after your request, on ${expires}. Confirming your email lets us send your code; it does not start a subscription.\n\nIf you did not request this offer, you can ignore this email.\n\nShield Family · An independent project by Daryan Kamalifar.`,
    html: htmlMessage(
      "A calmer start, together.",
      `<p style="font-size:16px;line-height:1.7;color:#6a625a">You requested the Shield Family three-month offer on the <strong style="color:#211e1a">${escapeHtml(plan)}</strong> plan.</p><p style="font-size:16px;line-height:1.7;color:#6a625a">Open the link, then confirm your email on the next page to receive your code.</p>`,
      { label: "Confirm my email", href: url },
      `This link expires 24 hours after your request, on ${escapeHtml(expires)}. Confirming your email does not start a subscription.<br><br>If you didn’t request this offer, you can ignore this email.`,
    ),
  };
}

function codeMessage(lease: EmailLease, siteOrigin: string): Message | null {
  const code = lease.code;
  if (!code || code.plan !== lease.signup.plan || !code.code.trim() || code.code.length > 128 || /[\r\n\u0000-\u001f]/.test(code.code) || !Number.isSafeInteger(code.expiresAt) || code.expiresAt <= Date.now()) return null;
  let redeemUrl: URL;
  try { redeemUrl = new URL(code.redeemUrl); } catch { return null; }
  if (redeemUrl.protocol !== "https:" || !["apps.apple.com", "itunes.apple.com", "buy.itunes.apple.com"].includes(redeemUrl.hostname) || redeemUrl.username || redeemUrl.password) return null;
  const da = (lease.job.locale ?? lease.signup.locale) === "da";
  const guideUrl = `${siteOrigin}${da ? "/da" : ""}/projects/shield-family/redeem`;
  const expires = expiryLabel(code.expiresAt, da ? "da" : "en");
  const plan = planNames[code.plan];
  if (da) {
    const planDa = { annual: "årlige", quarterly: "3-måneders", monthly: "månedlige" }[code.plan];
    const price = { annual: "den fulde årspris for det efterfølgende år", quarterly: "prisen for tre måneder hver tredje måned", monthly: "månedsprisen hver måned" }[code.plan];
    const renewalDa = `Efter tre gratis kalendermåneder fornys dit ${planDa} abonnement automatisk til ${price}, medmindre det opsiges. Apple bekræfter din berettigelse, lokale pris og fornyelsesdato, før du abonnerer. Opsig i Apples indstillinger mindst 24 timer før fornyelse.`;
    return {
      subject: "Din Shield Family-tilbudskode",
      text: `Din Shield Family-tilbudskode\n\nDin e-mail er bekræftet. Her er din kode til det ${planDa} abonnement:\n\n${code.code}\n\nIndløs hos Apple:\n${redeemUrl.href}\n\nIndløs før ${expires}. Åbn linket på din iPhone eller iPad, og læs Apples bekræftelsesskærm, før du accepterer.\n\n${renewalDa}\n\nBrug for hjælp? Din indløsningsvejledning:\n${guideUrl}\n\nModtagelse af koden starter ikke et abonnement.\n\nShield Family · Et uafhængigt projekt af Daryan Kamalifar.`,
      html: htmlMessage("Dine tre måneder starter her.", `<p style="font-size:16px;line-height:1.7;color:#6a625a">Din e-mail er bekræftet. Her er din kode til det <strong style="color:#211e1a">${planDa}</strong> abonnement.</p><p style="padding:18px;background:#e9e8f7;color:#332c9e;border-radius:12px;font-family:monospace;font-size:24px;font-weight:700;letter-spacing:2px;overflow-wrap:anywhere">${escapeHtml(code.code)}</p><p style="font-size:14px;line-height:1.7;color:#6a625a">Indløs før ${escapeHtml(expires)}. Åbn Apple-linket på din iPhone eller iPad, og læs bekræftelsesskærmen, før du accepterer.</p>`, { label: "Indløs hos Apple", href: redeemUrl.href }, `${escapeHtml(renewalDa)}<br><br>Modtagelse af koden starter ikke et abonnement.<br><br><a href="${escapeHtml(guideUrl)}" style="color:#332c9e;text-decoration:underline">Se indløsningsvejledningen</a>.`, "da"),
    };
  }
  const renewal = `After three calendar months free, your ${plan} subscription renews automatically at ${renewalDescriptions[code.plan]}, unless cancelled. Apple confirms eligibility, your local price and the renewal date before you subscribe. Cancel in Apple Settings at least 24 hours before renewal.`;
  return {
    subject: "Your Shield Family offer code",
    text: `Your Shield Family offer code\n\nYour email is confirmed. Here is your code for the ${plan} plan:\n\n${code.code}\n\nRedeem with Apple:\n${redeemUrl.href}\n\nRedeem before ${expires}. Open the link on your iPhone or iPad and review Apple's confirmation screen before accepting.\n\n${renewal}\n\nNeed a hand? Your redemption guide:\n${guideUrl}\n\nReceiving this code does not start a subscription.\n\nShield Family · An independent project by Daryan Kamalifar.`,
    html: htmlMessage(
      "Your three months start here.",
      `<p style="font-size:16px;line-height:1.7;color:#6a625a">Your email is confirmed. Here’s your code for the <strong style="color:#211e1a">${escapeHtml(plan)}</strong> plan.</p><p style="padding:18px;background:#e9e8f7;color:#332c9e;border-radius:12px;font-family:monospace;font-size:24px;font-weight:700;letter-spacing:2px;overflow-wrap:anywhere">${escapeHtml(code.code)}</p><p style="font-size:14px;line-height:1.7;color:#6a625a">Redeem before ${escapeHtml(expires)}. Open the Apple link on your iPhone or iPad and review the confirmation screen before accepting.</p>`,
      { label: "Redeem with Apple", href: redeemUrl.href },
      `${escapeHtml(renewal)}<br><br>Receiving this code does not start a subscription.<br><br><a href="${escapeHtml(guideUrl)}" style="color:#332c9e;text-decoration:underline">See the redemption guide</a>.`,
    ),
  };
}

export const deliver = internalAction({
  args: { jobId: v.id("shieldFamilyEmailJobs") },
  handler: async (ctx, { jobId }): Promise<void> => {
    const lease: EmailLease | null = await ctx.runMutation(internal.shieldOffers.leaseEmailJob, { jobId });
    if (!lease) return;
    const fail = async (errorCode: string) => { await ctx.runMutation(internal.shieldOffers.finishEmailJob, { jobId, delivered: false, errorCode }); };

    const apiKey = process.env.RESEND_API_KEY?.trim();
    const from = process.env.SHIELD_EMAIL_FROM?.trim();
    const siteUrl = process.env.SHIELD_SITE_URL?.trim();
    const secret = process.env.SHIELD_TOKEN_SECRET;
    if (!apiKey || !from || !siteUrl || !secret || secret.length < 32) {
      await fail("missing_configuration");
      return;
    }

    let siteOrigin: string;
    try {
      const url = new URL(siteUrl);
      const local = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
      if ((url.protocol !== "https:" && !(local && url.protocol === "http:")) || url.username || url.password || url.search || url.hash || /[\r\n]/.test(from)) throw new Error("Invalid config");
      siteOrigin = url.origin;
    } catch {
      await fail("invalid_configuration");
      return;
    }

    let message: Message | null;
    try { message = lease.job.kind === "verification" ? verificationMessage(lease, siteOrigin) : codeMessage(lease, siteOrigin); } catch { message = null; }
    if (!message) {
      await fail(lease.job.kind === "verification" ? "invalid_verification" : "invalid_offer_code");
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", "Idempotency-Key": `shield-family-${jobId}` },
        body: JSON.stringify({ from, to: [lease.signup.email], ...(process.env.SHIELD_EMAIL_REPLY_TO ? { reply_to: process.env.SHIELD_EMAIL_REPLY_TO } : {}), ...message }),
        signal: controller.signal,
      });
      if (!response.ok) {
        await fail(`provider_${response.status}`);
        return;
      }
      const result: unknown = await response.json().catch(() => null);
      const providerId = result && typeof result === "object" && "id" in result ? result.id : null;
      if (typeof providerId !== "string" || !/^[A-Za-z0-9_-]{1,128}$/.test(providerId)) {
        await fail("provider_invalid_response");
        return;
      }
      await ctx.runMutation(internal.shieldOffers.finishEmailJob, { jobId, delivered: true, providerId });
    } catch {
      await fail(controller.signal.aborted ? "provider_timeout" : "delivery_unavailable");
    } finally {
      clearTimeout(timeout);
    }
  },
});
