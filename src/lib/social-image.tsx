import { ImageResponse } from "next/og";
import type { Project } from "./projects";

export async function socialImage(project?: Project) {
  const ink = project?.ink || "#242520";
  const paper = project?.color || "#f4f2eb";
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: paper, color: ink, padding: "52px 62px", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 22, letterSpacing: -1 }}><div style={{ display: "flex", alignItems: "center", gap: 12 }}><svg width="30" height="30" viewBox="0 0 40 40"><path d="M20 3v34M3 20h34M8 8l24 24M8 32 32 8" stroke={project ? ink : "#bd4327"} strokeWidth="5" /></svg><span>daryanmade.</span></div><span style={{ fontSize: 15, letterSpacing: 0 }}>{project ? project.status : "Daryan Kamalifar · Founder at Sarpoli"}</span></div>
      <div style={{ display: "flex", flex: 1, flexDirection: "column", justifyContent: "center" }}>{project ? <><span style={{ fontSize: 22, marginBottom: 18 }}>{project.category}</span><span style={{ fontSize: 88, letterSpacing: -5, lineHeight: 1.1 }}>{project.name}</span><span style={{ fontSize: 34, letterSpacing: -1, lineHeight: 1.4, maxWidth: 1020, marginTop: 22 }}>{project.headline}</span></> : <><span style={{ fontSize: 112, letterSpacing: -7, lineHeight: 1.1 }}>Good ideas.</span><div style={{ display: "flex", fontSize: 112, letterSpacing: -7, lineHeight: 1.1 }}><span>Made</span><span style={{ fontFamily: "sans-serif", fontSize: 126, color: "#bd4327", marginLeft: 25 }}>real.</span></div></>}</div>
      <div style={{ display: "flex", justifyContent: "space-between", borderTop: `1px solid ${ink}40`, paddingTop: 20, fontSize: 15 }}><span>{project ? "Designed & developed by Daryan Kamalifar" : "Thoughtful products. Real-world purpose."}</span><span>{project ? `daryanmade / ${project.slug}` : "Explore the work →"}</span></div>
    </div>,
    { width: 1200, height: 630 }
  );
}
