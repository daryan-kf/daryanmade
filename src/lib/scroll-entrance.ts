import type { ScrollTrigger } from "gsap/ScrollTrigger";

/** A substantial part of the subject must clear the viewport's bottom edge.
 * Cap by viewport size so tall sections can still enter on short screens. */
export function entranceVisiblePixels(height: number, viewport: number) {
  return Math.min(height * .6, viewport * .45) + viewport * .08;
}

/** Play after a readable portion enters, then settle immediately when skipped.
 * Layout is measured only on ScrollTrigger refresh, never on each scroll tick. */
export function scrollEntrance(
  Trigger: typeof ScrollTrigger,
  element: HTMLElement,
  animation: gsap.core.Animation,
  presented?: () => void,
) {
  animation.pause(0);
  // Hide the whole composition, including labels outside the animated lines.
  // A paused from-tween must never leave a faint, readable preview behind.
  element.dataset.entranceState = "pending";
  const show = () => { delete element.dataset.entranceState; };
  return Trigger.create({
    trigger: element,
    start: () => `top bottom-=${Math.round(entranceVisiblePixels(element.offsetHeight, window.innerHeight))}`,
    end: "bottom top",
    once: true,
    onEnter: self => {
      show();
      presented?.();
      const speed = Math.abs(self.getVelocity()) / window.innerHeight;
      if (speed > 3.2 || self.progress >= 1) animation.progress(1);
      else {
        window.dispatchEvent(new CustomEvent("studio-feedback", { detail: { kind: "reveal" } }));
        animation.timeScale(speed > 1.4 ? 2.6 : 1).play();
      }
    },
    onLeave: () => { show(); presented?.(); animation.progress(1); },
    onKill: show,
  });
}
