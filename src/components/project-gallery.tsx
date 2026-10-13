"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { projects } from "@/lib/projects";
import { Arrow } from "./icons";
import { ProductVisual } from "./product-visual";

type Filter = "All work" | "Live" | "In the making";
export function ProjectGallery() {
  const [filter, setFilter] = useState<Filter>("All work");
  useEffect(() => {
    let active = true;
    const frame = requestAnimationFrame(() => {
      void import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => { if (active) ScrollTrigger.refresh(); }).catch(() => {});
    });
    return () => { active = false; cancelAnimationFrame(frame); };
  }, [filter]);
  const filtered = projects.filter((p) => filter === "All work" || (filter === "Live" ? p.status === "Live" : p.status === "Coming soon" || p.status === "In development" || p.status === "2027"));
  const cards = filtered.slice(0, 6);
  const rest = filtered.slice(6);
  return <>
    <div className="work-tools"><p>A few obsessions, brought to life.</p><div className="work-filters" aria-label="Filter projects">{(["All work", "Live", "In the making"] as Filter[]).map((item) => <button key={item} aria-pressed={filter === item} onClick={() => setFilter(item)}>{item}<span>{item === "All work" ? projects.length : projects.filter((p) => item === "Live" ? p.status === "Live" : p.status === "Coming soon" || p.status === "In development" || p.status === "2027").length}</span></button>)}</div></div>
    <p className="visually-hidden" aria-live="polite">Showing {filtered.length} {filter.toLowerCase()} projects.</p>
    <div className={`project-grid ${filter !== "All work" ? "is-filtered" : ""}`}>
      {cards.map((project, index) => <Link key={project.slug} href={`/projects/${project.slug}`} className={`project-card ${index < 2 ? "featured-card" : ""}`}>
        <div className="project-art" style={{ background: project.color, color: project.ink }}><ProductVisual project={project} large={index < 2} /><span className="project-open"><Arrow diagonal /></span></div>
        <div className="project-caption"><div><span className="project-number">{String(projects.indexOf(project) + 1).padStart(2, "0")} /</span><h3>{project.name}</h3></div><span className={`status ${project.status === "Live" ? "live" : ""}`}><i />{project.status}</span></div><p className="project-summary">{project.summary}</p>
      </Link>)}
    </div>
    {rest.length > 0 && <div className="more-work" data-reveal><div className="more-work-title"><span className="eyebrow">ALSO FROM MY CORNER OF THE INTERNET</span><span className="mini-label">{String(rest.length).padStart(2, "0")} MORE PROJECTS</span></div>{rest.map((project) => <Link href={`/projects/${project.slug}`} className="project-row" key={project.slug}><span className="row-number">{String(projects.indexOf(project) + 1).padStart(2, "0")}</span><h3>{project.name}</h3><span className="row-category">{project.category}</span><span className={`status ${project.status === "Live" ? "live" : ""}`}><i />{project.status}</span><Arrow diagonal /></Link>)}</div>}
  </>;
}
