import {
  BufferAttribute,
  CatmullRomCurve3,
  Curve,
  Sphere,
  TubeGeometry,
  Vector3,
} from "three";

export const MAKER_STAGES = ["hero", "sarpoli", "vela", "wardrobe", "work", "kaizencv", "koebsklar", "about", "closing"] as const;
export type MakerStage = (typeof MAKER_STAGES)[number];

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

const TAU = Math.PI * 2;
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
 * This target pose is stateless; bounded following belongs to the renderer.
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
  if (!anchors.length) {
    out.size = 0;
    return out;
  }
  let index = 0;
  while (index < anchors.length - 1 && scroll >= anchors[index + 1].scroll) index++;
  const a = anchors[index];
  const b = anchors[Math.min(index + 1, anchors.length - 1)];
  const t = a === b ? 0 : clamp((scroll - a.scroll) / Math.max(1, b.scroll - a.scroll));
  out.from = MAKER_STAGES.indexOf(a.stage);
  out.to = MAKER_STAGES.indexOf(b.stage);
  // Nearby art slots are one chapter. A short scroll between Wardrobe and the
  // collection heading must not send the sculpture out to the edge and back.
  if (a !== b && b.scroll - a.scroll < (compact ? 380 : 440)) {
    const progress = smooth(t);
    out.x = mix(a.x, b.x, progress);
    out.y = mix(a.y, b.y, progress) - scroll;
    out.size = mix(a.size, b.size, progress);
    out.morph = progress;
    out.docked = 1;
    return out;
  }
  const railSize = compact ? 24 : viewportWidth < 1100 ? 40 : 62;
  const margin = compact ? 12 : viewportWidth < 1100 ? 20 : 32;
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
  const crossAt = crossing ? Math.max(.34, Math.min(.68, (crossing.y - railY - a.scroll) / Math.max(1, span))) : .58;
  if (crossing) {
    out.crossingBand = crossing;
    out.crossingFromX = fromSide;
    out.crossingToX = toSide;
    out.crossingScroll = a.scroll + crossAt * span;
  }
  const crossHalf = Math.min(.10, 170 / Math.max(1, span));
  const crossStart = crossAt - crossHalf, crossEnd = crossAt + crossHalf;
  const exitEnd = crossing ? crossStart - .05 : .44;
  const exitStart = Math.min(.20, exitEnd - .16);
  const enterStart = crossing ? crossEnd + .05 : .72;
  const exit = smooth((t - exitStart) / (exitEnd - exitStart));
  const enter = smooth((t - enterStart) / (.92 - enterStart));
  const departureY = t <= exitStart ? a.y - scroll : a.y - a.scroll - span * exitStart;
  const arrivalY = t >= .92 ? b.y - scroll : b.y - a.scroll - span * .92;
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
  // Travel first, then unfold the next project while already in its art slot.
  out.morph = smooth((t - .92) / .08);
  out.docked = departing ? 1 - exit : enter;
  return out;
}

class MakerKnot extends Curve<Vector3> {
  constructor() { super(); }
  getPoint(t: number, target = new Vector3()) {
    const angle = t * TAU;
    const radius = 1.54 + 0.49 * Math.cos(3 * angle);
    return target.set(
      radius * Math.cos(2 * angle),
      radius * Math.sin(2 * angle),
      0.76 * Math.sin(3 * angle),
    );
  }
}

function closedCurve(points: number[][]) {
  return new CatmullRomCurve3(points.map(([x, y, z]) => new Vector3(x, y, z)), true, "centripetal");
}

function curveFor(stage: MakerStage): Curve<Vector3> {
  switch (stage) {
    case "hero":
    case "about":
    case "closing": return new MakerKnot();
    case "sarpoli":
      // A pair of open windows, connected by one uninterrupted orange ribbon.
      return closedCurve([
        [-1.8, -1.05, 0], [-1.95, 0.65, 0.1], [-1.4, 1.2, 0.2], [-0.35, 1.05, 0.4],
        [0.2, 0.1, 0.65], [0.55, -1.05, 0.2], [1.7, -0.95, 0], [1.9, 0.7, -0.15],
        [1.35, 1.2, -0.3], [0.35, 1.05, -0.5], [-0.2, -0.1, -0.65], [-0.55, -1.15, -0.2],
      ]);
    case "vela":
      // Three calm tiers: an ordered day emerging from one continuous thought.
      return closedCurve([
        [-1.7, 1.2, 0], [1.45, 1.2, .1], [1.75, .85, .15], [1.45, .5, 0],
        [-1.0, .5, -.1], [-1.3, .1, -.2], [-1.0, -.3, 0], [1.4, -.3, .15],
        [1.7, -.7, .1], [1.35, -1.1, 0], [-1.7, -1.1, -.1], [-2.0, -.4, -.1], [-2.0, .6, 0],
      ]);
    case "wardrobe":
      return closedCurve([
        [-1.9, 0, 0], [-1.3, 0.75, 0.1], [-0.45, 1.25, 0.2], [0.0, 1.0, 0.55],
        [0.5, 0.55, 0.25], [1.85, -0.05, 0], [1.45, -0.65, -0.15], [0, -0.7, -0.25], [-1.45, -0.65, 0],
      ]);
    case "work":
      return closedCurve([
        [-1.7, -0.7, 0], [-1.65, 0.7, -0.3], [-0.7, 1.5, 0], [0.5, 1.45, 0.45],
        [1.7, 0.7, 0], [1.6, -0.8, -0.45], [0.6, -1.35, 0], [-0.6, -1.35, 0.3],
      ]);
    case "kaizencv":
      // A sheet with one folded corner: experience taking a considered form.
      return closedCurve([
        [-1.2, -1.6, 0], [-1.2, 1.5, 0], [.45, 1.5, .1], [1.2, .7, .2], [1.2, -1.6, 0],
      ]);
    case "koebsklar":
      // A roof and a case-file opening: property decisions with a human door.
      return closedCurve([
        [-1.45, -1.25, 0], [-1.45, .35, 0], [0, 1.65, .1], [1.45, .35, 0],
        [1.45, -1.25, 0], [.45, -1.25, 0], [.45, -.3, .15], [-.45, -.3, .15], [-.45, -1.25, 0],
      ]);
  }
}

/** Build once. Every target shares the same ring/section topology, UVs and index.
 * GPU position AND normal morphing means no vertex generation in the render loop.
 */
export function createMakerGeometry(compact = false) {
  const segments = compact ? 96 : 192;
  const sides = compact ? 10 : 18;
  const targets = MAKER_STAGES.map((stage) => {
    const curve = curveFor(stage);
    const tube = new TubeGeometry(curve, segments, 0.34, sides, true);
    const frames = curve.computeFrenetFrames(segments, true);
    const positions = tube.getAttribute("position");
    const point = new Vector3();
    const normal = new Vector3();
    const binormal = new Vector3();
    const vertex = new Vector3();
    const ribbon = stage !== "hero" && stage !== "closing";
    for (let ring = 0; ring <= segments; ring++) {
      const t = ring / segments;
      curve.getPointAt(t, point);
      const twist = (ribbon ? 0.72 : 0.26) * Math.sin(t * TAU * 2);
      normal.copy(frames.normals[ring]).multiplyScalar(Math.cos(twist))
        .addScaledVector(frames.binormals[ring], Math.sin(twist));
      binormal.copy(frames.binormals[ring]).multiplyScalar(Math.cos(twist))
        .addScaledVector(frames.normals[ring], -Math.sin(twist));
      const thickness = (ribbon ? 0.28 : 0.36) + 0.025 * Math.sin(t * TAU * 3);
      for (let side = 0; side <= sides; side++) {
        const angle = side / sides * TAU;
        vertex.copy(point).addScaledVector(normal, Math.cos(angle) * thickness)
          .addScaledVector(binormal, Math.sin(angle) * thickness * (ribbon ? 0.62 : 0.9));
        positions.setXYZ(ring * (sides + 1) + side, vertex.x, vertex.y, vertex.z);
      }
    }
    // The circular seam must be exact after deformation, so no shadow slit can
    // appear when a morph is viewed edge-on.
    for (let side = 0; side <= sides; side++) {
      const last = segments * (sides + 1) + side;
      positions.setXYZ(last, positions.getX(side), positions.getY(side), positions.getZ(side));
    }
    let radius = 0;
    for (let vertex = 0; vertex < positions.count; vertex++) {
      radius = Math.max(radius, Math.hypot(positions.getX(vertex), positions.getY(vertex), positions.getZ(vertex)));
    }
    if (radius > 2.6) tube.scale(2.6 / radius, 2.6 / radius, 2.6 / radius);
    tube.computeVertexNormals();
    const normals = tube.getAttribute("normal");
    const seam = new Vector3();
    const joinNormals = (a: number, b: number) => {
      seam.set(normals.getX(a) + normals.getX(b), normals.getY(a) + normals.getY(b), normals.getZ(a) + normals.getZ(b)).normalize();
      normals.setXYZ(a, seam.x, seam.y, seam.z);
      normals.setXYZ(b, seam.x, seam.y, seam.z);
    };
    for (let ring = 0; ring <= segments; ring++) joinNormals(ring * (sides + 1), ring * (sides + 1) + sides);
    for (let side = 0; side <= sides; side++) joinNormals(side, segments * (sides + 1) + side);
    tube.computeBoundingSphere();
    return tube;
  });
  const geometry = targets[0];
  geometry.morphAttributes.position = targets.map((target) => target.getAttribute("position").clone() as BufferAttribute);
  geometry.morphAttributes.normal = targets.map((target) => target.getAttribute("normal").clone() as BufferAttribute);
  geometry.morphTargetsRelative = false;
  // Conservative for all targets; morphing stays inside their convex envelope.
  geometry.boundingSphere = new Sphere(new Vector3(), 2.65);
  geometry.userData.makerStages = [...MAKER_STAGES];
  geometry.userData.segments = segments;
  geometry.userData.sides = sides;
  for (let i = 1; i < targets.length; i++) targets[i].dispose();
  return geometry;
}
