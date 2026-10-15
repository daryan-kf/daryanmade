import { describe, expect, it } from "vitest";
import { createMakerGeometry, MAKER_STAGES } from "../../src/lib/maker-geometry";

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
