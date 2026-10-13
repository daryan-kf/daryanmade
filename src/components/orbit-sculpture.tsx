"use client";

import { useEffect, useId, useRef, useState } from "react";
import styles from "./orbit-sculpture.module.css";

type OrbitSculptureProps = { className?: string };

/** A local, asset-free study in continuous form. The SVG is also the no-WebGL version. */
export default function OrbitSculpture({ className = "" }: OrbitSculptureProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);
  const svgId = useId().replace(/:/g, "");

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let disposed = false;
    let cleanup: (() => void) | undefined;

    async function mount() {
      try {
        const THREE = await import("three");
        if (disposed || !host) return;

        const renderer = new THREE.WebGLRenderer({
          alpha: true,
          antialias: true,
          powerPreference: "low-power",
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
        renderer.setClearColor(0x000000, 0);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.17;
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.domElement.setAttribute("aria-hidden", "true");
        renderer.domElement.className = styles.canvas;

        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(-3.35, 3.35, 3.35, -3.35, 0.1, 40);
        camera.position.set(0, 0.22, 11);
        camera.lookAt(0, 0, 0);

        // An asymmetrical trefoil, swept with a gently flattened, varying section.
        // Its silhouette and self-intersections change as the object turns.
        class ContinuousCurve extends THREE.Curve<import("three").Vector3> {
          constructor() { super(); }

          getPoint(t: number, target = new THREE.Vector3()) {
            const angle = t * Math.PI * 2;
            const radius = 1.58 + 0.55 * Math.cos(3 * angle);
            return target.set(
              radius * Math.cos(2 * angle),
              radius * Math.sin(2 * angle) * 1.04,
              0.72 * Math.sin(3 * angle),
            );
          }
        }

        const curve = new ContinuousCurve();
        const segments = 256;
        const sides = 40;
        const geometry = new THREE.TubeGeometry(curve, segments, 0.39, sides, true);
        const frames = curve.computeFrenetFrames(segments, true);
        const vertices = geometry.attributes.position;
        const point = new THREE.Vector3();
        const normal = new THREE.Vector3();
        const binormal = new THREE.Vector3();
        const position = new THREE.Vector3();

        for (let i = 0; i <= segments; i++) {
          const t = i / segments;
          const angle = t * Math.PI * 2;
          curve.getPointAt(t, point);
          const width = 0.395 + 0.035 * Math.sin(3 * angle + 0.6);
          const twist = 0.32 * Math.sin(2 * angle);
          normal.copy(frames.normals[i]).multiplyScalar(Math.cos(twist));
          normal.addScaledVector(frames.binormals[i], Math.sin(twist));
          binormal.copy(frames.binormals[i]).multiplyScalar(Math.cos(twist));
          binormal.addScaledVector(frames.normals[i], -Math.sin(twist));

          for (let j = 0; j <= sides; j++) {
            const sectionAngle = (j / sides) * Math.PI * 2;
            position.copy(point);
            position.addScaledVector(normal, Math.cos(sectionAngle) * width);
            position.addScaledVector(binormal, Math.sin(sectionAngle) * width * 0.86);
            vertices.setXYZ(i * (sides + 1) + j, position.x, position.y, position.z);
          }
        }
        geometry.computeVertexNormals();
        geometry.computeBoundingSphere();

        // Seeded microtexture gives the clay-like finish a little physical presence.
        const textureSize = 128;
        const textureData = new Uint8Array(textureSize * textureSize * 4);
        let seed = 24817;
        for (let i = 0; i < textureSize * textureSize; i++) {
          seed = (seed * 1664525 + 1013904223) >>> 0;
          const grain = 112 + ((seed >>> 24) % 34);
          textureData[i * 4] = grain;
          textureData[i * 4 + 1] = grain;
          textureData[i * 4 + 2] = grain;
          textureData[i * 4 + 3] = 255;
        }
        const grainTexture = new THREE.DataTexture(textureData, textureSize, textureSize);
        grainTexture.wrapS = grainTexture.wrapT = THREE.RepeatWrapping;
        grainTexture.repeat.set(7, 2);
        grainTexture.needsUpdate = true;

        const material = new THREE.MeshPhysicalMaterial({
          color: "#e65b35",
          roughness: 0.36,
          metalness: 0.02,
          clearcoat: 0.16,
          clearcoatRoughness: 0.48,
          bumpMap: grainTexture,
          bumpScale: 0.011,
        });
        const sculpture = new THREE.Mesh(geometry, material);
        sculpture.castShadow = true;
        sculpture.receiveShadow = true;
        sculpture.rotation.set(0.17, -0.42, -0.28);
        sculpture.position.y = 0.2;
        scene.add(sculpture);

        scene.add(new THREE.HemisphereLight("#fff8e9", "#a05735", 2.5));
        const key = new THREE.DirectionalLight("#fff7ea", 4.5);
        key.position.set(-4, 6, 8);
        key.castShadow = true;
        key.shadow.mapSize.set(1024, 1024);
        key.shadow.camera.left = key.shadow.camera.bottom = -4;
        key.shadow.camera.right = key.shadow.camera.top = 4;
        key.shadow.normalBias = 0.035;
        key.shadow.bias = -0.0001;
        key.shadow.radius = 4;
        scene.add(key);
        const fill = new THREE.DirectionalLight("#ffd5b8", 1.7);
        fill.position.set(5, -1, 3);
        scene.add(fill);
        const rim = new THREE.DirectionalLight("#fffefa", 3);
        rim.position.set(2, 5, -4);
        scene.add(rim);

        let width = 1;
        let height = 1;
        let frame = 0;
        let visible = true;
        let contextAvailable = true;
        let previousTime = 0;
        let elapsed = 0;
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
        const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
        const pointer = { x: 0, y: 0 };
        const currentPointer = { x: 0, y: 0 };
        const velocity = { x: 0, y: 0 };

        const render = () => {
          if (contextAvailable) renderer.render(scene, camera);
        };
        const resize = () => {
          const bounds = host.getBoundingClientRect();
          width = Math.max(bounds.width, 1);
          height = Math.max(bounds.height, 1);
          const aspect = width / height;
          const viewHeight = aspect < 0.9 ? 7.2 : 6.7;
          camera.left = (-viewHeight * aspect) / 2;
          camera.right = (viewHeight * aspect) / 2;
          camera.top = viewHeight / 2;
          camera.bottom = -viewHeight / 2;
          camera.updateProjectionMatrix();
          renderer.setSize(width, height, false);
          render();
        };

        const tick = (time: number) => {
          frame = 0;
          if (disposed || !contextAvailable || !visible || document.hidden || reduceMotion.matches || pausedRef.current) return;
          const dt = Math.min(previousTime ? (time - previousTime) / 1000 : 1 / 60, 1 / 30);
          previousTime = time;
          elapsed += dt;
          // A critically damped pointer spring: interruptions retain momentum.
          for (const axis of ["x", "y"] as const) {
            velocity[axis] += ((pointer[axis] - currentPointer[axis]) * 100 - velocity[axis] * 20) * dt;
            currentPointer[axis] += velocity[axis] * dt;
          }
          sculpture.rotation.x = 0.17 + Math.sin(elapsed * 0.22) * 0.07 + currentPointer.y * 0.13;
          sculpture.rotation.y = -0.42 + elapsed * 0.095 + currentPointer.x * 0.22;
          sculpture.rotation.z = -0.28 + Math.sin(elapsed * 0.16) * 0.045;
          sculpture.position.y = 0.2 + Math.sin(elapsed * 0.6) * 0.045;
          render();
          frame = window.requestAnimationFrame(tick);
        };

        const syncPlayback = () => {
          if (frame) window.cancelAnimationFrame(frame);
          frame = 0;
          previousTime = 0;
          if (disposed || !contextAvailable) return;
          if (reduceMotion.matches || pausedRef.current) {
            pointer.x = pointer.y = 0;
            sculpture.rotation.set(0.17, -0.42, -0.28);
            sculpture.position.y = 0.2;
            render();
          } else if (visible && !document.hidden) {
            frame = window.requestAnimationFrame(tick);
          }
        };
        const onPointerMove = (event: PointerEvent) => {
          if (!finePointer.matches || reduceMotion.matches || pausedRef.current) return;
          const bounds = host.getBoundingClientRect();
          pointer.x = Math.max(-1, Math.min(1, ((event.clientX - bounds.left) / width) * 2 - 1));
          pointer.y = Math.max(-1, Math.min(1, ((event.clientY - bounds.top) / height) * 2 - 1));
        };
        const onPointerLeave = () => { pointer.x = pointer.y = 0; };
        const onContextLost = (event: Event) => {
          event.preventDefault();
          contextAvailable = false;
          if (frame) window.cancelAnimationFrame(frame);
          frame = 0;
          setReady(false);
        };
        const onContextRestored = () => {
          contextAvailable = true;
          resize();
          setReady(true);
          syncPlayback();
        };

        let resizeObserver: ResizeObserver | undefined;
        let intersectionObserver: IntersectionObserver | undefined;
        cleanup = () => {
          if (frame) window.cancelAnimationFrame(frame);
          resizeObserver?.disconnect();
          intersectionObserver?.disconnect();
          host.removeEventListener("pointermove", onPointerMove);
          host.removeEventListener("pointerleave", onPointerLeave);
          document.removeEventListener("visibilitychange", syncPlayback);
          reduceMotion.removeEventListener("change", syncPlayback);
          host.removeEventListener("motionchange", syncPlayback);
          renderer.domElement.removeEventListener("webglcontextlost", onContextLost);
          renderer.domElement.removeEventListener("webglcontextrestored", onContextRestored);
          geometry.dispose();
          material.dispose();
          grainTexture.dispose();
          key.shadow.map?.dispose();
          renderer.dispose();
          renderer.domElement.remove();
        };
        host.appendChild(renderer.domElement);
        resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(host);
        intersectionObserver = new IntersectionObserver(([entry]) => {
          visible = entry.isIntersecting;
          syncPlayback();
        }, { rootMargin: "80px" });
        intersectionObserver.observe(host);
        host.addEventListener("pointermove", onPointerMove, { passive: true });
        host.addEventListener("pointerleave", onPointerLeave);
        document.addEventListener("visibilitychange", syncPlayback);
        reduceMotion.addEventListener("change", syncPlayback);
        host.addEventListener("motionchange", syncPlayback);
        renderer.domElement.addEventListener("webglcontextlost", onContextLost);
        renderer.domElement.addEventListener("webglcontextrestored", onContextRestored);
        resize();
        setReady(true);
        syncPlayback();
      } catch {
        // The server-rendered form remains a complete visual on unsupported devices.
        cleanup?.();
        cleanup = undefined;
      }
    }

    void mount();
    return () => { disposed = true; cleanup?.(); };
  }, []);

  return (
    <div className={`${styles.wrapper} ${className}`}>
    <div ref={hostRef} className={styles.sculpture} data-ready={ready} aria-hidden="true">
      <svg className={styles.fallback} viewBox="0 0 600 600" fill="none" focusable="false">
        <defs>
          <linearGradient id={`${svgId}-body`} x1="155" y1="110" x2="430" y2="445" gradientUnits="userSpaceOnUse">
            <stop stopColor="#ff9a66" />
            <stop offset="0.35" stopColor="#ec673f" />
            <stop offset="0.76" stopColor="#dc4b28" />
            <stop offset="1" stopColor="#a72e14" />
          </linearGradient>
          <linearGradient id={`${svgId}-top`} x1="160" y1="120" x2="440" y2="310" gradientUnits="userSpaceOnUse">
            <stop stopColor="#ffac78" />
            <stop offset="0.45" stopColor="#ed7148" />
            <stop offset="1" stopColor="#df4b28" />
          </linearGradient>
          <filter id={`${svgId}-shadow`} x="0" y="0" width="600" height="600" filterUnits="userSpaceOnUse">
            <feDropShadow dx="3" dy="13" stdDeviation="10" floodColor="#71321c" floodOpacity="0.2" />
          </filter>
          <filter id={`${svgId}-floor`} x="80" y="440" width="440" height="110" filterUnits="userSpaceOnUse">
            <feGaussianBlur stdDeviation="12" />
          </filter>
        </defs>
        <ellipse cx="305" cy="493" rx="139" ry="12" fill="#4f3624" opacity="0.1" filter={`url(#${svgId}-floor)`} />
        <g transform="rotate(-13 300 290)" filter={`url(#${svgId}-shadow)`} strokeLinecap="round" strokeLinejoin="round">
          <path d="M300 139C367 68 451 98 460 183C468 263 406 343 300 379C194 416 119 379 133 295C148 211 216 172 300 139C389 104 447 183 401 264C355 347 289 442 210 419C133 397 158 311 213 259C267 207 350 210 389 287C430 368 373 446 300 379C225 311 234 209 300 139Z" stroke={`url(#${svgId}-body)`} strokeWidth="69" />
          <path d="M300 139C367 68 451 98 460 183C465 230 447 276 406 314" stroke={`url(#${svgId}-top)`} strokeWidth="69" />
          <path d="M210 419C133 397 158 311 213 259C248 225 292 215 331 235" stroke={`url(#${svgId}-top)`} strokeWidth="69" />
          <path d="M300 379C261 343 244 297 248 254" stroke={`url(#${svgId}-body)`} strokeWidth="69" />
          <path d="M310 123C367 78 430 110 440 173" stroke="#ffd1a1" strokeOpacity="0.34" strokeWidth="5" />
          <path d="M178 363C173 330 193 297 219 275" stroke="#ffbf8d" strokeOpacity="0.27" strokeWidth="4" />
        </g>
      </svg>
    </div>
    <button className={styles.motionControl} aria-pressed={paused} onClick={() => { const next = !paused; pausedRef.current = next; setPaused(next); hostRef.current?.dispatchEvent(new Event("motionchange")); }}>{paused ? "Play motion" : "Pause motion"}<span aria-hidden="true">{paused ? "▷" : "Ⅱ"}</span></button>
    </div>
  );
}
