"use node";

import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { updateApp, updateConfig, updateTopics, emailConfiguration, type UpdateApp } from "./lib/appUpdateConfig";
import { signUpdateToken } from "./lib/appUpdateTokens";
import type { FunctionReturnType } from "convex/server";

type Lease = NonNullable<FunctionReturnType<typeof internal.appUpdates.leaseJob>>;
const escapeHtml = (text: string) => text.replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]!);

function createMessage(app: UpdateApp, lease: Lease, config: NonNullable<ReturnType<typeof emailConfiguration>>) {
  const product = updateConfig[app];
  const da = lease.verification.locale === "da";
  const base = `${config.site}${da ? "/da" : ""}${product.base}`;
  const token = signUpdateToken(app, "verify", { id: lease.verification._id, generation: lease.verification.generation, expiresAt: lease.verification.expiresAt });
  const unsubscribe = signUpdateToken(app, "unsubscribe", { id: lease.email._id, generation: lease.email.generation, expiresAt: 0 });
  const confirmUrl = `${base}/verify#token=${token}`;
  const unsubscribeUrl = `${base}/unsubscribe#token=${unsubscribe}`;
  const privacyUrl = `${base}/privacy`;
  const topics = updateTopics(app);
  if (da) {
    const topicsDa = "appnyheder, lanceringsnyheder og invitationer til at teste kommende versioner";
    const heading = `Lidt mere fra ${product.name}.`;
    const explanation = `Du har bedt om ${topicsDa} fra ${product.name}. Bekræft din e-mail for at tilmelde dig appens nyhedsliste.`;
    const terms = `Linket udløber 24 timer efter din anmodning. Det tilmelder dig ikke alene at åbne linket; tryk på bekræftelsesknappen på siden. Dette gælder kun ${product.name}-listen. Det opretter ikke en appkonto, starter ikke et betalt abonnement og bestiller ikke en tilbudskode.`;
    return {
      from: config.from, to: lease.email.email, ...(config.replyTo ? { replyTo: config.replyTo } : {}),
      subject: `Bekræft nyheder fra ${product.name}`,
      text: `${heading}\n\n${explanation}\n${confirmUrl}\n\n${terms}\n\nHvis du ikke har bedt om dette, kan du ignorere mailen. Du kan annullere anmodningen eller afmelde dig her:\n${unsubscribeUrl}\n\nSådan bruger vi din e-mail:\n${privacyUrl}\n\n${product.name} · Daryan Kamalifar / Sarpoli`,
      html: `<!doctype html><html lang="da"><head><meta charset="utf-8"></head><body style="margin:0;background:#f5f2eb;color:#242520;font-family:Arial,sans-serif"><main style="max-width:520px;margin:auto;padding:44px 24px"><p style="font-size:15px;font-weight:700">${escapeHtml(product.name)}</p><h1 style="font-size:32px;line-height:1.15;margin-top:36px">${escapeHtml(heading)}</h1><p style="font-size:16px;line-height:1.7">${escapeHtml(explanation)}</p><p style="margin:30px 0"><a href="${escapeHtml(confirmUrl)}" style="display:inline-block;background:#242520;color:#fff;padding:16px 22px;border-radius:8px;text-decoration:none;font-weight:700">Bekræft min e-mail</a></p><p style="font-size:13px;line-height:1.8">${escapeHtml(terms)}</p><p style="font-size:13px;line-height:1.8">Hvis du ikke har bedt om dette, kan du ignorere mailen. <a href="${escapeHtml(unsubscribeUrl)}" style="color:#242520">Annullér anmodningen eller afmeld dig</a>.</p><p style="font-size:12px;line-height:1.7"><a href="${escapeHtml(privacyUrl)}" style="color:#242520">Sådan bruger vi din e-mail</a><br>${escapeHtml(product.name)} · Daryan Kamalifar / Sarpoli</p></main></body></html>`,
    };
  }
  return {
    from: config.from, to: lease.email.email, ...(config.replyTo ? { replyTo: config.replyTo } : {}),
    subject: `Confirm updates from ${product.name}`,
    text: `A little more from ${product.name}\n\nYou asked for ${topics} from ${product.name}. Confirm your email to join this app’s list:\n${confirmUrl}\n\nThe link expires 24 hours after your request. Opening it does not subscribe you; press the confirmation button on the page. This is only the ${product.name} list. It does not create an app account, start a paid subscription, or request an offer code.\n\nIf you did not request this, ignore this email. You can cancel this request or unsubscribe here:\n${unsubscribeUrl}\n\nHow we use your email:\n${privacyUrl}\n\n${product.name} · Daryan Kamalifar / Sarpoli`,
    html: `<!doctype html><html lang="en"><head><meta charset="utf-8"></head><body style="margin:0;background:#f5f2eb;color:#242520;font-family:Arial,sans-serif"><main style="max-width:520px;margin:auto;padding:44px 24px"><p style="font-size:15px;font-weight:700">${escapeHtml(product.name)}</p><h1 style="font-size:32px;line-height:1.15;margin-top:36px">A little more from ${escapeHtml(product.name)}.</h1><p style="font-size:16px;line-height:1.7">You asked for ${escapeHtml(topics)}. Confirm your email to join this app’s list.</p><p style="margin:30px 0"><a href="${escapeHtml(confirmUrl)}" style="display:inline-block;background:#242520;color:#fff;padding:16px 22px;border-radius:8px;text-decoration:none;font-weight:700">Confirm my email</a></p><p style="font-size:13px;line-height:1.8">Your link expires 24 hours after your request. Opening it does not subscribe you; press the confirmation button on the page. This is only the ${escapeHtml(product.name)} list. It does not create an app account, start a paid subscription, or request an offer code.</p><p style="font-size:13px;line-height:1.8">If you did not request this, ignore this email. <a href="${escapeHtml(unsubscribeUrl)}" style="color:#242520">Cancel this request or unsubscribe</a>.</p><p style="font-size:12px;line-height:1.7"><a href="${escapeHtml(privacyUrl)}" style="color:#242520">How we use your email</a><br>${escapeHtml(product.name)} · Daryan Kamalifar / Sarpoli</p></main></body></html>`,
  };
}

export const deliver = internalAction({
  args: { app: updateApp, jobId: v.string() },
  handler: async (ctx, { app, jobId }): Promise<void> => {
    const lease: Lease | null = await ctx.runMutation(internal.appUpdates.leaseJob, { app, jobId });
    if (!lease) return;
    const attempt = lease.job.attempts;
    const fail = (errorCode: string) => ctx.runMutation(internal.appUpdates.finishJob, { app, jobId, attempt, delivered: false, errorCode });
    const config = emailConfiguration(app);
    if (!config) { await fail("missing_configuration"); return; }
    const candidate = lease.job.message ?? createMessage(app, lease, config);
    const message = await ctx.runMutation(internal.appUpdates.freezeMessage, { app, jobId, attempt, message: candidate });
    if (!message) { await fail("expired_or_suppressed"); return; }
    const controller = new AbortController(), timeout = setTimeout(() => controller.abort(), 15_000);
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST", signal: controller.signal,
        headers: { Authorization: `Bearer ${config.apiKey}`, "Content-Type": "application/json", "Idempotency-Key": `app-updates-${app}-${jobId}` },
        body: JSON.stringify({ from: message.from, to: [message.to], ...(message.replyTo ? { reply_to: message.replyTo } : {}), subject: message.subject, text: message.text, html: message.html }),
      });
      if (!response.ok) { await fail(`provider_${response.status}`); return; }
      const result: unknown = await response.json().catch(() => null);
      const providerId = result && typeof result === "object" && "id" in result ? result.id : null;
      if (typeof providerId !== "string" || !/^[A-Za-z0-9_-]{1,128}$/.test(providerId)) { await fail("provider_invalid_response"); return; }
      await ctx.runMutation(internal.appUpdates.finishJob, { app, jobId, attempt, delivered: true, providerId });
    } catch { await fail(controller.signal.aborted ? "provider_timeout" : "delivery_unavailable"); }
    finally { clearTimeout(timeout); }
  },
});
