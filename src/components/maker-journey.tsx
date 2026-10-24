"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLocale } from "./locale-provider";
import { StudioSoundToggle } from "./studio-interactions";
import { studioGreeting } from "@/lib/studio-messages";
import styles from "./maker-journey.module.css";

/** A still from the same surface and studio lighting, including without WebGL. */
export function MakerFallback({ variant = "hero", className = "" }: { variant?: "hero" | "about" | "closing"; className?: string }) {
  return <img className={`${styles.fallback} ${className}`} src="/images/maker/fluid-study.webp" width={1000} height={1000} alt="" aria-hidden="true" draggable={false} decoding="async" loading={variant === "closing" ? "lazy" : "eager"} data-maker-fallback={variant} />;
}

/** One canvas renders the sculpture inside its hero and closing frames. */
export function MakerJourney() {
  const locale = useLocale();
  const wake = useRef<(() => void) | null>(null);
  const stopMotion = useRef<(() => void) | null>(null);
  const pausedRef = useRef(false);
  const [body, setBody] = useState<HTMLElement | null>(null);
  const [paused, setPaused] = useState(false);
  const [available, setAvailable] = useState(false);
  useEffect(() => { setBody(document.body); }, []);

  useEffect(() => {
    const root = document.documentElement;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const compact = matchMedia("(max-width: 700px), (pointer: coarse)");
    const finePointer = matchMedia("(hover: hover) and (pointer: fine)");
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
    let disposed = false;
    let generation = 0;
    let release: (() => void) | undefined;
    const fallback = () => {
      delete root.dataset.makerEnhanced;
      root.dataset.makerMotion = "fallback";
      setAvailable(false);
    };

    async function mount() {
      const version = ++generation;
      if (disposed || reduced.matches) return;
      try {
        const [THREE, { RoomEnvironment }, { createFluidStudy }, { createFluidGreeting, GREETING_SPREAD }] = await Promise.all([
          import("three"), import("three/addons/environments/RoomEnvironment.js"), import("@/lib/fluid-study"), import("@/lib/fluid-greeting"), document.fonts.ready,
        ]);
        if (disposed || reduced.matches || version !== generation) return;
        const anchors = Array.from(document.querySelectorAll<HTMLElement>('[data-maker-anchor="hero"], [data-maker-anchor="closing"]'));
        if (!anchors.length) return;
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
        renderer.setPixelRatio(Math.min(devicePixelRatio || 1, compact.matches ? 1.25 : 1.75));
        renderer.setClearColor(0, 0);
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = .8;
        const canvas = renderer.domElement;
        canvas.className = styles.canvas;
        canvas.dataset.makerCanvas = "";
        canvas.dataset.makerForm = "fluid";
        canvas.dataset.makerTopology = "trefoil";
        canvas.setAttribute("aria-hidden", "true");
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(34, 1, .1, 30);
        camera.position.set(0, 0, 6.8);
        const environment = new RoomEnvironment();
        const pmrem = new THREE.PMREMGenerator(renderer);
        const studio = pmrem.fromScene(environment, .035);
        scene.environment = studio.texture;
        scene.environmentRotation.set(0, .6, .15);
        environment.dispose();
        pmrem.dispose();
        const { geometry, material, tension, touch } = createFluidStudy(compact.matches);
        const accent = getComputedStyle(root).getPropertyValue("--accent").trim();
        if (accent) material.color.set(accent);
        const sculpture = new THREE.Mesh(geometry, material);
        material.transparent = true;
        sculpture.frustumCulled = false;
        scene.add(sculpture);
        const serif = getComputedStyle(document.querySelector("h1 em") ?? root).fontFamily;
        const greeting = root.dataset.languageChanging === "true" ? null : createFluidGreeting(compact.matches,
          studioGreeting(locale), serif, accent || "#bd4327");
        if (greeting) scene.add(greeting.points, greeting.lettersSurface);
        const key = new THREE.DirectionalLight("#ffe7ce", 1.6);
        key.position.set(-3, 5, 5);
        const rim = new THREE.DirectionalLight("#fff7ea", 2);
        rim.position.set(4, 1, -3);
        scene.add(key, rim);

        let frame = 0, lastTime = 0, nextDraw = 0, frames = 0;
        let breathTime = 0, arrival = 0;
        // Unravel .6–3.5s, hold, re-tie 7.6–9.8s, then release the greeting.
        const greetingEnd = 10.2;
        let greetingTime = root.dataset.languageChanging === "true" ? greetingEnd : 0;
        let greetingAmount = 0, greetingSkip = false, greetingSound = false, greetingDisposed = false;
        let active: HTMLElement | undefined;
        let contextAvailable = true;
        let needsMeasure = true;
        let initialized = false;
        let width = 0, height = 0;
        const current = { progress: 0, x: 0, y: 0, turn: 0, pulse: 0 };
        const target = { progress: 0, x: 0, y: 0, turn: 0 };
        const velocity = { turn: 0, pulse: 0 };
        let plays = 0;
        const stop = () => { if (frame) cancelAnimationFrame(frame); frame = 0; lastTime = 0; nextDraw = 0; };
        const findVisible = () => anchors.find(anchor => {
          const bounds = anchor.getBoundingClientRect();
          return bounds.bottom > 0 && bounds.top < innerHeight && bounds.width > 0 && bounds.height > 0;
        });
        const attach = (anchor: HTMLElement) => {
          if (active !== anchor || canvas.parentElement !== anchor) {
            anchors.forEach(item => { if (item !== anchor) delete item.dataset.makerReady; });
            active = anchor;
            active.appendChild(canvas);
            canvas.dataset.makerStage = active.dataset.makerAnchor;
            needsMeasure = true;
          }
          const bounds = anchor.getBoundingClientRect();
          if (needsMeasure || width !== bounds.width || height !== bounds.height) {
            width = bounds.width; height = bounds.height;
            renderer.setPixelRatio(Math.min(devicePixelRatio || 1, compact.matches ? 1.25 : 1.75));
            renderer.setSize(width, height, false);
            camera.aspect = width / height;
            // Fit the entire surface inside its own frame at every breakpoint.
            camera.position.z = 6.4 * Math.max(1, height / width);
            camera.updateProjectionMatrix();
            needsMeasure = false;
          }
          const chapter = anchor.closest<HTMLElement>("[data-maker-chapter]")?.getBoundingClientRect() ?? bounds;
          const closing = anchor.dataset.makerAnchor === "closing";
          target.progress = closing
            ? 1 + THREE.MathUtils.clamp((innerHeight - chapter.top) / (innerHeight + chapter.height), 0, 1)
            : THREE.MathUtils.clamp(-chapter.top / Math.max(chapter.height, 1), 0, 1);
        };
        const request = () => {
          if (frame || disposed || (pausedRef.current && frames > 0) || reduced.matches || document.hidden || !contextAvailable) return;
          frame = requestAnimationFrame(draw);
        };
        function draw(time: number) {
          frame = 0;
          if (disposed || (pausedRef.current && frames > 0) || reduced.matches || document.hidden || !contextAvailable) return;
          const visible = findVisible();
          if (!visible) { lastTime = 0; nextDraw = 0; return; }
          const interval = 1000 / (compact.matches ? 30 : 45);
          if (nextDraw && time < nextDraw) { request(); return; }
          nextDraw = nextDraw ? Math.max(nextDraw + interval, time) : time + interval;
          attach(visible);
          const delta = lastTime ? Math.min((time - lastTime) / 1000, .05) : 1 / 60;
          if (!initialized) { current.progress = target.progress; initialized = true; }
          lastTime = time;
          const blend = 1 - Math.exp(-delta * 5);
          breathTime += delta;
          arrival = Math.min(1, arrival + delta / 1.3);
          const settle = 1 - Math.pow(1 - arrival, 3);
          const breath = breathTime * Math.PI * 2 / 14;
          current.progress += (target.progress - current.progress) * blend;
          current.x += (target.x - current.x) * blend;
          current.y += (target.y - current.y) * blend;
          // A small interruptible spring carries the energy of each deliberate
          // spin. Fixed substeps keep rapid taps and slow frames stable.
          const steps = Math.ceil(delta / (1 / 120));
          const step = delta * .85 / steps;
          for (let i = 0; i < steps; i++) {
            velocity.turn += ((target.turn - current.turn) * 100 - velocity.turn * 10) * step;
            current.turn += velocity.turn * step;
            velocity.pulse += (-current.pulse * 100 - velocity.pulse * 10) * step;
            current.pulse += velocity.pulse * step;
          }
          tension.value = current.progress * .85 + current.x * .12 + Math.sin(breath) * .28;
          touch.value = current.pulse;
          sculpture.position.set(0, 0, 0);
          sculpture.scale.setScalar(.9 + settle * .1);
          sculpture.rotation.set(
            .18 + current.y * .14 + current.progress * .1 + current.pulse * .08 + Math.sin(breath) * .075 + (1 - settle) * .12,
            -.28 + current.x * .22 + current.progress * .16 + Math.sin(breath * .8) * .16 - (1 - settle) * .2,
            Math.PI / 2 + .05 + current.progress * .18 + current.turn + Math.sin(breath * .65) * .055,
          );
          if (greeting && !greetingDisposed && active?.dataset.makerAnchor === "hero") {
            const bounds = active.getBoundingClientRect();
            const visibleHeight = Math.min(innerHeight, bounds.bottom) - Math.max(0, bounds.top);
            if (visibleHeight >= Math.min(bounds.height * .6, innerHeight * .5)) greetingTime = Math.min(greetingEnd, greetingTime + delta);
            const smooth = (a: number, b: number, value: number) => { const t = Math.max(0, Math.min(1, (value - a) / (b - a))); return t * t * (3 - 2 * t); };
            const desired = greetingSkip ? 0 : smooth(.6, 3.5, greetingTime) * (1 - smooth(7.6, 9.8, greetingTime));
            greetingAmount += (desired - greetingAmount) * (1 - Math.exp(-delta * 6));
            if (greetingTime >= greetingEnd - .2 || (greetingSkip && greetingAmount < .002)) greetingAmount = 0;
            // Beads land in reading order; the lettering appears beneath each one as it settles.
            const reveal = (greetingAmount * (1 + GREETING_SPREAD) - 1) / GREETING_SPREAD;
            greeting.uniforms.amount.value = greetingAmount;
            greeting.uniforms.reveal.value = reveal;
            greeting.uniforms.time.value = breathTime;
            greeting.uniforms.opacity.value = smooth(0, .06, greetingAmount);
            greeting.points.visible = greeting.uniforms.opacity.value > .001 && reveal < 1.1;
            greeting.letterMaterial.opacity = smooth(0, .02, greetingAmount);
            greeting.lettersSurface.visible = reveal > -.05;
            greeting.uniforms.density.value = renderer.getPixelRatio() * Math.min(1.35, height / 460);
            sculpture.updateMatrixWorld();
            greeting.uniforms.knot.value.copy(sculpture.matrixWorld);
            material.opacity = 1 - smooth(.01, .09, greetingAmount);
            material.depthWrite = greetingAmount < .01;
            sculpture.visible = material.opacity > .005;
            canvas.dataset.makerGreeting = greetingAmount === 0 && greetingTime >= greetingEnd - .2 || greetingSkip && greetingAmount === 0 ? "knot" : greetingTime > 7.6 ? "returning" : greetingAmount > .97 ? "message" : greetingTime > .6 ? "unfolding" : "waiting";
            if (!greetingSound && greetingTime > .7 && greetingTime < 7) {
              greetingSound = true;
              window.dispatchEvent(new CustomEvent("studio-feedback", { detail: { kind: "reveal", note: 2 } }));
            }
            if (greetingAmount === 0 && (greetingTime >= greetingEnd - .2 || greetingSkip)) {
              scene.remove(greeting.points, greeting.lettersSurface);
              greeting.dispose(); greetingDisposed = true;
            }
          } else {
            if (greeting) { greeting.points.visible = false; greeting.lettersSurface.visible = false; }
            sculpture.visible = true; material.opacity = 1; material.depthWrite = true;
          }
          renderer.render(scene, camera);
          canvas.dataset.flowPhase = tension.value.toFixed(5);
          canvas.dataset.flowProgress = current.progress.toFixed(5);
          canvas.dataset.drawCount = String(++frames);
          canvas.dataset.sculptureTurn = current.turn.toFixed(5);
          active!.dataset.makerReady = "true";
          root.dataset.makerEnhanced = "true";
          root.dataset.makerMotion = pausedRef.current ? "paused" : "running";
          if (frames === 1) setAvailable(true);
          request();
        }
        const refresh = () => { needsMeasure = true; request(); };
        const pointer = (event: PointerEvent) => {
          if (!finePointer.matches || !active) return;
          const bounds = active.getBoundingClientRect();
          const inside = event.clientX >= bounds.left && event.clientX <= bounds.right && event.clientY >= bounds.top && event.clientY <= bounds.bottom;
          const x = inside ? (event.clientX - bounds.left) / bounds.width * 2 - 1 : 0;
          const y = inside ? (event.clientY - bounds.top) / bounds.height * 2 - 1 : 0;
          if (x === target.x && y === target.y) return;
          target.x = x; target.y = y;
          request();
        };
        const leave = () => { target.x = 0; target.y = 0; request(); };
        const play = () => {
          if (pausedRef.current || reduced.matches || document.hidden || !contextAvailable || !findVisible()) return;
          greetingSkip = true;
          // Preserve velocity if another tap arrives during the turn, but cap
          // queued travel so repeated taps never create an endless animation.
          target.turn = Math.min(target.turn + Math.PI * 2 / 3, current.turn + Math.PI * 4 / 3);
          velocity.pulse = Math.min(velocity.pulse + 7, 10);
          canvas.dataset.sculpturePlays = String(++plays);
          window.dispatchEvent(new CustomEvent("studio-feedback", { detail: { kind: "sculpture" } }));
          request();
        };
        const visibility = () => { if (document.hidden) stop(); else refresh(); };
        const lost = (event: Event) => {
          event.preventDefault(); contextAvailable = false; stop();
          anchors.forEach(anchor => { delete anchor.dataset.makerReady; });
          canvas.style.visibility = "hidden";
          fallback();
        };
        const restored = () => { release?.(); release = undefined; void mount(); };
        const resize = new ResizeObserver(refresh);
        anchors.forEach(anchor => resize.observe(anchor));
        resize.observe(document.body);
        window.addEventListener("scroll", request, { passive: true });
        window.addEventListener("resize", refresh, { passive: true });
        window.addEventListener("maker-layout-change", refresh);
        window.addEventListener("pointermove", pointer, { passive: true });
        window.addEventListener("maker-sculpture-play", play);
        document.addEventListener("pointerleave", leave);
        document.addEventListener("visibilitychange", visibility);
        document.addEventListener("load", refresh, true);
        window.visualViewport?.addEventListener("resize", refresh, { passive: true });
        canvas.addEventListener("webglcontextlost", lost);
        canvas.addEventListener("webglcontextrestored", restored);
        let fontReady = true;
        void document.fonts.ready.then(() => { if (fontReady) refresh(); });
        wake.current = refresh;
        stopMotion.current = stop;
        release = () => {
          fontReady = false; stop(); resize.disconnect();
          window.removeEventListener("scroll", request);
          window.removeEventListener("resize", refresh);
          window.removeEventListener("maker-layout-change", refresh);
          window.removeEventListener("pointermove", pointer);
          window.removeEventListener("maker-sculpture-play", play);
          document.removeEventListener("pointerleave", leave);
          document.removeEventListener("visibilitychange", visibility);
          document.removeEventListener("load", refresh, true);
          window.visualViewport?.removeEventListener("resize", refresh);
          canvas.removeEventListener("webglcontextlost", lost);
          canvas.removeEventListener("webglcontextrestored", restored);
          anchors.forEach(anchor => { delete anchor.dataset.makerReady; });
          if (!greetingDisposed) greeting?.dispose();
          geometry.dispose(); material.dispose(); studio.dispose(); renderer.dispose(); canvas.remove();
          wake.current = null; stopMotion.current = null;
        };
        request();
      } catch { release?.(); release = undefined; if (!disposed) fallback(); }
    }
    let near = false;
    let scheduled = false;
    let idle: number | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const cancelBoot = () => {
      if (idle !== undefined) window.cancelIdleCallback(idle);
      clearTimeout(timer);
      scheduled = false;
    };
    const queueMount = () => {
      if (disposed || scheduled || reduced.matches || saveData || !near) return;
      scheduled = true;
      const boot = () => { if (!disposed && !reduced.matches) void mount(); };
      // The matching still paints first. Load WebGL only near its own frame,
      // using an idle slot so it does not compete with text or initial input.
      if ("requestIdleCallback" in window) idle = window.requestIdleCallback(boot, { timeout: 800 });
      else timer = setTimeout(boot, 100);
    };
    const nearby = new IntersectionObserver(entries => {
      near = entries.some(entry => entry.isIntersecting) || near;
      queueMount();
    }, { rootMargin: "160px 0px" });
    document.querySelectorAll<HTMLElement>('[data-maker-anchor="hero"], [data-maker-anchor="closing"]').forEach(anchor => nearby.observe(anchor));
    const reset = () => { generation++; cancelBoot(); release?.(); release = undefined; fallback(); queueMount(); };
    reduced.addEventListener("change", reset);
    if (reduced.matches || saveData) fallback();
    return () => {
      disposed = true; generation++; cancelBoot(); nearby.disconnect(); release?.();
      reduced.removeEventListener("change", reset);
      delete root.dataset.makerMotion; delete root.dataset.makerEnhanced;
    };
  }, []);

  function toggle() {
    const next = !pausedRef.current;
    pausedRef.current = next;
    setPaused(next);
    window.dispatchEvent(new CustomEvent("studio-feedback", { detail: { kind: "motion", note: next ? 0 : 1 } }));
    document.documentElement.dataset.makerMotion = next ? "paused" : "running";
    if (next) stopMotion.current?.(); else wake.current?.();
    window.dispatchEvent(new CustomEvent("maker-motion-change", { detail: { paused: next } }));
  }
  return body && createPortal(<div className={styles.controls} data-studio-controls><StudioSoundToggle /><button type="button" className={styles.control} hidden={!available} aria-pressed={paused} aria-label={locale === "da" ? (paused ? "Afspil bevægelse" : "Sæt bevægelse på pause") : (paused ? "Play motion" : "Pause motion")} title={locale === "da" ? (paused ? "Afspil bevægelse" : "Sæt bevægelse på pause") : (paused ? "Play motion" : "Pause motion")} onClick={toggle} data-maker-motion-control><svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">{paused ? <path d="m5 2 9 6-9 6Z" /> : <path d="M4 2h3v12H4zm5 0h3v12H9z" />}</svg></button></div>, body);
}
