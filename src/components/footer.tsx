"use client";
import { portfolioCopy } from "@/lib/portfolio-copy";
import { localePath } from "@/lib/i18n";
import { useState } from "react";
import { useLocale } from "./locale-provider";
import { LanguageSwitch } from "./language-switch";
import Link from "next/link";
import { contact, contactEmail, linkedin } from "@/lib/projects";
import { Arrow, Envelope, MakerMark } from "./icons";
import styles from "./footer.module.css";

/** Many visitors use webmail, where an email link opens nothing; copying always works. */
function CopyEmail() {
  const t = portfolioCopy(useLocale());
  const [copied, setCopied] = useState(false);
  return <button type="button" className={styles.copy} aria-label={t("Copy email address")} onClick={async () => {
    try { await navigator.clipboard.writeText(contactEmail); setCopied(true); setTimeout(() => setCopied(false), 2200); } catch { /* The address stays visible to select. */ }
  }}><span aria-live="polite">{copied ? `${t("Copied")} ✓` : t("Copy")}</span></button>;
}

export function Footer() {
  const locale = useLocale();
  const t = portfolioCopy(locale);
  return <footer className="footer" id="contact">
    <div className="footer-intro">
      <span className="eyebrow"><span className="small-dot" />{t("GOOD THINGS START WITH A CONVERSATION")}</span>
      <h2 className={styles.heading}><a href={contact} className={styles.invitation}><span>{t("Your idea.")}<br /><em>{t("Let’s make it real.")}</em></span><span className={styles.arrow}><Envelope /><span>{t("Email me")}</span></span></a></h2>
      <div className={styles.details}><p className={styles.desktopCopy}>{t("An idea you can’t stop thinking about. Something we could make together. Or a project here you’d like to join. The door is always open.")}</p><p className={styles.mobileCopy}>{locale === "da" ? "Noget, du går og tænker på? Lad os tale om det." : "Something on your mind? Let’s talk."}</p><div className={styles.mailRow}><a href={contact} className="underlined-link"><Envelope width={16} height={16} /> {contactEmail}</a><CopyEmail /></div></div>
    </div>
    <div className={styles.contactPaths} aria-label={t("Ways to work together")}>
      <a href={`${contact}?subject=${encodeURIComponent(t("Let’s swap ideas"))}`}><span>{t("01 / SWAP IDEAS")}</span><h3>{t("Let’s swap ideas.")} <Envelope /></h3><p>{t("Something you keep coming back to? Tell me about it, and I’ll share what I’m exploring too.")}</p></a>
      <a href={`${contact}?subject=${encodeURIComponent(t("Let’s build something together"))}`}><span>{t("02 / BUILD TOGETHER")}</span><h3>{t("Let’s build together.")} <Envelope /></h3><p>{t("Different skills, the same itch to make things. Let’s see what we could create side by side.")}</p></a>
      <a href={`${contact}?subject=${encodeURIComponent(t("I’d love to work on one of your projects"))}`}><span>{t("03 / JOIN IN")}</span><h3>{t("Jump into a project.")} <Envelope /></h3><p>{t("One of these caught your eye? Tell me which one, and what you’d love to work on.")}</p></a>
    </div>
    <div className="footer-meta"><Link className="footer-brand" href={localePath("/", locale)} aria-label={t("daryanmade home")}><MakerMark width={22} height={22} />daryanmade.</Link><span>© {new Date().getFullYear()} Daryan Kamalifar</span><div><a href={linkedin} target="_blank" rel="noopener noreferrer">LinkedIn <Arrow diagonal width={12} height={12} /></a><a href="https://sarpoli.com" target="_blank" rel="noopener noreferrer">Sarpoli <Arrow diagonal width={12} height={12} /></a><LanguageSwitch locale={locale} /><Link href={localePath("/privacy", locale)}>{t("Privacy")}</Link><a href="#top">{t("Back to top ↑")}</a></div></div>
  </footer>;
}
