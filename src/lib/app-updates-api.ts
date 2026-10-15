import "server-only";
import { emailCopy } from "./email-copy";
import type { Locale } from "./i18n";
import { createHmac } from "node:crypto";
import { isUpdateApp } from "./app-updates";
import { appUpdateResponse, updatesUnavailable } from "./app-updates-response";

const json = (data: object, status = 200) => Response.json(data, { status, headers: { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" } });

export async function appUpdatesRequest(request: Request, app: string, action: string) {
  let locale: Locale = request.headers.get("accept-language")?.split(",")[0].trim().split("-")[0] === "da" ? "da" : "en";
  const respond = (data: object, status = 200) => {
    const body = data as Record<string, unknown>;
    return json({ ...body, ...(typeof body.error === "string" ? { error: emailCopy(body.error, locale) } : {}) }, status);
  };
  if (!isUpdateApp(app) || !["signup", "verify", "unsubscribe"].includes(action)) return respond({ ok: false, error: "Page not found." }, 404);
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return respond({ ok: false, error: "Please use this app’s email form." }, 403);
  if (!request.headers.get("content-type")?.includes("application/json")) return respond({ ok: false, error: "Please use the email form." }, 415);
  const url = process.env.CONVEX_SITE_URL || process.env.NEXT_PUBLIC_CONVEX_SITE_URL;
  const secret = process.env.APP_UPDATES_API_SECRET;
  if (!url || !secret || secret.length < 32) return respond(updatesUnavailable().body, 503);
  try {
    const backend = new URL(url);
    const local = ["localhost", "127.0.0.1", "[::1]"].includes(backend.hostname);
    if ((backend.protocol !== "https:" && !(local && backend.protocol === "http:")) || backend.username || backend.password || backend.search || backend.hash || backend.pathname !== "/" || backend.hostname.endsWith(".convex.cloud")) return respond(updatesUnavailable().body, 503);
    const reader = request.body?.getReader();
    if (!reader) return respond({ ok: false, error: "Please complete the form." }, 400);
    let size = 0; const chunks: Uint8Array[] = [];
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 4096) { await reader.cancel(); return respond({ ok: false, error: "Request too large." }, 413); }
      chunks.push(value);
    }
    let input: Record<string, unknown>;
    try { input = JSON.parse(Buffer.concat(chunks).toString("utf8")); } catch { return respond({ ok: false, error: "Please check the form and try again." }, 400); }
    if (!input || typeof input !== "object" || Array.isArray(input)) return respond({ ok: false, error: "Please complete the form." }, 400);
    if (input.locale !== undefined && input.locale !== "en" && input.locale !== "da") return respond({ ok: false, error: "Choose English or Danish." }, 400);
    locale = input.locale === "da" ? "da" : input.locale === "en" ? "en" : locale;
    if (action === "signup" && input.website) return respond({ ok: true, message: "A confirmation link has been requested." });
    const ip = (process.env.VERCEL ? request.headers.get("x-vercel-forwarded-for") : request.headers.get("x-forwarded-for"))?.split(",")[0].trim() || "unknown";
    const body = action === "signup" ? { locale, email: input.email, consentAccepted: input.consentAccepted, requestKey: createHmac("sha256", secret).update(`${app}:${ip}`).digest("hex") } : { token: input.token };
    const response = await fetch(`${backend.origin}/app-updates/${app}/${action}`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${secret}` }, body: JSON.stringify(body), cache: "no-store", signal: AbortSignal.timeout(20_000) });
    const result = await appUpdateResponse(action, response);
    return respond(result.body, result.status);
  } catch { return respond({ ok: false, error: "We couldn’t reach the email service. Please try again in a moment." }, 503); }
}
