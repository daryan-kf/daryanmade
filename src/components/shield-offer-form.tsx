"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import styles from "./shield-offer-form.module.css";

type Plan = "annual" | "quarterly" | "monthly";
const plans: { id: Plan; name: string; renewal: string }[] = [
  { id: "annual", name: "Yearly", renewal: "Renews for a full year" },
  { id: "quarterly", name: "Every 3 months", renewal: "Renews every three months" },
  { id: "monthly", name: "Monthly", renewal: "Renews monthly" },
];

function emailProblem(value: string) {
  if (!value.trim()) return "Enter your email address so we can send your confirmation link.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return "Use a complete email address, such as you@example.com.";
  return null;
}

export function ShieldOfferForm() {
  const id = useId();
  const emailId = `${id}-email`;
  const termsId = `${id}-terms`;
  const emailRef = useRef<HTMLInputElement>(null);
  const termsRef = useRef<HTMLInputElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<AbortController | null>(null);
  const [plan, setPlan] = useState<Plan>("annual");
  const [email, setEmail] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [termsError, setTermsError] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [confirmedRequest, setConfirmedRequest] = useState<string | null>(null);

  useEffect(() => () => {
    requestRef.current?.abort();
    requestRef.current = null;
  }, []);

  useEffect(() => {
    if (showSummary || serverError) summaryRef.current?.focus();
  }, [showSummary, serverError]);

  useEffect(() => {
    if (confirmedRequest) successRef.current?.focus();
  }, [confirmedRequest]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (requestRef.current) return;

    const currentEmailError = emailProblem(email);
    const currentTermsError = termsAccepted ? null : "Accept the offer details before requesting your confirmation link.";
    setEmailError(currentEmailError);
    setTermsError(currentTermsError);
    setServerError(null);
    if (currentEmailError || currentTermsError) {
      setShowSummary(true);
      // This also returns focus to the summary after a second unsuccessful attempt.
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }

    const website = String(new FormData(event.currentTarget).get("website") || "");
    const submittedEmail = email.trim();
    const controller = new AbortController();
    requestRef.current = controller;
    setShowSummary(false);
    setPending(true);
    const timeout = window.setTimeout(() => controller.abort(), 25_000);

    try {
      const response = await fetch("/api/shield-family/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: submittedEmail, plan, website, termsAccepted: true }),
        signal: controller.signal,
      });
      const result: unknown = await response.json().catch(() => null);
      const payload = result && typeof result === "object" ? result as { ok?: unknown; error?: unknown } : null;
      if (!response.ok || payload?.ok !== true) {
        const fallback = response.status === 429
          ? "There have been several requests. Please wait a little before trying again."
          : response.status === 503
            ? "Email confirmation is temporarily unavailable. Your details are still here; please try again shortly."
            : "We couldn’t complete your request. Please try again.";
        throw new Error(typeof payload?.error === "string" && payload.error.trim() ? payload.error : fallback);
      }
      if (requestRef.current === controller) setConfirmedRequest(submittedEmail);
    } catch (error) {
      if (requestRef.current !== controller) return;
      setServerError(controller.signal.aborted
        ? "The request took too long. Your details are still here; please try again."
        : error instanceof TypeError
          ? "We couldn’t connect. Check your connection and try again; your details are still here."
          : error instanceof Error ? error.message : "We couldn’t complete your request. Please try again.");
    } finally {
      window.clearTimeout(timeout);
      if (requestRef.current === controller) {
        requestRef.current = null;
        setPending(false);
      }
    }
  }

  if (confirmedRequest) {
    return <div className={`${styles.card} ${styles.success}`} ref={successRef} tabIndex={-1} role="status" aria-labelledby={`${id}-success-title`}>
      <span className={styles.successMark} aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="m5 12 4 4L19 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
      <p className={styles.kicker}>One small step left</p>
      <h3 id={`${id}-success-title`}>Check your inbox.</h3>
      <p className={styles.successLead}>We’ve requested a confirmation link for <strong>{confirmedRequest}</strong>. Confirm your address to receive your code.</p>
      <p className={styles.successNote}>Look in your spam or junk folder if you don’t see it. Requesting a code doesn’t start a subscription.</p>
      <a className={styles.successLink} href="#download">Take a look at the app <span aria-hidden="true">↓</span></a>
    </div>;
  }

  return <form className={styles.card} onSubmit={submit} noValidate aria-labelledby={`${id}-title`} aria-busy={pending}>
    <h3 id={`${id}-title`}>A little more family time.</h3>
    <p className={styles.lead}>Choose a plan and confirm your email to get your free code.</p>

    {(showSummary || serverError) && <div ref={summaryRef} className={styles.errorSummary} tabIndex={-1} role="alert">
      {serverError ? <p>{serverError}</p> : <><p>Please check these details:</p><ul>
        {emailError && <li><a href={`#${emailId}`} onClick={(event) => { event.preventDefault(); emailRef.current?.focus(); }}>Your email address</a></li>}
        {termsError && <li><a href={`#${termsId}`} onClick={(event) => { event.preventDefault(); termsRef.current?.focus(); }}>The offer details</a></li>}
      </ul></>}
    </div>}

    <fieldset className={styles.fields} disabled={pending}>
      <legend className={styles.visuallyHidden}>Request your Shield Family offer</legend>
      <fieldset className={styles.planFieldset}>
        <legend>Your plan after the free months</legend>
        <div className={styles.planOptions}>{plans.map((option) => <label key={option.id} className={styles.planOption} data-selected={plan === option.id || undefined}>
          <input type="radio" name="plan" value={option.id} checked={plan === option.id} onChange={() => { setPlan(option.id); setServerError(null); }} />
          <span className={styles.planName}>{option.name}<i aria-hidden="true" /></span>
          <strong>3 months free</strong>
          <span className={styles.renewal}>{option.renewal}</span>
        </label>)}</div>
        <p className={styles.planHelp}>Apple shows your local price and renewal date before you confirm.</p>
      </fieldset>

      <div className={styles.emailField}>
        <label htmlFor={emailId}>Your email address</label>
        <p id={`${emailId}-help`} className={styles.fieldHelp}>We’ll send a confirmation link, then your free code.</p>
        <input
          ref={emailRef}
          id={emailId}
          className={styles.emailInput}
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          maxLength={254}
          required
          placeholder="you@example.com"
          value={email}
          aria-invalid={!!emailError}
          aria-describedby={`${emailId}-help${emailError ? ` ${emailId}-error` : ""}`}
          onBlur={() => setEmailError(emailProblem(email))}
          onChange={(event) => { setEmail(event.target.value); setEmailError(null); setShowSummary(false); setServerError(null); }}
        />
        {emailError && <p id={`${emailId}-error`} className={styles.fieldError}>{emailError}</p>}
      </div>

      <div className={styles.honeypot} aria-hidden="true" inert>
        <label htmlFor={`${id}-website`}>Website</label>
        <input id={`${id}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>

      <div className={styles.consent}>
        <label className={styles.checkLabel} htmlFor={termsId}>
          <input ref={termsRef} id={termsId} name="termsAccepted" type="checkbox" required checked={termsAccepted} aria-invalid={!!termsError} aria-describedby={`${id}-offer-details${termsError ? ` ${termsId}-error` : ""}`} onChange={(event) => { setTermsAccepted(event.target.checked); setTermsError(null); setShowSummary(false); setServerError(null); }} />
          <span>I accept the offer details below and agree to receive my confirmation link and code by email.</span>
        </label>
        {termsError && <p id={`${termsId}-error`} className={styles.fieldError}>{termsError}</p>}
      </div>

      <button type="submit" className={styles.submit} disabled={pending}>
        <span>{pending ? "Requesting your link…" : serverError ? "Try again" : "Send my confirmation link"}</span>
        {pending ? <span className={styles.spinner} aria-hidden="true" /> : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>}
      </button>
    </fieldset>

    <p className={styles.privacyHelp}>Only emails about this offer. Read how we use your details in our <a href="/projects/shield-family/privacy">privacy notice</a>.</p>
    <p id={`${id}-offer-details`} className={styles.offerDetails}>For eligible new subscribers, while the first 500 places last. A valid code gives three calendar months free. After that, your chosen plan renews automatically at the local price: a full year for Yearly, every three months for the 3-month plan, or monthly. Apple confirms eligibility, price and renewal date before you subscribe. Cancel in Apple Settings at least 24 hours before renewal. Requesting a code does not start a subscription.</p>
    <p className={styles.liveStatus} role="status" aria-live="polite">{pending ? "Requesting your confirmation link. Please wait." : ""}</p>
  </form>;
}
