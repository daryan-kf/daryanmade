"use node";

import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { updateApp } from "./lib/appUpdateConfig";
import { readUpdateToken } from "./lib/appUpdateTokens";

export const confirm = internalAction({
  args: { app: updateApp, action: v.union(v.literal("verify"), v.literal("unsubscribe")), token: v.string() },
  handler: async (ctx, { app, action, token }): Promise<{ result: "expired" | "confirmed" | "unsubscribed" }> => {
    const decoded = readUpdateToken(app, action, token);
    if (!decoded || (action === "verify" && decoded.expiresAt <= Date.now()) || (action === "unsubscribe" && decoded.expiresAt !== 0)) return { result: "expired" };
    if (action === "verify") return ctx.runMutation(internal.appUpdates.confirmVerification, { app, ...decoded });
    return ctx.runMutation(internal.appUpdates.unsubscribe, { app, id: decoded.id, generation: decoded.generation });
  },
});
