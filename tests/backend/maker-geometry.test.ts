import { describe, expect, it } from "vitest";
import { createMakerGeometry } from "../../src/lib/maker-geometry";

describe("the single maker knot",()=>{
  it.each([false,true])("has one finite closed surface and unit normals (compact=%s)",compact=>{
    const geometry=createMakerGeometry(compact);
    expect(geometry.morphAttributes.position).toBeUndefined();
    const vertices=geometry.getAttribute("position"),normals=geometry.getAttribute("normal");
    for(let i=0;i<vertices.count;i++){
      expect(Number.isFinite(vertices.getX(i)+vertices.getY(i)+vertices.getZ(i))).toBe(true);
      expect(Math.hypot(vertices.getX(i),vertices.getY(i),vertices.getZ(i))).toBeLessThan(2.7);
      expect(Math.hypot(normals.getX(i),normals.getY(i),normals.getZ(i))).toBeCloseTo(1,4);
    }
    const {tubularSegments,radialSegments}=geometry.parameters;
    for(let side=0;side<=radialSegments;side++)for(const field of ["getX","getY","getZ"] as const){
      expect(vertices[field](tubularSegments*(radialSegments+1)+side)).toBeCloseTo(vertices[field](side),5);
    }
    geometry.dispose();
  });
  it("uses fewer than half the vertices on phones",()=>{
    const full=createMakerGeometry(),mobile=createMakerGeometry(true);
    expect(mobile.getAttribute("position").count).toBeLessThan(full.getAttribute("position").count/2);
    full.dispose();mobile.dispose();
  });
});
