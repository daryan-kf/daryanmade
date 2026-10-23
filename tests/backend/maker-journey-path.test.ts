import { describe, expect, it } from "vitest";
import { sampleMakerFlow, type MakerFlowLayout } from "../../src/lib/maker-journey-path";

const layout: MakerFlowLayout = { width:1440, height:1000, hero:{x:1040,y:450,size:530,bottom:920}, work:{top:1000,bottom:2450} };

describe("the scroll-driven maker current",()=>{
  it("starts as the unchanged hero knot in document space",()=>{
    expect(sampleMakerFlow(layout,0)).toMatchObject({x:1040,y:450,size:530,phase:0});
    expect(sampleMakerFlow(layout,20).y).toBe(430);
  });
  it("recedes to the background edge while the compact index is read",()=>{
    const pose=sampleMakerFlow(layout,1200);
    expect(pose.size).toBe(122);
    expect(pose.x).toBeGreaterThan(layout.width-45);
    expect(pose.y).toBeGreaterThan(400);
    expect(pose.y).toBeLessThan(550);
    expect(sampleMakerFlow(layout,layout.work.bottom).size).toBe(0);
  });
  it("has no state-dependent lag on reversal or direct scroll jumps",()=>{
    const positions=[0,200,800,1300,1800,2500];
    expect(positions.map(y=>sampleMakerFlow(layout,y))).toEqual(positions.toReversed().map(y=>sampleMakerFlow(layout,y)).reverse());
    for(let y=0;y<2500;y+=2){
      const a=sampleMakerFlow(layout,y),b=sampleMakerFlow(layout,y+.001);
      for(const key of ["x","y","size","rotation","phase"] as const)expect(Math.abs(a[key]-b[key])).toBeLessThan(.1);
    }
  });
  it("keeps the phase tied to scroll when opening a project changes the index height",()=>{
    const normal=sampleMakerFlow(layout,1300);
    const expanded=sampleMakerFlow({...layout,work:{...layout.work,bottom:3000}},1300);
    expect(expanded.phase).toBe(normal.phase);
    expect(expanded.size).toBe(122);
    expect(Number.isFinite(expanded.x+expanded.y)).toBe(true);
  });
  it("adapts the background placement to phones and toolbar resizing",()=>{
    const mobile:MakerFlowLayout={width:390,height:844,hero:{x:195,y:740,size:340,bottom:1000},work:{top:1050,bottom:2700}};
    expect(sampleMakerFlow(mobile,0)).toMatchObject({x:195,y:740,size:340});
    for(const height of [720,844,900]){
      const pose=sampleMakerFlow({...mobile,height},1500);
      expect(pose.size).toBe(94);
      expect(pose.x).toBeGreaterThan(390);
      expect(pose.y).toBeLessThan(height);
    }
  });
});
