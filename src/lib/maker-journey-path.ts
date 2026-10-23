export type MakerFlowLayout = {
  width: number;
  height: number;
  hero: { x: number; y: number; size: number; bottom: number };
  work: { top: number; bottom: number };
};
export type MakerFlowPose = { x: number; y: number; size: number; rotation: number; phase: number; progress: number };
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (x: number) => { const t = clamp(x); return t * t * t * (t * (t * 6 - 15) + 10); };

/** Scroll is the only playhead. The same knot leaves the hero, becomes a small
 * part of the background current, then recedes before the person section.
 * Project expansion changes the measured extent, never the form or pigment.
 */
export function sampleMakerFlow(layout: MakerFlowLayout, scroll: number): MakerFlowPose {
  const { width, height, hero, work } = layout;
  const compact = width <= 700;
  const start = Math.max(40, hero.y - height * .38);
  const end = Math.max(start + 180, work.top - height * .18);
  const entry = smooth((scroll - start) / (end - start));
  const progress = clamp((scroll - work.top + height * .5) / Math.max(height, work.bottom - work.top));
  const exit = smooth((scroll - (work.bottom - height * .65)) / (height * .5));
  const edgeX = width + (compact ? 8 : -22) + Math.sin(progress * Math.PI * 2) * (compact ? 8 : 20);
  return {
    x: mix(hero.x, edgeX, entry),
    y: mix(hero.y - scroll, height * (.44 + Math.sin(progress * Math.PI) * .08), entry),
    size: mix(hero.size, compact ? 94 : 122, entry) * (1 - exit),
    rotation: -.36 + scroll / Math.max(1, height) * .26,
    phase: scroll / Math.max(1, height) * .68,
    progress,
  };
}
