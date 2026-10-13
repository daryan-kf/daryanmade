"use node";

import { createHmac, timingSafeEqual } from "node:crypto";

function signingSecret(override?: string) {
  const secret = override ?? process.env.SHIELD_TOKEN_SECRET;
  if (!secret || secret.length < 32) throw new Error("Shield token signing is not configured.");
  return secret;
}

/** Node-only helper. Expiry and one-time consumption are enforced by the caller. */
export function signToken(id: string, expiresAt: number, secret?: string): string {
  if (!/^[A-Za-z0-9_-]+$/.test(id) || !Number.isSafeInteger(expiresAt) || expiresAt <= 0) {
    throw new Error("Invalid verification token input.");
  }
  const signature = createHmac("sha256", signingSecret(secret)).update(`${id}:${expiresAt}`).digest("base64url");
  return `${id}.${signature}`;
}

/** Checks authenticity without leaking a signature prefix through string comparison. */
export function matchesToken(token: string, id: string, expiresAt: number, secret?: string): boolean {
  if (!/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]{43}$/.test(token)) return false;
  const expected = Buffer.from(signToken(id, expiresAt, secret), "utf8");
  const received = Buffer.from(token, "utf8");
  return received.length === expected.length && timingSafeEqual(received, expected);
}
