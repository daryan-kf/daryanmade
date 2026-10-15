"use client";

import { useLocale } from "./locale-provider";
import { emailCopy } from "@/lib/email-copy";

import { useEffect, useId, useRef, useState, type CSSProperties, type FormEvent } from "react";
import { localizedAppUpdates, updateConsent, type UpdateApp } from "@/lib/app-updates";
import styles from "./app-updates.module.css";

export function AppUpdatesForm({ app, id = "updates", variant = "default" }: { app: UpdateApp; id?: string; variant?: "default" | "compact" }) {
  const locale = useLocale();
  const t = (text: string) => emailCopy(text, locale);
  const product = localizedAppUpdates(app, locale), fieldId = useId();
  const compact = variant === "compact";
  const formName = `${product.name} ${locale === "da" ? "e-mailnyheder" : "email updates"}${id === "updates" ? "" : ` (${id.replace(/[-_]+/g, " ")})`}`;
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [consentError, setConsentError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [summary, setSummary] = useState(false);
  const [pending, setPending] = useState(false);
  const [complete, setComplete] = useState(false);
  const errorRef = useRef<HTMLDivElement>(null), successRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<AbortController | null>(null);
  useEffect(() => () => { requestRef.current?.abort(); requestRef.current = null; }, []);
  useEffect(() => { if (summary || serverError) errorRef.current?.focus({ preventScroll: true }); }, [summary, serverError]);
  useEffect(() => { if (complete) successRef.current?.focus({ preventScroll: true }); }, [complete]);
  const validateEmail = (value: string) => value.trim().length <= 254 && /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(value.trim()) ? null : t("Enter a complete email address, like you@example.com.");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (requestRef.current) return;
    const emailProblem = validateEmail(email), consentProblem = consent ? null : locale === "da" ? `Vælg at modtage nyheder fra ${product.name}, før du tilmelder dig.` : `Choose to receive ${product.name} updates before joining.`;
    setEmailError(emailProblem); setConsentError(consentProblem); setServerError(null);
    if (emailProblem || consentProblem) { setSummary(true); errorRef.current?.focus(); return; }
    setSummary(false); setPending(true);
    const controller = new AbortController(); requestRef.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), 25_000);
    try {
      const response = await fetch(`/api/apps/${app}/signup`, { method: "POST", headers: { "Content-Type": "application/json", "Accept-Language": locale }, body: JSON.stringify({ locale, email: email.trim(), consentAccepted: true, website }), signal: controller.signal });
      const payload: unknown = await response.json().catch(() => null);
      const data = payload && typeof payload === "object" ? payload as { ok?: unknown; error?: unknown } : null;
      if (!response.ok || data?.ok !== true) throw new Error(typeof data?.error === "string" ? t(data.error) : t("We couldn’t request your confirmation email. Please try again."));
      if (requestRef.current === controller) setComplete(true);
    } catch (problem) {
      if (requestRef.current !== controller) return;
      setServerError(controller.signal.aborted ? t("That took a little too long. Please try again; your details are still here.") : problem instanceof TypeError ? t("We couldn’t connect. Check your connection and try again.") : problem instanceof Error ? problem.message : t("Please try again in a moment."));
    } finally {
      window.clearTimeout(timeout);
      if (requestRef.current === controller) { requestRef.current = null; setPending(false); }
    }
  }

  return <section id={id} className={`${styles.signup}${compact ? ` ${styles.compact}` : ""}`} aria-labelledby={`${fieldId}-title`} style={{ "--updates-default-accent": product.accent, "--updates-default-paper": product.paper, "--updates-default-ink": product.ink } as CSSProperties} data-updates-app={app}>
    <div className={styles.intro}>
      {!compact && <span className={styles.eyebrow}>{product.name} / {locale === "da" ? "Hold kontakten" : "Keep in touch"}</span>}
      <h2 id={`${fieldId}-title`}>{product.heading}</h2>
      <p>{product.description}</p>
      {!compact && <span className={styles.promise}>{t("One app. Its own mailing list. Always your choice.")}</span>}
    </div>
    {complete ? <div className={styles.success} ref={successRef} role="status" tabIndex={-1}>
      <span className={styles.successMark} aria-hidden="true">✓</span><h3>{t("Check your inbox.")}</h3>
      <p>{locale === "da" ? <>Hvis <strong>{email.trim()}</strong> skal bekræftes, sender vi et link. Åbn det, og bekræft for at tilmelde dig {product.name}. Allerede bekræftet? Så er alt klar.</> : <>If <strong>{email.trim()}</strong> needs confirmation, we’ll send a link. Open it and confirm to join the {product.name} list. Already confirmed? You’re all set.</>}</p>
      <p className={styles.small}>{t("Check your spam folder too. You can ignore the email if you change your mind.")}</p>
    </div> : <form onSubmit={submit} className={styles.form} noValidate aria-label={formName} aria-busy={pending}>
      {(summary || serverError) && <div className={styles.errorSummary} role="alert" tabIndex={-1} ref={errorRef}>
        {serverError ? <p>{serverError}</p> : <><p>{t("Please check these details.")}</p><ul>{emailError && <li><a href={`#${fieldId}-email`}>{emailError}</a></li>}{consentError && <li><a href={`#${fieldId}-consent`}>{consentError}</a></li>}</ul></>}
      </div>}
      <label className={styles.label} htmlFor={`${fieldId}-email`}>{t("Your email address")}</label>
      <input className={styles.email} id={`${fieldId}-email`} name="email" type="email" autoComplete="email" inputMode="email" maxLength={254} required placeholder={locale === "da" ? "dig@eksempel.dk" : "you@example.com"} value={email} disabled={pending} aria-invalid={!!emailError} aria-describedby={emailError ? `${fieldId}-email-error` : undefined} onBlur={() => { if (email.trim()) setEmailError(validateEmail(email)); }} onChange={event => { setEmail(event.target.value); setEmailError(null); setSummary(false); setServerError(null); }} />
      {emailError && <p className={styles.error} id={`${fieldId}-email-error`}>{emailError}</p>}
      <div className={styles.trap} aria-hidden="true"><label htmlFor={`${fieldId}-website`}>{t("Website")}</label><input id={`${fieldId}-website`} name="website" tabIndex={-1} autoComplete="off" value={website} onChange={event => setWebsite(event.target.value)} /></div>
      <label className={styles.consent} htmlFor={`${fieldId}-consent`}><input id={`${fieldId}-consent`} name="consentAccepted" type="checkbox" required checked={consent} disabled={pending} aria-invalid={!!consentError} aria-describedby={consentError ? `${fieldId}-consent-error` : undefined} onChange={event => { setConsent(event.target.checked); setConsentError(null); setSummary(false); setServerError(null); }} /><span>{updateConsent(app, locale)}</span></label>
      {consentError && <p className={styles.error} id={`${fieldId}-consent-error`}>{consentError}</p>}
      <button type="submit" disabled={pending} className={styles.button}>{pending ? t("Requesting your link…") : serverError ? t("Try again") : t("Keep me in the loop")}<span data-link-arrow="diagonal" aria-hidden="true">↗</span></button>
      <p className={styles.small}>{locale === "da" ? "Vi beder dig bekræfte din e-mail. " : "We’ll ask you to confirm your email. "}<a href={`${product.base}/privacy`}>{t("How we use your details")}</a>.{app === "shield-family" && (locale === "da" ? " Denne liste er adskilt fra tilbuddet om gratis måneder." : " This list is separate from the free-months offer.")}</p>
    </form>}
  </section>;
}
