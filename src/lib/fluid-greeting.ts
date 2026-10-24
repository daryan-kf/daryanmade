import { BufferAttribute, BufferGeometry, CanvasTexture, Color, Matrix4, Mesh, MeshPhysicalMaterial, NearestFilter, PlaneGeometry, Points, ShaderMaterial, Vector3 } from "three";

/** How far the writing sweep is spread across the beads: 0 moves them all at once. */
export const GREETING_SPREAD = .85;

/** The trefoil unravels into one thread of beads that writes the greeting in reading order,
 * line by line and left to right; each bead melts into the lit lettering where it lands.
 * Glyphs are sampled once from the already-loaded brand font; all travel is GPU driven. */
export function createFluidGreeting(compact: boolean, lines: string[], font: string, accent: string) {
  const paper = document.createElement("canvas");
  paper.width = 1200; paper.height = 720;
  const pen = paper.getContext("2d", { willReadFrequently: true });
  if (!pen) return null;
  pen.fillStyle = "white";
  pen.textAlign = "center";
  pen.textBaseline = "middle";
  const longest = lines.reduce((a, b) => a.length > b.length ? a : b);
  const largest = lines.length < 3 ? 200 : 150;
  pen.font = `italic ${largest}px ${font}`;
  const fontSize = Math.min(largest, largest * 1050 / Math.max(1, pen.measureText(longest).width));
  pen.font = `italic ${fontSize}px ${font}`;
  const rows = lines.map((line, index) => {
    const y = 360 + (index - (lines.length - 1) / 2) * fontSize * 1.18;
    const half = pen.measureText(line).width / 2 + fontSize * .1;
    pen.fillText(line, 600, y);
    return { y, left: 600 - half, right: 600 + half };
  });
  // Reading order from 0 to 1: which line, then how far along it.
  const writing = (x: number, y: number) => {
    let row = 0;
    rows.forEach((candidate, index) => { if (Math.abs(y - candidate.y) < Math.abs(y - rows[row].y)) row = index; });
    const { left, right } = rows[row];
    return (row + Math.min(1, Math.max(0, (x - left) / (right - left)))) / rows.length;
  };
  const pixels = pen.getImageData(0, 0, 1200, 720).data;
  const glyphs: [number, number, number][] = [];
  for (let y = 65; y < 650; y += 2) for (let x = 50; x < 1150; x += 2) {
    if (pixels[(y * 1200 + x) * 4 + 3] > 150) glyphs.push([x, y, writing(x, y)]);
  }
  if (!glyphs.length) return null;
  glyphs.sort((a, b) => a[2] - b[2]);
  // The same order as a texture, so the lettering appears exactly where beads have landed.
  const orderCanvas = document.createElement("canvas");
  orderCanvas.width = 1200; orderCanvas.height = 720;
  const orderPen = orderCanvas.getContext("2d")!;
  const order = orderPen.createImageData(1200, 720);
  for (let y = 0; y < 720; y++) for (let x = 0; x < 1200; x++) {
    const index = (y * 1200 + x) * 4;
    if (!pixels[index + 3]) continue;
    order.data[index] = Math.round(writing(x, y) * 255);
    order.data[index + 3] = 255;
  }
  orderPen.putImageData(order, 0, 0);

  const count = compact ? 6500 : 11000;
  const positions = new Float32Array(count * 3);
  const letters = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  const orders = new Float32Array(count);
  const curve = (u: number) => {
    const r = 1.54 + .49 * Math.cos(3 * u);
    return new Vector3(r * Math.cos(2 * u), r * Math.sin(2 * u), .76 * Math.sin(3 * u));
  };
  // Stable seeds make revisits and reduced-resolution variants reproducible.
  const random = (n: number) => { const v = Math.sin(n * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); };
  // Walking along the knot from one end is walking along the sentence: the thread unwinds in order.
  const along = Array.from({ length: count }, (_, i) => random(i + 1) * Math.PI * 2).sort((a, b) => a - b);
  for (let i = 0; i < count; i++) {
    const u = along[i];
    const v = random(i + count) * Math.PI * 2;
    const center = curve(u);
    const tangent = curve(u + .001).sub(curve(u - .001)).normalize();
    const outward = new Vector3(Math.cos(2 * u), Math.sin(2 * u), 0);
    const binormal = outward.clone().cross(tangent).normalize();
    const normal = tangent.clone().cross(binormal).normalize();
    center.addScaledVector(normal, .38 * Math.cos(v)).addScaledVector(binormal, .38 * Math.sin(v)).multiplyScalar(.72);
    center.toArray(positions, i * 3);
    const glyph = glyphs[Math.min(glyphs.length - 1, Math.floor((i + random(i + count * 2)) / count * glyphs.length))];
    letters[i * 3] = (glyph[0] - 600) / 1200 * 4.05;
    letters[i * 3 + 1] = -(glyph[1] - 360) / 1200 * 4.05;
    letters[i * 3 + 2] = (random(i + count * 3) - .5) * .07;
    orders[i] = glyph[2];
    seeds[i] = random(i + count * 4);
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  geometry.setAttribute("letter", new BufferAttribute(letters, 3));
  geometry.setAttribute("seed", new BufferAttribute(seeds, 1));
  geometry.setAttribute("order", new BufferAttribute(orders, 1));
  const uniforms = {
    amount: { value: 0 }, reveal: { value: -1 }, time: { value: 0 }, opacity: { value: 0 },
    density: { value: 1 }, knot: { value: new Matrix4() }, ink: { value: new Color(accent) },
  };
  const material = new ShaderMaterial({
    uniforms, transparent: true, depthWrite: false,
    vertexShader: `
      attribute vec3 letter;
      attribute float seed;
      attribute float order;
      uniform float amount, reveal, time, density;
      uniform mat4 knot;
      varying float sparkle;
      varying float fade;
      float easeInOut(float t) { return t < .5 ? 4. * t * t * t : 1. - pow(-2. * t + 2., 3.) / 2.; }
      void main() {
        float t = easeInOut(clamp(amount * ${(1 + GREETING_SPREAD).toFixed(2)} - order * ${GREETING_SPREAD.toFixed(2)}, 0., 1.));
        vec3 source = (knot * vec4(position, 1.)).xyz;
        vec3 target = letter;
        target.z += sin(letter.x * 2.8 + time * 1.3) * .025;
        // A curved flight that lifts toward the viewer, then lays the bead into its letter.
        vec3 delta = target - source;
        vec3 side = normalize(vec3(-delta.y, delta.x, 0.) + vec3(1e-4));
        vec3 control = mix(source, target, .42) + vec3(0., 0., .5 + seed * .35) + side * (seed - .5) * .55;
        vec3 p = mix(mix(source, control, t), mix(control, target, t), t);
        float flight = sin(t * 3.14159265);
        p += vec3(sin(seed * 35. + time * .9), cos(seed * 29. + time * .8), sin(seed * 51. + time * .7)) * .035 * flight;
        vec4 view = modelViewMatrix * vec4(p, 1.);
        gl_Position = projectionMatrix * view;
        float landed = smoothstep(.8, 1., t);
        gl_PointSize = clamp((2.7 + seed * .9) * density * 6.4 / -view.z * mix(1., .72, landed), 1., 7.);
        sparkle = .82 + seed * .18 + flight * .22;
        // Once the lettering has appeared beneath it, the bead melts away.
        fade = 1. - smoothstep(order + .005, order + .08, reveal);
      }`,
    fragmentShader: `
      uniform vec3 ink;
      uniform float opacity;
      varying float sparkle;
      varying float fade;
      void main() {
        vec2 uv = gl_PointCoord * 2. - 1.;
        float r = dot(uv, uv);
        if (r > 1. || fade < .002) discard;
        float dome = sqrt(1. - r);
        float light = .65 + .45 * dome + .15 * dot(uv, vec2(-.5, .7));
        float glint = pow(max(0., dome - uv.x * .3 + uv.y * .3), 12.) * .3;
        gl_FragColor = vec4(ink * light * sparkle + vec3(glint), opacity * fade * (1. - smoothstep(.6, 1., r)));
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
  const points = new Points(geometry, material);
  points.frustumCulled = false;
  points.visible = false;
  points.renderOrder = 2;
  // The landed beads become a smooth, lit typographic surface, revealed in the same order.
  // A tiny height field rounds its edges without loading another font or model.
  const lettering = new CanvasTexture(paper);
  const orderMap = new CanvasTexture(orderCanvas);
  orderMap.magFilter = orderMap.minFilter = NearestFilter;
  orderMap.generateMipmaps = false;
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
    shader.uniforms.greetingReveal = uniforms.reveal;
    shader.uniforms.greetingOrder = { value: orderMap };
    shader.vertexShader = "uniform float greetingTime;\n" + shader.vertexShader.replace("#include <begin_vertex>", "#include <begin_vertex>\ntransformed.z += sin(position.x * 2.8 + greetingTime * 1.3) * .025;");
    shader.fragmentShader = "uniform float greetingReveal;\nuniform sampler2D greetingOrder;\n" + shader.fragmentShader.replace("#include <map_fragment>", "#include <map_fragment>\nfloat writeOrder = texture2D(greetingOrder, vMapUv).r;\ndiffuseColor.a *= smoothstep(writeOrder - .01, writeOrder + .03, greetingReveal);");
  };
  letterMaterial.customProgramCacheKey = () => "maker-fluid-lettering-v2";
  const lettersSurface = new Mesh(letterGeometry, letterMaterial);
  lettersSurface.frustumCulled = false;
  lettersSurface.visible = false;
  lettersSurface.renderOrder = 3;
  return { points, lettersSurface, letterMaterial, uniforms, dispose: () => {
    geometry.dispose(); material.dispose(); letterGeometry.dispose(); letterMaterial.dispose(); lettering.dispose(); orderMap.dispose(); bevel.dispose();
  } };
}
