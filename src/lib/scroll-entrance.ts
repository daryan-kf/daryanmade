import type { gsap } from "gsap";
import type { ScrollTrigger } from "gsap/ScrollTrigger";

/** Play after a readable portion enters, then settle immediately when skipped.
 * Layout is measured only on ScrollTrigger refresh, never on each scroll tick. */
export function scrollEntrance(
  Trigger: typeof ScrollTrigger,
  element: HTMLElement,
  animation: gsap.core.Animation,
  presented?: () => void,
) {
  animation.pause(0);
  return Trigger.create({
    trigger: element,
    start: () => `top bottom-=${Math.round(Math.min(element.offsetHeight * .32, window.innerHeight * .2) + 28)}`,
    end: "bottom top",
    once: true,
    onEnter: self => {
      presented?.();
      const speed = Math.abs(self.getVelocity()) / window.innerHeight;
      if (speed > 3.2 || self.progress >= 1) animation.progress(1);
      else animation.timeScale(speed > 1.4 ? 2.6 : 1).play();
    },
    onLeave: () => { presented?.(); animation.progress(1); },
  });
}
