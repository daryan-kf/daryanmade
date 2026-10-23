"use client";

import Image from "next/image";
import { useId, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { useLocale } from "./locale-provider";
import styles from "./product-gallery.module.css";

type GalleryImage = { src: string; label: string; alt: string; width?: number; height?: number };

export function ProductGallery({ name, title, images, disclosure, locale: explicitLocale, variant = "default" }: {
  name: string; title: string; images: GalleryImage[]; disclosure: string; locale?: Locale; variant?: "default" | "day";
}) {
  const contextLocale = useLocale();
  const locale = explicitLocale ?? contextLocale;
  const t = (en: string, da: string) => locale === "da" ? da : en;
  const id = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const [selected, setSelected] = useState(0);
  const current = images[selected];
  return <section className={`${styles.gallery} ${variant === "day" ? styles.day : ""}`} aria-labelledby={id} data-product-gallery={name}>
    <div className={styles.heading}><div><p>{t("A CLOSER LOOK", "SE NÆRMERE")}</p><h3 id={id}>{title}</h3></div><span>{t("Swipe to explore. Select to enlarge.", "Stryg for at udforske. Vælg for at forstørre.")}</span></div>
    <div className={styles.track}>
      {images.map((item, index) => <button type="button" key={item.src} className={styles.card} onClick={() => { setSelected(index); dialog.current?.showModal(); }} aria-label={t(`Enlarge ${name}: ${item.label}`, `Forstør ${name}: ${item.label}`)}>
        <Image src={item.src} width={item.width ?? 900} height={item.height ?? 1951} alt={item.alt} sizes={variant === "day" ? "(max-width: 700px) 72vw, (max-width: 1000px) 34vw, 272px" : "(max-width: 700px) 44vw, 180px"} />
        <span><b>{String(index + 1).padStart(2, "0")}</b>{item.label}<i data-link-arrow="diagonal" aria-hidden="true">↗</i></span>
      </button>)}
    </div>
    <p className={styles.disclosure}>{disclosure}</p>
    <dialog ref={dialog} className={styles.dialog} aria-label={t(`${name} campaign image`, `${name}-kampagnebillede`)} onClick={(event) => { if (event.target === event.currentTarget) dialog.current?.close(); }} onKeyDown={(event) => {
      if (event.key === "ArrowRight") { event.preventDefault(); setSelected((index) => Math.min(images.length - 1, index + 1)); }
      if (event.key === "ArrowLeft") { event.preventDefault(); setSelected((index) => Math.max(0, index - 1)); }
    }}>
      <div className={styles.toolbar}><span>{current.label}</span><button type="button" onClick={() => dialog.current?.close()} aria-label={t(`Close ${name} image`, `Luk ${name}-billedet`)}>{t("Close", "Luk")} <span aria-hidden="true">×</span></button></div>
      <Image className={styles.expanded} src={current.src} width={current.width ?? 900} height={current.height ?? 1951} alt={current.alt} sizes="(max-width: 700px) 85vw, 500px" />
      <div className={styles.controls}><button type="button" disabled={selected === 0} onClick={() => setSelected(selected - 1)}>{t("← Previous", "← Forrige")}</button><span aria-live="polite">{selected + 1} / {images.length}</span><button type="button" disabled={selected === images.length - 1} onClick={() => setSelected(selected + 1)}>{t("Next →", "Næste →")}</button></div>
    </dialog>
  </section>;
}
