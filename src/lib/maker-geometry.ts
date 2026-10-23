import { Curve, TubeGeometry, Vector3 } from "three";

class MakerKnot extends Curve<Vector3> {
  constructor() { super(); }
  getPoint(t: number, target = new Vector3()) {
    const angle = t * Math.PI * 2;
    const radius = 1.54 + .49 * Math.cos(3 * angle);
    return target.set(radius * Math.cos(2 * angle), radius * Math.sin(2 * angle), .76 * Math.sin(3 * angle));
  }
}

/** One closed surface; no app-logo targets or hidden auxiliary components. */
export function createMakerGeometry(compact = false) {
  return new TubeGeometry(new MakerKnot(), compact ? 144 : 256, .38, compact ? 12 : 24, true);
}
