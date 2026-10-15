"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { MakerStage } from "@/lib/maker-geometry";
import type { MakerAnchor, MakerCrossing, MakerPose } from "@/lib/maker-journey-path";
import { useLocale } from "./locale-provider";
import { MAKER_PALETTES } from "@/lib/maker-appearance";
import styles from "./maker-journey.module.css";

export type { MakerStage } from "@/lib/maker-geometry";

/** Pre-rendered with the exact live geometry and studio material. Loading,
 * paused, reduced-motion and no-WebGL states keep the same sculptural finish. */
export function MakerFallback({ variant = "hero", className = "" }: { variant?: MakerStage; className?: string }) {
  const asset = variant === "about" || variant === "closing" || variant === "work" ? "hero" : variant;
  return <img className={`${styles.fallback} ${className}`} src={`/images/maker/${asset}.webp`} width={800} height={800} alt="" aria-hidden="true" draggable={false} decoding="async" data-maker-fallback={variant} />;
}

/** One page-level transparent canvas. The parent owns layout and art slots;
 * MotionProvider owns Lenis and ScrollTrigger. This component only joins GSAP's
 * existing ticker and refresh notifications, never creating a second clock.
 */
export function MakerJourney() {
  const locale = useLocale();
  const hostRef = useRef<HTMLDivElement>(null);
  const [portalHost, setPortalHost] = useState<HTMLElement | null>(null);
  useEffect(() => setPortalHost(document.body), []);
  const pausedRef = useRef(false);
  const wakeRef = useRef<(() => void) | null>(null);
  const [ready, setReady] = useState(false);
  const [available, setAvailable] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const root = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const compactQuery = window.matchMedia("(max-width: 760px), (pointer: coarse)");
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    let disposed = false;
    let generation = 0;
    let cleanupScene: (() => void) | undefined;

    const showFallback = () => {
      root.dataset.makerMotion = pausedRef.current ? "paused" : "fallback";
      setReady(false);
    };

    async function mountScene() {
      const thisGeneration = ++generation;
      if (reduced.matches || disposed) return;
      let release: (() => void) | undefined;
      try {
        const [THREE, { gsap }, { ScrollTrigger }, { createMakerGeometry, MAKER_STAGES }, { sampleMakerJourney, dampMakerValue }] = await Promise.all([
          import("three"), import("gsap"), import("gsap/ScrollTrigger"), import("@/lib/maker-geometry"), import("@/lib/maker-journey-path"),
        ]);
        if (disposed || reduced.matches || thisGeneration !== generation) return;

        const compact = compactQuery.matches;
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: !compact, powerPreference: "low-power" });
        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 2000);
        camera.position.z = 1000;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, compact ? 1.25 : 1.5));
        renderer.setClearColor(0x000000, 0);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.NoToneMapping;
        renderer.autoClear = false;
        const canvas = renderer.domElement;
        canvas.className = styles.canvas;
        canvas.setAttribute("aria-hidden", "true");
        canvas.dataset.makerCanvas = "";

        let geometry: ReturnType<typeof createMakerGeometry> | undefined;
        let material: import("three").ShaderMaterial | undefined;
        let shadowMap: import("three").DataTexture | undefined;
        let shadowMaterial: import("three").SpriteMaterial | undefined;
        let detach: (() => void) | undefined;
        let released = false;
        release = () => {
          if (released) return;
          released = true;
          detach?.();
          geometry?.dispose(); material?.dispose();
          shadowMap?.dispose(); shadowMaterial?.dispose();
          renderer.dispose(); canvas.remove();
        };

        geometry = createMakerGeometry(compact);
        material = new THREE.ShaderMaterial({
          uniforms: {
            pigment: { value: new THREE.Color(MAKER_PALETTES.hero.primary) },
            secondaryPigment: { value: new THREE.Color(MAKER_PALETTES.hero.secondary) },
            shadowPigment: { value: new THREE.Color(MAKER_PALETTES.hero.shadow) },
            detailPigment: { value: new THREE.Color("#fff7e8") },
          },
          vertexShader: `
            #include <common>
            #include <morphtarget_pars_vertex>
            attribute float part;
            varying float surfacePart;
            varying vec3 studioNormal;
            void main() {
              surfacePart = part;
              #include <beginnormal_vertex>
              #include <morphnormal_vertex>
              #include <defaultnormal_vertex>
              studioNormal = normalize(transformedNormal);
              #include <begin_vertex>
              #include <morphtarget_vertex>
              #include <project_vertex>
            }
          `,
          fragmentShader: `
            uniform vec3 pigment;
            uniform vec3 shadowPigment;
            uniform vec3 secondaryPigment;
            uniform vec3 detailPigment;
            varying float surfacePart;
            varying vec3 studioNormal;
            void main() {
              vec3 normal = normalize(studioNormal);
              vec3 light = normalize(vec3(-0.55, 0.7, 1.0));
              vec3 fill = normalize(vec3(0.5, -0.8, 0.65));
              vec3 view = vec3(0.0, 0.0, 1.0);
              float diffuse = max(dot(normal, light), 0.0);
              float bounce = max(dot(normal, fill), 0.0);
              float gloss = pow(max(dot(normal, normalize(light + view)), 0.0), 64.0);
              float softbox = pow(max(dot(normal, normalize(vec3(-0.85, 0.15, 1.2))), 0.0), 22.0);
              float rim = pow(max(dot(normal, normalize(fill + view)), 0.0), 45.0);
              vec3 base = surfacePart > 2.5 ? vec3(1.0, .62, .08) : surfacePart > 1.5 ? detailPigment : surfacePart > .5 ? secondaryPigment : pigment;
              vec3 shade = surfacePart > .5 ? base * .3 : shadowPigment;
              vec3 color = mix(shade, base, pow(diffuse, 0.7));
              color += base * bounce * 0.16;
              color += vec3(1.0, 0.91, 0.79) * (gloss * 0.65 + softbox * 0.14 + rim * 0.28);
              gl_FragColor = vec4(color, 1.0);
              #include <colorspace_fragment>
            }
          `,
        });
        const sculpture = new THREE.Mesh(geometry, material);
        sculpture.frustumCulled = false;
        scene.add(sculpture);

        const shadowPixels = new Uint8Array(64 * 64 * 4);
        for (let y = 0; y < 64; y++) for (let x = 0; x < 64; x++) {
          const offset = (y * 64 + x) * 4;
          const radius = ((x - 31.5) / 31.5) ** 2 + ((y - 31.5) / 31.5) ** 2;
          shadowPixels[offset] = 79; shadowPixels[offset + 1] = 48; shadowPixels[offset + 2] = 26;
          shadowPixels[offset + 3] = Math.round(Math.max(0, Math.exp(-radius * 4) - 0.018) * 34);
        }
        shadowMap = new THREE.DataTexture(shadowPixels, 64, 64);
        shadowMap.needsUpdate = true;
        shadowMaterial = new THREE.SpriteMaterial({ map: shadowMap, transparent: true, depthWrite: false, toneMapped: false });
        const shadow = new THREE.Sprite(shadowMaterial);
        scene.add(shadow);

        let width = window.innerWidth;
        let height = window.innerHeight;
        let anchors: MakerAnchor[] = [];
        let crossings: MakerCrossing[] = [];
        let measuring = true;
        let ticking = false;
        let contextAvailable = true;
        let previousScroll = window.scrollY;
        let seek = true;
        let reframe = false;
        let previousTime = 0;
        let fastUntil = 0;
        let passage: { band: MakerCrossing; from: number; to: number; scroll: number } | undefined;
        let elapsed = 0;
        let shown = false;
        const pose: MakerPose = { x: 0, y: 0, size: 0, from: 0, to: 0, morph: 0, docked: 1 };
        const displayed = { x: 0, y: 0, size: 0, docked: 1 };
        const targetWeights = new Float32Array(MAKER_STAGES.length);
        const pointer = { x: 0, y: 0 };
        const pointerPosition = { x: 0, y: 0 };
        const pointerVelocity = { x: 0, y: 0 };
        const rotations = MAKER_STAGES.map(stage => stage === "hero" || stage === "work" || stage === "about" || stage === "closing" ? [.16, -.36, -.24] : [.06, -.10, -.025]);
        const pigments = MAKER_STAGES.map(stage => ({ primary: new THREE.Color(MAKER_PALETTES[stage].primary), secondary: new THREE.Color(MAKER_PALETTES[stage].secondary), shadow: new THREE.Color(MAKER_PALETTES[stage].shadow) }));
        const cream = new THREE.Color("#fff7e8"), ink = new THREE.Color("#212245");
        const addColor = (value: import("three").Color, color: import("three").Color, weight: number) => { value.r += color.r * weight; value.g += color.g * weight; value.b += color.b * weight; };


        const clear = () => { renderer.setScissorTest(false); renderer.clear(); };
        const stop = () => { if (ticking) gsap.ticker.remove(tick); ticking = false; previousTime = 0; };
        const wake = () => {
          if (released || disposed || reduced.matches || !contextAvailable || document.hidden) return;
          if (pausedRef.current) { stop(); clear(); showFallback(); return; }
          if (!ticking) { ticking = true; gsap.ticker.add(tick); }
        };
        const queueMeasure = () => { measuring = true; wake(); };
        const measure = () => {
          measuring = false;
          const nextWidth = Math.max(1, window.innerWidth);
          const nextHeight = Math.max(1, window.innerHeight);
          // Lazy images and ScrollTrigger refresh can change measurements while
          // reading. They update targets without resetting the motion clock.
          // Resizing needs an immediate layout snapshot, but must preserve an
          // unfolding logo (including mobile browser toolbar height changes).
          reframe ||= width !== nextWidth || height !== nextHeight;
          width = nextWidth;
          height = nextHeight;
          renderer.setSize(width, height, false);
          camera.left = -width / 2; camera.right = width / 2;
          camera.top = height / 2; camera.bottom = -height / 2;
          camera.updateProjectionMatrix();
          const scroll = window.scrollY;
          const maxScroll = Math.max(0, document.documentElement.scrollHeight - height);
          anchors = Array.from(document.querySelectorAll<HTMLElement>("[data-maker-anchor]")).flatMap((element) => {
            const stage = element.dataset.makerAnchor as MakerStage;
            if (!MAKER_STAGES.includes(stage)) return [];
            const bounds = element.getBoundingClientRect();
            if (bounds.width < 8 || bounds.height < 8) return [];
            const y = bounds.top + bounds.height / 2 + scroll;
            return [{ stage, x: bounds.left + bounds.width / 2, y, size: Math.min(bounds.width, bounds.height), scroll: Math.min(maxScroll, Math.max(0, y - height * 0.52)) }];
          }).sort((a, b) => a.y - b.y);
          const shield = anchors.find(anchor => anchor.stage === "shield-family");
          const iqra = anchors.find(anchor => anchor.stage === "iqra");
          if (shield && iqra && Math.abs(shield.y - iqra.y) < 80) {
            shield.scroll = Math.max(0, shield.y - height * .76);
            iqra.scroll = Math.max(shield.scroll + 1, iqra.y - height * .28);
          }
          for (let i = 1; i < anchors.length; i++) anchors[i].scroll = Math.max(anchors[i].scroll, anchors[i - 1].scroll + 1);
          crossings = Array.from(document.querySelectorAll<HTMLElement>("[data-maker-crossing]")).map(element => {
            const bounds = element.getBoundingClientRect();
            const parent = element.parentElement ? getComputedStyle(element.parentElement) : null;
            const gap = parent?.display === "grid" ? parseFloat(parent.rowGap) || 0 : 0;
            return { y: bounds.top + scroll + bounds.height / 2, height: bounds.height + gap * 2 };
          });
        };

        function tick(time: number) {
          if (released || disposed || pausedRef.current || reduced.matches || document.hidden || !contextAvailable) { stop(); return; }
          if (measuring) measure();
          const dt = Math.min(previousTime ? time - previousTime : 1 / 60, .1);
          previousTime = time;
          const actualScroll = window.scrollY;
          const scrollDistance = actualScroll - previousScroll;
          previousScroll = actualScroll;
          // Wheel velocity never teleports the object. Only initial layout,
          // restored position and a viewport resize take an exact snapshot.
          if (Math.abs(scrollDistance) / dt > height * 2) fastUntil = time + .2;
          const reposition = seek || reframe;
          reframe = false;
          sampleMakerJourney(anchors, actualScroll, width, compact, pose, crossings);
          if (pose.crossing && pose.crossingBand && passage?.band !== pose.crossingBand) {
            passage = { band: pose.crossingBand, from: pose.crossingFromX!, to: pose.crossingToX!, scroll: pose.crossingScroll! };
          }
          if (passage && (reposition || passage.band.y - actualScroll < -passage.band.height || passage.band.y - actualScroll > height + passage.band.height)) passage = undefined;
          const passageX = passage ? (pose.crossing ? pose.x : actualScroll >= passage.scroll ? passage.to : passage.from) : pose.x;
          const heroAmbient = pose.from === 0 && pose.docked > 0.98;
          if (heroAmbient) elapsed += dt;
          for (const axis of ["x", "y"] as const) {
            const target = heroAmbient ? pointer[axis] : 0;
            // Exact critically damped response stays stable even on slow
            // frames; an Euler spring can diverge when a frame takes 100ms.
            const offset = pointerPosition[axis] - target;
            const impulse = pointerVelocity[axis] + 10 * offset;
            const decay = Math.exp(-10 * dt);
            pointerPosition[axis] = target + (offset + impulse * dt) * decay;
            pointerVelocity[axis] = (pointerVelocity[axis] - 10 * impulse * dt) * decay;
          }
          const influences = sculpture.morphTargetInfluences!;
          targetWeights.fill(0);
          targetWeights[pose.from] = 1 - pose.morph;
          targetWeights[pose.to] += pose.morph;
          let weightDistance = 0;
          for (let i = 0; i < influences.length; i++) weightDistance = Math.max(weightDistance, Math.abs(targetWeights[i] - influences[i]));
          // Resolve the incoming logo in about 1.1 seconds, then retain that
          // complete form throughout departure until the next section arrives.
          // One blend factor preserves a convex combination of all GPU shapes.
          const blend = seek ? 1 : Math.min(1 - Math.exp(-dt * 10), 1.15 * dt / Math.max(weightDistance, 0.0001));
          let rotationX = 0, rotationY = 0, rotationZ = 0;
          material!.uniforms.pigment.value.setRGB(0, 0, 0);
          material!.uniforms.secondaryPigment.value.setRGB(0, 0, 0);
          material!.uniforms.shadowPigment.value.setRGB(0, 0, 0);
          for (let i = 0; i < influences.length; i++) {
            influences[i] = weightDistance < .0005 ? targetWeights[i] : influences[i] + (targetWeights[i] - influences[i]) * blend;
            addColor(material!.uniforms.pigment.value, pigments[i].primary, influences[i]);
            addColor(material!.uniforms.secondaryPigment.value, pigments[i].secondary, influences[i]);
            addColor(material!.uniforms.shadowPigment.value, pigments[i].shadow, influences[i]);
            rotationX += rotations[i][0] * influences[i];
            rotationY += rotations[i][1] * influences[i];
            rotationZ += rotations[i][2] * influences[i];
          }
          material!.uniforms.detailPigment.value.copy(cream).lerp(ink, influences[MAKER_STAGES.indexOf("shield-family")]);
          canvas.dataset.makerStage = MAKER_STAGES[pose.morph >= .5 ? pose.to : pose.from];
          canvas.dataset.makerForm = weightDistance < .005 ? "settled" : "forming";
          // Docked artwork follows the document exactly. Once travelling, its
          // fixed-space arc owns vertical movement; mixing both coordinate
          // systems here would pull it up, then visibly chase it back down.
          if (!reposition && Math.abs(scrollDistance) < height * .35 && pose.docked > 0.999 && displayed.docked > 0.999) displayed.y -= scrollDistance;
          let distance = weightDistance;
          const catchUp = time < fastUntil && Math.hypot(displayed.x - pose.x, displayed.y - pose.y) > height * .3;
          for (const field of ["x", "y", "size", "docked"] as const) {
            const speed = field === "size" ? (compact ? 160 : 320) : field === "docked" ? 1.3 : Math.max(width, height) * (Math.abs(scrollDistance) > height * .15 ? 1.8 : .85);
            let target = field === "size" && catchUp ? Math.min(pose.size, compact ? 44 : width < 1100 ? 56 : 72) : pose[field];
            if (passage) {
              if (field === "x") target = passageX;
              if (field === "y") target = passage.band.y - actualScroll;
              if (field === "size") target = Math.min(compact ? 44 : width < 1100 ? 56 : 72, passage.band.height * .8);
              if (field === "docked") target = 0;
            }
            const response = pose.docked < displayed.docked - .01 ? 4.8 : pose.docked > displayed.docked + .01 ? 7 : 6;
            displayed[field] = reposition ? target : dampMakerValue(displayed[field], target, dt, speed, response);
            distance += Math.abs(displayed[field] - target);
          }
          // The shrinking form reaches the margin progressively; its body
          // never exits the viewport while position and scale catch up.
          const inset = displayed.size * .47 + 1;
          displayed.x = Math.max(inset, Math.min(width - inset, displayed.x));
          if (passage) {
            // If the hand-off lags behind a quick scroll, finish horizontally
            // inside the same empty band before moving along the next margin.
            displayed.y = passage.band.y - actualScroll;
            if (!pose.crossing && Math.abs(displayed.x - passageX) < 3) { passage = undefined; distance += 1; }
          }
          const ambient = heroAmbient ? displayed.docked : 0;
          rotationX += pointerPosition.y * .18 + Math.sin(elapsed * .42) * .15 * ambient;
          rotationY += pointerPosition.x * .28 + Math.sin(elapsed * .32) * .24 * ambient;
          rotationZ += Math.sin(elapsed * .27) * .08 * ambient;
          sculpture.rotation.set(
            seek ? rotationX : dampMakerValue(sculpture.rotation.x, rotationX, dt, 0.65),
            seek ? rotationY : dampMakerValue(sculpture.rotation.y, rotationY, dt, 0.65),
            seek ? rotationZ : dampMakerValue(sculpture.rotation.z, rotationZ, dt, 0.65),
          );
          seek = false;
          const visible = displayed.size > 0 && displayed.y + displayed.size * 0.6 > 0 && displayed.y - displayed.size * 0.6 < height;
          if (!visible) { clear(); if (distance < .0005) stop(); return; }
          sculpture.scale.setScalar(displayed.size / 5.7);
          sculpture.position.set(displayed.x - width / 2, height / 2 - displayed.y + Math.sin(elapsed * .7) * displayed.size * .014 * ambient, 0);
          shadow.position.set(displayed.x - width / 2, height / 2 - displayed.y - displayed.size * 0.39, -4);
          shadow.scale.set(displayed.size * 0.72, displayed.size * 0.1, 1);
          shadow.material.opacity = displayed.docked;
          clear();
          const left = Math.max(0, Math.floor(displayed.x - displayed.size * 0.57));
          const bottom = Math.max(0, Math.floor(height - displayed.y - displayed.size * 0.57));
          const right = Math.min(width, Math.ceil(displayed.x + displayed.size * 0.57));
          const top = Math.min(height, Math.ceil(height - displayed.y + displayed.size * 0.57));
          renderer.setScissor(left, bottom, Math.max(0, right - left), Math.max(0, top - bottom));
          renderer.setScissorTest(true);
          renderer.render(scene, camera);
          if (!shown || root.dataset.makerMotion !== "running") {
            shown = true; root.dataset.makerMotion = "running";
            setReady(true); setAvailable(true);
          }
          // Scrolling wakes the ticker. Outside the hero, a settled sculpture
          // costs no continuous rendering or allocation while someone reads.
          if (!heroAmbient && distance < .0005 && Math.abs(pointerVelocity.x) + Math.abs(pointerVelocity.y) < 0.002) stop();
        }

        const onPointer = (event: PointerEvent) => {
          if (!finePointer.matches || pausedRef.current || !anchors.length || window.scrollY > anchors[0].scroll + height * 0.25) return;
          const anchor = anchors[0];
          pointer.x = Math.max(-1, Math.min(1, (event.clientX - anchor.x) / Math.max(1, anchor.size * 0.5)));
          pointer.y = Math.max(-1, Math.min(1, (event.clientY - (anchor.y - window.scrollY)) / Math.max(1, anchor.size * 0.5)));
          wake();
        };
        const resetPointer = () => { pointer.x = pointer.y = 0; };
        const visibility = () => { if (document.hidden) stop(); else { previousTime = 0; queueMeasure(); } };
        const contextLost = (event: Event) => {
          event.preventDefault(); contextAvailable = false; stop(); showFallback(); setAvailable(false);
        };
        const contextRestored = () => { release?.(); cleanupScene = undefined; void mountScene(); };
        const resize = new ResizeObserver(queueMeasure);
        resize.observe(document.body);
        document.querySelectorAll("[data-maker-anchor]").forEach((element) => resize.observe(element));
        ScrollTrigger.addEventListener("refresh", queueMeasure);
        window.addEventListener("scroll", wake, { passive: true });
        window.addEventListener("resize", queueMeasure, { passive: true });
        window.addEventListener("maker-layout-change", queueMeasure);
        window.visualViewport?.addEventListener("resize", queueMeasure, { passive: true });
        window.addEventListener("pointermove", onPointer, { passive: true });
        document.addEventListener("pointerleave", resetPointer);
        document.addEventListener("visibilitychange", visibility);
        document.addEventListener("load", queueMeasure, true);
        canvas.addEventListener("webglcontextlost", contextLost);
        canvas.addEventListener("webglcontextrestored", contextRestored);
        let fontReady = true;
        void document.fonts.ready.then(() => { if (fontReady) queueMeasure(); });
        detach = () => {
          fontReady = false; stop(); resize.disconnect();
          ScrollTrigger.removeEventListener("refresh", queueMeasure);
          window.removeEventListener("scroll", wake);
          window.removeEventListener("resize", queueMeasure);
          window.removeEventListener("maker-layout-change", queueMeasure);
          window.visualViewport?.removeEventListener("resize", queueMeasure);
          window.removeEventListener("pointermove", onPointer);
          document.removeEventListener("pointerleave", resetPointer);
          document.removeEventListener("visibilitychange", visibility);
          document.removeEventListener("load", queueMeasure, true);
          canvas.removeEventListener("webglcontextlost", contextLost);
          canvas.removeEventListener("webglcontextrestored", contextRestored);
          if (wakeRef.current === wake) wakeRef.current = null;
        };
        cleanupScene = release;
        wakeRef.current = wake;
        host?.appendChild(canvas);
        setAvailable(true);
        wake();
      } catch {
        release?.();
        if (!disposed) { showFallback(); setAvailable(false); }
      }
    }

    const reset = () => {
      generation++;
      cleanupScene?.(); cleanupScene = undefined;
      wakeRef.current = null;
      showFallback();
      setAvailable(false);
      if (!reduced.matches) void mountScene();
    };
    reduced.addEventListener("change", reset);
    compactQuery.addEventListener("change", reset);
    if (!reduced.matches) void mountScene();
    else root.dataset.makerMotion = "fallback";
    return () => {
      disposed = true; generation++;
      reduced.removeEventListener("change", reset);
      compactQuery.removeEventListener("change", reset);
      cleanupScene?.(); wakeRef.current = null;
      delete root.dataset.makerMotion;
    };
  }, [portalHost]);

  function toggleMotion() {
    const next = !pausedRef.current;
    pausedRef.current = next;
    setPaused(next);
    document.documentElement.dataset.makerMotion = next ? "paused" : "fallback";
    if (next) setReady(false);
    wakeRef.current?.();
    window.dispatchEvent(new CustomEvent("maker-motion-change", { detail: { paused: next } }));
  }

  return portalHost ? createPortal(<>
    <div className={styles.layer} ref={hostRef} data-ready={ready && !paused} aria-hidden="true" />
    <button className={styles.control} type="button" hidden={!available} aria-pressed={paused} onClick={toggleMotion}>
      <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">{paused ? <path d="m5 2 9 6-9 6Z" /> : <path d="M4 2h3v12H4zm5 0h3v12H9z" />}</svg>
      {locale === "da" ? (paused ? "Afspil bevægelse" : "Sæt bevægelse på pause") : (paused ? "Play motion" : "Pause motion")}
    </button>
  </>, portalHost) : null;
}

export default MakerJourney;
