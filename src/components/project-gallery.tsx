import type { CSSProperties } from "react";
import Link from "next/link";
import { getProject, projectDestination, type Project } from "@/lib/projects";
import { AppleIcon, Arrow } from "./icons";
import { ProductVisual } from "./product-visual";
import styles from "./project-gallery.module.css";

const groups = [
  { id: "agency", title: "Agency", note: "The place where I build for others.", slugs: ["sarpoli"] },
  { id: "web-apps", title: "Web apps", note: "Purpose-built tools, right in your browser.", slugs: ["kaizencv", "koebsklar"] },
  { id: "mobile-apps", title: "Mobile apps", note: "A little more intention in your every day.", slugs: ["shield-family", "iqra", "vela", "wardrobe"] },
  { id: "next-chapter", title: "Next chapter", note: "Keeping a little room for surprise.", slugs: ["next-project"] },
];

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const destination = projectDestination(project);
  const agency = project.slug === "sarpoli";
  const next = project.slug === "next-project";
  return <article className={`${styles.card} ${agency ? styles.agency : ""} ${next ? styles.next : ""}`} data-project-card={project.slug} data-reveal style={{ "--card-color": project.color, "--card-ink": project.ink } as CSSProperties}>
    <Link href={destination.href} className={styles.mainLink} data-project-link aria-label={`${project.name} — ${destination.label}`} {...(destination.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
      <div className={styles.art}><ProductVisual project={project} large={agency || project.slug === "shield-family"} /><span className={styles.open}><Arrow diagonal /></span></div>
      <div className={styles.copy}>
        <div className={styles.meta}><span>{String(index).padStart(2, "0")} / {agency ? "FOUNDER" : project.category}</span><span className={styles.status}><i data-live={project.status === "Live"} />{project.status === "Coming soon" ? "Very soon" : project.status}</span></div>
        <div className={styles.title}><h4>{project.name}</h4>{agency && <span>My AI agency</span>}</div>
        <p className={styles.summary}>{project.summary}</p>
        {!next && <p className={styles.description}>{project.description}</p>}
        {agency && <span className={styles.agencyAction}>Explore Sarpoli <Arrow diagonal width={18} height={18} /></span>}
      </div>
    </Link>
    <div className={styles.bottom}>
      <div className={styles.tags}>{(next ? ["Something good is taking shape."] : project.tags.slice(0, 2)).map(tag => <span key={tag}>{tag}</span>)}</div>
      {project.storeUrl ? <a href={project.storeUrl} target="_blank" rel="noopener noreferrer" className={styles.store} aria-label={`Download ${project.name} on the App Store`}><AppleIcon width={20} height={23} /><span><small>Download on the</small>App Store</span><Arrow diagonal width={14} height={14} /></a> : <Link href={destination.href} className={styles.textAction} {...(destination.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{destination.label}<Arrow diagonal width={14} height={14} /></Link>}
    </div>
  </article>;
}

export function ProjectGallery() {
  let index = 0;
  return <div className={styles.collection}>
    <nav className={styles.directory} aria-label="Project categories" data-reveal><span>THE WHOLE COLLECTION</span><div>{groups.map(group => <a key={group.id} href={`#${group.id}`}>{group.title}<span>{String(group.slugs.length).padStart(2, "0")}</span></a>)}</div></nav>
    {groups.map((group, groupIndex) => <section className={styles.group} id={group.id} aria-labelledby={`${group.id}-title`} key={group.id}>
      <div className={styles.groupHeading} data-reveal><span className={styles.groupIndex}>0{groupIndex + 1}</span><h3 id={`${group.id}-title`}>{group.title}<span> / {String(group.slugs.length).padStart(2, "0")}</span></h3><p>{group.note}</p></div>
      <div className={styles.grid}>{group.slugs.map(slug => { const project = getProject(slug)!; return <ProjectCard key={slug} project={project} index={++index} />; })}</div>
    </section>)}
  </div>;
}
