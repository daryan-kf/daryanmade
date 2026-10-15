import type { Locale } from "@/lib/i18n";
import styles from "./hero-blueprint.module.css";

/** The drafting lines keep the sculpture connected to the idea taking shape. */
export function HeroBlueprint({ locale = "en" }: { locale?: Locale }) {
  return <div className={styles.blueprint} data-home-blueprint aria-hidden="true">
    <div className={styles.wash} />
    <svg viewBox="0 0 600 600" fill="none" className={styles.drawing}>
      <g data-home-orbit="outer">
        <ellipse cx="300" cy="300" rx="299" ry="218" transform="rotate(-32 300 300)" className={styles.orbit} data-home-drawing />
        <circle cx="46" cy="459" r="3" className={styles.orbitPoint} />
      </g>
      <g data-home-orbit="inner">
        <ellipse cx="300" cy="300" rx="274" ry="232" transform="rotate(36 300 300)" className={styles.orbitInner} data-home-drawing />
        <path d="M511 447h12m-6-6v12" className={styles.tick} />
      </g>
      <path d="M94 424C150 440 170 399 213 336S317 162 397 167C455 171 478 226 467 274" className={styles.construction} data-home-drawing />
      <path d="M94 424L74 459H39" className={styles.annotation} data-home-drawing />
      <circle cx="94" cy="424" r="3" className={styles.point} />
    </svg>
    <span className={styles.caption} data-home-note><i />{locale === "da" ? "IDEER TAGER FORM" : "IDEAS TAKE SHAPE"}</span>
    <span className={styles.note} data-home-note>{locale === "da" ? "Fra den første tanke" : "From the first thought"}<br /><em>{locale === "da" ? "til den sidste detalje." : "to the last detail."}</em></span>
  </div>;
}
