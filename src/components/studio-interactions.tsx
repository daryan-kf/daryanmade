"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "./locale-provider";
import { MakerMark } from "./icons";
import styles from "./studio-interactions.module.css";

type SoundKind = "open" | "close" | "navigate" | "sculpture" | "language" | "motion" | "reveal" | "enable";
const preferenceKey = "daryanmade-studio-sound";
const projectNotes = [196, 220, 261.63, 293.66, 329.63, 392, 440];
let enabled = false;
let context: AudioContext | undefined;
let previousSound = -Infinity;
let previousReveal = -Infinity;
let output: GainNode | undefined;
let air: AudioBuffer | undefined;
let disposalTimer: ReturnType<typeof setTimeout> | undefined;

/** A shared, gently compressed mix keeps overlapping gestures at one level. */
function mix(audio: AudioContext) {
  if (output) return output;
  output = audio.createGain();
  output.gain.value = .72;
  const compressor = audio.createDynamicsCompressor();
  compressor.threshold.value = -22;
  compressor.knee.value = 18;
  compressor.ratio.value = 3;
  compressor.attack.value = .006;
  compressor.release.value = .18;
  output.connect(compressor).connect(audio.destination);
  return output;
}

function tone(audio: AudioContext, frequency: number, start: number, duration: number, volume: number, pan = 0) {
  const oscillator = audio.createOscillator();
  const gain = audio.createGain();
  const position = audio.createStereoPanner();
  position.pan.value = pan;
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequency, start);
  oscillator.frequency.exponentialRampToValueAtTime(frequency * .997, start + duration);
  gain.gain.setValueAtTime(.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + .012);
  gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
  oscillator.connect(gain).connect(position).connect(mix(audio));
  oscillator.start(start);
  oscillator.stop(start + duration + .02);
  oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); position.disconnect(); };
}

/** Cached air texture, filtered into a soft paper/material movement. */
function breath(audio: AudioContext, start: number, opening: boolean, length = .26, volume = .012) {
  if (!air) {
    air = audio.createBuffer(1, Math.ceil(audio.sampleRate * .5), audio.sampleRate);
    const samples = air.getChannelData(0);
    for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
  }
  const source = audio.createBufferSource();
  const filter = audio.createBiquadFilter();
  const gain = audio.createGain();
  source.buffer = air;
  filter.type = "bandpass";
  filter.Q.value = .5;
  filter.frequency.setValueAtTime(opening ? 340 : 1050, start);
  filter.frequency.exponentialRampToValueAtTime(opening ? 1050 : 340, start + length);
  gain.gain.setValueAtTime(.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + length * .24);
  gain.gain.exponentialRampToValueAtTime(.0001, start + length);
  source.connect(filter).connect(gain).connect(mix(audio));
  source.start(start, Math.random() * .08);
  source.stop(start + length);
  source.onended = () => { source.disconnect(); filter.disconnect(); gain.disconnect(); };
}

async function playSound(kind: SoundKind, note = 0) {
  if (!enabled || document.hidden) return;
  // Appearance cues may use an already unlocked context, never create/resume it.
  if (kind === "reveal" && (document.documentElement.dataset.languageChanging === "true" || !context || context.state !== "running" || matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.makerMotion === "paused")) return;
  try {
    context ??= new AudioContext();
    if (context.state === "suspended") await context.resume();
    if (!enabled || context.state !== "running") return;
    const now = context.currentTime;
    mix(context).gain.setTargetAtTime(.72, now, .015);
    if (kind === "reveal") {
      if (now - previousReveal < 1.15 || now - previousSound < .4) return;
      previousReveal = now;
    } else {
      if (now - previousSound < .075) return;
      previousSound = now;
    }
    const frequency = projectNotes[Math.max(0, note) % projectNotes.length];
    if (kind === "sculpture" || kind === "enable") {
      // The knot's three loops become a small ascending, spatial three-note motif.
      const level = kind === "enable" ? .8 : 1;
      tone(context, frequency * 2, now, .42, .028 * level, -.18);
      tone(context, frequency * 3, now + .07, .34, .018 * level);
      tone(context, frequency * 4, now + .14, .4, .01 * level, .18);
      breath(context, now, true, .34, .009 * level);
    } else if (kind === "language") {
      const from = note ? frequency * 2 : frequency * 3;
      const to = note ? frequency * 3 : frequency * 2;
      tone(context, from, now, .23, .022, note ? -.2 : .2);
      tone(context, to, now + .065, .3, .018, note ? .2 : -.2);
      breath(context, now, Boolean(note), .24, .009);
    } else if (kind === "reveal") {
      // One quiet arrival accent per moment, rather than a sound for every layer.
      breath(context, now, true, .32, .006);
      tone(context, frequency * 2, now + .035, .34, .011, -.12);
      tone(context, frequency * 3, now + .09, .28, .004, .12);
    } else if (kind === "open" || kind === "close") {
      breath(context, now, kind === "open", kind === "open" ? .32 : .24);
      tone(context, kind === "open" ? frequency * 2 : frequency, now + .025, .24, .021);
    } else if (kind === "motion") {
      breath(context, now, Boolean(note), .18, .008);
      tone(context, note ? frequency * 2 : frequency, now, .2, .019);
    } else {
      tone(context, frequency * 2, now, .18, .025);
      tone(context, frequency * 2.756, now + .008, .1, .003);
    }
  } catch { /* Sound is an optional layer; controls and navigation stay immediate. */ }
}

export function StudioSoundToggle() {
  const locale = useLocale();
  const [on, setOn] = useState(false);
  useEffect(() => {
    try { enabled = sessionStorage.getItem(preferenceKey) === "on"; } catch { enabled = false; }
    setOn(enabled);
  }, []);
  return <button type="button" className={styles.soundButton} data-studio-sound aria-pressed={on} aria-label={locale === "da" ? (on ? "Slå lyd fra" : "Slå lyd til") : (on ? "Turn sound off" : "Turn sound on")} onClick={() => {
    enabled = !on;
    setOn(enabled);
    if (!enabled && context && output) {
      output.gain.cancelScheduledValues(context.currentTime);
      output.gain.setTargetAtTime(.0001, context.currentTime, .015);
    }
    try { sessionStorage.setItem(preferenceKey, enabled ? "on" : "off"); } catch { /* Private storage may be unavailable. */ }
    if (enabled) void playSound("enable");
  }} title={locale === "da" ? (on ? "Slå lyd fra" : "Slå lyd til") : (on ? "Turn sound off" : "Turn sound on")}><span className={styles.soundBars} aria-hidden="true"><i /><i /><i /><i /></span><span className={styles.controlLabel}>{locale === "da" ? `Lyd ${on ? "til" : "fra"}` : `Sound ${on ? "on" : "off"}`}</span></button>;
}

export function SculpturePlayButton() {
  const locale = useLocale();
  const [played, setPlayed] = useState(false);
  const [interactive, setInteractive] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    const sync = () => setInteractive(document.documentElement.dataset.makerMotion === "running");
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-maker-motion"] });
    return () => observer.disconnect();
  }, []);
  return <button type="button" className={styles.sculpturePlay} data-sculpture-play disabled={!interactive} aria-label={locale === "da" ? "Drej skulpturen" : "Turn the sculpture"} onClick={() => {
    window.dispatchEvent(new Event("maker-sculpture-play"));
    setPlayed(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setPlayed(false), 1800);
  }}><MakerMark width={22} height={22} /><span>{locale === "da" ? (played ? "En ny vinkel." : "Giv idéen et drej") : (played ? "A new perspective." : "Give it a spin")}</span><span aria-hidden="true">↻</span></button>;
}

/** A quiet, opt-in seven-note sound palette and a tiny echo of each action. */
export function StudioInteractions() {
  useEffect(() => {
    clearTimeout(disposalTimer);
    const root = document.documentElement;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    root.dataset.studioExperience = "true";
    const echoes = new Set<HTMLElement>();
    const noteFor = (target: Element) => {
      const card = target.closest<HTMLElement>("[data-project-card]");
      const link = target.closest<HTMLAnchorElement>('a[href^="#project-"]');
      const slug = card?.dataset.projectCard ?? link?.hash.replace("#project-", "");
      return ["sarpoli", "vela", "wardrobe", "kaizencv", "koebsklar", "shield-family", "iqra"].indexOf(slug ?? "");
    };
    const feedback = (event: Event) => {
      const { kind, note } = (event as CustomEvent<{ kind: SoundKind; note?: number }>).detail;
      void playSound(kind, note);
    };
    const click = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      const action = event.target.closest("a,button,summary");
      if (!action || action.matches("[data-studio-sound], [data-sculpture-play], [data-faq-trigger], [data-idea-choice], [data-language-choice], [data-maker-motion-control], [disabled]")) return;
      if (action.matches("summary") && action.closest<HTMLElement>("[data-project-index]")?.dataset.galleryMotion === "active") return;
      const expanded = action.getAttribute("aria-expanded");
      const kind = action.matches("summary") ? (action.parentElement?.hasAttribute("open") ? "close" : "open") : expanded !== null ? (expanded === "true" ? "close" : "open") : "navigate";
      void playSound(kind, noteFor(action));
    };
    const press = (event: PointerEvent) => {
      if (event.button !== 0 || !(event.target instanceof Element) || reduced.matches || root.dataset.makerMotion === "paused") return;
      const action = event.target.closest("a,button,summary");
      if (!action || action.matches("[disabled], [data-maker-motion-control]")) return;
      // A small copper impression belongs to the click, never to the cursor.
      const echo = document.createElement("span");
      echo.className = styles.pressEcho;
      echo.setAttribute("aria-hidden", "true");
      echo.style.left = `${event.clientX}px`;
      echo.style.top = `${event.clientY}px`;
      document.body.append(echo);
      echoes.add(echo);
      const animation = echo.animate([
        { transform: "translate(-50%, -50%) scale(.55) rotate(-20deg)", opacity: .65 },
        { transform: "translate(-50%, -50%) scale(1.35) rotate(25deg)", opacity: 0 },
      ], { duration: 360, easing: "cubic-bezier(.23,1,.32,1)" });
      animation.finished.catch(() => {}).finally(() => { echo.remove(); echoes.delete(echo); });
    };
    const visibility = () => { if (document.hidden) void context?.suspend().catch(() => {}); };
    const clearEchoes = () => echoes.forEach(echo => { echo.getAnimations().forEach(animation => animation.cancel()); echo.remove(); });
    window.addEventListener("studio-feedback", feedback);
    window.addEventListener("maker-motion-change", clearEchoes);
    reduced.addEventListener("change", clearEchoes);
    document.addEventListener("click", click);
    document.addEventListener("pointerdown", press, { passive: true });
    document.addEventListener("visibilitychange", visibility);
    return () => {
      delete root.dataset.studioExperience;
      window.removeEventListener("studio-feedback", feedback);
      window.removeEventListener("maker-motion-change", clearEchoes);
      reduced.removeEventListener("change", clearEchoes);
      document.removeEventListener("click", click);
      document.removeEventListener("pointerdown", press);
      document.removeEventListener("visibilitychange", visibility);
      echoes.forEach(echo => echo.remove());
      // A language route can remount the studio. Let its short sonic transition
      // finish and reuse the unlocked context if the next studio mounts.
      disposalTimer = setTimeout(() => {
        void context?.close().catch(() => {});
        context = undefined; output = undefined; air = undefined;
        previousSound = previousReveal = -Infinity;
      }, 650);
    };
  }, []);
  return null;
}
