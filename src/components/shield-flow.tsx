import { localePath, type Locale } from "@/lib/i18n";
import { LanguageSwitch } from "./language-switch";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./shield-flow.module.css";

export const SHIELD_HOME = "/projects/shield-family";
export const SHIELD_APP_STORE = "https://apps.apple.com/app/shield-family-parents-control/id6782042659";

export function ShieldFlowShell({ eyebrow, title, intro, children, article = false, locale = "en" }: {
  eyebrow: string;
  title: ReactNode;
  intro: string;
  children: ReactNode;
  article?: boolean;
  locale?: Locale;
}) {
  const t = (en: string, da: string) => locale === "da" ? da : en;
  return <div className={styles.site}>
    <header className={styles.header}>
      <Link href={localePath(SHIELD_HOME, locale)} className={styles.brand} aria-label={t("Shield Family home", "Shield Family forside")}><Image src="/images/shield-site/icon.webp" alt="" width={38} height={38} /><span>shield<span> family</span></span></Link>
      <LanguageSwitch locale={locale} />
      <Link href={localePath("/", locale)} className={styles.makerLink}>← daryanmade</Link>
    </header>
    <main id="main-content" className={`${styles.main} ${article ? styles.articleMain : ""}`}>
      <div className={styles.pageHeading}><p className={styles.eyebrow}>{eyebrow}</p><h1>{title}</h1><p className={styles.intro}>{intro}</p></div>
      {children}
    </main>
    <footer className={styles.footer}>
      <p>{t("An independent project by Daryan Kamalifar.", "Et uafhængigt projekt af Daryan Kamalifar.")}</p>
      <nav aria-label={t("Shield Family help", "Hjælp til Shield Family")}><Link href={localePath(SHIELD_HOME, locale)}>Shield Family</Link><Link href={localePath(`${SHIELD_HOME}/privacy`, locale)}>{t("Offer privacy", "Privatliv for tilbuddet")}</Link><Link href={localePath(`${SHIELD_HOME}/redeem`, locale)}>{t("Redemption help", "Hjælp til indløsning")}</Link><a href="https://daryan-kf.github.io/kidshield-legal/privacy.html">{t("App privacy", "Appens privatlivspolitik")}</a><a href="mailto:info@sarpoli.com">{t("Contact", "Kontakt")}</a></nav>
    </footer>
  </div>;
}
