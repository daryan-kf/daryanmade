import Image from "next/image";
import type { CSSProperties } from "react";
import type { Project } from "@/lib/projects";
import styles from "./product-visual.module.css";
import { MakerMark } from "./icons";

type ProductVisualProps = { project: Project; large?: boolean };

function Mark({ project, inverse = false }: { project: Project; inverse?: boolean }) {
  return (
    <div className={`${styles.mark} ${inverse ? styles.inverse : ""}`}>
      {project.slug === "next-project" ? <MakerMark width={35} height={35} /> : <Image src={`/images/${project.slug}/icon.png`} alt="" width={40} height={40} sizes="40px" />}
      <span>{project.name}</span>
    </div>
  );
}

function Phone({ slug, screen, className = "" }: { slug: string; screen: number; className?: string }) {
  return (
    <div className={`${styles.phone} ${className}`}>
      <Image src={`/images/${slug}/screen-${screen}.webp`} alt="" width={1000} height={2167} sizes="(max-width: 700px) 36vw, (max-width: 1100px) 24vw, 300px" />
      <span className={styles.phoneEdge} />
    </div>
  );
}

function BrowserBar({ label }: { label: string }) {
  return <div className={styles.browserBar}><span className={styles.browserDots}><i /><i /><i /></span><span>{label}</span><span className={styles.browserPlus}>+</span></div>;
}

function MobileScene({ project, large }: ProductVisualProps) {
  const isShield = project.slug === "shield-family";
  const isIqra = project.slug === "iqra";
  return (
    <>
      <div className={styles.halo} />
      <div className={styles.orbitLine} />
      <Mark project={project} />
      <span className={styles.previewLabel}>{isShield ? "Development preview" : "Interface preview"}</span>
      <span className={styles.sceneNote}>{isShield ? "A little learning. A little more play." : isIqra ? "One verse at a time." : "Find your everyday rhythm."}</span>
      <div className={styles.deviceAssembly}>
        <Phone slug={project.slug} screen={2} className={styles.phoneBack} />
        <Phone slug={project.slug} screen={1} className={styles.phoneFront} />
        {large && <Phone slug={project.slug} screen={3} className={styles.phoneThird} />}
      </div>
      {isIqra && <span className={styles.arabicLetter} lang="ar">اقرأ</span>}
      {project.slug === "vela" && <span className={styles.velaWords}>A day<br />with direction.</span>}
    </>
  );
}

function ResumeScene({ project }: { project: Project }) {
  return (
    <>
      <div className={styles.resumeHalo} />
      <Mark project={project} />
      <div className={styles.resumeWindow}>
        <BrowserBar label="A little more you." />
        <div className={styles.resumeShelf}>
          {[2, 3, 1].map((screen, i) => (
            <div className={`${styles.resumePaper} ${styles[`resumePaper${i}`]}`} key={screen}>
              <Image src={`/images/kaizencv/screen-${screen}.webp`} alt="" width={1000} height={1415} sizes="(max-width: 700px) 45vw, (max-width: 1100px) 32vw, 400px" />
            </div>
          ))}
        </div>
      </div>
      <div className={styles.resumeSeal}><span>YOUR NEXT</span><svg viewBox="0 0 40 40"><path d="m20 2 3.7 12.4L36 10l-8.6 10L36 30l-12.3-4.4L20 38l-3.7-12.4L4 30l8.6-10L4 10l12.3 4.4Z" fill="currentColor" /></svg><span>CHAPTER</span></div>
    </>
  );
}

function WardrobeScene({ project }: { project: Project }) {
  return (
    <>
      <div className={styles.fashionRule} />
      <Mark project={project} />
      <span className={styles.fashionWords}>Wear it.<br /><em>Your way.</em></span>
      <div className={`${styles.fashionPhoto} ${styles.fashionMain}`}><Image src="/images/wardrobe/screen-1.webp" alt="" fill sizes="(max-width: 700px) 48vw, 400px" /></div>
      <div className={`${styles.fashionPhoto} ${styles.fashionSecond}`}><Image src="/images/wardrobe/screen-2.webp" alt="" fill sizes="(max-width: 700px) 32vw, 300px" /></div>
      <div className={`${styles.fashionPhoto} ${styles.fashionShirt}`}><Image src="/images/wardrobe/hero.webp" alt="" fill sizes="(max-width: 700px) 28vw, 220px" /></div>
      <span className={styles.conceptLabel}>Concept imagery</span>
    </>
  );
}

function PropertyScene({ project }: { project: Project }) {
  return (
    <>
      <Image className={styles.propertyPhoto} src="/images/koebsklar/hero.webp" alt="" fill sizes="(max-width: 700px) 100vw, (max-width: 1100px) 80vw, 1100px" />
      <div className={styles.propertyWash} />
      <Mark project={project} inverse />
      <div className={styles.propertyWindow}>
        <BrowserBar label="koebsklar.vercel.app" />
        <Image src="/images/koebsklar/website.webp" alt="" width={1600} height={900} sizes="(max-width: 700px) 85vw, 700px" />
      </div>
    </>
  );
}

function AgencyScene({ project }: { project: Project }) {
  return (
    <>
      <Image className={styles.agencyPhoto} src="/images/sarpoli/hero.webp" alt="" fill sizes="(max-width: 700px) 100vw, 1000px" />
      <div className={styles.agencyWash} />
      <Mark project={project} />
      <span className={styles.agencyWords}>Ideas,<br /><em>put to work.</em></span>
      <span className={styles.agencyServices}>Websites · Tools · Automation</span>
      <svg className={styles.agencyDiagram} viewBox="0 0 200 200" fill="none"><circle cx="100" cy="100" r="83" stroke="currentColor" strokeWidth="1" /><path d="M17 100h166M100 17v166M41 41l118 118M41 159 159 41" stroke="currentColor" strokeWidth="1" /><circle cx="100" cy="100" r="29" fill="currentColor" /><circle cx="100" cy="100" r="18" fill="#e7e3d4" /></svg>
    </>
  );
}

function IdentityScene({ project }: { project: Project }) {
  return (
    <>
      <div className={styles.identityGrid} />
      <div className={styles.identityCircle} />
      <Mark project={project} />
      <span className={styles.identityName}>{project.name}</span>
      <span className={styles.identityPhrase}>{project.summary}</span>
      <svg className={styles.identityRoute} viewBox="0 0 400 170" fill="none"><path d="M10 130C60 130 44 20 112 30c80 13 48 130 133 110 47-11 52-80 98-81" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 7" /><circle cx="10" cy="130" r="5" fill="currentColor" /><path d="m332 48 14 11-14 11" stroke="currentColor" strokeWidth="1.5" /></svg>
      <span className={styles.identityIndex}>A project in the making <span>↗</span></span>
    </>
  );
}

export function ProductVisual({ project, large = false }: ProductVisualProps) {
  const isMobile = ["shield-family", "iqra", "vela"].includes(project.slug);
  const concept = project.slug === "wardrobe";
  return (
    <div
      className={`${styles.scene} ${large ? styles.large : ""}`}
      data-project={project.slug}
      style={{ "--project-color": project.color, "--project-ink": project.ink } as CSSProperties}
      role="img"
      aria-label={`${project.name} ${concept ? "concept imagery" : isMobile ? "development preview" : "product preview"}`}
    >
      {project.slug === "next-project" ? <><Mark project={project} /><MakerMark className={styles.surpriseMark} /><span className={styles.surpriseYear}>2027</span><span className={styles.sceneNote}>Something good is taking shape.</span></> : isMobile ? <MobileScene project={project} large={large} />
        : project.slug === "kaizencv" ? <ResumeScene project={project} />
        : project.slug === "wardrobe" ? <WardrobeScene project={project} />
        : project.slug === "koebsklar" ? <PropertyScene project={project} />
        : project.slug === "sarpoli" ? <AgencyScene project={project} />
        : <IdentityScene project={project} />}
    </div>
  );
}

export default ProductVisual;
