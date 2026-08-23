/**
 * GLSL library for the journey scenes.
 * Everything is procedural — no texture assets ship with the site.
 */

/** Ashima simplex 3D noise + fbm. Prepended to fragment shaders that need it. */
export const NOISE_GLSL = /* glsl */ `
vec3 mod289(vec3 x){return x - floor(x * (1.0/289.0)) * 289.0;}
vec4 mod289(vec4 x){return x - floor(x * (1.0/289.0)) * 289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

float fbm(vec3 p){
  float v = 0.0;
  float a = 0.5;
  for(int i = 0; i < OCTAVES; i++){
    v += a * snoise(p);
    p *= 2.02;
    a *= 0.5;
  }
  return v;
}

// fixed 3-octave variant for secondary detail — cheaper than the main fbm
float fbm3(vec3 p){
  float v = 0.0;
  float a = 0.5;
  for(int i = 0; i < 3; i++){
    v += a * snoise(p);
    p *= 2.02;
    a *= 0.5;
  }
  return v;
}
`

/* ── Earth ──────────────────────────────────────────────────────────── */

export const EARTH_VERT = /* glsl */ `
varying vec3 vNormal;
varying vec3 vObjPos;
varying vec3 vWorldPos;
void main(){
  vNormal = normalize(mat3(modelMatrix) * normal);
  vObjPos = position;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorldPos = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`

/*
 * The Earth surface is procedurally generated, but it is *static* in object
 * space — so it is baked once at startup into two equirect textures
 * (see lib/earthBake.ts). The per-frame shader then costs two texture taps
 * plus lighting math instead of ~36 simplex-noise evaluations per pixel.
 */

/** Fullscreen-quad vertex shader for the bake passes. */
export const BAKE_VERT = /* glsl */ `
varying vec2 vUv;
void main(){
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`

/** Shared equirect uv→direction preamble for the bake passes. */
const BAKE_DIR = /* glsl */ `
  float lon = (vUv.x - 0.5) * 6.2831853;
  float lat = (vUv.y - 0.5) * 3.14159265;
  vec3 dir = vec3(cos(lat) * cos(lon), sin(lat), cos(lat) * sin(lon));

  float warp = fbm(dir * 1.3 + vec3(3.7, 1.2, 5.1));
  float e = fbm(dir * 1.75 + warp * 0.55);
  float landMask = smoothstep(0.045, 0.105, e);
  float coast = smoothstep(0.02, 0.05, e) * (1.0 - smoothstep(0.05, 0.16, e));
  float iceEdge = 0.78 + 0.07 * fbm3(dir * 5.0);
  float ice = smoothstep(iceEdge, iceEdge + 0.06, abs(dir.y));
`

/** Bake pass A — rgb: surface albedo, a: ocean specular mask. */
export const EARTH_BAKE_ALBEDO_FRAG = /* glsl */ `
varying vec2 vUv;

__NOISE__

void main(){
${BAKE_DIR}
  vec3 oceanDeep = vec3(0.012, 0.055, 0.135);
  vec3 oceanShallow = vec3(0.03, 0.13, 0.255);
  vec3 ocean = mix(oceanDeep, oceanShallow, coast * 1.4 + 0.18 * fbm3(dir * 4.0));

  float biome = fbm3(dir * 3.1 + 11.0) * 0.5 + 0.5;
  vec3 vegetation = vec3(0.085, 0.16, 0.085);
  vec3 desert = vec3(0.38, 0.30, 0.18);
  vec3 rock = vec3(0.21, 0.20, 0.17);
  vec3 land = mix(vegetation, desert, smoothstep(0.35, 0.75, biome));
  land = mix(land, rock, smoothstep(0.10, 0.28, e) * 0.55);
  land *= 0.82 + 0.36 * fbm3(dir * 9.0);

  vec3 albedo = mix(ocean, land, landMask);
  albedo = mix(albedo, vec3(0.78, 0.83, 0.90), ice);
  float specMask = (1.0 - landMask) * (1.0 - ice);
  gl_FragColor = vec4(albedo, specMask);
}
`

/** Bake pass B — r: night-side city-light intensity. */
export const EARTH_BAKE_LIGHTS_FRAG = /* glsl */ `
varying vec2 vUv;

__NOISE__

void main(){
${BAKE_DIR}
  float cluster = smoothstep(0.05, 0.6, fbm3(dir * 4.2 + 7.3) * 0.5 + 0.5);
  float spark = smoothstep(0.55, 0.95, fbm(dir * 30.0) * 0.5 + 0.5);
  float lights = landMask * (1.0 - ice) * cluster * spark * (0.55 + coast * 1.1);
  gl_FragColor = vec4(lights, 0.0, 0.0, 1.0);
}
`

/** Per-frame Earth shader — noise-free; samples the baked maps. */
export const EARTH_FRAG = /* glsl */ `
uniform vec3 uLightDir;
uniform vec3 uCamPos;
uniform sampler2D uMap;
uniform sampler2D uAux;
varying vec3 vNormal;
varying vec3 vObjPos;
varying vec3 vWorldPos;

void main(){
  vec3 N = normalize(vNormal);
  vec3 V = normalize(uCamPos - vWorldPos);
  vec3 L = normalize(uLightDir);
  vec3 dir = normalize(vObjPos);

  vec2 uv = vec2(
    atan(dir.z, dir.x) * 0.15915494 + 0.5,
    asin(clamp(dir.y, -1.0, 1.0)) * 0.31830989 + 0.5
  );
  vec4 base = texture2D(uMap, uv);
  float lights = texture2D(uAux, uv).r;

  float ndl = dot(N, L);
  float dayF = smoothstep(-0.12, 0.35, ndl);

  // Day lighting with soft wrap
  float wrap = clamp((ndl + 0.18) / 1.18, 0.0, 1.0);
  vec3 col = base.rgb * wrap * 1.9;

  // Sun glint on water
  vec3 H = normalize(L + V);
  float spec = pow(max(dot(N, H), 0.0), 110.0) * base.a * dayF;
  col += vec3(1.0, 0.92, 0.78) * spec * 0.8;

  // City lights crawling up the night side
  float nightF = smoothstep(0.08, -0.22, ndl);
  col += vec3(1.0, 0.72, 0.38) * lights * nightF * 2.6;

  // Warm terminator band
  float term = smoothstep(0.16, 0.0, abs(ndl - 0.02));
  col += vec3(0.85, 0.42, 0.18) * term * 0.10;

  // Atmospheric rim (in-surface fresnel; the volumetric shell adds the halo)
  float fresnel = pow(1.0 - max(dot(N, V), 0.0), 2.4);
  col += vec3(0.23, 0.47, 0.95) * fresnel * (0.22 + 0.9 * dayF);

  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`

export const CLOUDS_FRAG = /* glsl */ `
uniform vec3 uLightDir;
uniform vec3 uCamPos;
uniform float uTime;
varying vec3 vNormal;
varying vec3 vObjPos;
varying vec3 vWorldPos;

__NOISE__

void main(){
  vec3 N = normalize(vNormal);
  vec3 L = normalize(uLightDir);
  vec3 dir = normalize(vObjPos);

  float ndl = dot(N, L);
  float dayF = smoothstep(-0.15, 0.4, ndl);

  // single-noise domain warp + 3-octave body keeps the look at ~1/3 the cost
  vec3 p = dir * 2.7 + vec3(uTime * 0.006, 0.0, uTime * 0.004);
  float c = fbm(p + 0.45 * snoise(p * 1.8));
  float clouds = smoothstep(0.08, 0.42, c);

  float lit = clamp((ndl + 0.25) / 1.25, 0.0, 1.0);
  vec3 col = mix(vec3(0.35, 0.42, 0.55), vec3(1.0, 0.99, 0.97), lit);

  float alpha = clouds * (0.16 + 0.78 * dayF);
  gl_FragColor = vec4(col, alpha * 0.9);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`

/** Additive halo shell rendered back-side; classic rim-glow atmosphere. */
export const ATMOSPHERE_VERT = /* glsl */ `
varying vec3 vNormal;
varying vec3 vWorldPos;
void main(){
  vNormal = normalize(mat3(modelMatrix) * normal);
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorldPos = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`

export const ATMOSPHERE_FRAG = /* glsl */ `
uniform vec3 uColor;
uniform vec3 uLightDir;
uniform vec3 uCamPos;
uniform float uPower;
uniform float uIntensity;
varying vec3 vNormal;
varying vec3 vWorldPos;
void main(){
  vec3 N = normalize(vNormal);
  vec3 V = normalize(uCamPos - vWorldPos);
  // Back-side shell: glow is strongest at the limb, fading outward
  float rim = pow(clamp(dot(N, V) + 1.04, 0.0, 1.0), uPower);
  float sun = 0.35 + 0.65 * smoothstep(-0.4, 0.5, dot(N, normalize(uLightDir)));
  gl_FragColor = vec4(uColor, rim * sun * uIntensity);
}
`

/* ── Star dome ──────────────────────────────────────────────────────── */

export const STARS_VERT = /* glsl */ `
attribute float aSize;
attribute vec3 aColor;
attribute float aPhase;
varying vec3 vColor;
varying float vPhase;
void main(){
  vColor = aColor;
  vPhase = aPhase;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = clamp(aSize * (340.0 / -mv.z), 1.0, 7.5);
  gl_Position = projectionMatrix * mv;
}
`

export const STARS_FRAG = /* glsl */ `
uniform float uTime;
varying vec3 vColor;
varying float vPhase;
void main(){
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.06, d);
  float tw = 0.7 + 0.3 * sin(uTime * 1.7 + vPhase);
  gl_FragColor = vec4(vColor, a * tw);
}
`

/* ── Nebula sprites ─────────────────────────────────────────────────── */

export const NEBULA_VERT = /* glsl */ `
varying vec2 vUv;
void main(){
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

/**
 * Nebula sprites sample the shared baked fbm tile (lib/noiseTexture.ts) —
 * two texture taps per fragment instead of two multi-octave noise fields.
 * The slow uv drift replaces the original time-slice morphing; at these
 * rates the difference is imperceptible.
 */
export const NEBULA_FRAG = /* glsl */ `
uniform sampler2D uNoise;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uSeed;
uniform float uTime;
uniform float uOpacity;
uniform float uDim;
varying vec2 vUv;

void main(){
  vec2 c = vUv * 2.0 - 1.0;
  float r = length(c);
  vec2 drift = vec2(uTime * 0.004, uTime * -0.0028);
  float n = texture2D(uNoise, vUv + uSeed * 0.37 + drift).r * 2.0 - 1.0;
  float n2 = texture2D(uNoise, vUv * 2.0 - uSeed * 0.61 - drift * 0.7).g * 2.0 - 1.0;
  float mask = smoothstep(1.0, 0.1, r);
  float body = smoothstep(-0.25, 0.65, n);
  vec3 col = mix(uColorA, uColorB, clamp(n2 * 0.7 + 0.5, 0.0, 1.0));
  float a = body * mask * uOpacity * uDim;
  gl_FragColor = vec4(col * (0.6 + 0.4 * body), a);
}
`

/* ── Black hole accretion disk ──────────────────────────────────────── */

export const DISK_VERT = /* glsl */ `
varying vec3 vPos;
void main(){
  vPos = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

export const DISK_FRAG = /* glsl */ `
uniform float uTime;
uniform float uInner;
uniform float uOuter;
uniform float uDim;
uniform float uIntensity;
varying vec3 vPos;

__NOISE__

void main(){
  float r = length(vPos.xy);
  float theta = atan(vPos.y, vPos.x);
  float rn = smoothstep(uInner, uOuter, r);

  // seamless angular noise via unit-circle embedding
  float swirl = snoise(vec3(cos(theta) * 1.6, sin(theta) * 1.6, r * 2.1 - uTime * 0.5));
  float bands = 0.55 + 0.45 * sin(theta * 2.0 + r * 9.5 - uTime * 2.1 + swirl * 2.2);

  float heat = pow(1.0 - rn, 2.1);
  vec3 col = mix(vec3(1.0, 0.97, 0.92), vec3(1.0, 0.55, 0.2), rn);
  col = mix(col, vec3(0.45, 0.12, 0.05), smoothstep(0.55, 1.0, rn));

  // relativistic beaming fake — one side runs hotter
  float doppler = 1.0 + 0.75 * sin(theta + 2.2);

  float edge = smoothstep(uInner, uInner + 0.16, r) * (1.0 - smoothstep(uOuter - 0.6, uOuter, r));
  float intensity = heat * (0.4 + 0.6 * bands) * doppler * uIntensity;
  gl_FragColor = vec4(col * intensity * uDim, edge * clamp(intensity, 0.0, 1.0) * uDim);
}
`

/* ── Engine plume ───────────────────────────────────────────────────── */

export const PLUME_VERT = /* glsl */ `
varying vec2 vUv;
void main(){
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

export const PLUME_FRAG = /* glsl */ `
uniform float uTime;
uniform vec3 uColorCore;
uniform vec3 uColorEdge;
uniform float uIntensity;
varying vec2 vUv;
void main(){
  // vUv.y: 1 at nozzle, 0 at plume tip (cone is built that way)
  float axial = pow(vUv.y, 1.6);
  float flicker = 0.86 + 0.14 * sin(uTime * 47.0 + vUv.y * 24.0) * sin(uTime * 31.0);
  // shock diamonds
  float diamonds = 0.75 + 0.25 * sin(vUv.y * 34.0 - uTime * 18.0);
  vec3 col = mix(uColorEdge, uColorCore, axial);
  float a = axial * flicker * diamonds * uIntensity;
  gl_FragColor = vec4(col * (0.7 + a), a);
}
`

export function withNoise(fragment: string, octaves = 5): string {
  return `#define OCTAVES ${octaves}\n` + fragment.replace('__NOISE__', NOISE_GLSL)
}
