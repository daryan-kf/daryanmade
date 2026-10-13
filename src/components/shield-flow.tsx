import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./shield-flow.module.css";

export const SHIELD_HOME = "/projects/shield-family";
export const SHIELD_APP_STORE = "https://apps.apple.com/app/shield-family-parents-control/id6782042659";

export function ShieldFlowShell({ eyebrow, title, intro, children, article = false }: {
  eyebrow: string;
  title: ReactNode;
  intro: string;
  children: ReactNode;
  article?: boolean;
}) {
  return <div className={styles.site}>
    <header className={styles.header}>
      <Link href={SHIELD_HOME} className={styles.brand} aria-label="Shield Family home"><Image src="/images/shield-site/icon.webp" alt="" width={38} height={38} /><span>shield<span> family</span></span></Link>
      <Link href="/" className={styles.makerLink}>← daryanmade</Link>
    </header>
    <main id="main-content" className={`${styles.main} ${article ? styles.articleMain : ""}`}>
      <div className={styles.pageHeading}><p className={styles.eyebrow}>{eyebrow}</p><h1>{title}</h1><p className={styles.intro}>{intro}</p></div>
      {children}
    </main>
    <footer className={styles.footer}>
      <p>An independent project by Daryan Kamalifar.</p>
      <nav aria-label="Shield Family help"><Link href={SHIELD_HOME}>Shield Family</Link><Link href={`${SHIELD_HOME}/privacy`}>Offer privacy</Link><Link href={`${SHIELD_HOME}/redeem`}>Redemption help</Link><a href="https://daryan-kf.github.io/kidshield-legal/privacy.html">App privacy</a><a href="mailto:info@sarpoli.com">Contact</a></nav>
    </footer>
  </div>;
}
