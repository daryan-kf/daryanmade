import { MAKER_STAGES, type MakerStage } from "./maker-geometry";
export type { MakerStage } from "./maker-geometry";

export type MakerAnchor = {
  stage: MakerStage;
  x: number;
  y: number;
  size: number;
  scroll: number;
};

export type MakerPose = {
  x: number;
  y: number;
  size: number;
  from: number;
  to: number;
  morph: number;
  docked: number;
  crossing?: boolean;
  crossingBand?: MakerCrossing;
  crossingFromX?: number;
  crossingToX?: number;
  crossingScroll?: number;
};
export type MakerCrossing = { y: number; height: number };

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => { const x = clamp(t); return x * x * (3 - 2 * x); };

/** A monotonic, time-based response: retargeting never introduces spring bounce.
 * The speed ceiling also applies to low-frame-rate and fast-scroll frames.
 */
export function dampMakerValue(current: number, target: number, dt: number, maxSpeed: number, response = 8) {
  const distance = target - current;
  if (Math.abs(distance) < 0.0001) return target;
  const step = Math.min(Math.abs(distance) * (1 - Math.exp(-response * dt)), maxSpeed * dt);
  return current + Math.sign(distance) * step;
}

/** Measured art slots and empty crossing bands define the path. The complete
 * sculpture remains inside the viewport throughout margin travel. It reaches
 * its next art slot before the next product form unfolds. No offscreen detour.
 * Positions are continuous; only the requested logo changes at arrival.
 * This target pose is stateless; timed morphing and bounded following belong to
 * the renderer, so fast scroll changes retarget one animation without a queue.
 */
export function sampleMakerJourney(
  anchors: readonly MakerAnchor[],
  scroll: number,
  viewportWidth: number,
  compact: boolean,
  out: MakerPose = { x: 0, y: 0, size: 0, from: 0, to: 0, morph: 0, docked: 1 },
  crossings: readonly MakerCrossing[] = [],
): MakerPose {
  out.crossing = false;
  out.crossingBand = undefined;
  out.crossingFromX = undefined;
  out.crossingToX = undefined;
  out.crossingScroll = undefined;
  if (!anchors.length) {
    out.size = 0;
    out.from = 0;
    out.to = 0;
    out.morph = 0;
    out.docked = 1;
    return out;
  }
  let index = 0;
  while (index < anchors.length - 1 && scroll >= anchors[index + 1].scroll) index++;
  const a = anchors[index];
  const b = anchors[Math.min(index + 1, anchors.length - 1)];
  const t = a === b ? 0 : clamp((scroll - a.scroll) / Math.max(1, b.scroll - a.scroll));
  out.from = MAKER_STAGES.indexOf(a.stage);
  out.to = MAKER_STAGES.indexOf(b.stage);
  if (a === b) {
    out.x = a.x; out.y = a.y - scroll; out.size = a.size;
    out.morph = 0; out.docked = 1;
    return out;
  }
  // Paired projects share one reserved horizontal art band. Moving directly
  // between them avoids sending the sculpture to a corner between two logos.
  if (a !== b && (Math.abs(b.y - a.y) < 80 || b.scroll - a.scroll < (compact ? 380 : 440))) {
    const progress = smooth((t - .28) / .62);
    out.x = mix(a.x, b.x, progress);
    out.y = mix(a.y, b.y, progress) - scroll;
    out.size = mix(a.size, b.size, progress);
    out.morph = t >= .90 ? 1 : 0;
    out.docked = 1;
    return out;
  }
  const railSize = compact ? 44 : viewportWidth < 1100 ? 56 : 72;
  const margin = compact ? 24 : viewportWidth < 1100 ? 30 : 40;
  const fromSide = a.x < viewportWidth / 2 ? margin : viewportWidth - margin;
  const toSide = b.x < viewportWidth / 2 ? margin : viewportWidth - margin;
  const span = b.scroll - a.scroll;
  const railY = mix(a.y - a.scroll, b.y - b.scroll, smooth(t));
  let crossing: MakerCrossing | undefined;
  let nearest = Infinity;
  if (fromSide !== toSide) for (const band of crossings) {
    const distance = Math.abs(band.y - (a.y + b.y) / 2);
    if (band.y > a.y && band.y < b.y && distance < nearest) { crossing = band; nearest = distance; }
  }
  const crossAt = crossing ? Math.max(.44, Math.min(.68, (crossing.y - railY - a.scroll) / Math.max(1, span))) : .58;
  if (crossing) {
    out.crossingBand = crossing;
    out.crossingFromX = fromSide;
    out.crossingToX = toSide;
    out.crossingScroll = a.scroll + crossAt * span;
  }
  const crossHalf = Math.min(.10, 170 / Math.max(1, span));
  const crossStart = crossAt - crossHalf, crossEnd = crossAt + crossHalf;
  const exitEnd = crossing ? crossStart - .05 : .52;
  const exitStart = Math.min(.30, exitEnd - .18);
  const enterStart = crossing ? crossEnd + .04 : .70;
  const arrivalAt = .90;
  const exit = smooth((t - exitStart) / (exitEnd - exitStart));
  const enter = smooth((t - enterStart) / (arrivalAt - enterStart));
  const departureFloor = a.size * .5 + 24;
  const departureY = Math.max(departureFloor, t <= exitStart ? a.y - scroll : a.y - a.scroll - span * exitStart);
  const arrivalY = t >= arrivalAt ? b.y - scroll : b.y - a.scroll - span * arrivalAt;
  const crossProgress = smooth((t - crossStart) / (crossHalf * 2));
  const railX = mix(fromSide, toSide, crossProgress);
  const departing = t < (exitEnd + enterStart) / 2;
  out.x = departing ? mix(a.x, railX, exit) : mix(railX, b.x, enter);
  out.y = departing ? mix(departureY, railY, exit) : mix(railY, arrivalY, enter);
  out.size = departing ? mix(a.size, railSize, exit) : mix(railSize, b.size, enter);
  if (crossing && t >= exitEnd && t <= enterStart) {
    // Approach and leave the empty band along the margin; only the small
    // fully visible form traverses it. All three joins share exact positions.
    const approach = smooth((t - exitEnd) / (crossStart - exitEnd));
    const leave = smooth((t - crossEnd) / (enterStart - crossEnd));
    const inBand = approach * (1 - leave);
    out.y = mix(railY, crossing.y - scroll, inBand);
    out.size = mix(railSize, Math.min(railSize, crossing.height * .8), inBand);
    out.crossing = t >= crossStart && t <= crossEnd;
  }
  // This is a target selection, never a scroll-scrubbed morph. The renderer
  // interpolates toward it in real time after arrival, including when scrolling
  // stops, so a quick wheel gesture cannot rush the visible transformation.
  out.morph = t >= arrivalAt ? 1 : 0;
  out.docked = departing ? 1 - exit : enter;
  return out;
}
