import { portfolioCopy } from "@/lib/portfolio-copy";
import { localePath, type Locale } from "@/lib/i18n";
import { Fragment, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { getProject, projectDestination, type Project } from "@/lib/projects";
import { AppleIcon, Arrow } from "./icons";
import { MakerFallback } from "./maker-journey";
import { ProductVisual } from "./product-visual";
import { ProjectStoryScene } from "./project-story-scene";
import styles from "./project-gallery.module.css";

const groupsFor = (locale: Locale) => { const t = portfolioCopy(locale); return [
  { id: "agency", title: t("Agency"), note: t("Built with people. For the work they do."), slugs: ["sarpoli"] },
  { id: "featured", title: t("A new chapter"), note: t("New ways to make the everyday feel better."), slugs: ["vela", "wardrobe"] },
  { id: "web-apps", title: t("Web apps"), note: t("Useful tools for the next step."), slugs: ["kaizencv", "koebsklar"] },
  { id: "mobile-apps", title: t("Mobile apps"), note: t("A little more intention. Wherever life happens."), slugs: ["shield-family", "iqra"] },
  { id: "next-chapter", title: t("Next chapter"), note: t("Always leave a little room for possibility."), slugs: ["next-project"] },
]; };

function Status({ project, locale }: { project: Project; locale: Locale }) {
  const t = portfolioCopy(locale);
  return <span className={styles.status}><i data-live={project.status === "Live"} />{project.slug === "vela" ? t("2.0 · Live") : t(project.status)}</span>;
}

function AgencyCard({ project, index, locale }: { project: Project; index: number; locale: Locale }) {
  const t = portfolioCopy(locale);
  return <article className={`${styles.card} ${styles.agency}`} data-project-card={project.slug}>
    <div className={styles.agencyLink}>
      <div className={styles.agencyCopy} data-reveal>
        <div className={styles.meta}><span>0{index} {t("/ FOUNDER")}</span><Status project={project} locale={locale} /></div>
        <div className={styles.agencyIdentity}><span className={styles.agencyLogo}><Image src="/images/sarpoli/icon.png" width={44} height={44} alt="" /></span><h4>Sarpoli</h4></div>
        <p className={styles.agencyHeadline}>{t("Give good people")}<br /><em>{t("their time back.")}</em></p>
        <p className={styles.agencyDescription}>{t("I founded Sarpoli to build AI around the work people actually do. Alongside lawyers, accountants and property teams, we turn piles of documents into a clear next step.")}</p>
        <p className={styles.agencyDescription}>{t("Case files read. Contract terms found. Invoice details lifted into the right place. Every field has a source; every important decision stays with a person.")}</p>
        <div className={styles.sectors}><span>{t("Law firms")}</span><span>{t("Accounting teams")}</span><span>{t("Property administration")}</span></div>
        <a href={project.url} target="_blank" rel="noopener noreferrer" data-project-link aria-label={t("Sarpoli — Visit Sarpoli")} className={styles.agencyAction}>{t("See what we build at Sarpoli")} <span><Arrow diagonal /></span></a>
      </div>
      <div className={styles.agencyArt}>
        <div className={styles.agencyOrbit} data-maker-anchor="sarpoli"><MakerFallback variant="sarpoli" /></div>
        <ProjectStoryScene locale={locale} story="sarpoli" />
      </div>
    </div>
    <div className={styles.agencyImpact}>
      <div data-reveal><span>{t("01 / LESS SEARCHING")}</span><h5>{t("The detail finds you.")}</h5><p>{t("Key terms, deadlines and amounts surface with the page they came from. Less reopening the same files.")}</p></div>
      <div data-reveal><span>{t("02 / LESS RE-ENTERING")}</span><h5>{t("One reading. More uses.")}</h5><p>{t("Useful information moves into the workflow your team already uses, instead of another copy-and-paste task.")}</p></div>
      <div data-reveal><span>{t("03 / MORE CERTAINTY")}</span><h5>{t("Judgment stays human.")}</h5><p>{t("Missing details and uncertainty stay visible. Your team reviews the work before it has consequences.")}</p></div>
    </div>
  </article>;
}

function WebShowcase({ project, index, locale }: { project: Project; index: number; locale: Locale }) {
  const t = portfolioCopy(locale);
  const isCareer = project.slug === "kaizencv";
  return <article className={`${styles.card} ${styles.webShowcase} ${isCareer ? styles.career : styles.property}`} data-project-card={project.slug}>
    <div className={styles.webBody}>
      <div className={styles.webCopy} data-reveal>
        <div className={styles.meta}><span>0{index} / {project.category}</span><Status project={project} locale={locale} /></div>
        <div className={styles.webIdentity}><Image src={`/images/${project.slug}/icon.png`} width={38} height={38} alt="" /><h4>{project.name}</h4></div>
        <p className={styles.webHeadline}>{isCareer ? <>{t("Your experience.")}<br /><em>{t("Its best expression.")}</em></> : <>{t("A whole case.")}<br /><em>{t("The details that matter.")}</em></>}</p>
        <p className={styles.webDescription}>{isCareer ? t("You have the experience. KaizenCV helps you find the words. Work with an AI coach, shape a CV around the role, and turn a daunting application into a clear next step.") : t("Built for Danish property lawyers. Købsklar reads the purchase agreement, reports and supporting documents together, then brings the findings, sources and draft advice into one review.")}</p>
        {!isCareer && <div className={styles.saving}><strong>80–90<span>%</span></strong><div>{t("less manual preparation.")}<small>{t("Estimated reduction, depending on the case.")}<br />{t("Professional review remains essential.")}</small></div></div>}
        <a href={project.url} target="_blank" rel="noopener noreferrer" className={styles.webAction} data-project-link aria-label={`${project.name} — ${locale === "da" ? "Besøg" : "Visit"} ${project.name}`}>{t("Explore")} {project.name}<span><Arrow diagonal /></span></a>
      </div>
      <div className={styles.webArt}><div className={`${styles.projectOrbit} ${isCareer ? styles.careerOrbit : styles.propertyOrbit}`} data-maker-anchor={isCareer ? "kaizencv" : "koebsklar"}><MakerFallback variant={isCareer ? "kaizencv" : "koebsklar"} /></div><ProjectStoryScene locale={locale} story={isCareer ? "kaizencv" : "koebsklar"} /></div>
    </div>
    <div className={styles.webFeatures}>
      {(isCareer ? [
        ["01", t("A coach, not a blank page."), t("Import your CV, unpack your experience, and review suggestions before they become your words.")],
        ["02", t("Made for the opportunity."), t("Tailor a CV and cover letter to the role. Choose a template, then export a considered application.")],
        ["03", t("Keep the next step in sight."), t("Track applications and prepare for conversations with role-specific interview preparation in beta.")],
      ] : [
        ["01", t("Findings you can trace."), t("Follow every key fact to its document and page. Conflicting details across files are brought into view.")],
        ["02", t("The groundwork, prepared."), t("An analysis report, draft legal assessment, advisory letter and document overview, ready for your review.")],
        ["03", t("Time for the advice."), t("Typically 10–20 minutes for processing. Spend your attention on checking the case and advising the buyer.")],
      ]).map(([number, title, text]) => <div key={number} data-reveal><span>{number}</span><h5>{title}</h5><p>{text}</p></div>)}
    </div>
  </article>;
}

function VelaCard({ project, index, locale }: { project: Project; index: number; locale: Locale }) {
  const t = portfolioCopy(locale);
  return <article className={`${styles.card} ${styles.vela}`} data-project-card="vela">
    <Link href={localePath("/vela", locale)} data-project-link aria-label={t("Vela — Explore Vela")} className={styles.velaLink}>
      <div className={styles.velaCopy} data-reveal>
        <div className={styles.meta}><span>0{index} {t("/ A NEW CHAPTER")}</span><Status project={project} locale={locale} /></div>
        <div className={styles.velaIdentity}><Image src="/images/vela-site/icon.webp" alt="" width={48} height={48} /><h4>Vela</h4></div>
        <p className={styles.velaHeadline}>{t("A mind full.")}<br /><em>{t("A day, clear.")}</em></p>
        <p className={styles.velaDescription}>{t("Say what’s on your mind. Give it a place in your day. An AI planner for your tasks, ideas and the things you want to become.")}</p>
        <span className={styles.velaAction}>{t("Explore Vela 2.0")} <span><Arrow diagonal /></span></span>
        <span className={styles.previewNote}>{t("Vela 2.0 · Available for iPhone & iPad")}</span>
      </div>
      <div className={styles.velaArt} data-home-device-stack>
        <div className={styles.velaSun} /><div className={styles.velaArc} />
        <div className={styles.velaOrbit} data-maker-anchor="vela"><MakerFallback variant="vela" /></div>
        <div className={`${styles.velaPhone} ${styles.velaPhoneBack}`} data-home-phone="back"><Image src="/images/vela-site/talk-to-vela.webp" alt={t("Vela 2.0 interface: talk to Vela and review proposed changes")} width={1290} height={2796} sizes="(max-width: 700px) 42vw, 280px" /></div>
        <div className={`${styles.velaPhone} ${styles.velaPhoneFront}`} data-home-phone="front"><Image src="/images/vela-site/today.webp" alt={t("Vela 2.0 interface: today’s plan and priorities")} width={1290} height={2796} sizes="(max-width: 700px) 48vw, 310px" /></div>
        <span className={styles.velaCaption}>{t("ONE SENTENCE.")}<br /><em>{t("Your day, planned.")}</em></span>
      </div>
    </Link>
  </article>;
}

function WardrobeCard({ project, index, locale }: { project: Project; index: number; locale: Locale }) {
  const t = portfolioCopy(locale);
  return <article className={`${styles.card} ${styles.wardrobe}`} data-project-card="wardrobe" data-project-disabled="true" aria-disabled="true">
    <div className={styles.wardrobeImage}><Image src="/images/wardrobe/current-ui.webp" width={1000} height={2167} alt={t("A development glimpse of Wardrobe’s outfit styling interface")} sizes="180px" /></div>
    <div className={styles.wardrobeCopy}><span className={styles.wardrobeEyebrow}>0{index} {t("/ QUIETLY TAKING SHAPE")}</span><h4>{project.name}</h4><p>{t("Your closet. A fresh perspective.")}<br />{t("A more thoughtful way to get dressed is in the making.")}</p></div>
    <div className={styles.wardrobeEnd}><span className={styles.comingSoon}><span aria-hidden="true">◷</span> {t("Coming soon")}</span><div className={styles.wardrobeOrbit} data-maker-anchor="wardrobe"><MakerFallback variant="wardrobe" /></div></div>
  </article>;
}

function ProjectCard({ project, index, locale }: { project: Project; index: number; locale: Locale }) {
  const t = portfolioCopy(locale);
  if (project.slug === "sarpoli") return <AgencyCard project={project} index={index} locale={locale} />;
  if (["kaizencv", "koebsklar"].includes(project.slug)) return <WebShowcase project={project} index={index} locale={locale} />;
  if (project.slug === "vela") return <VelaCard project={project} index={index} locale={locale} />;
  if (project.slug === "wardrobe") return <WardrobeCard project={project} index={index} locale={locale} />;
  const destination = projectDestination(project, locale);
  const next = project.slug === "next-project";
  return <article className={`${styles.card} ${next ? styles.next : ""}`} data-project-card={project.slug} style={{ "--card-color": project.color, "--card-ink": project.ink } as CSSProperties}>
    <Link href={destination.href} className={styles.mainLink} data-project-link aria-label={`${project.name} — ${destination.label}`} {...(destination.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
      <div className={styles.art} data-reveal><ProductVisual locale={locale} project={project} large={project.slug === "shield-family"} /><span className={styles.open}><Arrow diagonal /></span></div>
      <div className={styles.copy} data-reveal><div className={styles.meta}><span>{String(index).padStart(2, "0")} / {project.category}</span><Status project={project} locale={locale} /></div><h4>{project.name}</h4><p className={styles.summary}>{project.summary}</p>{!next && <p className={styles.description}>{project.description}</p>}</div>
    </Link>
    {!next && <div className={styles.bottom}><Link href={destination.href} className={styles.textAction} {...(destination.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{destination.label}<Arrow diagonal width={16} height={16} /></Link>{project.storeUrl && <a href={project.storeUrl} target="_blank" rel="noopener noreferrer" className={styles.store} aria-label={locale === "da" ? `Hent ${project.name} i App Store` : `Download ${project.name} on the App Store`}><AppleIcon width={17} height={20} /><span>App Store</span><Arrow diagonal width={12} height={12} /></a>}</div>}
  </article>;
}

export function ProjectGallery({ locale = "en" }: { locale?: Locale }) {
  const t = portfolioCopy(locale);
  const groups = groupsFor(locale);
  let index = 0;
  return <div className={styles.collection}>
    <nav className={styles.directory} aria-label={t("Project categories")}><span>{t("THE COLLECTION / 08")}</span><div>{groups.map(group => <a key={group.id} href={`#${group.id}`}>{group.title}<span>{String(group.slugs.length).padStart(2, "0")}</span></a>)}</div></nav>
    {groups.map((group, groupIndex) => <section className={styles.group} id={group.id} aria-labelledby={`${group.id}-title`} key={group.id}>
      <div className={styles.crossing} data-maker-crossing aria-hidden="true" /><div className={styles.groupHeading}><span className={styles.groupIndex} data-reveal>0{groupIndex + 1}</span><h3 id={`${group.id}-title`} data-reveal>{group.title}</h3><p data-reveal>{group.note}</p>{group.id === "web-apps" && <div className={styles.workOrbit} data-maker-anchor="work"><MakerFallback variant="work" /></div>}</div>
      <div className={styles.grid}>{group.slugs.map((slug, position) => <Fragment key={slug}>{group.id === "web-apps" && position > 0 && <div className={styles.webCrossing} data-maker-crossing aria-hidden="true" />}<ProjectCard project={getProject(slug, locale)!} locale={locale} index={++index} /></Fragment>)}</div>
    </section>)}
  </div>;
}
