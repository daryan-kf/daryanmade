"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Arrow, Check } from "./icons";
import type { Locale } from "@/lib/i18n";
import styles from "./project-story-scene.module.css";

type Story = "sarpoli" | "kaizencv" | "koebsklar";
const names: Record<Story, string> = { sarpoli: "Sarpoli", kaizencv: "KaizenCV", koebsklar: "Købsklar" };
const steps: Record<Story, string[]> = {
  sarpoli: ["Read the source", "Connect the details", "A person approves"],
  kaizencv: ["Find your story", "Shape your CV", "Make your next move"],
  koebsklar: ["Bring the case", "Follow the findings", "Review the advice"],
};
const danishSteps: Record<Story, string[]> = {
  sarpoli: ["Læs kilden", "Forbind detaljerne", "Et menneske godkender"],
  kaizencv: ["Find din historie", "Form dit CV", "Tag næste skridt"],
  koebsklar: ["Saml sagen", "Følg fundene", "Gennemgå rådene"],
};

function AgencyStory({ locale }: { locale: Locale }) {
  const da = locale === "da";
  return <div className={styles.workspace}>
    <div className={styles.sourceAssembly} data-story-source>
    <div className={`${styles.paper} ${styles.sourceBack}`} data-story-surface="back" aria-hidden="true"><span>{da ? "SAGSFIL / 02" : "CASE FILE / 02"}</span><i /><i /><i /></div>
    <div className={`${styles.paper} ${styles.source}`} data-story-surface="source">
      <div className={styles.paperTop}><span>{da ? "01 / KILDE" : "01 / ORIGINAL"}</span><span>{da ? "14 SIDER" : "14 PAGES"}</span></div>
      <h5>{da ? <>Service-<br />aftale.</> : <>Services<br />agreement.</>}</h5><p>{da ? <>Detaljerne skal findes.<br />Hver eneste gang.</> : <>Details worth finding.<br />Every single time.</>}</p>
      <span className={styles.sourceScanner} data-story-scan aria-hidden="true" /><div className={styles.documentLines} aria-hidden="true"><i /><i /><i data-story-highlight /><i /><i data-story-highlight /><i /></div>
      <div className={styles.sourceTag}>{da ? "Punkt 6.1" : "Clause 6.1"} <Arrow diagonal width={11} height={11} /></div>
    </div>
    </div>
    <div className={`${styles.resultPanel} ${styles.agencyResult}`} data-story-result data-story-surface="result">
      <div className={styles.resultHeader}><span className={styles.spark}>✳</span><span>{da ? "DET, DER ER VIGTIGT." : "THE USEFUL PART."}</span></div>
      <div className={styles.resultRow} data-story-field><span>{da ? "Månedligt honorar" : "Monthly fee"}<strong>{da ? "42.500 kr." : "42,500 kr."}</strong></span><small>{da ? "pkt. 6.1 ↗" : "cl. 6.1 ↗"}</small></div>
      <div className={styles.resultRow} data-story-field><span>{da ? "Opsigelsesvarsel" : "Notice period"}<strong>{da ? "6 måneder" : "6 months"}</strong></span><small>{da ? "pkt. 12.2 ↗" : "cl. 12.2 ↗"}</small></div>
      <div className={`${styles.resultRow} ${styles.uncertain}`} data-story-field><span>{da ? "Manglende bilag" : "Missing attachment"}<strong>{da ? "Bilag 2" : "Schedule 2"}</strong></span><small>{da ? "Tjek" : "Review"}</small></div>
      <div className={styles.approval} data-story-outcome><span><Check width={14} height={14} /></span><div>{da ? "Klar til din gennemgang." : "Ready for your review."}<small>{da ? "Beslutningen er stadig din." : "The decision stays with you."}</small></div></div>
    </div>
    <div className={styles.connector} aria-hidden="true"><span data-story-connector /><Arrow width={14} height={14} /></div>
    <span className={styles.sceneAnnotation}>{da ? "KILDEN ER ALTID MED." : "THE SOURCE NEVER DISAPPEARS."}</span>
  </div>;
}

function CareerStory({ locale }: { locale: Locale }) {
  const da = locale === "da";
  return <div className={styles.workspace}>
    <div className={styles.sourceAssembly} data-story-source>
    <div className={styles.resumeShadow} data-story-surface="back" aria-hidden="true" />
    <div className={styles.resume} data-story-surface="source"><div className={styles.resumeBar}><span>{da ? "DIN ERFARING, TYDELIGERE." : "YOUR EXPERIENCE, CLEARER."}</span><span>PDF</span></div><Image src="/images/kaizencv/screen-1.webp" width={1000} height={1415} alt={da ? "En KaizenCV-skabelon med profil, erfaring, kompetencer og uddannelse" : "A KaizenCV resume template with a professional summary, experience, skills and education"} sizes="(max-width: 700px) 65vw, 320px" /></div>
    </div>
    <div className={styles.coach} data-story-result data-story-surface="result"><div className={styles.resultHeader}><span className={styles.spark}>✳</span><span>{da ? "DIN AI-KARRIERECOACH" : "YOUR AI CAREER COACH"}</span></div><p>{da ? <>“Jeg ved, hvad jeg gjorde.<br />Hvordan sætter jeg ord på?”</> : <>“I know what I did.<br />How do I put it into words?”</>}</p><div className={styles.coachAnswer} data-story-field><span>{da ? "FORMULERET MERE PRÆCIST." : "A CLEARER WAY TO SAY IT."}</span><p className={styles.originalPhrase}>{da ? "Stod for den daglige drift." : "Managed daily operations."}<i data-story-edit aria-hidden="true" /></p><p className={styles.proposedPhrase} data-story-phrase>{da ? <>Ledte den daglige drift<br />på tværs af tre skift.</> : <>Led day-to-day operations<br />across three shifts.</>}</p></div><div className={styles.coachAction} data-story-field><Check width={13} height={13} /> {da ? "Gennemgå, før du bruger det" : "Review before you apply"}</div></div>
    <div className={styles.careerOutcome} data-story-outcome><span className={styles.outcomeIcon}><Arrow diagonal width={17} height={17} /></span><span>{da ? "Din historie. En stærkere ansøgning." : "Your story. A stronger application."}<small>{da ? "CV + ansøgning + næste skridt" : "CV + cover letter + next steps"}</small></span></div>
    <div className={styles.templateSwatches} aria-hidden="true"><i data-story-field /><i data-story-field /><i data-story-field /><span>{da ? "ET FORMAT, DER PASSER TIL DIG" : "A FORMAT THAT FEELS LIKE YOU"}</span></div>
  </div>;
}

function PropertyStory({ locale }: { locale: Locale }) {
  const da = locale === "da";
  return <div className={styles.workspace}>
    <div className={styles.caseFiles} data-story-source>
      {(da ? ["Købsaftale", "Tilstandsrapport", "Tingbog"] : ["Purchase agreement", "Condition report", "Land registry"]).map((label, i) => <div className={styles.caseFile} data-story-surface="source" key={label}><span className={styles.fileGlyph} aria-hidden="true">↳</span><div>{label}<small>{String(i + 1).padStart(2, "0")} / {da ? "SAGSDOKUMENT" : "CASE DOCUMENT"}</small></div><span className={styles.fileType}>PDF</span></div>)}
    </div>
    <div className={styles.caseReport} data-story-result data-story-surface="result">
      <div className={styles.reportHeader}><span className={styles.caseBadge}>K</span><div>{da ? "Én sag. Et klarere overblik." : "One case. A clearer picture."}<small>{da ? "ILLUSTRERET BOLIGGENNEMGANG" : "ILLUSTRATIVE PROPERTY REVIEW"}</small></div><span className={styles.reportDot} /></div>
      <div className={styles.finding} data-story-field><span className={styles.findingIndex}>01</span><div><strong>{da ? "En detalje at undersøge" : "A detail to investigate"}</strong><p>{da ? "Fugt bemærket i tagrummet." : "Moisture noted in the roof space."}</p><span>{da ? "Tilstandsrapport · s. 14 ↗" : "Condition report · p. 14 ↗"}</span></div></div>
      <div className={styles.finding} data-story-field><span className={styles.findingIndex}>02</span><div><strong>{da ? "En forskel at afklare" : "A difference to reconcile"}</strong><p>{da ? "Arealet er forskelligt i dokumenterne." : "Registered area differs across files."}</p><span>{da ? "BBR ↔ Tilstandsrapport ↗" : "BBR ↔ Condition report ↗"}</span></div></div>
      <div className={styles.deliverableRow} data-story-field><span>{da ? "Analyserapport" : "Analysis report"}</span><span>{da ? "Rådgivningsudkast" : "Draft advice"}</span><span>{da ? "Kilder" : "Sources"}</span></div>
    </div>
    <div className={styles.propertyOutcome} data-story-outcome><span className={styles.outcomeIcon}><Check width={16} height={16} /></span><span>{da ? "Forberedt af AI. Gennemgået af dig." : "Prepared by AI. Reviewed by you."}<small>{da ? "Din faglighed, hvor den gør en forskel." : "Your expertise, where it matters."}</small></span></div>
  </div>;
}

/** An explanatory sequence runs at a readable pace, independent of scroll velocity.
 * The DOM is complete without JavaScript; animation only rearranges the illustration.
 */
export function ProjectStoryScene({ story, locale = "en" }: { story: Story; locale?: Locale }) {
  const da = locale === "da";
  const root = useRef<HTMLDivElement>(null);
  const replay = useRef<(() => void) | null>(null);
  const [canReplay, setCanReplay] = useState(false);

  useEffect(() => {
    let disposed = false;
    let cleanup = () => {};
    Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([{ gsap }, { ScrollTrigger }]) => {
      const element = root.current;
      if (disposed || !element) return;
      gsap.registerPlugin(ScrollTrigger);
      const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
      let context: ReturnType<typeof gsap.context> | undefined;
      let timeline: ReturnType<typeof gsap.timeline> | undefined;
      let offscreen: IntersectionObserver | undefined;
      let globallyPaused = document.documentElement.dataset.makerMotion === "paused";
      let started = false;
      const configure = () => {
        context?.revert();
        offscreen?.disconnect();
        replay.current = null;
        setCanReplay(false);
        element.dataset.storyState = "complete";
        element.dataset.storyPhase = "complete";
        if (preference.matches || globallyPaused) return;
        context = gsap.context(() => {
          timeline = gsap.timeline({ paused: true, defaults: { duration: .8, ease: "power3.out" }, onStart: () => { element.dataset.storyState = "playing"; element.dataset.storyPhase = "1"; }, onComplete: () => { element.dataset.storyState = "complete"; element.dataset.storyPhase = "complete"; } });
          const highlights = element.querySelectorAll("[data-story-highlight]");
          const connectors = element.querySelectorAll("[data-story-connector]");
          const scanner = element.querySelector("[data-story-scan]");
          const edits = element.querySelectorAll("[data-story-edit]");
          const phrases = element.querySelectorAll("[data-story-phrase]");
          const preparation = element.querySelector("[data-story-preparation]");
          // Paper is opaque throughout. Move a whole document assembly on one
          // plane; never fade or rotate its individual sheets through each other.
          // The reading surfaces stay still while their useful details are found.
          timeline.from(element.querySelectorAll("[data-story-source]"), { y: 18, clipPath: "inset(0 0 100% 0)", duration: .9 }, 0)
            .call(() => { element.dataset.storyPhase = "2"; }, [], 1.2)
            .from(element.querySelectorAll("[data-story-result]"), { clipPath: "inset(0 100% 0 0 round 10px)", duration: .85, ease: "power2.inOut" }, 1.2)
            .from(element.querySelectorAll("[data-story-field]"), { y: 6, opacity: 0, stagger: .25, duration: .5 }, 1.8)
            .call(() => { element.dataset.storyPhase = "3"; }, [], 3.45)
            .from(element.querySelectorAll("[data-story-outcome]"), { y: 10, clipPath: "inset(0 0 100% 0)", duration: .7 }, 3.45);
          if (scanner) timeline.fromTo(scanner, { y: -28, opacity: 0 }, { y: 110, opacity: 1, duration: 1.45, ease: "power1.inOut" }, .8).to(scanner, { opacity: 0, duration: .2 }, 2.25);
          if (highlights.length) timeline.from(highlights, { scaleX: .05, transformOrigin: "left center", duration: .55, stagger: .4 }, 1.2);
          if (connectors.length) timeline.from(connectors, { scaleX: 0, transformOrigin: "left center", duration: .6 }, 1.1);
          if (edits.length) timeline.from(edits, { scaleX: 0, transformOrigin: "left center", duration: .5 }, 2.1);
          if (phrases.length) timeline.from(phrases, { clipPath: "inset(0 100% 0 0)", duration: .9, ease: "power2.inOut" }, 2.5);
          if (preparation) timeline.from(preparation, { scaleX: 1, transformOrigin: "left center", duration: 1.2, ease: "power2.inOut" }, 3.45);
          // A meaningful part of the demonstration must be visible before it
          // starts. Fast scrolling can skip a scene without forcing a catch-up.
          // A completed scene remains composed when approached in reverse.
          if (started) timeline.progress(1).pause();
          else element.dataset.storyState = "waiting";
          const settle = () => { started = true; timeline?.progress(1).pause(); };
          // IntersectionObserver alone misses a jump from entirely below to
          // entirely above the viewport. ScrollTrigger's cached bounds catch it.
          ScrollTrigger.create({ trigger: element, start: "top bottom", end: "bottom top", onLeave: settle });
          replay.current = () => { started = true; timeline?.restart(); };
          setCanReplay(true);
          offscreen = new IntersectionObserver(([entry]) => {
            if (!timeline || timeline.progress() === 1) return;
            const readableHeight = Math.min(260, entry.boundingClientRect.height * .44, (entry.rootBounds?.height ?? innerHeight) * .52);
            const readable = entry.isIntersecting && entry.intersectionRect.height >= readableHeight;
            if (entry.boundingClientRect.bottom <= 0) {
              settle();
            } else if (readable) {
              started = true;
              timeline.resume();
            } else timeline.pause();
          }, { threshold: [0, .2, .35, .5, .75, 1] });
          offscreen.observe(element);
        }, element);
      };
      const onPause = (event: Event) => { globallyPaused = Boolean((event as CustomEvent<{ paused: boolean }>).detail?.paused); configure(); };
      configure();
      preference.addEventListener("change", configure);
      window.addEventListener("maker-motion-change", onPause);
      cleanup = () => { preference.removeEventListener("change", configure); window.removeEventListener("maker-motion-change", onPause); offscreen?.disconnect(); context?.revert(); replay.current = null; };
    }).catch(() => { /* Static scenes remain complete if animation cannot load. */ });
    return () => { disposed = true; cleanup(); };
  }, []);

  return <div ref={root} lang={locale} className={`${styles.scene} ${styles[story]}`} data-project-story={story}>
    <div className={styles.sceneTop}><span>{da ? "IDÉEN I BEVÆGELSE" : "THE IDEA, IN MOTION"}</span><button type="button" onClick={() => replay.current?.()} disabled={!canReplay} aria-label={da ? `Afspil ${names[story]}-forløbet igen` : `Replay ${names[story]} workflow`}><span aria-hidden="true">↺</span> {da ? "Afspil igen" : "Replay"}</button></div>
    <div className={styles.sceneGrid} aria-hidden="true" />
    {story === "sarpoli" ? <AgencyStory locale={locale} /> : story === "kaizencv" ? <CareerStory locale={locale} /> : <PropertyStory locale={locale} />}
    {story === "koebsklar" && <div className={styles.preparation}><div><span>{da ? "MANUEL FORBEREDELSE" : "MANUAL PREPARATION"}</span><span>100% → <strong>{da ? "10–20% tilbage" : "10–20% remaining"}</strong></span></div><div className={styles.preparationTrack} aria-hidden="true"><span data-story-preparation /></div><small>{da ? "Viser den anslåede reduktion · afhænger af sagen" : "Illustrates the estimated reduction · case-dependent"}</small></div>}
    <ol className={styles.steps} aria-label={da ? `${names[story]}-forløb` : `${names[story]} workflow`}>{(da ? danishSteps : steps)[story].map((label, index) => <li key={label}><span>0{index + 1}</span>{label}</li>)}</ol>
    <span className={styles.sceneCaption}>{da ? "Illustreret arbejdsgang" : "Illustrated workflow"}{story === "sarpoli" ? (da ? " · Fiktivt eksempel" : " · Fictional example") : ""}</span>
  </div>;
}
