"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import styles from "./home-app-screen.module.css";

type ScreenRegion = { top: number; bottom: number; delay?: number; background?: string };
const regions = {
  "vela-talk": [
    { top: 13, bottom: 21.6, delay: 0 },
    { top: 21.6, bottom: 27.7, delay: 350 },
    { top: 27.7, bottom: 41.8, delay: 680 },
    { top: 41.8, bottom: 56.2, delay: 850 },
    { top: 56.2, bottom: 61.5, delay: 1020 },
  ],
  "vela-today": [
    { top: 12.8, bottom: 19.7 }, { top: 19.7, bottom: 35.8 },
    { top: 36.4, bottom: 41.6, background: "#fff" },
    { top: 41.6, bottom: 47.4, background: "#fff" },
    { top: 47.4, bottom: 53, background: "#fff" },
    { top: 53, bottom: 58.8, background: "#fff" },
    { top: 59.7, bottom: 66.5 }, { top: 66.5, bottom: 72.8, background: "#fff" },
    { top: 72.8, bottom: 79.8, background: "#fff" },
    { top: 79.8, bottom: 86.5, background: "#fff" },
  ],
  "shield-today": [{ top: 13.5, bottom: 41.7 }, { top: 41.7, bottom: 49.3 }, { top: 49.3, bottom: 66.5 }, { top: 66.5, bottom: 72 }, { top: 73.7, bottom: 85.2 }],
  "shield-child": [{ top: 19.5, bottom: 46.2 }, { top: 46.2, bottom: 60.5 }, { top: 60.5, bottom: 83.4 }, { top: 83.4, bottom: 98.3 }],
  "shield-learn": [
    { top: 19.6, bottom: 36.3, background: "#30278d" },
    { top: 36.3, bottom: 43.5, background: "#2d2588" },
    { top: 43.5, bottom: 50.3, background: "#2b2384" },
    { top: 50.3, bottom: 57.2, background: "#292180" },
    { top: 57.2, bottom: 64.2, background: "#27207b" },
    { top: 64.2, bottom: 73.5, background: "#241e75" },
  ],
  "iqra-read": [{ top: 15.2, bottom: 35.8 }, { top: 36.7, bottom: 56.7 }, { top: 58, bottom: 77.8 }],
  "iqra-prayer": [
    { top: 38.3, bottom: 51, background: "#f1eddf" },
    { top: 51, bottom: 61.5, background: "#f1eddf" },
    { top: 61.5, bottom: 77.1, background: "#f1eddf" },
    { top: 78.5, bottom: 89.5, background: "#f1eddf" },
  ],
  "iqra-memorize": [{ top: 13.4, bottom: 28.6 }, { top: 29.5, bottom: 47.2 }, { top: 47.2, bottom: 60.3 }, { top: 61.5, bottom: 82.6 }, { top: 84, bottom: 98.7 }],
  wardrobe: [{ top: 12, bottom: 26 }, { top: 26, bottom: 70 }, { top: 71, bottom: 88 }],
} satisfies Record<string, ScreenRegion[]>;

export type HomeAppScreenKind = keyof typeof regions;
type Props = {
  screen: HomeAppScreenKind;
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  sizes?: string;
  delay?: number;
};

/** Animate real interface regions without replacing their content with a mock.
 * The original screenshot is the complete server-rendered/resting surface.
 * Temporary masks share its decoded source and disappear after one entrance.
 */
export function HomeAppScreen({ screen, src, alt = "", width = 1000, height = 2167, sizes, delay = 0 }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const image = useRef<HTMLImageElement>(null);
  const [state, setState] = useState<"static" | "waiting" | "playing" | "complete">("static");
  const [decodedSource, setDecodedSource] = useState("");
  const content: ScreenRegion[] = regions[screen];
  const background = screen.startsWith("shield") ? "#f4f1e8" : screen.startsWith("iqra") ? "#faf7ed" : "#f7f6f2";

  useEffect(() => {
    const element = host.current;
    if (!element) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let disposed = false;
    let started = false;
    let complete = false;
    let timer = 0;
    let checkFrame = 0;
    let observer: IntersectionObserver | undefined;
    const finish = () => {
      complete = true;
      window.clearTimeout(timer);
      window.cancelAnimationFrame(checkFrame);
      window.removeEventListener("scroll", checkSkipped);
      observer?.disconnect();
      if (!disposed) setState("complete");
    };
    // IntersectionObserver need not report a jump from below to above the
    // viewport: both positions are non-intersecting. Settle skipped screens
    // so a later chapter never carries their temporary entrance masks.
    const checkSkipped = () => {
      if (checkFrame || complete || disposed) return;
      checkFrame = window.requestAnimationFrame(() => {
        checkFrame = 0;
        if (element.getBoundingClientRect().bottom <= 0) finish();
      });
    };
    const start = async () => {
      if (started || complete || disposed) return;
      started = true;
      const currentImage = image.current;
      if (!currentImage) { finish(); return; }
      try { await currentImage.decode(); } catch { finish(); return; }
      if (disposed || complete) return;
      setDecodedSource(currentImage.currentSrc || currentImage.src);
      setState("playing");
      const lastDelay = Math.max(...content.map((region, index) => region.delay ?? index * 120));
      timer = window.setTimeout(finish, 480 + delay + lastDelay + 680);
    };
    const preference = () => { if (reduced.matches) finish(); };
    const pause = (event: Event) => {
      if ((event as CustomEvent<{ paused?: boolean }>).detail?.paused) finish();
    };
    if (reduced.matches || document.documentElement.dataset.makerMotion === "paused" || document.documentElement.dataset.languageChanging === "true") {
      finish();
    } else {
      setState("waiting");
      observer = new IntersectionObserver(entries => {
        if (entries.some(entry => entry.boundingClientRect.bottom <= 0)) finish();
        else if (entries.some(entry => entry.isIntersecting)) void start();
      }, { threshold: .15, rootMargin: "0px 0px -12% 0px" });
      observer.observe(element);
      window.addEventListener("scroll", checkSkipped, { passive: true });
      checkSkipped();
    }
    reduced.addEventListener("change", preference);
    window.addEventListener("maker-motion-change", pause);
    return () => {
      disposed = true;
      window.clearTimeout(timer);
      window.cancelAnimationFrame(checkFrame);
      window.removeEventListener("scroll", checkSkipped);
      observer?.disconnect();
      reduced.removeEventListener("change", preference);
      window.removeEventListener("maker-motion-change", pause);
    };
  }, [content, delay, screen, src]);

  return <div ref={host} className={styles.screen} data-app-screen={screen} data-screen-motion={state}>
    <Image ref={image} className={styles.source} src={src} alt={alt} width={width} height={height} sizes={sizes} />
    {(state === "waiting" || state === "playing") && <div className={styles.regions} aria-hidden="true">
      {content.map((region, index) => {
        const bandHeight = region.bottom - region.top;
        return <div className={styles.region} key={index} style={{ top: `${region.top}%`, height: `${bandHeight}%`, background: region.background || background }}>
          <span className={styles.content} data-screen-content style={{
            backgroundImage: decodedSource ? `url("${decodedSource}")` : undefined,
            backgroundSize: `100% ${10000 / bandHeight}%`,
            backgroundPosition: `center ${region.top / (100 - bandHeight) * 100}%`,
            animationDelay: `${480 + delay + (region.delay ?? index * 120)}ms`,
          } as CSSProperties} />
        </div>;
      })}
    </div>}
  </div>;
}
