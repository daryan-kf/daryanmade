import {
  BufferAttribute,
  BufferGeometry,
  CatmullRomCurve3,
  Curve,
  Shape,
  Sphere,
  TubeGeometry,
  Vector2,
  Vector3,
} from "three";
import { MAKER_LOGO_SHAPES, type MakerLogoCommand, type MakerLogoShape } from "./maker-logo-paths";

export const MAKER_STAGES = ["hero", "sarpoli", "vela", "wardrobe", "work", "kaizencv", "koebsklar", "shield-family", "iqra", "about", "closing"] as const;
export type MakerStage = (typeof MAKER_STAGES)[number];

const TAU = Math.PI * 2;
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

class MakerKnot extends Curve<Vector3> {
  constructor() { super(); }
  getPoint(t: number, target = new Vector3()) {
    const angle = t * TAU;
    const radius = 1.54 + 0.49 * Math.cos(3 * angle);
    return target.set(radius * Math.cos(2 * angle), radius * Math.sin(2 * angle), .76 * Math.sin(3 * angle));
  }
}

function curveFor(): Curve<Vector3> { return new MakerKnot(); }

function sourcePath(commands: MakerLogoCommand[]) {
  const path = new Shape();
  for (const command of commands) {
    switch (command[0]) {
      case "M": path.moveTo(command[1], command[2]); break;
      case "L": path.lineTo(command[1], command[2]); break;
      case "C": path.bezierCurveTo(command[1], command[2], command[3], command[4], command[5], command[6]); break;
      case "Q": path.quadraticCurveTo(command[1], command[2], command[3], command[4]); break;
    }
  }
  path.closePath();
  return path;
}

// Ray intersection pairs the house outline with its actual keyhole contour.
// Keeping both boundaries on the same radial line avoids a twisted hole wall.
function holePoint(outside: Vector2, center: Vector2, boundary: Vector2[]) {
  const dx = outside.x - center.x, dy = outside.y - center.y;
  let distance = 0;
  for (let i = 0; i < boundary.length - 1; i++) {
    const a = boundary[i], b = boundary[i + 1];
    const ex = b.x - a.x, ey = b.y - a.y;
    const determinant = dx * ey - dy * ex;
    if (Math.abs(determinant) < .00001) continue;
    const ax = a.x - center.x, ay = a.y - center.y;
    const alongRay = (ax * ey - ay * ex) / determinant;
    const alongEdge = (ax * dy - ay * dx) / determinant;
    if (alongRay >= 0 && alongEdge >= 0 && alongEdge <= 1) distance = Math.max(distance, alongRay);
  }
  return new Vector2(center.x + dx * distance, center.y + dy * distance);
}

type SurfacePart = { segments: number; sides: number; role: number };

function fillLogoSurface(geometry: BufferGeometry, logo: MakerLogoShape, part: SurfacePart) {
  const { segments, sides } = part;
  const contour = sourcePath(logo.commands).getSpacedPoints(segments);
  const center = new Vector2(...logo.center);
  const hole = logo.hole ? sourcePath(logo.hole).getSpacedPoints(256) : undefined;
  // Positive world-space winding produces outward-facing front triangles.
  let area = 0;
  for (let i = 0; i < segments; i++) area += contour[i].x * contour[i + 1].y - contour[i + 1].x * contour[i].y;
  if (area < 0) contour.reverse();
  const positions = geometry.getAttribute("position");
  const scale = .009;
  const radiusX = Math.max(...contour.map(point => Math.abs(point.x - center.x)));
  const radiusY = Math.max(...contour.map(point => Math.abs(point.y - center.y)));
  for (let ring = 0; ring <= segments; ring++) {
    const point = contour[ring];
    const inside = hole ? holePoint(point, center, hole) : center;
    for (let side = 0; side <= sides; side++) {
      const u = side === sides ? 0 : side / (sides - 1);
      // A slightly convex face, a rounded edge, and the matching rear face.
      // The last edge closes through the hidden axis for filled silhouettes.
      const front = u <= .5;
      const edge = front ? u * 2 : (1 - u) * 2;
      const radial = Math.sin(edge * Math.PI / 2);
      const bevel = Math.max(0, (radial - .91) / .09);
      const x = mix(inside.x, point.x, radial);
      const y = mix(inside.y, point.y, radial);
      // A physical dome keeps the pointed droplet's tip from producing a
      // radial ridge across its face. Flatter lettering keeps its bevel.
      const faceCurve = logo.roundness === undefined ? .10 * radial * radial
        : logo.roundness * Math.min(1.1, ((x - center.x) / radiusX) ** 2 + ((y - center.y) / radiusY) ** 2);
      const depth = logo.depth * (1 - faceCurve) * Math.sqrt(Math.max(0, 1 - bevel * bevel));
      positions.setXYZ(ring * (sides + 1) + side, (x - 256) * scale, (256 - y) * scale, (front ? 1 : -1) * depth + (logo.offset ?? 0));
    }
  }
}

function fillTubeSurface(geometry: BufferGeometry, stage: MakerStage, part: SurfacePart) {
  const curve = curveFor();
  const { segments, sides } = part;
  const frames = curve.computeFrenetFrames(segments, true);
  const positions = geometry.getAttribute("position");
  const point = new Vector3(), normal = new Vector3(), binormal = new Vector3(), vertex = new Vector3();
  const ribbon = false;
  for (let ring = 0; ring <= segments; ring++) {
    const t = ring / segments;
    curve.getPointAt(t, point);
    const twist = (ribbon ? .72 : .20) * Math.sin(t * TAU * 2);
    normal.copy(frames.normals[ring]).multiplyScalar(Math.cos(twist)).addScaledVector(frames.binormals[ring], Math.sin(twist));
    binormal.copy(frames.binormals[ring]).multiplyScalar(Math.cos(twist)).addScaledVector(frames.normals[ring], -Math.sin(twist));
    const thickness = (ribbon ? .28 : .38) + .022 * Math.sin(t * TAU * 3);
    for (let side = 0; side <= sides; side++) {
      const angle = side / sides * TAU;
      vertex.copy(point).addScaledVector(normal, Math.cos(angle) * thickness).addScaledVector(binormal, Math.sin(angle) * thickness * (ribbon ? .62 : .96));
      positions.setXYZ(ring * (sides + 1) + side, vertex.x, vertex.y, vertex.z);
    }
  }
}

function fillStrokeSurface(geometry: BufferGeometry, points: number[][], part: SurfacePart, thickness: number, depth = .35) {
  const curve = new CatmullRomCurve3(points.map(([x, y]) => new Vector3((x - 256) * .009, (256 - y) * .009, depth)), false, "centripetal");
  const frames = curve.computeFrenetFrames(part.segments, false);
  const positions = geometry.getAttribute("position");
  const center = new Vector3(), vertex = new Vector3();
  // The visible tube runs outward; its return surface collapses onto the
  // internal axis. This caps an open stroke without changing morph topology.
  for (let ring = 0; ring <= part.segments; ring++) {
    const t = ring / part.segments;
    const along = t <= .5 ? t * 2 : (1 - t) * 2;
    const frame = Math.min(part.segments, Math.round(along * part.segments));
    curve.getPointAt(along, center);
    const cap = t <= .5 && along > 0 && along < 1 ? Math.min(1, Math.sin(along * Math.PI) * 12) : 0;
    for (let side = 0; side <= part.sides; side++) {
      const angle = side / part.sides * TAU;
      vertex.copy(center).addScaledVector(frames.normals[frame], Math.cos(angle) * thickness * cap).addScaledVector(frames.binormals[frame], Math.sin(angle) * thickness * cap);
      positions.setXYZ(ring * (part.sides + 1) + side, vertex.x, vertex.y, vertex.z);
    }
  }
}

function circleShape(x: number, y: number, radius: number): MakerLogoShape {
  const k = radius * .55228475;
  return { center: [x, y], depth: .018, commands: [
    ["M", x + radius, y], ["C", x + radius, y + k, x + k, y + radius, x, y + radius],
    ["C", x - k, y + radius, x - radius, y + k, x - radius, y],
    ["C", x - radius, y - k, x - k, y - radius, x, y - radius],
    ["C", x + k, y - radius, x + radius, y - k, x + radius, y],
  ] };
}

/** All targets have identical components and indices. Solid logo faces use the
 * same surface grid as the knot, so even separate logo pieces morph on the GPU.
 */
export function createMakerGeometry(compact = false) {
  const parts: SurfacePart[] = [
    { segments: compact ? 128 : 256, sides: compact ? 14 : 28, role: 0 },
    { segments: compact ? 72 : 144, sides: compact ? 10 : 20, role: 1 },
    { segments: compact ? 24 : 40, sides: 8, role: 2 },
    { segments: compact ? 24 : 40, sides: 8, role: 2 },
    { segments: compact ? 36 : 64, sides: 8, role: 2 },
    { segments: compact ? 40 : 72, sides: 8, role: 3 },
    { segments: compact ? 24 : 40, sides: 8, role: 3 },
  ];
  const targets = MAKER_STAGES.map((stage) => {
    const shapes = stage in MAKER_LOGO_SHAPES ? MAKER_LOGO_SHAPES[stage as keyof typeof MAKER_LOGO_SHAPES] : undefined;
    const meshes = parts.map((part, component) => {
      const { segments, sides } = part;
      const mesh = new TubeGeometry(new MakerKnot(), segments, .3, sides, true);
      const positions = mesh.getAttribute("position");
      const logo = shapes?.[component];
      if (logo) fillLogoSurface(mesh, logo, part);
      else if (component === 0) fillTubeSurface(mesh, stage, part);
      else if (stage === "wardrobe" && component === 1) fillStrokeSurface(mesh, [
        [435, 107], [429, 95], [414, 94], [405, 105], [410, 118], [420, 122],
        [420, 134], [469, 174], [369, 174], [420, 134],
      ], part, .061);
      else if (stage === "wardrobe" && (component === 2 || component === 3)) {
        fillLogoSurface(mesh, circleShape(component === 2 ? 220 : 292, 297, 14), part);
        mesh.translate(0, 0, .65);
      } else if (stage === "wardrobe" && component === 4) fillStrokeSurface(mesh, [[224, 332], [240, 344], [256, 348], [272, 344], [288, 332]], part, .055, .69);
      else {
        // Unused components stay microscopic and inside the main sculpture.
        mesh.scale(.00001, .00001, .00001);
      }
      for (let side = 0; side <= sides; side++) {
        const last = segments * (sides + 1) + side;
        positions.setXYZ(last, positions.getX(side), positions.getY(side), positions.getZ(side));
      }
      mesh.computeVertexNormals();
      const normals = mesh.getAttribute("normal");
      const seam = new Vector3();
      for (let vertex = 0; vertex < normals.count; vertex++) {
        seam.fromBufferAttribute(normals, vertex);
        if (seam.lengthSq() < .00001) normals.setXYZ(vertex, 0, 0, 1);
      }
      const joinNormals = (a: number, b: number) => {
        seam.set(normals.getX(a) + normals.getX(b), normals.getY(a) + normals.getY(b), normals.getZ(a) + normals.getZ(b));
        if (seam.lengthSq() < .00001) seam.set(0, 0, 1);
        seam.normalize(); normals.setXYZ(a, seam.x, seam.y, seam.z); normals.setXYZ(b, seam.x, seam.y, seam.z);
      };
      for (let ring = 0; ring <= segments; ring++) joinNormals(ring * (sides + 1), ring * (sides + 1) + sides);
      for (let side = 0; side <= sides; side++) joinNormals(side, segments * (sides + 1) + side);
      return mesh;
    });
    const count = meshes.reduce((sum, mesh) => sum + mesh.getAttribute("position").count, 0);
    const positions = new Float32Array(count * 3), normals = new Float32Array(count * 3), roles = new Float32Array(count);
    const indices: number[] = [];
    let offset = 0;
    meshes.forEach((mesh, component) => {
      positions.set(mesh.getAttribute("position").array, offset * 3);
      normals.set(mesh.getAttribute("normal").array, offset * 3);
      roles.fill(parts[component].role, offset, offset + mesh.getAttribute("position").count);
      for (const index of mesh.index!.array) indices.push(index + offset);
      offset += mesh.getAttribute("position").count;
      mesh.dispose();
    });
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new BufferAttribute(positions, 3));
    geometry.setAttribute("normal", new BufferAttribute(normals, 3));
    geometry.setAttribute("part", new BufferAttribute(roles, 1));
    geometry.setIndex(indices);
    let radius = 0;
    for (let vertex = 0; vertex < count; vertex++) radius = Math.max(radius, Math.hypot(positions[vertex * 3], positions[vertex * 3 + 1], positions[vertex * 3 + 2]));
    if (radius > 2.6) geometry.scale(2.6 / radius, 2.6 / radius, 2.6 / radius);
    return geometry;
  });
  const geometry = targets[0];
  geometry.morphAttributes.position = targets.map(target => target.getAttribute("position").clone() as BufferAttribute);
  geometry.morphAttributes.normal = targets.map(target => target.getAttribute("normal").clone() as BufferAttribute);
  geometry.morphTargetsRelative = false;
  geometry.boundingSphere = new Sphere(new Vector3(), 2.65);
  geometry.userData.makerStages = [...MAKER_STAGES];
  geometry.userData.segments = parts[0].segments;
  geometry.userData.sides = parts[0].sides;
  geometry.userData.parts = parts;
  for (let i = 1; i < targets.length; i++) targets[i].dispose();
  return geometry;
}
