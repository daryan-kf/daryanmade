"use client";

import { scrollEntrance } from "@/lib/scroll-entrance";
import { useEffect, useRef, useState } from "react";

/** Reading text enters once; the sculpture owns its separate, anchored motion. */
export function HomeChoreography() {
  const played = useRef(false);
  const revealed = useRef(new WeakSet<Element>());
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const sync = (event: Event) => setPaused(Boolean((event as CustomEvent<{ paused: boolean }>).detail?.paused));
    window.addEventListener("maker-motion-change", sync);
    return () => window.removeEventListener("maker-motion-change", sync);
  }, []);

  useEffect(() => {
    if (paused) return;
    const languageChange = document.documentElement.dataset.languageChanging === "true";
    let disposed = false;
    let release: (() => void) | undefined;
    Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([{ gsap }, { ScrollTrigger }]) => {
      const page = document.querySelector<HTMLElement>("[data-home-experience]");
      if (disposed || !page) return;
      gsap.registerPlugin(ScrollTrigger);
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        const context = gsap.context(() => {
          const select = gsap.utils.selector(page);
          if (!languageChange && !played.current && window.scrollY < window.innerHeight * .65) {
            played.current = true;
            const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
            intro.from(select("[data-home-line]"), { yPercent: 105, rotationX: -16, duration: 1.3, stagger: .18, clearProps: "all" }, 0)
              .from(select("[data-home-note]").filter((element: HTMLElement) => {
                const bounds = element.getBoundingClientRect();
                const visible = bounds.top >= 0 && bounds.bottom <= innerHeight * .92;
                if (visible) revealed.current.add(element);
                return visible;
              }), { opacity: 0, y: 28, duration: 1.05, stagger: .08, clearProps: "all" }, .5);
            ScrollTrigger.create({ trigger: page.querySelector("[data-home-hero]"), start: "top top", end: "bottom top", onLeave: () => intro.progress(1) });
          } else {
            played.current = true;
          }

          select("[data-home-note]").forEach((element: HTMLElement) => {
            if (revealed.current.has(element)) return;
            const entrance = gsap.from(element, { opacity: 0, y: 28, duration: 1.05, ease: "power3.out", clearProps: "all", paused: true });
            scrollEntrance(ScrollTrigger, element, entrance, () => { revealed.current.add(element); });
          });

          select("[data-home-heading]").forEach((element: HTMLElement) => {
            if (languageChange && element.getBoundingClientRect().top < innerHeight) revealed.current.add(element);
            if (revealed.current.has(element)) return;
            const lines = element.querySelectorAll("[data-home-heading-line]");
            const rule = element.querySelector("[data-home-rule]");
            const timeline = gsap.timeline({ paused: true });
            timeline.from(lines, { yPercent: 104, rotationX: -24, rotation: 1, duration: 1.15, stagger: .13, ease: "power3.out", clearProps: "all" });
            if (rule) timeline.from(rule, { scaleX: 0, transformOrigin: "left center", duration: .85, ease: "power3.inOut", clearProps: "all" }, .12);
            scrollEntrance(ScrollTrigger, element, timeline, () => { revealed.current.add(element); });
          });

          select("[data-creative-note]").forEach((element: HTMLElement) => {
            if (languageChange && element.getBoundingClientRect().top < innerHeight) revealed.current.add(element);
            if (revealed.current.has(element)) return;
            const timeline = gsap.timeline({ paused: true });
            timeline.from(element.querySelectorAll("[data-creative-line]"), { yPercent: 110, rotationX: -35, rotationZ: 2, opacity: 0, duration: 1.2, stagger: .16, ease: "power3.out", clearProps: "all" });
            timeline.from(element.querySelector("[data-creative-thread]"), { strokeDasharray: 1, strokeDashoffset: 1, duration: 1.6, ease: "power2.inOut", clearProps: "all" }, .3);
            timeline.from(element.querySelector("svg"), { rotation: -100, scale: .6, duration: 1.1, ease: "power3.out", clearProps: "all" }, 0);
            scrollEntrance(ScrollTrigger, element, timeline, () => { revealed.current.add(element); });
          });

          select("[data-home-portrait]").forEach((element: HTMLElement) => {
            if (languageChange && element.getBoundingClientRect().top < innerHeight) revealed.current.add(element);
            if (revealed.current.has(element)) return;
            const image = element.querySelector("img");
            const timeline = gsap.timeline({ paused: true });
            timeline.from(element, { clipPath: "inset(12% 8% 12% 8% round 16px)", transformPerspective: 1000, rotationY: -12, rotationX: 6, y: 45, scale: .94, duration: 1.3, ease: "power3.out", clearProps: "all" });
            if (image) timeline.from(image, { scale: 1.13, duration: 1.5, ease: "power3.out", clearProps: "transform" }, 0);
            scrollEntrance(ScrollTrigger, element, timeline, () => { revealed.current.add(element); });
          });
        }, page);
        return () => context.revert();
      });
      release = () => media.revert();
    }).catch(() => { /* The completed composition is already server rendered. */ });
    return () => { disposed = true; release?.(); };
  }, [paused]);

  return null;
}
