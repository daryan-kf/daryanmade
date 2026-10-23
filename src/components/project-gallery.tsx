"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { localePath, type Locale } from "@/lib/i18n";
import { getProject, projects, projectDestination, type Project } from "@/lib/projects";
import { portfolioCopy } from "@/lib/portfolio-copy";
import { entranceVisiblePixels } from "@/lib/scroll-entrance";
import { Arrow, MakerMark } from "./icons";
import styles from "./project-gallery.module.css";

const identities: Record<string, string> = {
  sarpoli: "/images/sarpoli/icon.png",
  vela: "/images/vela-site/icon.webp",
  wardrobe: "/images/twillby-site/mascot.png",
  kaizencv: "/images/kaizencv/icon.png",
  koebsklar: "/images/koebsklar/icon.png",
  "shield-family": "/images/shield-site/icon.webp",
  iqra: "/images/iqra-site/icon.webp",
};

function BrowserPreview({ project, locale }: { project: Project; locale: Locale }) {
  const da = locale === "da";
  return <div className={styles.browser}>
    <div className={styles.browserBar}><span className={styles.browserDots} aria-hidden="true"><i /><i /><i /></span><span>{new URL(project.url!).hostname}</span><span aria-hidden="true">↗</span></div>
    <Image src={`/images/${project.slug}/website-current.webp`} width={1600} height={1000} sizes="(max-width: 700px) 90vw, (max-width: 1100px) 55vw, 700px" alt={da ? `${project.name} — den aktuelle hjemmeside` : `${project.name} — the real website`} />
  </div>;
}

function ProjectPreview({ project, locale }: { project: Project; locale: Locale }) {
  const da = locale === "da";
  if (project.slug === "sarpoli") return <figure className={`${styles.visual} ${styles.sarpoliVisual}`}>
    <span className={styles.artLabel}>{da ? "FRA PAPIRARBEJDE TIL MULIGHEDER" : "FROM PAPERWORK TO POSSIBILITY"}</span>
    <span className={styles.sarpoliHalo} aria-hidden="true" />
    <BrowserPreview project={project} locale={locale} />
    <div className={styles.process} aria-hidden="true"><span>{da ? "Dokumenter" : "Documents"}</span><span>↗</span><span>{da ? "Klarhed" : "Clarity"}</span><span>↗</span><span>{da ? "Mennesker" : "People"}</span></div>
    <figcaption>{da ? "AI til det virkelige arbejde. Mennesker ved roret." : "AI for the actual work. People in control."}</figcaption>
  </figure>;

  if (project.slug === "vela") return <figure className={`${styles.visual} ${styles.velaVisual}`}>
    <span className={styles.artLabel}>{da ? "LIDT MERE PLADS I DIT HOVED" : "A LITTLE MORE ROOM IN YOUR HEAD"}</span>
    <span className={styles.velaDisc} aria-hidden="true" />
    <div className={styles.phonePair}>
      <Image className={styles.phoneBack} src="/images/vela-site/talk-to-vela.webp" width={900} height={1951} sizes="(max-width: 700px) 38vw, 230px" alt={da ? "Tal med Vela for at fange dine idéer og opgaver" : "Talk to Vela to capture ideas and tasks"} />
      <Image className={styles.phoneFront} src="/images/vela-site/today.webp" width={900} height={1951} sizes="(max-width: 700px) 43vw, 260px" alt={da ? "Vela samler dagens opgaver, fokus og kalender" : "Vela brings the day’s tasks, focus and calendar together"} />
    </div>
    <span className={styles.velaNote} aria-hidden="true">{da ? <>En tanke.<br />Et næste skridt.</> : <>A thought.<br />A next step.</>}</span>
    <figcaption>{da ? "Vela 2.0 · iPhone og iPad" : "Vela 2.0 · iPhone & iPad"}</figcaption>
  </figure>;

  if (project.slug === "wardrobe") return <figure className={`${styles.visual} ${styles.twillbyVisual}`}>
    <span className={styles.artLabel}>{da ? "GAMLE FAVORITTER. NYE MULIGHEDER." : "OLD FAVOURITES. NEW POSSIBILITIES."}</span>
    <span className={styles.closetDisc} aria-hidden="true" />
    <div className={`${styles.garment} ${styles.garmentOne}`} aria-hidden="true"><Image src="/images/twillby-site/coat.webp" width={383} height={720} sizes="120px" alt="" /><span>01 / {da ? "FAVORIT" : "FAVOURITE"}</span></div>
    <div className={`${styles.garment} ${styles.garmentTwo}`} aria-hidden="true"><Image src="/images/twillby-site/shirt.webp" width={539} height={720} sizes="110px" alt="" /><span>02 / {da ? "GENOPDAG" : "REDISCOVER"}</span></div>
    <Image className={styles.mascot} src="/images/twillby-site/mascot-closet.png" width={1254} height={1254} sizes="(max-width: 700px) 78vw, 480px" alt={da ? "Twillbys denimmascot med tøj fra garderoben" : "Twillby’s denim mascot with clothes from the closet"} />
    <figcaption>{da ? "App Store og Google Play · Kommer snart" : "App Store & Google Play · Coming soon"}</figcaption>
  </figure>;

  if (project.slug === "kaizencv" || project.slug === "koebsklar") return <figure className={`${styles.visual} ${styles.desktopVisual}`}>
    <span className={styles.artLabel}>{project.slug === "kaizencv" ? (da ? "DIT NÆSTE KAPITEL" : "YOUR NEXT CHAPTER") : (da ? "HELE SAGEN. ET KLARERE BILLEDE." : "THE WHOLE CASE. A CLEARER PICTURE.")}</span>
    <span className={styles.desktopBackdrop} aria-hidden="true" />
    <BrowserPreview project={project} locale={locale} />
    <figcaption>{da ? "Et kig ind i det rigtige produkt." : "A window into the real product."}</figcaption>
  </figure>;

  if (project.slug === "shield-family") return <figure className={`${styles.visual} ${styles.shieldVisual}`}>
    <span className={styles.artLabel}>{da ? "MINDRE FRIKTION. MERE FAMILIE." : "LESS FRICTION. MORE FAMILY."}</span>
    <div className={styles.campaignPair}>
      <Image src="/images/shield-site/day-01.webp" width={1206} height={2622} sizes="(max-width: 700px) 39vw, 240px" alt={da ? "Shield Family — familiens skærmtid og rutiner" : "Shield Family — family screen time and routines"} />
      <Image src="/images/shield-site/day-06.webp" width={1206} height={2622} sizes="(max-width: 700px) 39vw, 240px" alt={da ? "Shield Family — læring og tid til at lege" : "Shield Family — learning and time to play"} />
    </div>
    <figcaption>{da ? "Appvisninger · Eksempel på familiedata" : "App previews · Example family data"}</figcaption>
  </figure>;

  return <figure className={`${styles.visual} ${styles.iqraVisual}`}>
    <span className={styles.artLabel}>{da ? "EN LILLE DAGLIG PRAKSIS" : "A SMALL, DAILY PRACTICE"}</span>
    <span className={styles.iqraArch} aria-hidden="true" />
    <span className={styles.iqraWord} aria-hidden="true" lang="ar">اقرأ</span>
    <Image className={styles.iqraPhone} src="/images/iqra-site/read.webp" width={900} height={1951} sizes="(max-width: 700px) 40vw, 225px" alt={da ? "Læs Koranen i Iqra med arabisk tekst, translitteration og betydning" : "Read the Quran in Iqra with Arabic, transliteration and meaning"} />
    <figcaption>{da ? "Læs. Lyt. Vend tilbage." : "Read. Listen. Return."}</figcaption>
  </figure>;
}

function ProjectExhibit({ project, index, locale }: { project: Project; index: number; locale: Locale }) {
  const da = locale === "da";
  const t = portfolioCopy(locale);
  const destination = projectDestination(project, locale);
  const featured = index <= 3;
  return <article id={`project-${project.slug}`} className={`${styles.exhibit} ${featured ? styles.featured : styles.compact}`} data-project-card={project.slug} data-home-chapter={project.slug}>
    <div className={styles.exhibitMain}>
      <div className={styles.copy} data-reveal>
        <div className={styles.meta}><span>{String(index).padStart(2, "0")} / {project.category}</span><span className={styles.status}><i data-live={project.status === "Live"} />{project.slug === "vela" ? t("2.0 · Live") : t(project.status)}</span></div>
        <div className={styles.identity} data-reveal-item><span className={styles.identityMark}><Image src={identities[project.slug]} width={56} height={56} sizes="38px" alt="" /></span><h3>{project.name}</h3></div>
        <p className={styles.tagline} data-reveal-item>{project.summary}</p>
        <p className={styles.description} data-reveal-item><span className={styles.desktopDescription}>{project.description}</span><span className={styles.mobileDescription}>{project.mobileDescription ?? project.description}</span></p>
        <Link href={destination.href} data-project-link data-reveal-item className={styles.visit} {...(destination.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}><span>{destination.label}</span><span className={styles.actionArrow}><Arrow diagonal width={17} height={17} /></span>{destination.external && <span className={styles.srOnly}>{da ? " (åbner i en ny fane)" : " (opens in a new tab)"}</span>}</Link>
      </div>
      <ProjectPreview project={project} locale={locale} />
    </div>
    <details className={styles.details} onToggle={() => window.dispatchEvent(new Event("maker-layout-change"))}>
      <summary><span>{da ? "Idéen bag projektet" : "The idea behind it"}</span><span className={styles.plus} aria-hidden="true" /></summary>
      <div className={styles.story} data-project-panel>
        <div className={styles.storyIntro}><p className={styles.storyLabel}>{da ? "HVORFOR DET FINDES" : "WHY IT EXISTS"}</p><h4>{project.headline}</h4><p>{project.story}</p></div>
        <ul className={styles.features}>{project.features.map((feature, featureIndex) => <li key={feature.title}><span aria-hidden="true">0{featureIndex + 1}</span><div><strong>{feature.title}</strong><p>{feature.text}</p></div></li>)}</ul>
      </div>
    </details>
  </article>;
}

type ArtLayer = { element: HTMLElement; depth: number; base: string };
type ArtScene = {
  element: HTMLElement;
  card: HTMLElement;
  layers: ArtLayer[];
  visible: boolean;
  top: number;
  height: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetX: number;
  targetY: number;
  progress: number;
  targetProgress: number;
};

/** One demand-driven loop gives the art depth; reading and navigation stay still. */
function mountExhibitMotion(collection: HTMLDivElement) {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)");
  const easing = getComputedStyle(document.documentElement).getPropertyValue("--ease-out").trim() || "cubic-bezier(.23,1,.32,1)";
  let enabled = !reduced.matches && document.documentElement.dataset.makerMotion !== "paused";
  let disposed = false;
  let frame = 0;
  let lastTime = 0;
  let measure = true;
  const listeners: (() => void)[] = [];
  const revealed = new WeakSet<Element>();
  const entrances = new Set<Animation>();
  const disclosures = new Map<HTMLDetailsElement, { animation: Animation; fade: Animation; target: boolean }>();
  collection.dataset.galleryMotion = enabled ? "active" : "static";
  const layerDefinitions: [string, number][] = [
    [styles.browser, .65], [styles.phoneBack, .7], [styles.phoneFront, 1.1],
    [styles.mascot, .85], [styles.garment, .4], [styles.sarpoliHalo, -.55],
    [styles.velaDisc, -.6], [styles.closetDisc, -.55], [styles.desktopBackdrop, -.5],
    [styles.iqraArch, -.45], [styles.iqraWord, .25], [styles.iqraPhone, .9],
  ];
  const scenes: ArtScene[] = Array.from(collection.querySelectorAll<HTMLElement>("figure")).map(element => {
    const layers: ArtLayer[] = [];
    layerDefinitions.forEach(([className, depth]) => element.querySelectorAll<HTMLElement>(`.${className}`).forEach(layer => {
      const base = getComputedStyle(layer).transform;
      layer.dataset.artLayer = "";
      layers.push({ element: layer, depth, base: base === "none" ? "" : base });
    }));
    element.querySelectorAll<HTMLElement>(`.${styles.campaignPair} img`).forEach((layer, index) => {
      const base = getComputedStyle(layer).transform;
      layer.dataset.artLayer = "";
      layers.push({ element: layer, depth: index ? 1 : .65, base: base === "none" ? "" : base });
    });
    return { element, card: element.closest<HTMLElement>("[data-project-card]")!, layers, visible: false, top: 0, height: 1, x: 0, y: 0, vx: 0, vy: 0, targetX: 0, targetY: 0, progress: 0, targetProgress: 0 };
  });
  const cardEntrances = new Map<HTMLElement, Animation>();
  const cardStart = (scene: ArtScene) => `perspective(1400px) translate3d(0,64px,-90px) rotateX(9deg) rotateY(${scenes.indexOf(scene) % 2 ? -3 : 3}deg) scale(.94)`;
  function prepareCards() {
    if (!enabled) return;
    scenes.forEach(scene => {
      if (revealed.has(scene.element)) return;
      scene.card.style.opacity = "0";
      scene.card.style.visibility = "hidden";
      scene.card.style.transform = cardStart(scene);
      scene.card.style.transformOrigin = "center top";
    });
  }
  function settleCard(scene: ArtScene) {
    cardEntrances.get(scene.card)?.finish();
    scene.card.style.removeProperty("opacity");
    scene.card.style.removeProperty("visibility");
    scene.card.style.removeProperty("transform");
    scene.card.style.removeProperty("transform-origin");
  }
  prepareCards();

  function requestFrame() {
    if (!disposed && enabled && !document.hidden && !frame) frame = requestAnimationFrame(tick);
  }
  function tick(time: number) {
    frame = 0;
    if (disposed || !enabled || document.hidden) return;
    const dt = Math.min((time - (lastTime || time - 16)) / 1000, .032);
    lastTime = time;
    let settling = false;
    const readLayout = measure;
    measure = false;
    // Read every visible frame before writing transforms to avoid layout thrash.
    if (readLayout) scenes.forEach(scene => {
      if (!scene.visible) return;
      // Entrance transforms must not move their own scroll trigger. Read the
      // natural layout position, independently of the card's current tilt.
      let top = 0;
      let offset: HTMLElement | null = scene.element;
      while (offset) { top += offset.offsetTop; offset = offset.offsetParent as HTMLElement | null; }
      scene.top = top - scrollY;
      scene.height = scene.element.offsetHeight;
      scene.targetProgress = Math.max(-1, Math.min(1, (innerHeight / 2 - scene.top - scene.height / 2) / ((innerHeight + scene.height) / 2)));
    });
    scenes.forEach(scene => {
      if (!scene.visible) return;
      const visibleHeight = Math.min(innerHeight, scene.top + scene.height) - Math.max(0, scene.top);
      if (!revealed.has(scene.element) && visibleHeight >= entranceVisiblePixels(scene.height, innerHeight)) {
        revealed.add(scene.element);
        scene.element.dataset.artRevealed = "true";
        scene.card.style.visibility = "visible";
        if (document.documentElement.dataset.languageChanging !== "true") {
          window.dispatchEvent(new CustomEvent("studio-feedback", { detail: { kind: "reveal", note: scenes.indexOf(scene) } }));
          const entrance = scene.element.animate([
            { clipPath: "inset(9% 6% 9% 6% round 18px)", opacity: 0 },
            { clipPath: "inset(0% 0% 0% 0% round 0px)", opacity: 1 },
          ], { duration: 1200, easing });
          entrances.add(entrance);
          entrance.onfinish = () => entrances.delete(entrance);
          const cardEntrance = scene.card.animate([
            { transform: cardStart(scene), opacity: 0 },
            { transform: "perspective(1400px) translate3d(0,0,0) rotateX(0deg) rotateY(0deg) scale(1)", opacity: 1 },
          ], { duration: 1350, easing, fill: "forwards" });
          cardEntrances.set(scene.card, cardEntrance);
          cardEntrance.onfinish = () => {
            cardEntrances.delete(scene.card);
            settleCard(scene);
            cardEntrance.cancel();
            layoutChanged();
          };
        } else {
          settleCard(scene);
        }
      }
      // A lightly damped spring carries momentum when the pointer reverses.
      scene.vx = (scene.vx + (scene.targetX - scene.x) * 100 * dt) * Math.exp(-10 * dt);
      scene.vy = (scene.vy + (scene.targetY - scene.y) * 100 * dt) * Math.exp(-10 * dt);
      scene.x += scene.vx * dt;
      scene.y += scene.vy * dt;
      scene.progress += (scene.targetProgress - scene.progress) * (1 - Math.exp(-8 * dt));
      scene.layers.forEach(layer => {
        const x = scene.x * layer.depth * 11;
        const y = scene.progress * layer.depth * 52 + scene.y * layer.depth * 8;
        const rotateX = (scene.progress * 10 - scene.y * 4) * layer.depth;
        const rotateY = (scene.x * 6 + scene.progress * 4) * layer.depth;
        layer.element.style.transform = `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,${(layer.depth * 32).toFixed(2)}px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) ${layer.base}`;
      });
      settling ||= Math.abs(scene.targetProgress - scene.progress) > .001 || Math.abs(scene.targetX - scene.x) > .001 || Math.abs(scene.targetY - scene.y) > .001 || Math.abs(scene.vx) > .002 || Math.abs(scene.vy) > .002;
    });
    if (settling) requestFrame();
    else lastTime = 0;
  }
  function layoutChanged() { measure = true; requestFrame(); }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const scene = scenes.find(item => item.element === entry.target);
      if (!scene) return;
      scene.visible = entry.isIntersecting;
      if (!entry.isIntersecting && entry.boundingClientRect.bottom <= 0) {
        revealed.add(scene.element);
        settleCard(scene);
      }
      scene.layers.forEach(layer => { layer.element.style.willChange = entry.isIntersecting ? "transform" : ""; });
    });
    layoutChanged();
  }, { threshold: 0 });
  scenes.forEach(scene => {
    observer.observe(scene.element);
    const pointerMove = (event: PointerEvent) => {
      if (!enabled || !finePointer.matches || event.pointerType === "touch") return;
      const rect = scene.element.getBoundingClientRect();
      scene.targetX = Math.max(-1, Math.min(1, (event.clientX - rect.left) / rect.width * 2 - 1));
      scene.targetY = Math.max(-1, Math.min(1, (event.clientY - rect.top) / rect.height * 2 - 1));
      requestFrame();
    };
    const pointerLeave = () => { scene.targetX = 0; scene.targetY = 0; requestFrame(); };
    scene.element.addEventListener("pointermove", pointerMove, { passive: true });
    scene.element.addEventListener("pointerleave", pointerLeave, { passive: true });
    listeners.push(() => { scene.element.removeEventListener("pointermove", pointerMove); scene.element.removeEventListener("pointerleave", pointerLeave); });
  });

  function finishDisclosure(details: HTMLDetailsElement, target: boolean) {
    const current = disclosures.get(details);
    disclosures.delete(details);
    current?.animation.cancel();
    current?.fade.cancel();
    details.open = target;
    details.style.removeProperty("height");
    details.style.removeProperty("overflow");
    delete details.dataset.disclosureState;
    window.dispatchEvent(new Event("maker-layout-change"));
  }
  function disclose(event: MouseEvent) {
    const summary = (event.target as Element).closest("summary");
    const details = summary?.parentElement;
    if (!enabled || !summary || !(details instanceof HTMLDetailsElement) || !collection.contains(details)) return;
    const panel = details.querySelector<HTMLElement>("[data-project-panel]");
    if (!panel) return;
    event.preventDefault();
    const current = disclosures.get(details);
    const target = !(current?.target ?? details.open);
    window.dispatchEvent(new CustomEvent("studio-feedback", { detail: { kind: target ? "open" : "close" } }));
    const start = details.getBoundingClientRect().height;
    const opacity = current ? Number(getComputedStyle(panel).opacity) : target ? 0 : 1;
    current?.animation.cancel();
    current?.fade.cancel();
    details.open = true;
    details.style.height = `${start}px`;
    details.style.overflow = "hidden";
    details.dataset.disclosureState = target ? "opening" : "closing";
    const border = parseFloat(getComputedStyle(details).borderTopWidth) || 0;
    const end = summary.getBoundingClientRect().height + (target ? panel.getBoundingClientRect().height : 0) + border;
    const animation = details.animate([{ height: `${start}px` }, { height: `${end}px` }], { duration: target ? 360 : 300, easing, fill: "forwards" });
    const fade = panel.animate([{ opacity, transform: target ? "translateY(8px)" : "translateY(0)" }, { opacity: target ? 1 : 0, transform: target ? "translateY(0)" : "translateY(-5px)" }], { duration: target ? 320 : 220, easing, fill: "forwards" });
    disclosures.set(details, { animation, fade, target });
    animation.onfinish = () => { if (disclosures.get(details)?.animation === animation) finishDisclosure(details, target); };
  }
  collection.addEventListener("click", disclose);

  function modeChanged() {
    enabled = !reduced.matches && document.documentElement.dataset.makerMotion !== "paused";
    collection.dataset.galleryMotion = enabled ? "active" : "static";
    if (!finePointer.matches) scenes.forEach(scene => { scene.targetX = 0; scene.targetY = 0; });
    if (!enabled || document.hidden) {
      cancelAnimationFrame(frame);
      frame = 0;
      lastTime = 0;
      entrances.forEach(animation => animation.cancel());
      entrances.clear();
      scenes.forEach(settleCard);
      disclosures.forEach(({ target }, details) => finishDisclosure(details, target));
      scenes.forEach(scene => {
        scene.x = scene.y = scene.vx = scene.vy = scene.targetX = scene.targetY = scene.progress = 0;
        scene.layers.forEach(layer => { layer.element.style.removeProperty("transform"); layer.element.style.removeProperty("will-change"); });
      });
    } else {
      prepareCards();
      scenes.forEach(scene => scene.layers.forEach(layer => { layer.element.style.willChange = scene.visible ? "transform" : ""; }));
      layoutChanged();
    }
  }
  const resize = new ResizeObserver(layoutChanged);
  resize.observe(collection);
  window.addEventListener("scroll", layoutChanged, { passive: true });
  window.addEventListener("resize", layoutChanged, { passive: true });
  window.addEventListener("maker-motion-change", modeChanged);
  window.addEventListener("maker-layout-change", layoutChanged);
  document.addEventListener("visibilitychange", modeChanged);
  reduced.addEventListener("change", modeChanged);
  finePointer.addEventListener("change", modeChanged);
  return () => {
    disposed = true;
    cancelAnimationFrame(frame);
    observer.disconnect();
    resize.disconnect();
    listeners.forEach(remove => remove());
    entrances.forEach(animation => animation.cancel());
    cardEntrances.forEach(animation => animation.cancel());
    cardEntrances.clear();
    scenes.forEach(settleCard);
    disclosures.forEach(({ target }, details) => finishDisclosure(details, target));
    scenes.forEach(scene => scene.layers.forEach(layer => { layer.element.style.removeProperty("transform"); layer.element.style.removeProperty("will-change"); delete layer.element.dataset.artLayer; }));
    collection.removeEventListener("click", disclose);
    window.removeEventListener("scroll", layoutChanged);
    window.removeEventListener("resize", layoutChanged);
    window.removeEventListener("maker-motion-change", modeChanged);
    window.removeEventListener("maker-layout-change", layoutChanged);
    document.removeEventListener("visibilitychange", modeChanged);
    reduced.removeEventListener("change", modeChanged);
    finePointer.removeEventListener("change", modeChanged);
    delete collection.dataset.galleryMotion;
  };
}

export function ProjectGallery({ locale = "en" }: { locale?: Locale }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const collection = root.current;
    const navigation = collection?.querySelector<HTMLElement>("nav");
    if (!collection || !navigation) return;
    const links = Array.from(navigation.querySelectorAll<HTMLAnchorElement>("a"));
    const cards = Array.from(collection.querySelectorAll<HTMLElement>("[data-project-card]")).filter(card => card.dataset.projectCard !== "next-project");
    const visible = new Set<Element>();
    let current = "", touched = -Infinity;
    let observer: IntersectionObserver;
    let resizeTimer: ReturnType<typeof setTimeout>;
    const touch = () => { touched = performance.now(); };
    const observe = () => {
      observer?.disconnect(); visible.clear();
      observer = new IntersectionObserver(entries => {
        entries.forEach(entry => { if (entry.isIntersecting) visible.add(entry.target); else visible.delete(entry.target); });
        const card = cards.slice().reverse().find(item => visible.has(item));
        if (!card || current === card.id) return;
        current = card.id;
        collection.dataset.activeProject = card.dataset.projectCard;
        links.forEach(link => {
          if (link.hash === `#${current}`) link.setAttribute("aria-current", "location");
          else link.removeAttribute("aria-current");
        });
        if (innerWidth > 700 || performance.now() - touched < 1800) return;
        const link = links.find(item => item.hash === `#${current}`);
        if (!link) return;
        const bounds = link.getBoundingClientRect(), rail = navigation.getBoundingClientRect();
        if (bounds.left < rail.left + 10 || bounds.right > rail.right - 10) {
          const animate = !matchMedia("(prefers-reduced-motion: reduce)").matches && document.documentElement.dataset.makerMotion !== "paused";
          navigation.scrollTo({ left: link.offsetLeft - navigation.clientWidth / 2 + link.offsetWidth / 2, behavior: animate ? "smooth" : "instant" });
        }
      }, { rootMargin: `-84px 0px -${Math.round(innerHeight * .55)}px 0px`, threshold: 0 });
      cards.forEach(card => observer.observe(card));
    };
    const resize = () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(observe, 120); };
    observe();
    navigation.addEventListener("pointerdown", touch, { passive: true });
    navigation.addEventListener("keydown", touch);
    window.addEventListener("resize", resize, { passive: true });
    return () => {
      observer.disconnect(); clearTimeout(resizeTimer);
      navigation.removeEventListener("pointerdown", touch);
      navigation.removeEventListener("keydown", touch);
      window.removeEventListener("resize", resize);
    };
  }, [locale]);
  useEffect(() => {
    const collection = root.current;
    if (!collection) return;
    let release: (() => void) | undefined;
    // Keep gallery setup out of the hero's first paint; static HTML is complete.
    const nearby = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      nearby.disconnect();
      release = mountExhibitMotion(collection);
    }, { rootMargin: "400px 0px" });
    nearby.observe(collection);
    return () => { nearby.disconnect(); release?.(); };
  }, [locale]);
  const da = locale === "da";
  const collection = projects.filter(project => project.slug !== "next-project").map(project => getProject(project.slug, locale)!);
  const next = getProject("next-project", locale)!;
  return <div ref={root} className={styles.collection} data-project-index>
    <div className={styles.indexHeading} data-reveal><span>{da ? "SYV PROJEKTER. ÉN NYSGERRIGHED." : "SEVEN PROJECTS. ONE CURIOSITY."}</span><p>{da ? "Følg din nysgerrighed." : "Follow your curiosity."}<span aria-hidden="true">↘</span></p></div>
    <nav className={styles.projectNavigation} data-reveal aria-label={da ? "Gå til et projekt" : "Jump to a project"}>{collection.map((project, index) => <a key={project.slug} href={`#project-${project.slug}`}><span>{String(index + 1).padStart(2, "0")}</span>{project.name}</a>)}</nav>
    <div className={styles.exhibits}>{collection.map((project, index) => <ProjectExhibit key={project.slug} project={project} index={index + 1} locale={locale} />)}</div>
    <article className={styles.next} data-project-card="next-project" data-reveal data-home-chapter="next-project"><span className={styles.nextNumber}>08 / {da ? "PÅ TEGNEBRÆTTET" : "ON THE DRAWING BOARD"}</span><div className={styles.nextHeading}><MakerMark width={42} height={42} /><h3>{next.summary}</h3></div><Link href={localePath("/projects/next-project", locale)} data-project-link><span>{da ? "Næste projekt · 2027" : "Next project · 2027"}</span><Arrow diagonal width={20} height={20} /></Link></article>
  </div>;
}
