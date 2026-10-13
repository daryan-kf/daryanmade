"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function MotionProvider() {
  const pathname = usePathname();
  useEffect(() => {
    let disposed = false;
    let cleanup: (() => void) | undefined;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) return;
    Promise.all([import("gsap"), import("gsap/ScrollTrigger"), import("lenis")]).then(([{ gsap }, { ScrollTrigger }, { default: Lenis }]) => {
      if (disposed) return;
      gsap.registerPlugin(ScrollTrigger);
      const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
      const lenis = finePointer ? new Lenis({ duration: 1.05, smoothWheel: true, anchors: true }) : undefined;
      const tick = (time: number) => lenis?.raf(time * 1000);
      lenis?.on("scroll", ScrollTrigger.update);
      if (lenis) { gsap.ticker.add(tick); gsap.ticker.lagSmoothing(0); }
      const context = gsap.context(() => {
        gsap.from("[data-hero-line]", { yPercent: 110, rotation: 2, duration: 1.15, stagger: 0.12, ease: "power4.out", clearProps: "all" });
        gsap.from("[data-hero-fade]", { opacity: 0, y: 16, duration: 0.8, delay: 0.4, stagger: 0.1, ease: "power3.out", clearProps: "all" });
        gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((element) => {
          gsap.from(element, { opacity: 0, y: 35, duration: 0.85, ease: "power3.out", clearProps: "all", scrollTrigger: { trigger: element, start: "top 94%", once: true } });
        });
        if (finePointer) gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((element) => {
          gsap.fromTo(element, { y: 24 }, { y: -24, ease: "none", scrollTrigger: { trigger: element.parentElement, start: "top bottom", end: "bottom top", scrub: 0.6 } });
        });
        const progress = document.querySelector(".scroll-progress");
        if (progress) gsap.to(progress, { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: true } });
      });
      const refresh = () => { if (!disposed) ScrollTrigger.refresh(); };
      document.fonts.ready.then(refresh);
      const timer = window.setTimeout(refresh, 400);
      cleanup = () => { clearTimeout(timer); context.revert(); gsap.ticker.remove(tick); lenis?.destroy(); };
    }).catch(() => { /* Content stays readable if optional motion cannot load. */ });
    const change = () => { if (media.matches) { cleanup?.(); cleanup = undefined; } };
    media.addEventListener("change", change);
    return () => { disposed = true; cleanup?.(); media.removeEventListener("change", change); };
  }, [pathname]);
  return <div className="scroll-progress" aria-hidden="true" />;
}
