import { BufferAttribute, BufferGeometry, CanvasTexture, Color, Matrix4, Mesh, MeshPhysicalMaterial, PlaneGeometry, Points, ShaderMaterial, Vector3 } from "three";

/** The same trefoil surface becomes a field of liquid beads, then typography.
 * Glyphs are sampled once from the already-loaded brand font; all travel is GPU driven. */
export function createFluidGreeting(compact: boolean, lines: string[], font: string, accent: string) {
  const paper = document.createElement("canvas");
  paper.width = 1200; paper.height = 720;
  const pen = paper.getContext("2d");
  if (!pen) return null;
  pen.fillStyle = "white";
  pen.textAlign = "center";
  pen.textBaseline = "middle";
  const longest = lines.reduce((a, b) => a.length > b.length ? a : b);
  pen.font = `italic 150px ${font}`;
  const fontSize = Math.min(150, 150 * 1050 / Math.max(1, pen.measureText(longest).width));
  pen.font = `italic ${fontSize}px ${font}`;
  lines.forEach((line, index) => pen.fillText(line, 600, 180 + index * 177));
  const pixels = pen.getImageData(0, 0, 1200, 720).data;
  const glyphs: [number, number][] = [];
  for (let y = 65; y < 650; y += 2) for (let x = 50; x < 1150; x += 2) {
    if (pixels[(y * 1200 + x) * 4 + 3] > 150) glyphs.push([x, y]);
  }
  if (!glyphs.length) return null;
  const count = compact ? 6500 : 11000;
  const positions = new Float32Array(count * 3);
  const letters = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  const curve = (u: number) => {
    const r = 1.54 + .49 * Math.cos(3 * u);
    return new Vector3(r * Math.cos(2 * u), r * Math.sin(2 * u), .76 * Math.sin(3 * u));
  };
  // Stable seeds make revisits and reduced-resolution variants reproducible.
  const random = (n: number) => { const v = Math.sin(n * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); };
  for (let i = 0; i < count; i++) {
    const u = random(i + 1) * Math.PI * 2;
    const v = random(i + count) * Math.PI * 2;
    const center = curve(u);
    const tangent = curve(u + .001).sub(curve(u - .001)).normalize();
    const outward = new Vector3(Math.cos(2 * u), Math.sin(2 * u), 0);
    const binormal = outward.clone().cross(tangent).normalize();
    const normal = tangent.clone().cross(binormal).normalize();
    center.addScaledVector(normal, .38 * Math.cos(v)).addScaledVector(binormal, .38 * Math.sin(v)).multiplyScalar(.72);
    center.toArray(positions, i * 3);
    const glyph = glyphs[Math.floor(random(i + count * 2) * glyphs.length)];
    letters[i * 3] = (glyph[0] - 600) / 1200 * 4.05;
    letters[i * 3 + 1] = -(glyph[1] - 360) / 1200 * 4.05;
    letters[i * 3 + 2] = (random(i + count * 3) - .5) * .07;
    seeds[i] = random(i + count * 4);
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  geometry.setAttribute("letter", new BufferAttribute(letters, 3));
  geometry.setAttribute("seed", new BufferAttribute(seeds, 1));
  const uniforms = {
    amount: { value: 0 }, time: { value: 0 }, opacity: { value: 0 },
    density: { value: 1 }, knot: { value: new Matrix4() }, ink: { value: new Color(accent) },
  };
  const material = new ShaderMaterial({
    uniforms, transparent: true, depthWrite: false,
    vertexShader: `
      attribute vec3 letter;
      attribute float seed;
      uniform float amount, time, density;
      uniform mat4 knot;
      varying float sparkle;
      void main() {
        float travel = smoothstep(0., 1., clamp(amount * 1.12 - seed * .12, 0., 1.));
        vec3 source = (knot * vec4(position, 1.)).xyz;
        vec3 target = letter;
        target.z += sin(letter.x * 2.8 + time * 1.3) * .025;
        vec3 flow = vec3(sin(seed * 35. + time * .5), cos(seed * 29. + time * .4), sin(seed * 51.));
        vec3 p = mix(source, target, travel) + flow * sin(travel * 3.14159265) * (.18 + seed * .36);
        vec4 view = modelViewMatrix * vec4(p, 1.);
        gl_Position = projectionMatrix * view;
        gl_PointSize = clamp((2.7 + seed * .9) * density * 6.4 / -view.z, 1., 7.);
        sparkle = .82 + seed * .18;
      }`,
    fragmentShader: `
      uniform vec3 ink;
      uniform float opacity;
      varying float sparkle;
      void main() {
        vec2 uv = gl_PointCoord * 2. - 1.;
        float r = dot(uv, uv);
        if (r > 1.) discard;
        float dome = sqrt(1. - r);
        float light = .65 + .45 * dome + .15 * dot(uv, vec2(-.5, .7));
        float glint = pow(max(0., dome - uv.x * .3 + uv.y * .3), 12.) * .3;
        gl_FragColor = vec4(ink * light * sparkle + vec3(glint), opacity * (1. - smoothstep(.6, 1., r)));
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
  const points = new Points(geometry, material);
  points.frustumCulled = false;
  points.visible = false;
  points.renderOrder = 2;
  // The travelling beads coalesce into a smooth, lit typographic surface.
  // A tiny height field rounds its edges without loading another font or model.
  const lettering = new CanvasTexture(paper);
  const bevelCanvas = document.createElement("canvas");
  bevelCanvas.width = paper.width; bevelCanvas.height = paper.height;
  const bevelPen = bevelCanvas.getContext("2d")!;
  bevelPen.fillStyle = "black"; bevelPen.fillRect(0, 0, 1200, 720);
  bevelPen.filter = "blur(4px)";
  bevelPen.drawImage(paper, 0, 0);
  const bevel = new CanvasTexture(bevelCanvas);
  const letterGeometry = new PlaneGeometry(4.05, 4.05 * .6, 48, 24);
  const letterMaterial = new MeshPhysicalMaterial({
    color: accent, map: lettering, bumpMap: bevel, bumpScale: .075,
    metalness: .045, roughness: .31, clearcoat: .85, clearcoatRoughness: .19,
    envMapIntensity: .65, transparent: true, depthWrite: false,
  });
  letterMaterial.onBeforeCompile = shader => {
    shader.uniforms.greetingTime = uniforms.time;
    shader.vertexShader = "uniform float greetingTime;\n" + shader.vertexShader.replace("#include <begin_vertex>", "#include <begin_vertex>\ntransformed.z += sin(position.x * 2.8 + greetingTime * 1.3) * .025;");
  };
  letterMaterial.customProgramCacheKey = () => "maker-fluid-lettering-v1";
  const lettersSurface = new Mesh(letterGeometry, letterMaterial);
  lettersSurface.frustumCulled = false;
  lettersSurface.visible = false;
  lettersSurface.renderOrder = 3;
  return { points, lettersSurface, letterMaterial, uniforms, dispose: () => {
    geometry.dispose(); material.dispose(); letterGeometry.dispose(); letterMaterial.dispose(); lettering.dispose(); bevel.dispose();
  } };
}
