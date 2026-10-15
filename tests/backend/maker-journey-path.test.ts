import { describe, expect, it } from "vitest";
import { MAKER_STAGES } from "../../src/lib/maker-geometry";
import { dampMakerValue, sampleMakerJourney, type MakerAnchor } from "../../src/lib/maker-journey-path";

const anchors: MakerAnchor[] = [
  { stage: "hero", x: 1000, y: 420, size: 500, scroll: 0 },
  { stage: "sarpoli", x: 950, y: 1620, size: 260, scroll: 1200 },
  { stage: "vela", x: 330, y: 2420, size: 220, scroll: 2000 },
];
const selectedStage = (scroll: number) => {
  const pose = sampleMakerJourney(anchors, scroll, 1440, false);
  return MAKER_STAGES[pose.morph === 1 ? pose.to : pose.from];
};

describe("the continuous sculpture journey", () => {
  it("holds the complete current logo until the next art slot is reached", () => {
    for (const scroll of [0, 100, 350, 600, 900, 1079]) expect(selectedStage(scroll)).toBe("hero");
    for (const scroll of [1080, 1100, 1199, 1200, 1500]) expect(selectedStage(scroll)).toBe("sarpoli");
    const arrived = sampleMakerJourney(anchors, 1080, 1440, false);
    expect(arrived.x).toBe(anchors[1].x);
    expect(arrived.size).toBe(anchors[1].size);
    expect(arrived.docked).toBe(1);
    for (let scroll = 0; scroll < 2000; scroll += 17) {
      expect([0, 1]).toContain(sampleMakerJourney(anchors, scroll, 1440, false).morph);
    }
  });

  it("keeps location and size continuous through departure, crossing, arrival and stage changes", () => {
    const bands = [{ y: 2020, height: 100 }];
    for (let scroll = 0; scroll <= 2000; scroll += .5) {
      const before = sampleMakerJourney(anchors, scroll, 1440, false, undefined, bands);
      const after = sampleMakerJourney(anchors, scroll + .001, 1440, false, undefined, bands);
      expect(Math.abs(before.x - after.x)).toBeLessThan(.1);
      expect(Math.abs(before.y - after.y)).toBeLessThan(.1);
      expect(Math.abs(before.size - after.size)).toBeLessThan(.1);
    }
  });

  it("holds at the first slot before departing and travels around the middle of the viewport", () => {
    const held = sampleMakerJourney(anchors, 1200 * .29, 1440, false);
    expect(held.x).toBe(anchors[0].x);
    expect(held.size).toBe(anchors[0].size);
    expect(held.y - held.size * .5).toBeGreaterThanOrEqual(24);
    const travelling = sampleMakerJourney(anchors, 1200 * .6, 1440, false);
    expect(travelling.y).toBe(420);
    expect(travelling.x).toBeGreaterThanOrEqual(1400);
    expect(travelling.x + travelling.size * .5).toBeLessThan(1440);
    expect(travelling.size).toBe(72);
  });

  it("moves directly between same-row Shield Family and Iqra while holding the source logo", () => {
    const pair: MakerAnchor[] = [
      { stage: "shield-family", x: 420, y: 3100, size: 220, scroll: 2340 },
      { stage: "iqra", x: 1000, y: 3100, size: 220, scroll: 2820 },
    ];
    for (let scroll = 2340; scroll <= 2820; scroll += 10) {
      const pose = sampleMakerJourney(pair, scroll, 1440, false);
      expect(pose.x).toBeGreaterThanOrEqual(420);
      expect(pose.x).toBeLessThanOrEqual(1000);
      expect(pose.y).toBe(3100 - scroll);
      expect(pose.size).toBe(220);
      expect(pose.crossing).toBe(false);
      expect(pose.morph).toBe(scroll < 2772 || scroll === 2820 ? 0 : 1);
    }
  });

  it("bounds time-based following and retargets without overshoot", () => {
    const forward = dampMakerValue(0, 1, 1 / 30, .4);
    expect(forward).toBeLessThanOrEqual(.4 / 30);
    const reverse = dampMakerValue(forward, 0, 1 / 30, .4);
    expect(reverse).toBeGreaterThanOrEqual(0);
    expect(reverse).toBeLessThan(forward);
  });
});
