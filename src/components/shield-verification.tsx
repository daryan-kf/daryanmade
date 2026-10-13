"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AppleIcon, Check } from "./icons";
import styles from "./shield-flow.module.css";

type Plan = "annual" | "quarterly" | "monthly";
type VerifiedOffer = { code: string; redeemUrl: string; expiresAt: string | number; plan: Plan };
const OFFER = "/projects/shield-family#offer";
const RENEWAL: Record<Plan, { label: string; text: string }> = {
  annual: { label: "Your yearly offer", text: "If Apple confirms eligibility, three calendar months free are followed by the full annual price for the following year, then yearly renewal unless cancelled. This is the full yearly charge, not a prorated nine-month price." },
  quarterly: { label: "Your three-month plan offer", text: "If Apple confirms eligibility, three calendar months free are followed by the full three-month price, charged every three months unless cancelled." },
  monthly: { label: "Your monthly offer", text: "If Apple confirms eligibility, three calendar months free are followed by the monthly price, charged each month unless cancelled." },
};

function readOffer(value: unknown): VerifiedOffer | null {
  if (!value || typeof value !== "object") return null;
  const data = value as Record<string, unknown>;
  if (data.ok !== true || typeof data.code !== "string" || !data.code || typeof data.redeemUrl !== "string" || !(typeof data.expiresAt === "string" || typeof data.expiresAt === "number") || !(data.plan === "annual" || data.plan === "quarterly" || data.plan === "monthly")) return null;
  try {
    const url = new URL(data.redeemUrl);
    if (url.protocol !== "https:" || url.hostname !== "apps.apple.com" || url.pathname !== "/redeem") return null;
  } catch { return null; }
  return { code: data.code, redeemUrl: data.redeemUrl, expiresAt: data.expiresAt, plan: data.plan };
}

function expiryText(value: string | number) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Copenhagen", timeZoneName: "short" }).format(date);
}

export function ShieldVerification() {
  const captured = useRef(false);
  const tokenRef = useRef("");
  const requestRef = useRef<AbortController | null>(null);
  const successRef = useRef<HTMLHeadingElement>(null);
  const [ready, setReady] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offer, setOffer] = useState<VerifiedOffer | null>(null);
  const [copyStatus, setCopyStatus] = useState("");

  useEffect(() => {
    if (captured.current) return;
    captured.current = true;
    const hash = window.location.hash;
    const token = new URLSearchParams(hash.slice(1)).get("token");
    if (token && token.length <= 2048 && !/[\u0000-\u001f\u007f]/.test(token)) tokenRef.current = token;
    if (hash) window.history.replaceState(window.history.state, "", window.location.pathname + window.location.search);
    setHasToken(Boolean(tokenRef.current));
    setReady(true);
  }, []);

  useEffect(() => () => { requestRef.current?.abort(); requestRef.current = null; }, []);
  useEffect(() => { if (offer) successRef.current?.focus({ preventScroll: true }); }, [offer]);

  async function confirm() {
    if (!tokenRef.current || requestRef.current) return;
    const controller = new AbortController();
    requestRef.current = controller;
    setPending(true);
    setError(null);
    const timeout = window.setTimeout(() => controller.abort(), 25_000);
    try {
      const response = await fetch("/api/shield-family/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: tokenRef.current }), cache: "no-store", signal: controller.signal });
      const payload: unknown = await response.json().catch(() => null);
      const data = payload && typeof payload === "object" ? payload as { ok?: unknown; error?: unknown } : null;
      if (!response.ok || data?.ok !== true) throw new Error(typeof data?.error === "string" && data.error.trim() ? data.error : response.status === 429 ? "There have been several requests. Please wait a moment and try again." : "We couldn’t confirm your email. Please try again.");
      const verified = readOffer(payload);
      if (!verified) throw new Error("We couldn’t read the offer details. Please try confirming again or contact us for help.");
      if (requestRef.current === controller) {
        tokenRef.current = "";
        setOffer(verified);
      }
    } catch (problem) {
      if (requestRef.current !== controller) return;
      setError(controller.signal.aborted ? "Confirmation took too long. Please try again; your link is still here." : problem instanceof TypeError ? "We couldn’t connect. Check your connection and try again." : problem instanceof Error ? problem.message : "We couldn’t confirm your email. Please try again.");
    } finally {
      window.clearTimeout(timeout);
      if (requestRef.current === controller) { requestRef.current = null; setPending(false); }
    }
  }

  async function copyCode() {
    if (!offer) return;
    try { await navigator.clipboard.writeText(offer.code); setCopyStatus("Copied. Your code is ready to paste into Apple’s redemption screen."); }
    catch { setCopyStatus("Select the code above and copy it manually."); }
  }

  if (!ready) return <div className={styles.card}><p role="status">Opening your confirmation link…</p></div>;

  if (offer) {
    const expiry = expiryText(offer.expiresAt);
    return <section className={styles.card} aria-labelledby="shield-code-title">
      <span className={styles.successMark} aria-hidden="true"><Check /></span>
      <h2 id="shield-code-title" ref={successRef} tabIndex={-1}>Your code is ready.</h2>
      <p>Your email is confirmed. Keep your unique code and private link to yourself.</p>
      <p className={styles.emailNote}>We’re also sending a copy to your inbox.</p>
      <span className={styles.codeLabel} id="shield-code-label">Your Shield Family offer code</span>
      <div className={styles.codeRow}><code tabIndex={0} aria-labelledby="shield-code-label">{offer.code}</code><button type="button" onClick={copyCode} className={styles.copyButton}>Copy code</button></div>
      <p className={styles.copyStatus} role="status">{copyStatus}</p>
      {expiry && <p className={styles.expiry}>Redeem before {expiry}.</p>}
      <div className={styles.renewal}><strong>{RENEWAL[offer.plan].label}</strong><p>{RENEWAL[offer.plan].text}</p><p>Check the exact local price and renewal date Apple shows before confirming. Cancel in Apple Settings at least 24 hours before renewal to avoid the next charge.</p></div>
      <a href={offer.redeemUrl} className={`${styles.button} ${styles.redeemButton}`} referrerPolicy="no-referrer"><AppleIcon />Redeem with Apple</a>
      <p className={styles.assurance}><LockIcon /><span>Confirming your email and receiving this code do not start a subscription or charge you. Apple checks eligibility and asks you to confirm the offer.</span></p>
      <div className={styles.actionLinks}><Link href="/projects/shield-family/redeem" className={styles.quietLink}>How to enter a code manually</Link><Link href="/projects/shield-family" className={styles.quietLink}>Back to Shield Family</Link></div>
    </section>;
  }

  if (!hasToken) return <section className={styles.card} aria-labelledby="shield-missing-link-title"><h2 id="shield-missing-link-title">Open the link from your email.</h2><p>This page needs your private confirmation link. Open that link again, or request a fresh one from the offer page.</p><div className={styles.actionLinks}><Link href={OFFER} className={styles.button}>Return to the offer</Link><a href="mailto:info@sarpoli.com" className={styles.quietLink}>Ask for help</a></div></section>;

  return <section className={styles.card} aria-labelledby="shield-confirm-title">
    <h2 id="shield-confirm-title">Ready when you are.</h2>
    <p>Press the button to confirm this is your email and request your unique Shield Family offer code.</p>
    <p>Opening this link alone does not confirm your email or assign a code.</p>
    {error && <div className={styles.error} role="alert"><p>{error}</p><Link href={OFFER}>Need a fresh link? Return to the offer.</Link></div>}
    <button type="button" onClick={confirm} disabled={pending} aria-busy={pending} className={`${styles.button} ${styles.confirmButton}`}>{pending ? "Confirming your email…" : "Confirm my email"}</button>
    <p className={styles.assurance}><LockIcon /><span>Confirming here does not start a subscription or charge you. Apple shows the offer’s eligibility, price and renewal terms before you redeem.</span></p>
    <div className={styles.actionLinks}><Link href="/projects/shield-family/privacy" className={styles.quietLink}>How we use your email</Link><a href="mailto:info@sarpoli.com" className={styles.quietLink}>Need a hand?</a></div>
  </section>;
}

function LockIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="4.5" y="10" width="15" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14.5v2" /></svg>; }
