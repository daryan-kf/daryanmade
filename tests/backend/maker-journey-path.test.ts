import { describe, expect, it } from "vitest";
import { MAKER_STAGES } from "../../src/lib/maker-geometry";
import { dampMakerValue, resolveMakerWeights, sampleMakerJourney, type MakerAnchor, type MakerPose } from "../../src/lib/maker-journey-path";

const anchors: MakerAnchor[] = [
  { stage: "hero", x: 1000, y: 420, size: 500, scroll: 0 },
  { stage: "sarpoli", x: 950, y: 1620, size: 260, scroll: 1200 },
  { stage: "vela", x: 330, y: 2420, size: 220, scroll: 2000 },
];
const weightsFor = (pose: MakerPose) => {
  const weights = new Array<number>(MAKER_STAGES.length).fill(0);
  weights[pose.from] = 1 - pose.morph;
  weights[pose.to] += pose.morph;
  return weights;
};

describe("the continuous sculpture journey", () => {
  it("holds the source, morphs during departure and travel, and completes before arrival", () => {
    for (const scroll of [0, 100, 350, 360]) expect(sampleMakerJourney(anchors, scroll, 1440, false).morph).toBe(0);
    let previous = 0;
    for (const progress of [.4, .55, .7, .8]) {
      const pose = sampleMakerJourney(anchors, 1200 * progress, 1440, false);
      expect(pose.morph).toBeGreaterThan(previous);
      expect(pose.morph).toBeLessThan(1);
      previous = pose.morph;
    }
    expect(sampleMakerJourney(anchors, 1200 * .86, 1440, false).morph).toBe(1);
    const arrived = sampleMakerJourney(anchors, 1080, 1440, false);
    expect(arrived.x).toBe(anchors[1].x);
    expect(arrived.size).toBe(anchors[1].size);
    expect(arrived.docked).toBe(1);
    for (const scroll of [1080, 1100, 1199, 1200, 1400]) expect(weightsFor(sampleMakerJourney(anchors, scroll, 1440, false))[MAKER_STAGES.indexOf("sarpoli")]).toBe(1);
  });

  it("keeps location and size continuous through departure, crossing, arrival and stage changes", () => {
    const bands = [{ y: 2020, height: 100 }];
    for (let scroll = 0; scroll <= 2000; scroll += .5) {
      const before = sampleMakerJourney(anchors, scroll, 1440, false, undefined, bands);
      const after = sampleMakerJourney(anchors, scroll + .001, 1440, false, undefined, bands);
      expect(Math.abs(before.x - after.x)).toBeLessThan(.1);
      expect(Math.abs(before.y - after.y)).toBeLessThan(.1);
      expect(Math.abs(before.size - after.size)).toBeLessThan(.1);
      const firstWeights = weightsFor(before), nextWeights = weightsFor(after);
      expect(Math.max(...firstWeights.map((weight, index) => Math.abs(weight - nextWeights[index])))).toBeLessThan(.001);
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

  it("morphs continuously across the direct same-row Shield Family to Iqra move", () => {
    const pair: MakerAnchor[] = [
      { stage: "shield-family", x: 420, y: 3100, size: 220, scroll: 2340 },
      { stage: "iqra", x: 1000, y: 3100, size: 220, scroll: 2820 },
    ];
    let previous = 0;
    for (let scroll = 2340; scroll <= 2820; scroll += 10) {
      const pose = sampleMakerJourney(pair, scroll, 1440, false);
      expect(pose.x).toBeGreaterThanOrEqual(420);
      expect(pose.x).toBeLessThanOrEqual(1000);
      expect(pose.y).toBe(3100 - scroll);
      expect(pose.size).toBe(220);
      expect(pose.crossing).toBe(false);
      const incoming = weightsFor(pose)[MAKER_STAGES.indexOf("iqra")];
      expect(incoming).toBeGreaterThanOrEqual(previous);
      if (scroll < 2340 + 480 * .28) expect(incoming).toBe(0);
      else if (scroll < 2772) { expect(incoming).toBeGreaterThan(0); expect(incoming).toBeLessThan(1); }
      else expect(incoming).toBe(1);
      previous = incoming;
    }
  });

  it("reverses the same continuous morph and returns to a complete source logo", () => {
    const target = MAKER_STAGES.indexOf("sarpoli");
    let previous = 1;
    for (let scroll = 1200; scroll >= 0; scroll -= 5) {
      const incoming = weightsFor(sampleMakerJourney(anchors, scroll, 1440, false))[target];
      expect(incoming).toBeLessThanOrEqual(previous);
      previous = incoming;
    }
    expect(previous).toBe(0);
  });

  it("resolves a recognizable endpoint before the last two percent of docking", () => {
    const out: number[] = [];
    expect(resolveMakerWeights([.99, .01], out)).toBe(0);
    expect(out).toEqual([1, 0]);
    expect(resolveMakerWeights([.01, .99], out)).toBe(1);
    expect(out).toEqual([0, 1]);
  });

  it("keeps rendered weights continuous, normalized and convex during interrupted journeys", () => {
    let previous = [1, 0, 0];
    for (let step = 0; step <= 1000; step++) {
      const progress = step / 1000;
      const out: number[] = [];
      resolveMakerWeights([1 - progress, progress * .65, progress * .35], out);
      expect(out.reduce((sum, weight) => sum + weight, 0)).toBeCloseTo(1, 12);
      for (let i = 0; i < out.length; i++) {
        expect(out[i]).toBeGreaterThanOrEqual(0);
        expect(out[i]).toBeLessThanOrEqual(1);
        expect(Math.abs(out[i] - previous[i])).toBeLessThan(.005);
      }
      previous = out;
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
