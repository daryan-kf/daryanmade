import Image from "next/image";
import type { Locale } from "@/lib/i18n";
import type { CSSProperties } from "react";
import type { Project } from "@/lib/projects";
import styles from "./product-visual.module.css";
import { MakerMark } from "./icons";
import { HomeAppScreen, type HomeAppScreenKind } from "./home-app-screen";

type ProductVisualProps = { project: Project; large?: boolean; locale?: Locale };

function Mark({ project, inverse = false }: { project: Project; inverse?: boolean }) {
  return (
    <div className={`${styles.mark} ${inverse ? styles.inverse : ""}`}>
      {project.slug === "next-project" ? <MakerMark width={35} height={35} /> : <Image src={`/images/${project.slug}/icon.png`} alt="" width={40} height={40} sizes="40px" />}
      <span>{project.name}</span>
    </div>
  );
}

function Phone({ project, screen, className = "" }: { project: Project; screen: number; className?: string }) {
  const screens: Record<string, HomeAppScreenKind[]> = {
    "shield-family": ["shield-today", "shield-child", "shield-learn"],
    iqra: ["iqra-read", "iqra-prayer", "iqra-memorize"],
    vela: ["vela-today", "vela-talk", "vela-today"],
  };
  const kind = screens[project.slug]?.[screen - 1];
  const src = project.screenshots?.[screen - 1] || `/images/${project.slug}/screen-${screen}.webp`;
  return (
    <div className={`${styles.phone} ${className}`}>
      {kind ? <HomeAppScreen screen={kind} src={src} width={1000} height={2167} delay={(screen - 1) * 180} sizes="(max-width: 700px) 36vw, (max-width: 1100px) 24vw, 300px" /> : <Image src={src} alt="" width={1000} height={2167} sizes="(max-width: 700px) 36vw, (max-width: 1100px) 24vw, 300px" />}
      <span className={styles.phoneEdge} />
    </div>
  );
}

function BrowserBar({ label }: { label: string }) {
  return <div className={styles.browserBar}><span className={styles.browserDots}><i /><i /><i /></span><span>{label}</span><span className={styles.browserPlus}>+</span></div>;
}

function MobileScene({ project, large, locale = "en" }: ProductVisualProps) {
  const isIqra = project.slug === "iqra";
  const previews: Record<string, string> = { "Latest update preview": "Forhåndsvisning af seneste opdatering", "Read · Learn · Remember": "Læs · Lær · Husk", "Vela 2.0": "Vela 2.0" };
  const preview = project.previewLabel || "Interface preview";
  return (
    <>
      <div className={styles.halo} />
      <div className={styles.orbitLine} />
      <Mark project={project} />
      <span className={styles.previewLabel}>{locale === "da" ? previews[preview] || project.previewLabel || "Forhåndsvisning af brugerfladen" : preview}</span>
      <div className={styles.deviceAssembly} data-parallax>
        <Phone project={project} screen={2} className={styles.phoneBack} />
        <Phone project={project} screen={1} className={styles.phoneFront} />
        {large && <Phone project={project} screen={3} className={styles.phoneThird} />}
      </div>
      {isIqra && <span className={styles.arabicLetter} lang="ar">اقرأ</span>}
      {project.slug === "vela" && <span className={styles.velaWords}>{locale === "da" ? <>En dag<br />med retning.</> : <>A day<br />with direction.</>}</span>}
    </>
  );
}

function ResumeScene({ project }: { project: Project }) {
  return <>
    <div className={styles.resumeHalo} /><Mark project={project} />
    <div className={styles.currentWebWindow}>
      <BrowserBar label="kaizencv.com" />
      <Image src="/images/kaizencv/website-current.webp" alt="" width={1600} height={1000} sizes="(max-width: 700px) 90vw, 700px" />
    </div>
  </>;
}

function WardrobeScene({ project, locale = "en" }: ProductVisualProps) {
  return <>
    <div className={styles.fashionRule} /><Mark project={project} />
    <span className={styles.fashionWords}>{locale === "da" ? <>Din stil.<br /><em>På din måde.</em></> : <>Wear it.<br /><em>Your way.</em></>}</span>
    <div className={styles.wardrobePhone}><HomeAppScreen screen="wardrobe" src="/images/wardrobe/current-ui.webp" width={1000} height={2167} sizes="(max-width: 700px) 52vw, 360px" /></div>
    <div className={`${styles.fashionPhoto} ${styles.fashionShirt}`}><Image src="/images/wardrobe/hero.webp" alt="" fill sizes="(max-width: 700px) 28vw, 220px" /></div>
    <span className={styles.conceptLabel}>{locale === "da" ? "Under udvikling" : "In the making"}</span>
  </>;
}

function PropertyScene({ project }: { project: Project }) {
  return (
    <>
      <Image className={styles.propertyPhoto} src="/images/koebsklar/hero.webp" alt="" fill sizes="(max-width: 700px) 100vw, (max-width: 1100px) 80vw, 1100px" />
      <div className={styles.propertyWash} />
      <Mark project={project} inverse />
      <div className={styles.propertyWindow}>
        <BrowserBar label="koebsklar.vercel.app" />
        <Image src="/images/koebsklar/website-current.webp" alt="" width={1600} height={1000} sizes="(max-width: 700px) 85vw, 700px" />
      </div>
    </>
  );
}

function AgencyScene({ project }: { project: Project }) {
  return <>
    <div className={styles.agencyGrid} /><div className={styles.agencyOrbit} />
    <Mark project={project} inverse />
    <div className={styles.agencyWebsite}><BrowserBar label="sarpoli.com" /><Image src="/images/sarpoli/website-current.webp" alt="" width={1600} height={1000} sizes="(max-width: 700px) 90vw, 800px" /></div>
  </>;
}

function IdentityScene({ project, locale = "en" }: ProductVisualProps) {
  return (
    <>
      <div className={styles.identityGrid} />
      <div className={styles.identityCircle} />
      <Mark project={project} />
      <span className={styles.identityName}>{project.name}</span>
      <span className={styles.identityPhrase}>{project.summary}</span>
      <svg className={styles.identityRoute} viewBox="0 0 400 170" fill="none"><path d="M10 130C60 130 44 20 112 30c80 13 48 130 133 110 47-11 52-80 98-81" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 7" /><circle cx="10" cy="130" r="5" fill="currentColor" /><path d="m332 48 14 11-14 11" stroke="currentColor" strokeWidth="1.5" /></svg>
      <span className={styles.identityIndex}>{locale === "da" ? "Et projekt på vej" : "A project in the making"} <span>↗</span></span>
    </>
  );
}

export function ProductVisual({ project, large = false, locale = "en" }: ProductVisualProps) {
  const isMobile = ["shield-family", "iqra", "vela"].includes(project.slug);
  const concept = project.slug === "wardrobe";
  return (
    <div
      className={`${styles.scene} ${large ? styles.large : ""}`}
      data-project={project.slug}
      style={{ "--project-color": project.color, "--project-ink": project.ink } as CSSProperties}
      role="img"
      aria-label={locale === "da" ? `${project.name}: ${concept ? "forhåndsvisning af brugerflade under udvikling og stilbilleder" : isMobile ? "appens brugerflade" : "produktvisning"}` : `${project.name} ${concept ? "development interface preview and styling imagery" : isMobile ? "product interface" : "product preview"}`}
    >
      {project.slug === "next-project" ? <><Mark project={project} /><MakerMark className={styles.surpriseMark} /><span className={styles.surpriseYear}>2027</span><span className={styles.sceneNote}>{locale === "da" ? "Noget godt er ved at tage form." : "Something good is taking shape."}</span></> : isMobile ? <MobileScene project={project} large={large} locale={locale} />
        : project.slug === "kaizencv" ? <ResumeScene project={project} />
        : project.slug === "wardrobe" ? <WardrobeScene project={project} locale={locale} />
        : project.slug === "koebsklar" ? <PropertyScene project={project} />
        : project.slug === "sarpoli" ? <AgencyScene project={project} />
        : <IdentityScene project={project} locale={locale} />}
    </div>
  );
}

export default ProductVisual;
