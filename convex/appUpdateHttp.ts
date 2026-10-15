import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { UPDATE_APPS, emailConfiguration } from "./lib/appUpdateConfig";
import { isEmailLocale } from "./lib/emailLocale";
import { normalizeEmail } from "./lib/validators";

const json = (data: object, status = 200) => Response.json(data, { status, headers: { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" } });

export function registerAppUpdateRoutes(http: ReturnType<typeof httpRouter>) {
  for (const app of UPDATE_APPS) for (const action of ["signup", "verify", "unsubscribe"] as const) {
    http.route({ path: `/app-updates/${app}/${action}`, method: "POST", handler: httpAction(async (ctx, request) => {
      const secret = process.env.APP_UPDATES_API_SECRET;
      if (!secret || secret.length < 32 || request.headers.get("authorization") !== `Bearer ${secret}`) return json({ ok: false, error: "Unauthorized" }, 401);
      if (!request.headers.get("content-type")?.includes("application/json")) return json({ ok: false, error: "Use the email form to continue." }, 415);
      if ((process.env.APP_UPDATES_TOKEN_SECRET?.length ?? 0) < 32 || (action === "signup" && !emailConfiguration(app))) return json({ ok: false, error: "Email updates are temporarily unavailable. Please try again later." }, 503);
      try {
        const reader = request.body?.getReader();
        if (!reader) return json({ ok: false, error: "Please complete the form." }, 400);
        const decoder = new TextDecoder(); let size = 0, raw = "";
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          size += value.byteLength;
          if (size > 4096) { await reader.cancel(); return json({ ok: false, error: "Request too large." }, 413); }
          raw += decoder.decode(value, { stream: true });
        }
        raw += decoder.decode();
        let input: Record<string, unknown>;
        try { input = JSON.parse(raw); } catch { return json({ ok: false, error: "Please check the form and try again." }, 400); }
        if (!input || typeof input !== "object" || Array.isArray(input)) return json({ ok: false, error: "Please complete the form." }, 400);
        if (input.locale !== undefined && !isEmailLocale(input.locale)) return json({ ok: false, error: "Choose English or Danish." }, 400);
        if (action === "signup") {
          const email = normalizeEmail(input.email);
          if (!email || input.consentAccepted !== true || typeof input.requestKey !== "string" || !/^[a-f0-9]{64}$/.test(input.requestKey)) return json({ ok: false, error: "Enter your email and choose to receive this app’s updates." }, 400);
          const result = await ctx.runMutation(internal.appUpdates.requestVerification, { app, email, consentAccepted: true, locale: input.locale ?? "en", requestKey: input.requestKey });
          if (result.result === "limited") return json({ ok: false, error: "Too many requests. Please try again in an hour." }, 429);
          if (result.result === "invalid") return json({ ok: false, error: "Please check your email and consent." }, 400);
          return json({ ok: true, message: "If confirmation is needed, a link has been requested. Check your inbox and spam folder." });
        }
        if (typeof input.token !== "string" || input.token.length > 300) return json({ ok: false, error: "This link is invalid. Please use the link in your email." }, 400);
        const result = await ctx.runAction(internal.appUpdateActions.confirm, { app, action, token: input.token });
        if (result.result === "expired") return json({ ok: false, error: action === "verify" ? "This confirmation link has expired or is no longer valid. Request a fresh link to continue." : "This unsubscribe link is no longer valid. Use the link in your latest email or contact us." }, 410);
        return json({ ok: true, status: result.result });
      } catch { return json({ ok: false, error: "We couldn’t complete that request. Please try again." }, 503); }
    }) });
  }
}
