"use client";

import { scrollEntrance } from "@/lib/scroll-entrance";
import { useEffect, useRef, type ReactNode } from "react";

/** Progressive enhancement: the complete story is rendered before animation loads. */
export function ProductMotion({ children, className }: { children: ReactNode; className?: string }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let disposed = false;
    let revert: (() => void) | undefined;
    Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([{ gsap }, { ScrollTrigger }]) => {
      if (disposed || !root.current) return;
      gsap.registerPlugin(ScrollTrigger);
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        const context = gsap.context(() => {
          root.current?.querySelectorAll<HTMLElement>("[data-product-enter]").forEach((el) => {
            const entrance = gsap.from(el, { y: 18, opacity: 0, duration: .7, ease: "power3.out", clearProps: "all", paused: true });
            scrollEntrance(ScrollTrigger, el, entrance);
          });
          root.current?.querySelectorAll<HTMLElement>("[data-plan-scene]").forEach((scene) => {
            const timeline = gsap.timeline({ scrollTrigger: { trigger: scene, start: "top 82%", end: "center 30%", scrub: .7 } });
            timeline.from(scene.querySelectorAll("[data-task-card]"), { y: 45, x: -24, rotationZ: -3, stagger: .14, ease: "power2.out" })
              .fromTo(scene.querySelector("[data-plan-line]"), { scaleX: 0 }, { scaleX: 1, transformOrigin: "left center", ease: "none" }, 0);
          });
          root.current?.querySelectorAll<HTMLElement>("[data-focus-scene]").forEach((scene) => {
            const timeline = gsap.timeline({ scrollTrigger: { trigger: scene, start: "top 80%", end: "center 30%", scrub: .5 } });
            timeline.from(scene.querySelector("[data-focus-arc]"), { strokeDashoffset: 650, ease: "none" })
              .fromTo(scene.querySelectorAll("[data-distraction]"), { opacity: 1, y: 0 }, { opacity: .35, y: 16, stagger: .08 }, 0)
              .from(scene.querySelector("[data-focus-label]"), { y: 20, opacity: 0 }, .3);
          });
          root.current?.querySelectorAll<HTMLElement>("[data-reading-scene]").forEach((scene) => {
            // Scripture is a stationary source capture; only the explanatory reading markers move.
            gsap.fromTo(scene.querySelectorAll("[data-reading-marker]"), { "--reading-progress": 0, x: 18 }, { "--reading-progress": 1, x: 0, stagger: .3, ease: "none", scrollTrigger: { trigger: scene, start: "top 75%", end: "bottom 70%", scrub: .4 } });
          });
          if (window.matchMedia("(min-width: 850px) and (pointer: fine)").matches) {
            root.current?.querySelectorAll<HTMLElement>("[data-product-fan]").forEach((scene) => {
              const phones = scene.querySelectorAll("[data-fan-phone]");
              const entrance = gsap.from(phones, { y: 54, rotationZ: index => (index - 1) * 3, stagger: .1, duration: .95, ease: "power3.out", paused: true });
              scrollEntrance(ScrollTrigger, scene, entrance);
              gsap.to(phones, { y: (index) => -18 - index * 13, ease: "none", scrollTrigger: { trigger: scene, start: "top top", end: "bottom top", scrub: .8 } });
            });
          }
        }, root);
        return () => context.revert();
      });
      revert = () => media.revert();
    }).catch(() => { /* The server-rendered layout remains the complete experience. */ });
    return () => { disposed = true; revert?.(); };
  }, []);
  return <div ref={root} className={className}>{children}</div>;
}
