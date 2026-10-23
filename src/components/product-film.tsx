"use client";

import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { useLocale } from "./locale-provider";
import styles from "./product-film.module.css";
import disclosure from "./native-disclosure.module.css";

/** Media is fetched only when requested. Native controls remain available throughout. */
export function ProductFilm({ src, poster, title, caption, ratio = "21 / 9", transcript, captions, locale: explicitLocale }: {
  src: string; poster: string; title: string; caption: string; ratio?: string; transcript: string; captions?: string; locale?: Locale;
}) {
  const contextLocale = useLocale();
  const locale = explicitLocale ?? contextLocale;
  const t = (en: string, da: string) => locale === "da" ? da : en;
  const video = useRef<HTMLVideoElement>(null);
  const previousLocale = useRef(locale);
  useEffect(() => {
    if (previousLocale.current === locale) return;
    previousLocale.current = locale;
    // A client-side language change also updates captions on a playing film.
    // Keep browser/user caption preferences untouched on the initial render.
    for (const track of Array.from(video.current?.textTracks ?? [])) {
      if (track.language === "en" || track.language === "da") track.mode = track.language === locale ? "showing" : "disabled";
    }
  }, [locale]);
  const [started, setStarted] = useState(false);
  const [failed, setFailed] = useState(false);
  const danishCaptions = captions?.replace(/\.en\.vtt$/, ".da.vtt");
  return <figure className={styles.film}>
    <div className={styles.frame} style={{ aspectRatio: ratio }}>
      <video ref={video} controls playsInline preload="none" poster={poster} aria-label={title}
        onPlay={() => setStarted(true)} onError={() => setFailed(true)}>
        <source src={src} type="video/mp4" />
        {captions && <track kind="captions" src={captions} srcLang="en" label="English" />}
        {captions && danishCaptions !== captions && <track kind="subtitles" src={danishCaptions} srcLang="da" label="Dansk" default={locale === "da"} />}
        {t("Your browser does not support this video.", "Din browser understøtter ikke denne video.")} <a href={src}>{t("Open the film", "Åbn filmen")}</a>.
      </video>
      {!started && !failed && <button className={styles.play} type="button" aria-label={t(`Play ${title}`, `Afspil ${title}`)} onClick={() => {
        video.current?.play().catch(() => setFailed(true));
      }}><span aria-hidden="true">▶</span><span>{t("Watch the film", "Se filmen")}</span></button>}
    </div>
    <figcaption><span>{caption}{locale === "da" && captions && <small className={styles.languageNote}>Engelsk tale · danske undertekster</small>}</span><details className={disclosure.disclosure}><summary>{t("Film description", "Beskrivelse af filmen")}</summary><p>{transcript}</p></details></figcaption>
    {failed && <p role="status" className={styles.error}>{t("The film could not play here.", "Filmen kunne ikke afspilles her.")} <a href={src}>{t("Open the video directly", "Åbn videoen direkte")}</a>.</p>}
  </figure>;
}
