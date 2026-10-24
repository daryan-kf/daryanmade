"use client";

import Image from "next/image";
import Link from "next/link";
import { Fragment, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import type { Locale } from "@/lib/i18n";
import { contact, getProject, projects, projectDestination, type Project } from "@/lib/projects";
import { portfolioCopy } from "@/lib/portfolio-copy";
import { deviceSketch, type DeviceKind } from "@/lib/sketch-path";
import { Arrow } from "./icons";
import styles from "./work-story.module.css";

type Words = { en: string; da: string };
type Shot = { src: string; width: number; height: number; alt: Words };
type Chapter = { question: Words; caption: Words; device: DeviceKind; shot?: Shot; extras?: Shot[]; notes: [Words, Words]; wash?: string; ink?: string };

const identities: Record<string, string> = {
  sarpoli: "/images/sarpoli/icon.png",
  vela: "/images/vela-site/icon.webp",
  wardrobe: "/images/twillby-site/mascot.png",
  kaizencv: "/images/kaizencv/icon.png",
  koebsklar: "/images/koebsklar/icon.png",
  "shield-family": "/images/shield-site/icon.webp",
  iqra: "/images/iqra-site/icon.webp",
};

const website = (slug: string, name: string): Shot => ({ src: `/images/${slug}/website-current.webp`, width: 1600, height: 1000, alt: { en: `${name} — the real website`, da: `${name} — den aktuelle hjemmeside` } });

/** Every project began as a question. The sketch is the idea; the screen is what it became. */
const chapters: Record<string, Chapter> = {
  sarpoli: {
    question: { en: "What if paperwork gave time back?", da: "Hvad hvis papirarbejde gav tid tilbage?" },
    caption: { en: "AI for the actual work. People in control.", da: "AI til det virkelige arbejde. Mennesker ved roret." },
    device: "browser", shot: website("sarpoli", "Sarpoli"),
    notes: [{ en: "documents in", da: "dokumenter ind" }, { en: "people decide", da: "mennesker beslutter" }],
  },
  vela: {
    question: { en: "What if a thought could plan your day?", da: "Hvad hvis en tanke kunne planlægge din dag?" },
    caption: { en: "Vela 2.0 · iPhone & iPad", da: "Vela 2.0 · iPhone og iPad" },
    device: "phone",
    shot: { src: "/images/vela-site/today.webp", width: 900, height: 1951, alt: { en: "Vela brings the day’s tasks, focus and calendar together", da: "Vela samler dagens opgaver, fokus og kalender" } },
    extras: [{ src: "/images/vela-site/talk-to-vela.webp", width: 900, height: 1951, alt: { en: "Talk to Vela turns one sentence into changes to review", da: "Tal med Vela gør én sætning til ændringer, du kan gennemgå" } }],
    notes: [{ en: "just say it", da: "bare sig det" }, { en: "Top 3, not a backlog", da: "Top 3, ikke en bunke" }],
  },
  wardrobe: {
    question: { en: "What if your next outfit was already yours?", da: "Hvad hvis dit næste outfit allerede var dit?" },
    caption: { en: "App Store & Google Play · Coming soon", da: "App Store og Google Play · Kommer snart" },
    device: "polaroid",
    shot: { src: "/images/twillby-site/mascot-closet.png", width: 1254, height: 1254, alt: { en: "Twillby’s denim mascot with clothes from the closet", da: "Twillbys denimmascot med tøj fra garderoben" } },
    extras: [
      { src: "/images/twillby-site/coat.webp", width: 383, height: 720, alt: { en: "A saved coat in the closet", da: "En gemt frakke i garderoben" } },
      { src: "/images/twillby-site/shirt.webp", width: 539, height: 720, alt: { en: "A saved shirt in the closet", da: "En gemt skjorte i garderoben" } },
    ],
    notes: [{ en: "your own closet", da: "dit eget skab" }, { en: "coming soon", da: "kommer snart" }],
  },
  kaizencv: {
    question: { en: "What if your CV told your real story?", da: "Hvad hvis dit CV fortalte din rigtige historie?" },
    caption: { en: "A window into the real product.", da: "Et kig ind i det rigtige produkt." },
    device: "browser", shot: website("kaizencv", "KaizenCV"),
    notes: [{ en: "your real experience", da: "din egen erfaring" }, { en: "tailored to the role", da: "tilpasset jobbet" }],
  },
  koebsklar: {
    question: { en: "What if every finding showed its source?", da: "Hvad hvis hvert fund viste sin kilde?" },
    caption: { en: "A window into the real product.", da: "Et kig ind i det rigtige produkt." },
    device: "browser", shot: website("koebsklar", "Købsklar"),
    notes: [{ en: "every finding, sourced", da: "hvert fund med kilde" }, { en: "the lawyer decides", da: "advokaten beslutter" }],
  },
  "shield-family": {
    question: { en: "What if screen time felt fair?", da: "Hvad hvis skærmtid føltes fair?" },
    caption: { en: "App previews · Example family data", da: "Appvisninger · Eksempel på familiedata" },
    device: "phone",
    shot: { src: "/images/shield-family/screen-1.webp", width: 1000, height: 2167, alt: { en: "Shield Family — each child’s time and requests in one parent view", da: "Shield Family — hvert barns tid og anmodninger samlet for forælderen" } },
    extras: [{ src: "/images/shield-site/today.webp", width: 1170, height: 2532, alt: { en: "Shield Family — a child’s day and setup", da: "Shield Family — et barns dag og opsætning" } }],
    notes: [{ en: "learning earns time", da: "læring giver tid" }, { en: "one family plan", da: "én fælles plan" }],
  },
  iqra: {
    question: { en: "What if the Quran felt within reach?", da: "Hvad hvis Koranen føltes inden for rækkevidde?" },
    caption: { en: "Read. Listen. Return.", da: "Læs. Lyt. Vend tilbage." },
    device: "phone",
    shot: { src: "/images/iqra-site/read.webp", width: 900, height: 1951, alt: { en: "Read the Quran in Iqra with Arabic, transliteration and meaning", da: "Læs Koranen i Iqra med arabisk tekst, translitteration og betydning" } },
    extras: [{ src: "/images/iqra-site/prayer.webp", width: 900, height: 1951, alt: { en: "Iqra prayer times for the day", da: "Iqras bedetider for dagen" } }],
    notes: [{ en: "word by word", da: "ord for ord" }, { en: "every feature free", da: "alle funktioner gratis" }],
  },
  // The finale: the question is classified, and the knot sketched for it lights up.
  "next-project": {
    question: { en: "What if", da: "Hvad hvis" },
    caption: { en: "Somewhere new. Mid-2027.", da: "Et nyt sted. Midt i 2027." },
    device: "mark", wash: "#100f0d", ink: "#f3ede2",
    notes: [{ en: "pack light", da: "pak let" }, { en: "bring friends", da: "tag vennerne med" }],
  },
};

function Pencil() {
  return <svg viewBox="0 0 66 12" aria-hidden="true"><path d="M0 6 6.2 3.5v5Z" fill="#2b2a25" /><path d="M6.2 3.5 16 0v12L6.2 8.5Z" fill="#ecd2a6" /><rect x="16" width="38" height="12" fill="var(--accent)" /><rect x="16" y="4" width="38" height="3.4" fill="#fff" opacity=".18" /><rect x="54" width="5" height="12" fill="#c8c1b2" /><rect x="59" width="7" height="12" rx="2.2" fill="#e8a59c" /></svg>;
}

function StoryFigure({ project, chapter, index, locale, near }: { project: Project; chapter: Chapter; index: number; locale: Locale; near: boolean }) {
  // Once the story is close, every chapter loads, so the pinned stage never waits for an image.
  const loading = near ? "eager" : undefined;
  const say = (words: Words) => locale === "da" ? words.da : words.en;
  const sketch = deviceSketch(chapter.device, index * 11 + 3);
  const screen = sketch.screen;
  const percent = (value: number, total: number) => `${(value / total * 100).toFixed(3)}%`;
  return <figure className={styles.figure} data-story-figure data-device={chapter.device} aria-label={project.slug === "next-project" ? say(chapter.caption) : undefined}>
    <span className={styles.numeral} data-n={String(index + 1).padStart(2, "0")} aria-hidden="true" />
    <div className={styles.stageArt}>
      {chapter.extras?.map((shot, extra) => <div key={shot.src} className={styles.extra} data-extra={extra}><Image src={shot.src} width={shot.width} height={shot.height} sizes="(max-width: 960px) 30vw, 220px" alt={say(shot.alt)} loading={loading} /></div>)}
      <div className={styles.device} style={{ aspectRatio: `${sketch.width} / ${sketch.height}`, "--radius": `${((screen?.radius ?? 0) / sketch.width * 100).toFixed(2)}cqw` } as CSSProperties}>
        <svg className={styles.sketch} viewBox={`0 0 ${sketch.width} ${sketch.height}`} aria-hidden="true">
          {sketch.guides.map((d, guide) => <path key={guide} className={styles.guide} d={d} pathLength={1} />)}
          <path className={styles.echo} d={sketch.echo} pathLength={1} />
          <path className={styles.outline} d={sketch.outline} pathLength={1} data-story-line />
          {sketch.details.map((d, detail) => <path key={detail} className={styles.detail} d={d} pathLength={1} />)}
          {chapter.device === "mark" && sketch.outline.split(/(?=M)/).map((strand, light) => <path key={light} className={styles.comet} d={strand} pathLength={1} style={{ "--light": light } as CSSProperties} />)}
        </svg>
        {screen && chapter.shot && <>
          <span className={styles.hatch} style={{ left: percent(screen.x, sketch.width), top: percent(screen.y, sketch.height), width: percent(screen.width, sketch.width), height: percent(screen.height, sketch.height) }} aria-hidden="true" />
          <span className={styles.shadow} style={{ left: percent(screen.x, sketch.width), top: percent(screen.y, sketch.height), width: percent(screen.width, sketch.width), height: percent(screen.height, sketch.height) }} aria-hidden="true" />
          <div className={styles.screen} style={{ left: percent(screen.x, sketch.width), top: percent(screen.y, sketch.height), width: percent(screen.width, sketch.width), height: percent(screen.height, sketch.height) }}>
            <Image src={chapter.shot.src} fill sizes={chapter.device === "browser" ? "(max-width: 960px) 92vw, 760px" : "(max-width: 960px) 62vw, 340px"} alt={say(chapter.shot.alt)} loading={loading} />
          </div>
        </>}
        <span className={styles.pencil} data-story-pencil aria-hidden="true"><Pencil /></span>
      </div>
      {chapter.notes.map((note, position) => <span key={position} className={styles.note} data-note={position} aria-hidden="true">{say(note)}</span>)}
    </div>
    <figcaption className={styles.caption}>{say(chapter.caption)}</figcaption>
  </figure>;
}

const cipherGlyphs = "abcdefghijklmnopqrstuvwxyz";
// Hints about the mid-2027 project, never its name.
const hints = {
  en: ["the group chat became a plan", "your trip planned itself", "everyone agreed on where to go", "the budget split itself fairly"],
  da: ["gruppechatten blev til en plan", "turen planlagde sig selv", "alle blev enige om, hvor I skal hen", "budgettet delte sig selv retfærdigt"],
};

/** The rest of the question decrypts into one hint at a time: letters resolve left to right,
 * hold, then scramble into the next. Runs only while on screen; still motion shows the first hint. */
function Cipher({ da }: { da: boolean }) {
  const lines = da ? hints.da : hints.en;
  const resolved = useRef<HTMLSpanElement>(null);
  const scrambled = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const plain = resolved.current, noise = scrambled.current;
    if (!plain || !noise) return;
    const decode = 1700, hold = 3400, encode = 900;
    let frame = 0, index = 0, start = performance.now() - decode, lastNoise = 0, shown = "";
    const scramble = (text: string) => text.replace(/\S/g, () => cipherGlyphs[Math.floor(Math.random() * cipherGlyphs.length)]);
    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      let elapsed = now - start;
      if (elapsed > decode + hold + encode) { index = (index + 1) % lines.length; start = now; elapsed = 0; }
      const line = lines[index];
      const progress = elapsed < decode ? elapsed / decode : elapsed < decode + hold ? 1 : 1 - (elapsed - decode - hold) / encode;
      const count = Math.round(line.length * (1 - Math.pow(1 - progress, 2)));
      if (now - lastNoise < 120 && shown === line.slice(0, count)) return;
      lastNoise = now;
      shown = line.slice(0, count);
      plain.textContent = shown;
      noise.textContent = scramble(line.slice(count));
    };
    const still = () => matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.makerMotion === "paused";
    const watch = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(frame);
      if (entry.isIntersecting && !still()) frame = requestAnimationFrame(tick);
      else { plain.textContent = lines[index]; noise.textContent = ""; }
    });
    watch.observe(plain);
    return () => { watch.disconnect(); cancelAnimationFrame(frame); };
  }, [lines]);
  // Every hint is laid out invisibly in the same cell, so the box keeps the height of the longest one.
  return <span className={styles.cipher} aria-hidden="true">{lines.map(line => <span key={line} className={styles.cipherSize}>{line}?</span>)}<span><span ref={resolved}>{lines[0]}</span><span ref={scrambled} className={styles.scrambled} />?</span></span>;
}

/** Months until mid-2027, worked out on the visitor's own clock after load. */
function Countdown({ da }: { da: boolean }) {
  const [months, setMonths] = useState<number | null>(null);
  useEffect(() => {
    const now = new Date();
    setMonths(Math.max(1, (2027 - now.getFullYear()) * 12 + 6 - now.getMonth()));
  }, []);
  if (months === null) return null;
  return <span className={styles.countdown}>{da ? `· cirka ${months} ${months === 1 ? "måned" : "måneder"} igen` : `· about ${months} ${months === 1 ? "month" : "months"} to go`}</span>;
}

function StoryChapter({ project, index, total, locale, near }: { project: Project; index: number; total: number; locale: Locale; near: boolean }) {
  const da = locale === "da";
  const t = portfolioCopy(locale);
  const chapter = chapters[project.slug];
  const next = project.slug === "next-project";
  const destination = projectDestination(project, locale);
  const words = (da ? chapter.question.da : chapter.question.en).split(" ");
  const status = project.slug === "vela" ? t("2.0 · Live") : next ? (da ? "Midt i 2027" : "Mid-2027") : t(project.status);
  return <article id={`project-${project.slug}`} className={styles.chapter} data-project-card={project.slug} data-story-chapter data-finale={next || undefined} style={{ "--wash": chapter.wash ?? project.color, "--wash-ink": chapter.ink ?? project.ink } as CSSProperties}>
    {next && <span className={styles.sky} aria-hidden="true"><i /><i /></span>}
    <div className={styles.ask}>
      <p className={styles.meta}><span>{String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</span><span>{project.category}</span>{!next && <span className={styles.metaStatus}><i data-live={project.status === "Live"} />{status}</span>}</p>
      <p className={styles.question}>{words.map((word, position) => <span key={position}>{position > 0 && " "}<span className={styles.word} style={{ "--word": position } as CSSProperties}>{word}</span></span>)}{next && <> <Cipher da={da} /><span className={styles.srOnly}>{da ? `${hints.da[0]}? Et hint om projektet, der kommer midt i 2027.` : `${hints.en[0]}? A hint about the project arriving mid-2027.`}</span></>}</p>
    </div>
    <StoryFigure project={project} chapter={chapter} index={index} locale={locale} near={near} />
    <div className={styles.answer}>
      {!next && <p className={styles.became}><span aria-hidden="true">↳</span> {da ? "Det blev til" : "That became"}</p>}
      <div className={styles.identity}>{!next && <span className={styles.icon}><Image src={identities[project.slug]} width={56} height={56} sizes="40px" alt="" /></span>}<h3>{next ? project.summary : project.name}</h3></div>
      {next && <p className={styles.status}><i data-live={false} />{status}<Countdown da={da} /></p>}
      {!next && <p className={styles.description}>{project.mobileDescription ?? project.description}</p>}
      <div className={styles.actions}>
        <Link href={destination.href} data-project-link className={styles.visit} {...(destination.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}><span>{next ? (da ? "Se et første glimt" : "Get a first look") : destination.label}</span><span className={styles.visitArrow}><Arrow diagonal width={16} height={16} /></span>{destination.external && <span className={styles.srOnly}>{da ? " (åbner i en ny fane)" : " (opens in a new tab)"}</span>}</Link>
        {next && <a href={`${contact}?subject=${encodeURIComponent(da ? "Fortæl mig det først: projektet i 2027" : "Tell me first: the mid-2027 project")}`} className={styles.yours}>{da ? "Hør om det først" : "Be the first to know"} <Arrow width={15} height={15} /></a>}
      </div>
      {!next && <details className={styles.details} onToggle={() => window.dispatchEvent(new Event("maker-layout-change"))}>
        <summary><span className={styles.plus} aria-hidden="true" /><span>{da ? "Idéen bag projektet" : "The idea behind it"}</span></summary>
        <div className={styles.storyBody}>
          <p className={styles.storyLabel}>{da ? "HVORFOR DET FINDES" : "WHY IT EXISTS"}</p>
          <p className={styles.summary}>{project.summary}</p>
          <h4>{project.headline}</h4>
          <p>{project.story}</p>
          <ul>{project.features.map((feature, featureIndex) => <li key={feature.title}><span aria-hidden="true">0{featureIndex + 1}</span><div><strong>{feature.title}</strong><p>{feature.text}</p></div></li>)}</ul>
        </div>
      </details>}
    </div>
  </article>;
}

type Item = { article: HTMLElement; figure: HTMLElement; line: SVGPathElement | null; length: number; box: [number, number]; wash: string; ink: string; draw: number; fill: number; progress: number; tilt: number; seen: boolean; drawing: boolean; filled: boolean };
const clamp = (value: number) => Math.min(1, Math.max(0, value));
const ease = (value: number) => 1 - Math.pow(1 - value, 3);

/** Scroll makes the thing: the pencil draws, then the real screen rises through the sketch.
 * One demand-driven loop; reading text never moves. */
function mountStory(root: HTMLElement) {
  const html = document.documentElement;
  const wide = matchMedia("(min-width: 960px)");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const rail = root.querySelector<HTMLElement>("[data-story-rail]");
  const links = Array.from(rail?.querySelectorAll<HTMLAnchorElement>('a[href^="#project-"]') ?? []);
  const items: Item[] = Array.from(root.querySelectorAll<HTMLElement>("[data-story-chapter]")).map(article => {
    const figure = article.querySelector<HTMLElement>("[data-story-figure]")!;
    const line = figure.querySelector<SVGPathElement>("[data-story-line]");
    const box = (line?.ownerSVGElement?.getAttribute("viewBox") ?? "0 0 1 1").split(" ").slice(2).map(Number) as [number, number];
    const style = getComputedStyle(article);
    return { article, figure, line, length: line?.getTotalLength() ?? 0, box, wash: style.getPropertyValue("--wash").trim(), ink: style.getPropertyValue("--wash-ink").trim(), draw: -1, fill: -1, progress: -1, tilt: 0, seen: false, drawing: false, filled: false };
  });
  let frame = 0, last = 0, active = -1, touched = -Infinity;
  const still = () => reduced.matches || html.dataset.makerMotion === "paused";

  function setMode() {
    if (reduced.matches) delete root.dataset.storyMode;
    else root.dataset.storyMode = wide.matches ? "stage" : "inline";
    request();
  }

  function activate(index: number) {
    if (index === active) return;
    const first = active === -1;
    active = index;
    const item = items[index];
    root.style.setProperty("--story-wash", item.wash);
    root.style.setProperty("--story-ink", item.ink);
    root.dataset.activeProject = item.article.dataset.projectCard;
    items.forEach((other, position) => {
      other.figure.toggleAttribute("data-active", position === index);
      other.figure.toggleAttribute("data-past", position < index);
    });
    links.forEach((link, position) => position === index ? link.setAttribute("aria-current", "location") : link.removeAttribute("aria-current"));
    if (!first) window.dispatchEvent(new CustomEvent("studio-feedback", { detail: { kind: "reveal" } }));
    const link = links[index];
    if (rail && link && root.dataset.storyMode === "inline" && performance.now() - touched > 1800) {
      const bounds = link.getBoundingClientRect(), strip = rail.getBoundingClientRect();
      if (bounds.left < strip.left + 16 || bounds.right > strip.right - 16) rail.scrollTo({ left: link.offsetLeft - rail.clientWidth / 2 + link.offsetWidth / 2, behavior: still() ? "instant" : "smooth" });
    }
  }

  function tick(time: number) {
    frame = 0;
    const step = last ? Math.min(64, time - last) : 16;
    last = time;
    const mode = root.dataset.storyMode;
    const vh = innerHeight;
    // Read every box before writing any style.
    const articles = items.map(item => item.article.getBoundingClientRect());
    const figures = mode === "inline" ? items.map(item => item.figure.getBoundingClientRect()) : [];
    let current = articles.findIndex(box => box.top <= vh * .5 && box.bottom > vh * .5);
    if (current < 0) current = articles[0].top > vh * .5 ? 0 : items.length - 1;
    activate(current);
    let moving = false;
    items.forEach((item, index) => {
      const box = articles[index];
      if (!item.seen && box.top < vh * .88 && box.bottom > 0) { item.seen = true; item.article.dataset.seen = ""; }
      let progress = 1;
      if (!still() && mode === "stage") {
        // The first chapter starts drawing as the story enters; later ones as they take the stage.
        const start = index === 0 ? vh * .9 : vh * .5;
        progress = clamp((start - box.top) / (box.height + start - vh * .5));
      } else if (!still() && mode === "inline") {
        progress = clamp((vh - figures[index].top) / (vh * .78));
      }
      // The finale takes its time: a longer sketch, a later glow and a softer follow.
      const finale = item.article.hasAttribute("data-finale");
      const inline = mode === "inline";
      const draw = ease(clamp(progress / (finale ? (inline ? .85 : .62) : inline ? .55 : .3)));
      const fill = ease(clamp((progress - (finale ? (inline ? .72 : .52) : inline ? .45 : .22)) / (finale ? .35 : inline ? .45 : .28)));
      const smoothing = still() ? 1 : 1 - Math.exp(-step / (finale ? 190 : 85));
      const nextDraw = Math.abs(draw - item.draw) < .0008 ? draw : item.draw + (draw - item.draw) * smoothing;
      const nextFill = Math.abs(fill - item.fill) < .0008 ? fill : item.fill + (fill - item.fill) * smoothing;
      if (nextDraw !== draw || nextFill !== fill) moving = true;
      const style = item.figure.style;
      if (Math.abs(progress - item.progress) > .0005) { item.progress = progress; style.setProperty("--chapter", progress.toFixed(4)); }
      if (nextDraw === item.draw && nextFill === item.fill) return;
      item.draw = nextDraw; item.fill = nextFill;
      style.setProperty("--draw", nextDraw.toFixed(4));
      style.setProperty("--fill", nextFill.toFixed(4));
      const drawing = nextDraw > .004 && nextDraw < .992 && !still();
      if (drawing !== item.drawing) { item.drawing = drawing; item.figure.toggleAttribute("data-drawing", drawing); }
      const filled = nextFill > .82;
      if (filled !== item.filled) { item.filled = filled; item.figure.toggleAttribute("data-filled", filled); }
      if (drawing && item.line && item.length) {
        // The pencil rides the end of the stroke and leans with its direction.
        const at = nextDraw * item.length;
        const tip = item.line.getPointAtLength(at), ahead = item.line.getPointAtLength(Math.min(item.length, at + item.length * .01));
        const heading = Math.atan2(ahead.y - tip.y, ahead.x - tip.x) * 180 / Math.PI;
        const lean = Math.max(-14, Math.min(14, Math.sin(heading * Math.PI / 180) * -10 + Math.cos(heading * Math.PI / 180) * 6));
        item.tilt += (lean - item.tilt) * .2;
        style.setProperty("--px", `${(tip.x / item.box[0] * 100).toFixed(2)}%`);
        style.setProperty("--py", `${(tip.y / item.box[1] * 100).toFixed(2)}%`);
        style.setProperty("--tilt", `${item.tilt.toFixed(2)}deg`);
      }
    });
    const chapterBox = articles[active];
    if (rail && chapterBox) rail.style.setProperty("--rail-progress", clamp((vh * .5 - chapterBox.top) / chapterBox.height).toFixed(3));
    if (moving) request();
    else last = 0;
  }

  function request() { if (!frame) frame = requestAnimationFrame(tick); }
  const resize = () => { items.forEach(item => { item.length = item.line?.getTotalLength() ?? 0; }); request(); };
  const touch = () => { touched = performance.now(); };
  setMode();
  addEventListener("scroll", request, { passive: true });
  addEventListener("resize", resize, { passive: true });
  addEventListener("maker-motion-change", request);
  addEventListener("maker-layout-change", request);
  wide.addEventListener("change", setMode);
  reduced.addEventListener("change", setMode);
  rail?.addEventListener("pointerdown", touch, { passive: true });
  rail?.addEventListener("keydown", touch);
  return () => {
    cancelAnimationFrame(frame);
    removeEventListener("scroll", request);
    removeEventListener("resize", resize);
    removeEventListener("maker-motion-change", request);
    removeEventListener("maker-layout-change", request);
    wide.removeEventListener("change", setMode);
    reduced.removeEventListener("change", setMode);
    rail?.removeEventListener("pointerdown", touch);
    rail?.removeEventListener("keydown", touch);
    delete root.dataset.storyMode;
  };
}

export function WorkStory({ locale = "en" }: { locale?: Locale }) {
  const root = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  // A language change remounts the route. When the story is already near, its mode is set
  // before paint so the reading position restored after the switch stays exact.
  useLayoutEffect(() => {
    const story = root.current;
    if (!story) return;
    let release: (() => void) | undefined;
    const mount = () => { setNear(true); release = mountStory(story); };
    const bounds = story.getBoundingClientRect();
    if (bounds.top < innerHeight * 2 && bounds.bottom > -innerHeight) { mount(); return () => release?.(); }
    // Otherwise keep setup out of the hero's first paint; the server-rendered story is complete.
    const nearby = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      nearby.disconnect();
      mount();
    }, { rootMargin: "100% 0px" });
    nearby.observe(story);
    return () => { nearby.disconnect(); release?.(); };
  }, []);
  const da = locale === "da";
  const collection = projects.map(project => getProject(project.slug, locale)!);
  return <div ref={root} className={styles.story} data-project-index>
    <nav className={styles.rail} data-story-rail style={{ "--rail-ink": collection[0].ink } as CSSProperties} aria-label={da ? "Gå til et projekt" : "Jump to a project"}>{collection.filter(project => project.slug !== "next-project").map((project, index) => <a key={project.slug} href={`#project-${project.slug}`}><span>{String(index + 1).padStart(2, "0")}</span><span className={styles.railName}>{project.name}</span></a>)}<a href="#about" className={styles.skip}>{da ? "Spring videre" : "Skip ahead"} <span aria-hidden="true">↓</span></a></nav>
    {collection.map((project, index) => <StoryChapter key={project.slug} project={project} index={index} total={collection.length} locale={locale} near={near} />)}
  </div>;
}
