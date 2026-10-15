"use client";

import { createContext, useCallback, useContext, useLayoutEffect, useSyncExternalStore, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { localePath, stripLocale, type Locale } from "@/lib/i18n";

type LanguageNavigation = { pending: Locale | null; change: (locale: Locale) => void };
const LocaleContext = createContext<Locale>("en");
const NavigationContext = createContext<LanguageNavigation>({ pending: null, change: () => {} });
type Place = { selector: string; top: number };
type LanguageChange = {
  id: number;
  language: Locale;
  sourcePath: string;
  destinationPath: string;
  place: Place | null;
};

// A dynamic language segment can remount its provider during a soft navigation.
// Keep only the non-sensitive transition/reading anchor across that remount.
// This is browser memory, never storage; private tokens are not kept here.
let activeChange: LanguageChange | null = null;
let sequence = 0;
let arrivalAnimations: Animation[] = [];
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };
const snapshot = () => activeChange?.language ?? null;
const serverSnapshot = () => null;
const notify = () => { for (const listener of listeners) listener(); };

function readingPlace(): Place | null {
  const candidates = Array.from(document.querySelectorAll<HTMLElement>("[data-project-card], main section[id], main section[aria-labelledby], footer[id]"))
    .map(element => ({ element, bounds: element.getBoundingClientRect() }))
    .filter(({ bounds }) => bounds.top <= innerHeight * .4 && bounds.bottom > 0)
    .sort((a, b) => b.bounds.top - a.bounds.top);
  const reading = candidates[0];
  if (!reading) return null;
  const { element, bounds } = reading;
  const selector = element.dataset.projectCard ? `[data-project-card="${CSS.escape(element.dataset.projectCard)}"]`
    : element.id ? `#${CSS.escape(element.id)}` : `main section[aria-labelledby="${CSS.escape(element.getAttribute("aria-labelledby")!)}"]`;
  return { selector, top: bounds.top };
}

function finish(change: LanguageChange, cancelled = false) {
  if (activeChange !== change) return;
  activeChange = null;
  notify();
  document.documentElement.dataset.languagePhase = "arriving";
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.makerMotion === "paused";
  if (!cancelled && !reduced) {
    // Fade only visible reading blocks. Headers, backgrounds, images and the
    // fixed Three.js layer stay live and stationary; no document snapshots.
    const blocks = Array.from(document.querySelectorAll<HTMLElement>("main h1, main h2, main h3, main p, main li, main label, main summary, main figcaption, main dt, main dd, main > span, main > a"));
    const visible = blocks.filter(element => {
      const bounds = element.getBoundingClientRect();
      return bounds.width > 0 && bounds.height > 0 && bounds.bottom > 0 && bounds.top < innerHeight;
    });
    const unique = visible.filter(element => !visible.some(parent => parent !== element && parent.contains(element)));
    arrivalAnimations = unique.map(element => element.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 180, easing: "ease-out" }));
  }
  // Retain the flag through mount effects so scroll/hero intros do not replay.
  void Promise.allSettled(arrivalAnimations.map(animation => animation.finished)).then(() => {
    if (sequence === change.id) arrivalAnimations = [];
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (sequence === change.id && !activeChange) {
        delete document.documentElement.dataset.languageChanging;
        delete document.documentElement.dataset.languagePhase;
      }
    }));
  });
}

export function LocaleProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  const pathname = usePathname(), router = useRouter();
  const pending = useSyncExternalStore(subscribe, snapshot, serverSnapshot);

  useLayoutEffect(() => {
    document.documentElement.lang = locale;
    const change = activeChange;
    if (!change) return;
    if (locale === change.language && localePath(pathname, locale) === change.destinationPath) {
      const anchor = change.place && document.querySelector(change.place.selector);
      if (anchor && change.place) window.scrollBy({ top: anchor.getBoundingClientRect().top - change.place.top, behavior: "instant" });
      finish(change);
    } else if (stripLocale(pathname) !== stripLocale(change.sourcePath)) {
      // Another navigation superseded the pending language request.
      finish(change, true);
    }
  }, [locale, pathname, pending]);

  useLayoutEffect(() => {
    const cancelForHistory = () => { if (activeChange) finish(activeChange, true); };
    window.addEventListener("popstate", cancelForHistory);
    return () => window.removeEventListener("popstate", cancelForHistory);
  }, []);

  const change = useCallback((language: Locale) => {
    // The synchronous record also guards repeated clicks before React rerenders.
    if (language === locale || activeChange) return;
    const privateLink = { hash: window.location.hash };
    window.dispatchEvent(new CustomEvent("private-link-language-change", { detail: privateLink }));
    const destinationPath = localePath(pathname, language);
    const url = `${destinationPath}${window.location.search}${privateLink.hash}`;
    const navigation: LanguageChange = { id: ++sequence, language, sourcePath: pathname, destinationPath, place: readingPlace() };
    for (const animation of arrivalAnimations) animation.cancel();
    arrivalAnimations = [];
    activeChange = navigation;
    document.documentElement.dataset.languageChanging = "true";
    document.documentElement.dataset.languagePhase = "loading";
    notify();
    // Leave the old content fully readable while its translated payload loads.
    // Layout commit swaps the text and starts its short arrival before paint.
    try { router.push(url, { scroll: false }); }
    catch { finish(navigation, true); }
  }, [locale, pathname, router]);

  return <LocaleContext.Provider value={locale}><NavigationContext.Provider value={{ pending, change }}>{children}</NavigationContext.Provider></LocaleContext.Provider>;
}
export function useLocale() { return useContext(LocaleContext); }
export function useLanguageNavigation() { return useContext(NavigationContext); }
