"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "./locale-provider";
import { Arrow } from "./icons";
import styles from "./hero-idea-note.module.css";

const ideas = [
  { name: "Vela", slug: "vela", en: "What if a thought could plan your day?", da: "Hvad hvis en tanke kunne planlægge din dag?" },
  { name: "Twillby", slug: "wardrobe", en: "What if your next outfit was already yours?", da: "Hvad hvis dit næste outfit allerede var dit?" },
  { name: "Sarpoli", slug: "sarpoli", en: "What if paperwork gave people their time back?", da: "Hvad hvis papirarbejdet gav mennesker tiden tilbage?" },
];

/** Three small questions connect the abstract sculpture to actual things made. */
export function HeroIdeaNote() {
  const da = useLocale() === "da";
  const [active, setActive] = useState(0);
  const question = useRef<HTMLDivElement>(null);
  const animation = useRef<Animation | null>(null);
  useEffect(() => {
    const stop = () => animation.current?.cancel();
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    window.addEventListener("maker-motion-change", stop);
    reduced.addEventListener("change", stop);
    return () => { stop(); window.removeEventListener("maker-motion-change", stop); reduced.removeEventListener("change", stop); };
  }, []);
  const idea = ideas[active];
  function select(index: number) {
    if (index === active) return;
    setActive(index);
    window.dispatchEvent(new CustomEvent("studio-feedback", { detail: { kind: "navigate", note: index + 1 } }));
    animation.current?.cancel();
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.makerMotion === "paused") return;
    animation.current = question.current?.animate([
      { opacity: .25, transform: "translateY(7px)" },
      { opacity: 1, transform: "translateY(0)" },
    ], { duration: 450, easing: "cubic-bezier(.23,1,.32,1)" }) ?? null;
  }
  return <aside className={styles.note} data-home-note aria-label={da ? "Idéerne, der startede det hele" : "The ideas that started it all"}>
    <div className={styles.top}><span>{da ? "ALT BEGYNDER MED ET HVAD HVIS." : "EVERYTHING STARTS WITH A WHAT IF."}</span><div className={styles.choices} role="group" aria-label={da ? "Vælg en tanke" : "Choose a thought"}>{ideas.map((item, index) => <button type="button" data-idea-choice key={item.slug} aria-label={da ? `Tanken bag ${item.name}` : `The thought behind ${item.name}`} aria-pressed={active === index} onClick={() => select(index)}>{String(index + 1).padStart(2, "0")}</button>)}</div></div>
    <div ref={question} className={styles.thought} aria-live="polite"><p>{da ? idea.da : idea.en}</p><a href={`#project-${idea.slug}`}>{da ? `Det blev til ${idea.name}` : `That became ${idea.name}`}<Arrow diagonal width={13} height={13} /></a></div>
  </aside>;
}
