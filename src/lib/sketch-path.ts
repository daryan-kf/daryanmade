import { MAKER_MARK_PATH } from "@/components/icons";

/** Hand-drawn outlines for the work story. Seeded, so server and client agree. */
export type DeviceKind = "phone" | "browser" | "polaroid" | "mark";
export type Screen = { x: number; y: number; width: number; height: number; radius: number };
export type DeviceSketch = { width: number; height: number; outline: string; echo: string; details: string[]; guides: string[]; screen?: Screen };

function random(seed: number) {
  let state = seed * 2654435761 >>> 0;
  return () => {
    state = state + 0x6d2b79f5 >>> 0;
    let value = Math.imul(state ^ state >>> 15, 1 | state);
    value = value + Math.imul(value ^ value >>> 7, 61 | value) ^ value;
    return ((value ^ value >>> 14) >>> 0) / 4294967296;
  };
}

const round = (value: number) => Math.round(value * 10) / 10;
const point = (x: number, y: number) => `${round(x)} ${round(y)}`;

/** A rounded rectangle in one clockwise stroke that bows a little on each side
 * and runs past its starting point, the way a pencil closes a shape. */
export function sketchRect(x: number, y: number, width: number, height: number, radius: number, seed = 1, wobble = 1.4) {
  const next = random(seed);
  const shake = (amount = wobble) => (next() - .5) * 2 * amount;
  const r = Math.min(radius, width / 2, height / 2), k = r * .5523;
  const left = x, top = y, right = x + width, bottom = y + height;
  // Corner anchors drift slightly; sides bow between them.
  const a = [[left + r, top], [right - r, top], [right, top + r], [right, bottom - r], [right - r, bottom], [left + r, bottom], [left, bottom - r], [left, top + r]].map(([px, py]) => [px + shake(), py + shake()]);
  const side = (from: number[], to: number[]) => {
    const bow = shake(wobble * 1.6);
    const nx = -(to[1] - from[1]), ny = to[0] - from[0], length = Math.hypot(nx, ny) || 1;
    const ox = nx / length * bow, oy = ny / length * bow;
    return `C ${point(from[0] + (to[0] - from[0]) / 3 + ox, from[1] + (to[1] - from[1]) / 3 + oy)} ${point(from[0] + (to[0] - from[0]) * 2 / 3 + ox, from[1] + (to[1] - from[1]) * 2 / 3 + oy)} ${point(to[0], to[1])}`;
  };
  const overshoot = Math.min(width * .12, 26);
  return [
    `M ${point(a[0][0], a[0][1])}`,
    side(a[0], a[1]),
    `C ${point(a[1][0] + k, a[1][1])} ${point(a[2][0], a[2][1] - k)} ${point(a[2][0], a[2][1])}`,
    side(a[2], a[3]),
    `C ${point(a[3][0], a[3][1] + k)} ${point(a[4][0] + k, a[4][1])} ${point(a[4][0], a[4][1])}`,
    side(a[4], a[5]),
    `C ${point(a[5][0] - k, a[5][1])} ${point(a[6][0], a[6][1] + k)} ${point(a[6][0], a[6][1])}`,
    side(a[6], a[7]),
    `C ${point(a[7][0], a[7][1] - k)} ${point(a[0][0] - k, a[0][1] + shake(.6))} ${point(a[0][0] + 1, a[0][1] - .4)}`,
    `C ${point(a[0][0] + overshoot / 3, a[0][1] - 1)} ${point(a[0][0] + overshoot * 2 / 3, a[0][1] - 1.8)} ${point(a[0][0] + overshoot, a[0][1] - 2.6)}`,
  ].join(" ");
}

export function sketchLine(x1: number, y1: number, x2: number, y2: number, seed = 1, wobble = 1) {
  const next = random(seed);
  const bow = (next() - .5) * 2 * wobble;
  const nx = -(y2 - y1), ny = x2 - x1, length = Math.hypot(nx, ny) || 1;
  const ox = nx / length * bow, oy = ny / length * bow;
  return `M ${point(x1, y1)} C ${point(x1 + (x2 - x1) / 3 + ox, y1 + (y2 - y1) / 3 + oy)} ${point(x1 + (x2 - x1) * 2 / 3 + ox, y1 + (y2 - y1) * 2 / 3 + oy)} ${point(x2, y2)}`;
}

export function sketchCircle(cx: number, cy: number, r: number, seed = 1, wobble = .4) {
  const next = random(seed);
  const shake = () => (next() - .5) * 2 * wobble;
  const k = r * .5523;
  const [top, right, bottom, left] = [[cx, cy - r], [cx + r, cy], [cx, cy + r], [cx - r, cy]].map(([x, y]) => [x + shake(), y + shake()]);
  return `M ${point(top[0], top[1])} C ${point(top[0] + k, top[1])} ${point(right[0], right[1] - k)} ${point(right[0], right[1])} C ${point(right[0], right[1] + k)} ${point(bottom[0] + k, bottom[1])} ${point(bottom[0], bottom[1])} C ${point(bottom[0] - k, bottom[1])} ${point(left[0], left[1] + k)} ${point(left[0], left[1])} C ${point(left[0], left[1] - k)} ${point(top[0] - k, top[1] + .5)} ${point(top[0] + r * .25, top[1] - .6)}`;
}

/** Construction lines that run past the corners, like a layout sketch. */
function guides(left: number, top: number, right: number, bottom: number, reach: number, seed: number) {
  return [
    sketchLine(left - reach, top, right + reach, top, seed, .5),
    sketchLine(left, top - reach, left, bottom + reach, seed + 1, .5),
    sketchLine(right, bottom + reach, right, top - reach, seed + 2, .5),
    sketchLine(right + reach, bottom, left - reach, bottom, seed + 3, .5),
  ];
}

export function deviceSketch(kind: DeviceKind, seed: number): DeviceSketch {
  if (kind === "phone") return {
    width: 300, height: 603,
    outline: sketchRect(8, 8, 284, 587, 46, seed),
    echo: sketchRect(9, 7, 283, 589, 47, seed + 40, 2),
    details: [sketchRect(118, 31, 64, 18, 9, seed + 2, .5), sketchLine(296, 150, 296, 206, seed + 3, .4), sketchLine(4, 132, 4, 166, seed + 4, .4), sketchLine(4, 180, 4, 214, seed + 5, .4)],
    guides: guides(8, 8, 292, 595, 34, seed + 6),
    screen: { x: 20, y: 20, width: 260, height: 563, radius: 36 },
  };
  if (kind === "browser") return {
    width: 640, height: 442,
    outline: sketchRect(8, 8, 624, 426, 14, seed),
    echo: sketchRect(7, 9, 626, 425, 15, seed + 40, 2.2),
    details: [sketchLine(8, 44, 632, 44, seed + 2, .7), sketchCircle(30, 26, 4.5, seed + 3), sketchCircle(48, 26, 4.5, seed + 4), sketchCircle(66, 26, 4.5, seed + 5), sketchRect(230, 17, 180, 18, 9, seed + 6, .5)],
    guides: guides(8, 8, 632, 434, 40, seed + 7),
    screen: { x: 10, y: 45, width: 620, height: 388, radius: 11 },
  };
  if (kind === "polaroid") return {
    width: 360, height: 440,
    outline: sketchRect(8, 8, 344, 424, 7, seed),
    echo: sketchRect(7, 9, 346, 422, 8, seed + 40, 2),
    details: [sketchRect(26, 26, 308, 308, 3, seed + 2, .7), sketchLine(48, 386, 196, 381, seed + 3, 3)],
    guides: guides(8, 8, 352, 432, 34, seed + 4),
    screen: { x: 26, y: 26, width: 308, height: 308, radius: 3 },
  };
  return {
    width: 40, height: 40,
    outline: MAKER_MARK_PATH,
    echo: MAKER_MARK_PATH,
    details: [],
    guides: [sketchCircle(20.5, 19, 17.5, seed, .25)],
  };
}
