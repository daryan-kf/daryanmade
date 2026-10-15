"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { localePath, type Locale } from "@/lib/i18n";
import { useLocale, useLanguageNavigation } from "./locale-provider";
import styles from "./language-switch.module.css";

export function LanguageSwitch({ locale: supplied }: { locale?: Locale }) {
  const context = useLocale(), locale = supplied ?? context;
  const pathname = usePathname(), { pending, change } = useLanguageNavigation();
  return <nav className={styles.switch} data-language-switch data-active={pending ?? locale} aria-busy={Boolean(pending)} aria-label={locale === "da" ? "Vælg sprog" : "Choose language"}>
    <span className={styles.thumb} aria-hidden="true" />
    {(["en", "da"] as const).map(language => <Link key={language} href={localePath(pathname, language)} lang={language} hrefLang={language} aria-label={language === "en" ? "English" : "Dansk"} aria-current={locale === language ? "page" : undefined} scroll={false} onClick={event => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
      event.preventDefault(); change(language);
    }}>{language === "en" ? "EN" : "DA"}</Link>)}
  </nav>;
}
