"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { useLocale } from "./locale-provider";

type Collection = { count: number; labels: string[]; caption: string };
const collections: Record<string, Collection> = {
  "shield-family": { count: 4, labels: ["Family overview", "Child profile", "Learning activities", "Screen-time plan"], caption: "Development preview · Real device captures using a demo family. The App Store version may differ." },
  kaizencv: { count: 3, labels: ["Nova résumé template", "Flux résumé template", "Résumé template"], caption: "Real résumé designs from KaizenCV · Demonstration content." },
  iqra: { count: 3, labels: ["Quran reader", "Prayer learning", "Memorisation"], caption: "Product interface preview · Features and design may vary by app version." },
  vela: { count: 3, labels: ["Daily overview", "Focus experience", "Voice tools"], caption: "Product interface preview · Features and design may vary by app version." },
  wardrobe: { count: 2, labels: ["Personal style concept", "Wardrobe inspiration"], caption: "Concept imagery · These visuals illustrate the creative direction, rather than the finished app." }
};
const danishCollections: Record<string, Collection> = {
  "shield-family": { count: 4, labels: ["Familieoverblik", "Barneprofil", "Læringsaktiviteter", "Skærmtidsplan"], caption: "Forhåndsvisning under udvikling · Faktiske skærmbilleder fra en enhed med en demofamilie. App Store-versionen kan afvige." },
  kaizencv: { count: 3, labels: ["Nova CV-skabelon", "Flux CV-skabelon", "CV-skabelon"], caption: "Faktiske CV-design fra KaizenCV · Demonstrationsindhold." },
  iqra: { count: 3, labels: ["Koranlæser", "Lær at bede", "Memorering"], caption: "Forhåndsvisning af brugerfladen · Funktioner og design kan variere mellem appversioner." },
  vela: { count: 3, labels: ["Dagsoverblik", "Fokusoplevelse", "Stemmeværktøjer"], caption: "Forhåndsvisning af brugerfladen · Funktioner og design kan variere mellem appversioner." },
  wardrobe: { count: 2, labels: ["Koncept for personlig stil", "Garderobeinspiration"], caption: "Konceptbilleder · Billederne viser den kreative retning frem for den færdige app." }
};

export function ScreenshotGallery({ slug, name, locale: explicitLocale }: { slug: string; name: string; locale?: Locale }) {
  const contextLocale = useLocale();
  const locale = explicitLocale ?? contextLocale;
  const t = (en: string, da: string) => locale === "da" ? da : en;
  const collection = (locale === "da" ? danishCollections : collections)[slug];
  const dialog = useRef<HTMLDialogElement>(null);
  const [selected, setSelected] = useState(0);
  if (!collection) return null;
  const source = (index: number) => `/images/${slug}/screen-${index + 1}.webp`;
  return <section className="screenshot-section" aria-labelledby="screens-title"><div className="detail-section-label"><span className="eyebrow">{t("A CLOSER LOOK", "SE NÆRMERE")}</span><h2 id="screens-title">{t("In the", "Nede i")} <em>{t("details.", "detaljerne.")}</em></h2><span>{t("Click a preview to explore", "Vælg et billede for at se mere")}</span></div><div className={`screenshot-track ${slug === "kaizencv" || slug === "wardrobe" ? "paper-track" : ""}`}>{Array.from({ length: collection.count }, (_, index) => <button className="screenshot-button" key={index} onClick={() => { setSelected(index); dialog.current?.showModal(); }} aria-label={t(`Enlarge ${name}: ${collection.labels[index]}`, `Forstør ${name}: ${collection.labels[index]}`)}><Image src={source(index)} width={1000} height={slug === "kaizencv" ? 1415 : slug === "wardrobe" ? 1500 : 2167} sizes="(max-width: 600px) 60vw, 260px" alt={`${name}: ${collection.labels[index]}`} /><span>{String(index + 1).padStart(2, "0")} / {collection.labels[index]} <span data-link-arrow="diagonal" aria-hidden="true">↗</span></span></button>)}</div><p className="image-disclosure">{collection.caption}</p><dialog className="image-dialog" ref={dialog} onClick={(event) => { if (event.target === event.currentTarget) dialog.current?.close(); }} aria-label={t(`${name} enlarged preview`, `${name}: forstørret forhåndsvisning`)}><div className="image-dialog-toolbar"><span>{collection.labels[selected]}</span><button onClick={() => dialog.current?.close()} aria-label={t("Close enlarged preview", "Luk forstørret forhåndsvisning")}>{t("Close ×", "Luk ×")}</button></div><Image className="enlarged-preview" src={source(selected)} width={1000} height={slug === "kaizencv" ? 1415 : slug === "wardrobe" ? 1500 : 2167} sizes="90vw" alt={`${name}: ${collection.labels[selected]}`} /><div className="image-dialog-controls"><button disabled={selected === 0} onClick={() => setSelected(selected - 1)}>{t("← Previous", "← Forrige")}</button><span>{selected + 1} / {collection.count}</span><button disabled={selected === collection.count - 1} onClick={() => setSelected(selected + 1)}>{t("Next →", "Næste →")}</button></div></dialog></section>;
}
