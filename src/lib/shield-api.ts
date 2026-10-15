import "server-only";
import { emailCopy } from "./email-copy";
import type { Locale } from "./i18n";
import { createHmac } from "node:crypto";

export const shieldResponse = (data: object, status = 200) => Response.json(data, { status, headers: { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" } });

export async function shieldRequest(request: Request, endpoint: "signup" | "verify") {
  let locale: Locale = request.headers.get("accept-language")?.split(",")[0].trim().split("-")[0] === "da" ? "da" : "en";
  const respond = (data: object, status = 200) => {
    const body = data as Record<string, unknown>;
    return shieldResponse({ ...body, ...(typeof body.error === "string" ? { error: emailCopy(body.error, locale) } : {}) }, status);
  };
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return respond({ ok: false, error: "Please submit this form from the Shield Family website." }, 403);
  if (!request.headers.get("content-type")?.includes("application/json")) return respond({ ok: false, error: "Please use the signup form." }, 415);
  const url = process.env.CONVEX_SITE_URL || process.env.NEXT_PUBLIC_CONVEX_SITE_URL;
  const secret = process.env.SHIELD_API_SECRET;
  if (!url || !secret) return respond({ ok: false, error: "Email signup is temporarily unavailable. Please try again later." }, 503);
  try {
    const reader = request.body?.getReader();
    if (!reader) return respond({ ok: false, error: "Please complete the form." }, 400);
    let size = 0; const chunks: Uint8Array[] = [];
    while (true) { const { value, done } = await reader.read(); if (done) break; size += value.byteLength; if (size > 4096) { await reader.cancel(); return respond({ ok: false, error: "Request too large." }, 413); } chunks.push(value); }
    let data: Record<string, unknown>;
    try { data = JSON.parse(Buffer.concat(chunks).toString("utf8")); } catch { return respond({ ok: false, error: "Please check the form and try again." }, 400); }
    if (!data || typeof data !== "object" || Array.isArray(data)) return respond({ ok: false, error: "Please complete the form." }, 400);
    if (data.locale !== undefined && data.locale !== "en" && data.locale !== "da") return respond({ ok: false, error: "Choose English or Danish." }, 400);
    locale = data.locale === "da" ? "da" : data.locale === "en" ? "en" : locale;
    if (endpoint === "signup" && data.website) return respond({ ok: true, message: "A confirmation link has been requested." });
    const ip = (process.env.VERCEL ? request.headers.get("x-vercel-forwarded-for") : request.headers.get("x-forwarded-for"))?.split(",")[0].trim() || "unknown";
    const body = endpoint === "signup" ? { locale, email: data.email, plan: data.plan, termsAccepted: data.termsAccepted, requestKey: createHmac("sha256", secret).update(ip).digest("hex") } : { token: data.token };
    const response = await fetch(`${url.replace(/\/$/, "")}/shield-family/${endpoint}`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${secret}` }, body: JSON.stringify(body), cache: "no-store", signal: AbortSignal.timeout(20000) });
    const result = await response.json();
    if (typeof result?.ok !== "boolean") throw new Error("Invalid backend response");
    return respond(result, response.status);
  } catch { return respond({ ok: false, error: "We couldn’t reach the signup service. Please try again in a moment." }, 503); }
}
