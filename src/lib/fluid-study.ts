import { MeshPhysicalMaterial, TorusGeometry } from "three";

/* The maker mark's original 2:3 trefoil centerline, as in maker-geometry.ts.
 * Only its tube cross-section responds to touch and scroll; the three loops
 * and their over/under crossings keep their identity at every tension. */
const surface = `
  uniform float fluidTension;
  uniform float fluidTouch;
  vec3 makerCurve(float u) {
    float radius = 1.54 + .49 * cos(3.0 * u);
    return vec3(radius * cos(2.0 * u), radius * sin(2.0 * u), .76 * sin(3.0 * u));
  }
  vec3 fluidSurface(vec2 coordinate) {
    float u = coordinate.x * 6.28318530718;
    float v = coordinate.y * 6.28318530718;
    vec3 center = makerCurve(u);
    vec3 tangent = normalize(makerCurve(u + .001) - makerCurve(u - .001));
    vec3 outward = vec3(cos(2.0 * u), sin(2.0 * u), 0.0);
    vec3 binormal = normalize(cross(outward, tangent));
    vec3 normal = normalize(cross(tangent, binormal));
    float wave = sin(3.0 * u + fluidTension * 1.4);
    float ripple = fluidTouch * .065 * sin(5.0 * u - fluidTension * 1.8);
    float breadth = .38 * (1.0 + .07 * wave + ripple);
    float depth = .38 * (1.0 - .06 * wave - ripple);
    float twist = fluidTension * .38 + .12 * sin(3.0 * u);
    float across = breadth * cos(v);
    float through = depth * sin(v);
    vec3 section = normal * (across * cos(twist) - through * sin(twist))
      + binormal * (across * sin(twist) + through * cos(twist));
    return (center + section) * .72;
  }
`;

export function createFluidStudy(compact: boolean) {
  // The regular UV lattice is reparameterized into the original trefoil above.
  const geometry = new TorusGeometry(1, .38, compact ? 28 : 40, compact ? 192 : 288);
  const tension = { value: 0 };
  const touch = { value: 0 };
  const material = new MeshPhysicalMaterial({
    color: "#bd4327", metalness: .045, roughness: .31,
    clearcoat: .85, clearcoatRoughness: .19, envMapIntensity: .65,
  });
  material.onBeforeCompile = (shader) => {
    shader.uniforms.fluidTension = tension;
    shader.uniforms.fluidTouch = touch;
    shader.vertexShader = surface + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace("#include <beginnormal_vertex>", `
      vec3 fluidU = fluidSurface(uv + vec2(.0003, 0.0)) - fluidSurface(uv - vec2(.0003, 0.0));
      vec3 fluidV = fluidSurface(uv + vec2(0.0, .0003)) - fluidSurface(uv - vec2(0.0, .0003));
      vec3 objectNormal = normalize(cross(fluidU, fluidV));
    `).replace("#include <begin_vertex>", "vec3 transformed = fluidSurface(uv);");
  };
  material.customProgramCacheKey = () => "maker-trefoil-terracotta-v3";
  return { geometry, material, tension, touch };
}
