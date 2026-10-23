"use client";
import { portfolioCopy } from "@/lib/portfolio-copy";
import { localePath } from "@/lib/i18n";
import { useLocale } from "./locale-provider";
import { LanguageSwitch } from "./language-switch";
import Link from "next/link";
import { contact, contactEmail, linkedin } from "@/lib/projects";
import { Arrow, MakerMark } from "./icons";
import styles from "./footer.module.css";

export function Footer() {
  const locale = useLocale();
  const t = portfolioCopy(locale);
  return <footer className="footer" id="contact">
    <div className="footer-intro" data-reveal>
      <span className="eyebrow" data-reveal-item><span className="small-dot" />{t("GOOD THINGS START WITH A CONVERSATION")}</span>
      <h2 className={styles.heading} data-reveal-item><a href={contact} className={styles.invitation}><span>{t("Your idea.")}<br /><em>{t("Let’s make it real.")}</em></span><span className={styles.arrow}><Arrow diagonal /></span></a></h2>
      <div className={styles.details} data-reveal-item><p className={styles.desktopCopy}>{t("A business idea you want built. Something we could create together. Or a project here you’d love to be part of. There’s an open invitation to reach out.")}</p><p className={styles.mobileCopy}>{locale === "da" ? "Har du noget i tankerne? Lad os tage en snak." : "Have something in mind? Tell me about it."}</p><a href={contact} className="underlined-link">{contactEmail} <Arrow diagonal width={15} height={15} /></a></div>
    </div>
    <div className={styles.contactPaths} aria-label={t("Ways to work together")}>
      <a data-reveal href={`${contact}?subject=${encodeURIComponent(t("I have an idea to build"))}`}><span>{t("01 / BRING AN IDEA")}</span><h3>{t("Build it for me.")} <Arrow diagonal /></h3><p>{t("You have an idea for an app, website or business tool. Let’s find a way to bring it to life.")}</p></a>
      <a data-reveal href={`${contact}?subject=${encodeURIComponent(t("Let’s build something together"))}`}><span>{t("02 / FIND A COLLABORATOR")}</span><h3>{t("Build it with me.")} <Arrow diagonal /></h3><p>{t("A shared idea, complementary skills, or a problem worth solving. Let’s explore it together.")}</p></a>
      <a data-reveal href={`${contact}?subject=${encodeURIComponent(t("I’d love to work on one of your projects"))}`}><span>{t("03 / JOIN THE WORK")}</span><h3>{t("Be part of a project.")} <Arrow diagonal /></h3><p>{t("Something here caught your attention? Tell me which project, and what you’d like to bring.")}</p></a>
    </div>
    <div className="footer-meta" data-reveal><Link className="footer-brand" href={localePath("/", locale)} aria-label={t("daryanmade home")}><MakerMark width={22} height={22} />daryanmade.</Link><span>© {new Date().getFullYear()} Daryan Kamalifar</span><div><a href={linkedin} target="_blank" rel="noopener noreferrer">LinkedIn <Arrow diagonal width={12} height={12} /></a><a href="https://sarpoli.com" target="_blank" rel="noopener noreferrer">Sarpoli <Arrow diagonal width={12} height={12} /></a><LanguageSwitch locale={locale} /><Link href={localePath("/privacy", locale)}>{t("Privacy")}</Link><a href="#top">{t("Back to top ↑")}</a></div></div>
  </footer>;
}
