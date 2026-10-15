"use client";

import { scrollEntrance } from "@/lib/scroll-entrance";
import { useEffect, useRef, useState } from "react";

/** The page stays complete without JS. Drawing, depth and type arrive in one
 * sequence; reading copy never scrubs back out as someone changes scroll speed. */
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
            const paths = Array.from(page.querySelectorAll<SVGGeometryElement>("[data-home-drawing]"));
            paths.forEach(path => {
              const length = path.getTotalLength();
              gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
            });
            intro.from(select("[data-home-line]"), { yPercent: 105, rotationX: -12, duration: 1.05, stagger: .13, clearProps: "all" }, 0)
              .to(paths, { strokeDashoffset: 0, duration: 1.25, stagger: .055 }, .12)
              .from(select("[data-home-note]"), { opacity: 0, y: 12, duration: .65, stagger: .07, clearProps: "all" }, .45);
            ScrollTrigger.create({ trigger: page.querySelector("[data-home-hero]"), start: "top top", end: "bottom top", onLeave: () => intro.progress(1) });
          } else {
            played.current = true;
          }

          // Only the drawing moves with scroll. The hero's headline and controls
          // remain still; the independently owned orange sculpture sets the pace.
          const hero = page.querySelector("[data-home-hero]");
          const drawing = page.querySelector("[data-home-blueprint]");
          if (hero && drawing) {
            gsap.to(drawing, { opacity: .25, y: -8, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom 15%", scrub: true } });
          }

          select("[data-home-heading]").forEach((element: HTMLElement) => {
            if (languageChange && element.getBoundingClientRect().top < innerHeight) revealed.current.add(element);
            if (revealed.current.has(element)) return;
            const lines = element.querySelectorAll("[data-home-heading-line]");
            const rule = element.querySelector("[data-home-rule]");
            const timeline = gsap.timeline({ paused: true });
            timeline.from(lines, { yPercent: 104, rotation: .8, duration: .75, stagger: .085, ease: "power3.out", clearProps: "all" });
            if (rule) timeline.from(rule, { scaleX: 0, transformOrigin: "left center", duration: .85, ease: "power3.inOut", clearProps: "all" }, .12);
            scrollEntrance(ScrollTrigger, element, timeline, () => { revealed.current.add(element); });
          });

          // The back screen opens the thought; the front screen resolves the day.
          // Both retain opaque surfaces and fixed depth, so text never bleeds through.
          select("[data-home-device-stack]").forEach((element: HTMLElement) => {
            if (languageChange && element.getBoundingClientRect().top < innerHeight) revealed.current.add(element);
            if (revealed.current.has(element)) return;
            const back = element.querySelector('[data-home-phone="back"]');
            const front = element.querySelector('[data-home-phone="front"]');
            const timeline = gsap.timeline({ paused: true, defaults: { ease: "power3.out" } });
            if (back) timeline.from(back, { y: 54, x: 28, rotation: -2, scale: .94, duration: 1.05, clearProps: "transform" }, 0);
            if (front) timeline.from(front, { y: 84, x: -14, rotation: 3, scale: .97, duration: .95, clearProps: "transform" }, .16);
            scrollEntrance(ScrollTrigger, element, timeline, () => { revealed.current.add(element); });
          });

          select("[data-home-portrait]").forEach((element: HTMLElement) => {
            if (languageChange && element.getBoundingClientRect().top < innerHeight) revealed.current.add(element);
            if (revealed.current.has(element)) return;
            const image = element.querySelector("img");
            const timeline = gsap.timeline({ paused: true });
            timeline.from(element, { clipPath: "inset(12% 8% 12% 8% round 5px)", duration: .85, ease: "power3.out", clearProps: "clipPath" });
            if (image) timeline.from(image, { scale: 1.04, duration: .95, ease: "power3.out", clearProps: "transform" }, 0);
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
