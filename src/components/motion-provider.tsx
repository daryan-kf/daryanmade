"use client";

import { useEffect, useRef, useState } from "react";
import { stripLocale } from "@/lib/i18n";
import { scrollEntrance } from "@/lib/scroll-entrance";
import { usePathname } from "next/navigation";

export function MotionProvider() {
  const pathname = usePathname();
  const contentPath = stripLocale(pathname);
  const [paused, setPaused] = useState(false);
  const presented = useRef(new WeakSet<Element>());
  useEffect(() => { setPaused(false); }, [contentPath]);
  useEffect(() => {
    const sync = (event: Event) => setPaused(Boolean((event as CustomEvent<{ paused: boolean }>).detail?.paused));
    window.addEventListener("maker-motion-change", sync);
    return () => window.removeEventListener("maker-motion-change", sync);
  }, []);
  useEffect(() => {
    if (paused) return;
    const languageChange = document.documentElement.dataset.languageChanging === "true";
    let disposed = false;
    let cleanup: (() => void) | undefined;
    Promise.all([import("gsap"), import("gsap/ScrollTrigger"), import("lenis")]).then(([{ gsap }, { ScrollTrigger }, { default: Lenis }]) => {
      if (disposed) return;
      gsap.registerPlugin(ScrollTrigger);
      const motion = gsap.matchMedia();
      motion.add("(prefers-reduced-motion: no-preference)", () => {
      const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
      const lenis = finePointer ? new Lenis({ duration: 1.1, smoothWheel: true, anchors: true }) : undefined;
      const tick = (time: number) => lenis?.raf(time * 1000);
      lenis?.on("scroll", ScrollTrigger.update);
      if (lenis) { gsap.ticker.add(tick); gsap.ticker.lagSmoothing(0); }
      const context = gsap.context(() => {
        const fresh = (selector: string) => gsap.utils.toArray<Element>(selector).filter(element => {
          if (languageChange && element.getBoundingClientRect().top < innerHeight) presented.current.add(element);
          return !presented.current.has(element);
        });
        const lines = fresh("[data-hero-line]");
        const hero = fresh("[data-hero-fade]");
        [...lines, ...hero].forEach(element => presented.current.add(element));
        if (lines.length) gsap.from(lines, { yPercent: 110, rotation: 1.5, duration: 1.2, stagger: 0.12, ease: "power4.out", clearProps: "all" });
        if (hero.length) gsap.from(hero, { opacity: 0, y: 18, duration: .8, delay: 0.2, stagger: 0.06, ease: "power3.out", clearProps: "all" });
        gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((element) => {
          if (languageChange && element.getBoundingClientRect().top < innerHeight) presented.current.add(element);
          if (presented.current.has(element)) return;
          const children = element.querySelectorAll("[data-reveal-item]");
          const targets = children.length ? children : element;
          const sibling = element.hasAttribute("data-project-card") && element.previousElementSibling ? 0.08 : 0;
          const entrance = gsap.from(targets, { opacity: 0, y: children.length ? 14 : 20, duration: .65, delay: finePointer ? sibling : 0, stagger: children.length ? .055 : 0, ease: "power3.out", clearProps: "all", paused: true });
          scrollEntrance(ScrollTrigger, element, entrance, () => { presented.current.add(element); });
        });
        if (finePointer) gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((element) => {
          gsap.fromTo(element, { y: 16 }, { y: -16, ease: "none", scrollTrigger: { trigger: element.parentElement, start: "top bottom", end: "bottom top", scrub: 0.8 } });
        });
        gsap.utils.toArray<HTMLElement>("[data-story-progress]").forEach(element => {
          gsap.fromTo(element, { scaleX: 0 }, { scaleX: 1, transformOrigin: "left center", ease: "none", scrollTrigger: { trigger: element.closest("section"), start: "top 65%", end: "bottom 75%", scrub: 0.5 } });
        });
        const progress = document.querySelector(".scroll-progress");
        if (progress) gsap.to(progress, { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: true } });
      });
      const refresh = () => { if (!disposed) ScrollTrigger.refresh(); };
      document.fonts.ready.then(refresh);
      const timer = window.setTimeout(refresh, 400);
      let resizeTimer: ReturnType<typeof setTimeout>;
      const resize = new ResizeObserver(() => { clearTimeout(resizeTimer); resizeTimer = setTimeout(refresh, 120); });
      const main = document.querySelector("main");
      if (main) resize.observe(main);
      return () => { clearTimeout(timer); clearTimeout(resizeTimer); resize.disconnect(); context.revert(); gsap.ticker.remove(tick); lenis?.destroy(); };
      });
      cleanup = () => motion.revert();
    }).catch(() => { /* Content stays readable if optional motion cannot load. */ });
    return () => { disposed = true; cleanup?.(); };
  }, [pathname, paused]);
  return <div className="scroll-progress" aria-hidden="true" hidden={paused} />;
}
