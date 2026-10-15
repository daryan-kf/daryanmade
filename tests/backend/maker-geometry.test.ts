import { describe, expect, it } from "vitest";
import { createMakerGeometry, dampMakerValue, MAKER_STAGES, sampleMakerJourney, type MakerAnchor } from "../../src/lib/maker-geometry";

describe("the maker sculpture", () => {
  it.each([false, true])("keeps every morph target finite, bounded and on one closed topology (compact=%s)", (compact) => {
    const geometry = createMakerGeometry(compact);
    const positions = geometry.morphAttributes.position!;
    const normals = geometry.morphAttributes.normal!;
    expect(positions).toHaveLength(MAKER_STAGES.length);
    expect(normals).toHaveLength(MAKER_STAGES.length);
    const count = geometry.getAttribute("position").count;
    const sides = geometry.userData.sides as number;
    const segments = geometry.userData.segments as number;
    for (let target = 0; target < positions.length; target++) {
      expect(positions[target].count).toBe(count);
      expect(normals[target].count).toBe(count);
      for (let vertex = 0; vertex < count; vertex++) {
        const x = positions[target].getX(vertex), y = positions[target].getY(vertex), z = positions[target].getZ(vertex);
        expect(Number.isFinite(x + y + z)).toBe(true);
        expect(Math.hypot(x, y, z)).toBeLessThan(2.65);
        const nx = normals[target].getX(vertex), ny = normals[target].getY(vertex), nz = normals[target].getZ(vertex);
        expect(Math.hypot(nx, ny, nz)).toBeCloseTo(1, 4);
      }
      for (let side = 0; side <= sides; side++) {
        const last = segments * (sides + 1) + side;
        expect(positions[target].getX(last)).toBe(positions[target].getX(side));
        expect(positions[target].getY(last)).toBe(positions[target].getY(side));
        expect(positions[target].getZ(last)).toBe(positions[target].getZ(side));
      }
    }
    geometry.dispose();
  });

  it("uses less than half the vertices on compact devices", () => {
    const full = createMakerGeometry(false), compact = createMakerGeometry(true);
    expect(compact.getAttribute("position").count).toBeLessThan(full.getAttribute("position").count / 2);
    full.dispose(); compact.dispose();
  });
});

describe("the maker journey", () => {
  const anchors: MakerAnchor[] = [
    { stage: "hero", x: 1000, y: 420, size: 500, scroll: 0 },
    { stage: "sarpoli", x: 950, y: 1620, size: 260, scroll: 1200 },
    { stage: "vela", x: 960, y: 2420, size: 220, scroll: 2000 },
  ];

  it("docks exactly into measured art slots", () => {
    for (const anchor of anchors) {
      const pose = sampleMakerJourney(anchors, anchor.scroll, 1440, false);
      expect(pose.x).toBe(anchor.x);
      expect(pose.y).toBe(anchor.y - anchor.scroll);
      expect(pose.size).toBe(anchor.size);
    }
  });

  it.each([false, true])("keeps the entire travelling form inside the reserved margin (compact=%s)", (compact) => {
    const width = compact ? 390 : 1440;
    const pose = sampleMakerJourney(anchors, 600, width, compact);
    expect(pose.size).toBe(compact ? 24 : 62);
    expect(pose.x).toBeLessThan(width);
    expect(pose.docked).toBe(0);
    expect(pose.x - pose.size * .47).toBeGreaterThanOrEqual(width - (compact ? 24 : 64));
    expect(pose.x + pose.size * .47).toBeLessThan(width);
    expect(pose.morph, "The product form holds during travel").toBe(0);
  });

  it("changes sides only through a measured empty band, without jumps at its edges", () => {
    const alternating: MakerAnchor[] = [anchors[1], { ...anchors[2], x: 330 }];
    const bands = [{ y: 2020, height: 100 }];
    const samples = [1520, 1560, 1600, 1640, 1680].map(scroll => sampleMakerJourney(alternating, scroll, 1440, false, undefined, bands));
    expect(samples[0].x).toBeGreaterThan(1400);
    expect(samples.at(-1)!.x).toBeLessThan(40);
    for (let index = 0; index < samples.length; index++) {
      expect(samples[index].y).toBe(2020 - (1520 + index * 40));
      expect(samples[index].size).toBeLessThan(100);
      expect(samples[index].morph).toBe(0);
    }
    for (const boundary of [1480, 1520, 1680, 1720]) {
      const before = sampleMakerJourney(alternating, boundary - .001, 1440, false, undefined, bands);
      const after = sampleMakerJourney(alternating, boundary + .001, 1440, false, undefined, bands);
      expect(Math.abs(before.x - after.x)).toBeLessThan(.1);
      expect(Math.abs(before.y - after.y)).toBeLessThan(.1);
      expect(Math.abs(before.size - after.size)).toBeLessThan(.1);
    }
  });

  it("finishes the transfer before unfolding the next product", () => {
    const arrived = sampleMakerJourney(anchors, 1200 * .92, 1440, false);
    expect(arrived.x).toBe(anchors[1].x);
    expect(arrived.size).toBe(anchors[1].size);
    expect(arrived.docked).toBe(1);
    expect(arrived.morph).toBe(0);
    const unfolding = sampleMakerJourney(anchors, 1200 * .96, 1440, false);
    expect(unfolding.x).toBe(anchors[1].x);
    expect(unfolding.morph).toBeCloseTo(.5);
  });

  it("holds each complete local form long enough to read before starting a transfer", () => {
    for (const scroll of [0, 60, 120, 180]) {
      const pose = sampleMakerJourney(anchors, scroll, 1440, false);
      expect(pose.x).toBe(anchors[0].x);
      expect(pose.size).toBe(anchors[0].size);
      expect(pose.y).toBe(anchors[0].y - scroll);
      expect(pose.docked).toBe(1);
      expect(pose.morph).toBe(0);
    }
  });

  it("joins nearby slots directly instead of detouring to the gutter and back", () => {
    const nearby: MakerAnchor[] = [
      { stage: "wardrobe", x: 1190, y: 2500, size: 135, scroll: 2000 },
      { stage: "work", x: 1250, y: 2620, size: 90, scroll: 2120 },
    ];
    for (let scroll = 2000; scroll <= 2120; scroll += 5) {
      const pose = sampleMakerJourney(nearby, scroll, 1440, false);
      expect(pose.x).toBeGreaterThanOrEqual(1190);
      expect(pose.x).toBeLessThanOrEqual(1250);
      expect(pose.size).toBeGreaterThanOrEqual(90);
      expect(pose.size).toBeLessThanOrEqual(135);
      expect(pose.docked).toBe(1);
    }
  });

  it("reverses without history-dependent jumps and stays continuous at every stop", () => {
    const forwards = [0, 100, 600, 1100, 1200, 1800, 2000].map((scroll) => sampleMakerJourney(anchors, scroll, 1440, false));
    const backwards = [2000, 1800, 1200, 1100, 600, 100, 0].map((scroll) => sampleMakerJourney(anchors, scroll, 1440, false)).reverse();
    expect(backwards).toEqual(forwards);
    const before = sampleMakerJourney(anchors, 1199.99, 1440, false);
    const after = sampleMakerJourney(anchors, 1200.01, 1440, false);
    expect(Math.abs(after.x - before.x)).toBeLessThan(0.01);
    expect(Math.abs(after.size - before.size)).toBeLessThan(0.01);
  });
});

describe("time-based sculpture response", () => {
  it.each([1 / 120, 1 / 60, 1 / 30])("bounds scale and angular movement at a %s second frame time", (dt) => {
    expect(dampMakerValue(500, 180, dt, 440)).toBeGreaterThanOrEqual(500 - 440 * dt);
    expect(dampMakerValue(-0.4, 0.4, dt, 0.65)).toBeLessThanOrEqual(-0.4 + 0.65 * dt);
  });

  it("retargets quickly without overshooting or carrying momentum in the wrong direction", () => {
    let position = 0;
    for (let frame = 0; frame < 8; frame++) position = dampMakerValue(position, 1, 1 / 60, 0.9);
    const reversal = dampMakerValue(position, 0, 1 / 60, 0.9);
    expect(reversal).toBeGreaterThan(0);
    expect(reversal).toBeLessThan(position);
    for (let frame = 0; frame < 180; frame++) {
      position = dampMakerValue(position, 0, 1 / 60, 0.9);
      expect(position).toBeGreaterThanOrEqual(0);
    }
    expect(position).toBe(0);
  });

  it("gives the same settled appearance at 30, 60 and 120 fps", () => {
    const results = [30, 60, 120].map(fps => {
      let value = 0;
      for (let frame = 0; frame < fps * 2; frame++) value = dampMakerValue(value, 1, 1 / fps, 0.9);
      return value;
    });
    expect(Math.max(...results) - Math.min(...results)).toBeLessThan(0.003);
    expect(Math.min(...results)).toBeGreaterThan(0.995);
  });
});
