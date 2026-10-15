import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { normalizeEmail } from "./lib/validators";
import { isEmailLocale } from "./lib/emailLocale";
import { registerAppUpdateRoutes } from "./appUpdateHttp";

const http = httpRouter();
registerAppUpdateRoutes(http);
const json = (body: object, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
const authorized = (request: Request) => {
  const secret = process.env.SHIELD_API_SECRET;
  return Boolean(secret && secret.length >= 32 && request.headers.get("authorization") === `Bearer ${secret}`);
};
const emailReady = () => Boolean(process.env.RESEND_API_KEY && process.env.SHIELD_EMAIL_FROM && process.env.SHIELD_EMAIL_SENDER_VERIFIED === "true" && (process.env.SHIELD_TOKEN_SECRET?.length ?? 0) >= 32 && process.env.SHIELD_SITE_URL?.startsWith("https://"));

http.route({ path: "/shield-family/signup", method: "POST", handler: httpAction(async (ctx, request) => {
  if (!authorized(request)) return json({ ok: false, error: "Unauthorized" }, 401);
  if (!emailReady()) return json({ ok: false, error: "Email signup is temporarily unavailable. Please try again later." }, 503);
  try {
    const raw = await request.text(); if (raw.length > 4096) return json({ ok: false, error: "Request too large." }, 413);
    const input = JSON.parse(raw);
    if (input.locale !== undefined && !isEmailLocale(input.locale)) return json({ ok: false, error: "Choose English or Danish." }, 400);
    const email = normalizeEmail(input.email);
    if (!email || !["annual", "quarterly", "monthly"].includes(input.plan) || input.termsAccepted !== true || !/^[a-f0-9]{64}$/.test(input.requestKey)) return json({ ok: false, error: "Enter your email, choose a plan and accept the offer terms." }, 400);
    const response = await ctx.runAction(internal.shieldActions.request, { email, plan: input.plan, termsAccepted: true, locale: input.locale ?? "en", requestKey: input.requestKey });
    if (response.result === "limited") return json({ ok: false, error: "Too many requests. Please try again in an hour." }, 429);
    if (response.result === "unavailable") return json({ ok: false, error: "This offer is not available right now. Please try another plan or check back later." }, 409);
    if (response.result === "invalid") return json({ ok: false, error: "Please check your email and the offer terms." }, 400);
    return json({ ok: true, message: "A confirmation link has been requested. Check your inbox and spam folder." });
  } catch { return json({ ok: false, error: "We couldn’t request your email. Please try again." }, 503); }
}) });

http.route({ path: "/shield-family/verify", method: "POST", handler: httpAction(async (ctx, request) => {
  if (!authorized(request)) return json({ ok: false, error: "Unauthorized" }, 401);
  if (!emailReady()) return json({ ok: false, error: "Email confirmation is temporarily unavailable. Please try again later." }, 503);
  try {
    const raw = await request.text(); if (raw.length > 1024) return json({ ok: false, error: "Invalid confirmation link." }, 400);
    const input = JSON.parse(raw);
    if (typeof input.token !== "string") return json({ ok: false, error: "Invalid confirmation link." }, 400);
    const response = await ctx.runAction(internal.shieldActions.verify, { token: input.token });
    if (response.result === "expired") return json({ ok: false, error: "This confirmation link has expired or is invalid. Request a new link to continue." }, 410);
    if (response.result === "unavailable") return json({ ok: false, error: "There are no codes available for this offer right now. No subscription has been started." }, 409);
    return json({ ok: true, code: response.code, redeemUrl: response.redeemUrl, expiresAt: response.expiresAt, plan: response.plan });
  } catch { return json({ ok: false, error: "We couldn’t confirm your email. Please try again." }, 503); }
}) });
export default http;
