"use client";

import { useLocale } from "./locale-provider";
import { emailCopy } from "@/lib/email-copy";
import { stripLocale } from "@/lib/i18n";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { localizedAppUpdates, updateTopics, type UpdateApp } from "@/lib/app-updates";
import styles from "./app-updates.module.css";

export function AppUpdatesConfirmation({ app, action }: { app: UpdateApp; action: "verify" | "unsubscribe" }) {
  const locale = useLocale();
  const t = (text: string) => emailCopy(text, locale);
  const product = localizedAppUpdates(app, locale), unsubscribe = action === "unsubscribe";
  const captured = useRef(false), tokenRef = useRef("");
  const requestRef = useRef<AbortController | null>(null), successRef = useRef<HTMLHeadingElement>(null), errorRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false), [hasToken, setHasToken] = useState(false), [pending, setPending] = useState(false), [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (captured.current) return;
    captured.current = true;
    const token = new URLSearchParams(window.location.hash.slice(1)).get("token");
    if (token && token.length <= 300 && !/[\u0000-\u001f\u007f]/.test(token)) tokenRef.current = token;
    if (window.location.hash) window.history.replaceState(window.history.state, "", window.location.pathname + window.location.search);
    setHasToken(Boolean(tokenRef.current)); setReady(true);
  }, []);
  useEffect(() => {
    // Hand the private fragment only to an explicit same-page language navigation.
    // Keep it in memory; do not place signed links in browser storage or history state.
    const transfer = (event: Event) => {
      const detail = (event as CustomEvent<{ hash?: string }>).detail;
      if (detail && tokenRef.current && stripLocale(window.location.pathname) === `${stripLocale(product.base)}/${action}`) detail.hash = `#token=${encodeURIComponent(tokenRef.current)}`;
    };
    window.addEventListener("private-link-language-change", transfer);
    return () => window.removeEventListener("private-link-language-change", transfer);
  }, []);
  useEffect(() => () => { requestRef.current?.abort(); requestRef.current = null; }, []);
  useEffect(() => { if (done) successRef.current?.focus({ preventScroll: true }); }, [done]);
  useEffect(() => { if (error) errorRef.current?.focus({ preventScroll: true }); }, [error]);

  async function confirm() {
    if (!tokenRef.current || requestRef.current) return;
    const controller = new AbortController(); requestRef.current = controller;
    setPending(true); setError(null);
    const timeout = window.setTimeout(() => controller.abort(), 25_000);
    try {
      const response = await fetch(`/api/apps/${app}/${action}`, { method: "POST", headers: { "Content-Type": "application/json", "Accept-Language": locale }, body: JSON.stringify({ locale, token: tokenRef.current }), cache: "no-store", signal: controller.signal });
      const payload: unknown = await response.json().catch(() => null);
      const data = payload && typeof payload === "object" ? payload as { ok?: unknown; status?: unknown; error?: unknown } : null;
      if (!response.ok || data?.ok !== true || data.status !== (unsubscribe ? "unsubscribed" : "confirmed")) throw new Error(typeof data?.error === "string" ? t(data.error) : t("We couldn’t complete that request. Please try again."));
      if (requestRef.current === controller) { tokenRef.current = ""; setDone(true); }
    } catch (problem) {
      if (requestRef.current !== controller) return;
      setError(controller.signal.aborted ? t("That took too long. Please try again; your link is still here.") : problem instanceof TypeError ? t("We couldn’t connect. Check your connection and try again.") : problem instanceof Error ? problem.message : t("Please try again in a moment."));
    } finally {
      window.clearTimeout(timeout);
      if (requestRef.current === controller) { requestRef.current = null; setPending(false); }
    }
  }

  if (!ready) return <div className={styles.flowCard}><p role="status">{t("Opening your private link…")}</p></div>;
  if (done) return <section className={styles.flowCard} aria-labelledby="updates-success"><h2 id="updates-success" tabIndex={-1} ref={successRef}>{unsubscribe ? t("You’re unsubscribed.") : t("You’re on the list.")}</h2><p>{unsubscribe ? (locale === "da" ? `Du modtager ikke længere e-mailnyheder fra ${product.name}. Dine tilmeldinger hos andre apps og eventuelle anmodninger om Shield Family-tilbud ændres ikke.` : `You won’t receive email updates from ${product.name}. Your other app lists and any Shield Family offer request are unchanged.`) : (locale === "da" ? `Din e-mail er bekræftet til ${updateTopics(app, locale)} fra ${product.name}. Du kan afmelde dig via linket i enhver nyhedsmail.` : `Your email is confirmed for ${updateTopics(app)} from ${product.name}. You can unsubscribe using the link in any update.`)}</p><div className={styles.flowLinks}><Link href={product.home}>{locale === "da" ? "Tilbage til" : "Back to"} {product.name}</Link><Link href={`${product.base}/privacy`}>{t("Your email privacy")}</Link></div></section>;
  if (!hasToken) return <section className={styles.flowCard}><h2>{t("Open the link from your email.")}</h2><p>{locale === "da" ? `Denne side kræver dit private ${unsubscribe ? "afmeldingslink" : "bekræftelseslink"}. Åbn linket fra din e-mail igen${unsubscribe ? ", eller kontakt os for hjælp." : ", eller bestil et nyt nedenfor."}` : <>This page needs your private {unsubscribe ? "unsubscribe" : "confirmation"} link. Open the email link again{unsubscribe ? ", or contact us for help." : ", or request a fresh one below."}</>}</p><div className={styles.flowLinks}><Link href={`${product.home}#updates`}>{unsubscribe ? `${locale === "da" ? "Tilbage til" : "Back to"} ${product.name}` : t("Request a new link")}</Link><a href="mailto:info@sarpoli.com">{t("Get help")}</a></div></section>;
  return <section className={styles.flowCard} aria-labelledby="updates-action-title"><h2 id="updates-action-title">{unsubscribe ? (locale === "da" ? `Forlad ${product.name}-listen?` : `Leave the ${product.name} list?`) : t("One small step, then you’re in.")}</h2><p>{unsubscribe ? (locale === "da" ? `Tryk nedenfor for at stoppe e-mailnyheder fra ${product.name}. Det gælder kun denne apps nyhedsliste.` : `Press below to stop email updates from ${product.name}. This only changes this app’s mailing list.`) : (locale === "da" ? `Bekræft din e-mail for at modtage ${updateTopics(app, locale)} fra ${product.name}. Det opretter ikke en appkonto eller et betalt abonnement.` : `Confirm your email to receive ${updateTopics(app)} from ${product.name}. This does not create an app account or start a paid subscription.`)}</p><p>{t("Opening this link alone does not change your preferences.")}</p>{error && <div className={styles.errorSummary} role="alert" tabIndex={-1} ref={errorRef}>{error}</div>}<button className={styles.button} type="button" onClick={confirm} disabled={pending} aria-busy={pending}>{pending ? t("Saving your choice…") : unsubscribe ? t("Unsubscribe from this list") : t("Confirm my email")}<span aria-hidden="true">↗</span></button><div className={styles.flowLinks}>{!unsubscribe && <Link href={`${product.home}#updates`}>{t("Request a fresh link")}</Link>}<Link href={`${product.base}/privacy`}>{t("How we use your email")}</Link><a href="mailto:info@sarpoli.com">{t("Get help")}</a></div></section>;
}
