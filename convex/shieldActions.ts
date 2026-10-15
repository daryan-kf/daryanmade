"use node";

import { v } from "convex/values";
import { emailLocale } from "./lib/emailLocale";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { offerPlan } from "./lib/validators";
import { matchesToken } from "./lib/tokens";

export const request = internalAction({
  args: { email: v.string(), plan: offerPlan, termsAccepted: v.boolean(), locale: v.optional(emailLocale), requestKey: v.string() },
  handler: async (ctx, args): Promise<{ result: "accepted" | "limited" | "invalid" | "unavailable" }> => ctx.runMutation(internal.shieldOffers.requestVerification, args),
});

export const verify = internalAction({
  args: { token: v.string() },
  handler: async (ctx, { token }): Promise<{ result: string; code?: string; redeemUrl?: string; expiresAt?: number; plan?: string }> => {
    if (token.length > 256 || !/^[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]{43}$/.test(token)) return { result: "expired" };
    const id = token.split(".")[0];
    const verification = await ctx.runQuery(internal.shieldOffers.getVerification, { id });
    if (!verification || verification.expiresAt <= Date.now() || !matchesToken(token, verification._id, verification.expiresAt)) return { result: "expired" };
    return ctx.runMutation(internal.shieldOffers.confirmVerification, { verificationId: verification._id });
  },
});
