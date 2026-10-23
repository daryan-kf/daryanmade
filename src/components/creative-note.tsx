import type { Locale } from "@/lib/i18n";
import { MakerMark } from "./icons";
import styles from "./creative-note.module.css";

export function CreativeNote({ place, locale }: { place: "about" | "closing"; locale: Locale }) {
  const da = locale === "da";
  const lines = place === "about"
    ? da ? ["Nysgerrig af natur.", "Jeg lærer ved at bygge."] : ["My head asks questions.", "My hands build the answers."]
    : da ? ["En idé i baghovedet?", "Lad os give den liv."] : ["Your next ‘what if’", "could start right here."];
  return <aside className={styles.note} data-creative-note data-note-place={place} aria-label={lines.join(" ")}>
    <div className={styles.label} aria-hidden="true"><MakerMark width={20} height={20} /><span>{place === "about" ? da ? "SÅDAN ER JEG SKRUET SAMMEN" : "A LITTLE FROM THE INSIDE" : da ? "EN TANKE TIL" : "ONE MORE THOUGHT"}</span></div>
    <p aria-hidden="true">{lines.map((line, index) => <span className={styles.line} key={line}><span data-creative-line>{index ? <em>{line}</em> : line}</span></span>)}</p>
    <svg className={styles.thread} viewBox="0 0 420 35" fill="none" aria-hidden="true"><path data-creative-thread pathLength="1" d="M2 23C65 23 94 8 141 12S225 32 255 21 271 1 253 8 245 32 296 23 356 16 418 21" /></svg>
  </aside>;
}
