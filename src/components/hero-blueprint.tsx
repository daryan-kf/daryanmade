import type { Locale } from "@/lib/i18n";
import styles from "./hero-blueprint.module.css";

/** One construction line: the thought underneath the finished maker’s mark. */
export function HeroBlueprint({ locale = "en" }: { locale?: Locale }) {
  return <div className={styles.blueprint} data-home-blueprint aria-hidden="true">
    <svg viewBox="0 0 600 600" fill="none" className={styles.drawing}>
      <path d="M94 424C150 440 170 399 213 336S317 162 397 167C455 171 478 226 467 274" className={styles.construction} data-home-drawing />
      <path d="M94 424L74 459H39" className={styles.annotation} data-home-drawing />
      <circle cx="94" cy="424" r="3" className={styles.point} />
    </svg>
    <span className={styles.note} data-home-note>{locale === "da" ? "Fra den første tanke" : "From the first thought"}<br /><em>{locale === "da" ? "til den sidste detalje." : "to the last detail."}</em></span>
  </div>;
}
