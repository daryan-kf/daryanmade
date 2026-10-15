"use node";

import { createHmac, timingSafeEqual } from "node:crypto";
import type { UpdateApp } from "./appUpdateConfig";

type Purpose = "verify" | "unsubscribe";
export type UpdateToken = { id: string; generation: number; expiresAt: number };
function secret() {
  const value = process.env.APP_UPDATES_TOKEN_SECRET;
  if (!value || value.length < 32) throw new Error("App updates signing is not configured.");
  return value;
}
function signature(app: UpdateApp, purpose: Purpose, payload: string) {
  return createHmac("sha256", secret()).update(`app-updates:v1:${app}:${purpose}:${payload}`).digest("base64url");
}
export function signUpdateToken(app: UpdateApp, purpose: Purpose, token: UpdateToken) {
  if (!/^[A-Za-z0-9_-]+$/.test(token.id) || !Number.isSafeInteger(token.generation) || token.generation < 1 || !Number.isSafeInteger(token.expiresAt) || token.expiresAt < (purpose === "verify" ? 1 : 0)) throw new Error("Invalid token input.");
  const payload = `${token.id}.${token.generation}.${token.expiresAt}`;
  return `${payload}.${signature(app, purpose, payload)}`;
}
export function readUpdateToken(app: UpdateApp, purpose: Purpose, value: string): UpdateToken | null {
  if (value.length > 300 || !/^[A-Za-z0-9_-]+\.[0-9]{1,12}\.[0-9]{1,16}\.[A-Za-z0-9_-]{43}$/.test(value)) return null;
  const [id, generationText, expiryText, received] = value.split(".");
  const generation = Number(generationText), expiresAt = Number(expiryText);
  if (!Number.isSafeInteger(generation) || generation < 1 || !Number.isSafeInteger(expiresAt) || expiresAt < (purpose === "verify" ? 1 : 0)) return null;
  const expected = signature(app, purpose, `${id}.${generationText}.${expiryText}`);
  if (!timingSafeEqual(Buffer.from(received), Buffer.from(expected))) return null;
  return { id, generation, expiresAt };
}
