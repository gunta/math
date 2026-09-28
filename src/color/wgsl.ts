// WGSL ports of the color functions, as source strings to paste into a shader.
//
//   import { wgsl } from 'math/color'
//   const module = device.createShaderModule({ code: wgsl.oklab + wgsl.oklch + mainSource })
//
// Each snippet holds only function definitions, so any combination concatenates into a WebGPU
// shader module or a three.js TSL wgslFn include. Functions take and return vec3f, share their names
// with the GLSL snippets and mirror the JS with the same constants. Colors are linear sRGB with 1.0
// as reference white, hue is in degrees.
//
// Matrices are written row by row as in the JS and applied as `v * mat3x3f(...)`. mat3x3f takes
// columns, so this multiplies by the rows, the same math as the JS.

/** WGSL `srgbToLinear` and `linearToSrgb`, the sRGB transfer functions sign-mirrored for extended range. */
export const srgb = /* wgsl */ `
fn srgbToLinear(c: vec3f) -> vec3f {
    let a = abs(c);
    return sign(c) * select(a / 12.92, pow((a + 0.055) / 1.055, vec3f(2.4)), a > vec3f(0.04045));
}

fn linearToSrgb(c: vec3f) -> vec3f {
    let a = abs(c);
    return sign(c) * select(12.92 * a, 1.055 * pow(a, vec3f(1.0 / 2.4)) - 0.055, a > vec3f(0.0031308));
}
`;

/** WGSL `linearSrgbToOklab`, `oklabToLinearSrgb` and `mixOklab(a, b, t)`, which interpolates two linear sRGB colors through OKLab. */
export const oklab = /* wgsl */ `
fn linearSrgbToOklab(c: vec3f) -> vec3f {
    let lms = c * mat3x3f(
        0.41222146947076305, 0.5363325372617348, 0.05144599326750221,
        0.21190349581782522, 0.6806995506452344, 0.10739695353694056,
        0.08830245919005643, 0.2817188391361215, 0.6299787016738222);
    // sign-preserving cube root
    return sign(lms) * pow(abs(lms), vec3f(1.0 / 3.0)) * mat3x3f(
        0.210454268309314, 0.7936177747023054, -0.0040720430116193,
        1.9779985324311684, -2.4285922420485799, 0.450593709617411,
        0.0259040424655478, 0.7827717124575296, -0.8086757549230774);
}

fn oklabToLinearSrgb(lab: vec3f) -> vec3f {
    let lms = lab * mat3x3f(
        1.0, 0.3963377773761749, 0.2158037573099136,
        1.0, -0.1055613458156586, -0.0638541728258133,
        1.0, -0.0894841775298119, -1.2914855480194092);
    return lms * lms * lms * mat3x3f(
        4.076741636075958, -3.3077115392580616, 0.2309699031821043,
        -1.2684379732850317, 2.6097573492876887, -0.34131937600265727,
        -0.004196076138675564, -0.7034186179359363, 1.7076146940746117);
}

fn mixOklab(a: vec3f, b: vec3f, t: f32) -> vec3f {
    return oklabToLinearSrgb(mix(linearSrgbToOklab(a), linearSrgbToOklab(b), t));
}
`;

/** WGSL `oklabToOklch`, `oklchToOklab` and `mixOklch(a, b, t)` (shorter hue arc), which need the `oklab` snippet. */
export const oklch = /* wgsl */ `
fn oklabToOklch(lab: vec3f) -> vec3f {
    let c = length(lab.yz);
    // hue is powerless for grays
    let h = select(0.0, degrees(atan2(lab.z, lab.y)), c > 0.000004);
    return vec3f(lab.x, c, select(h, h + 360.0, h < 0.0));
}

fn oklchToOklab(lch: vec3f) -> vec3f {
    let h = radians(lch.z);
    return vec3f(lch.x, lch.y * cos(h), lch.y * sin(h));
}

fn mixOklch(a: vec3f, b: vec3f, t: f32) -> vec3f {
    var lchA = oklabToOklch(linearSrgbToOklab(a));
    var lchB = oklabToOklch(linearSrgbToOklab(b));
    // a gray endpoint takes the other endpoint's hue
    if lchA.y <= 0.000004 { lchA.z = lchB.z; } else if lchB.y <= 0.000004 { lchB.z = lchA.z; }
    // go around the shorter hue arc
    let d = lchB.z - lchA.z;
    if d > 180.0 { lchA.z += 360.0; } else if d < -180.0 { lchB.z += 360.0; }
    return oklabToLinearSrgb(oklchToOklab(mix(lchA, lchB, t)));
}
`;

/** WGSL `linearSrgbToLinearDisplayP3` and `linearDisplayP3ToLinearSrgb`, which convert between linear sRGB and Display P3 primaries. */
export const displayP3 = /* wgsl */ `
fn linearSrgbToLinearDisplayP3(c: vec3f) -> vec3f {
    return c * mat3x3f(
        0.8224619687143623, 0.17753803128563772, 0.0,
        0.03319419885096158, 0.9668058011490382, 0.0,
        0.017082630721120033, 0.07239744066396347, 0.9105199286149166);
}

fn linearDisplayP3ToLinearSrgb(c: vec3f) -> vec3f {
    return c * mat3x3f(
        1.2249401762805596, -0.22494017628055993, 0.0,
        -0.04205695470968818, 1.0420569547096883, 0.0,
        -0.019637554590334436, -0.07863604555063189, 1.0982736001409663);
}
`;

/** WGSL `linearSrgbToLinearRec2020` and `linearRec2020ToLinearSrgb`, which convert between linear sRGB and Rec.2020 primaries. */
export const rec2020 = /* wgsl */ `
fn linearSrgbToLinearRec2020(c: vec3f) -> vec3f {
    return c * mat3x3f(
        0.627403895934699, 0.3292830383778836, 0.043313065687417246,
        0.06909728935823205, 0.9195403950754587, 0.011362315566309173,
        0.01639143887515028, 0.08801330787722576, 0.895595253247624);
}

fn linearRec2020ToLinearSrgb(c: vec3f) -> vec3f {
    return c * mat3x3f(
        1.6604910021084343, -0.5876411387885496, -0.0728498633198848,
        -0.12455047452159085, 1.1328998971259603, -0.008349422604369473,
        -0.018150763354905307, -0.10057889800800737, 1.1187296613629127);
}
`;

/** WGSL `nitsToPq`, `pqToNits` (SMPTE ST 2084 in cd/m²) and `linearSrgbToRec2100Pq` for HDR10 output with 1.0 at 203 cd/m². */
export const pq = /* wgsl */ `
fn nitsToPq(nits: vec3f) -> vec3f {
    let x = pow(max(nits, vec3f(0.0)) / 10000.0, vec3f(2610.0 / 16384.0));
    return pow((3424.0 / 4096.0 + 2413.0 / 128.0 * x) / (1.0 + 2392.0 / 128.0 * x), vec3f(2523.0 / 32.0));
}

fn pqToNits(pq: vec3f) -> vec3f {
    let x = pow(max(pq, vec3f(0.0)), vec3f(32.0 / 2523.0));
    let n = max((x - 3424.0 / 4096.0) / (2413.0 / 128.0 - 2392.0 / 128.0 * x), vec3f(0.0));
    return 10000.0 * pow(n, vec3f(16384.0 / 2610.0));
}

fn linearSrgbToRec2100Pq(c: vec3f) -> vec3f {
    // linear sRGB to linear Rec.2020, then reference white to 203 cd/m²
    return nitsToPq(203.0 * (c * mat3x3f(
        0.627403895934699, 0.3292830383778836, 0.043313065687417246,
        0.06909728935823205, 0.9195403950754587, 0.011362315566309173,
        0.01639143887515028, 0.08801330787722576, 0.895595253247624)));
}
`;

/** WGSL `linearToHlg` and `hlgToLinear`, the BT.2100 HLG OETF and its inverse, sign-mirrored. */
export const hlg = /* wgsl */ `
fn linearToHlg(e: vec3f) -> vec3f {
    let hi = 0.17883277 * log(12.0 * e - 0.28466892) + 0.55991073;
    return select(sign(e) * sqrt(3.0 * abs(e)), hi, e > vec3f(1.0 / 12.0));
}

fn hlgToLinear(e: vec3f) -> vec3f {
    let hi = (exp((e - 0.55991073) / 0.17883277) + 0.28466892) / 12.0;
    return select(e * abs(e) / 3.0, hi, e > vec3f(0.5));
}
`;

/** WGSL `tonemapReinhard` and `tonemapReinhardExtended(c, white)`, which saturates to 1 at `white`. */
export const tonemapReinhard = /* wgsl */ `
fn tonemapReinhard(c: vec3f) -> vec3f {
    let x = max(c, vec3f(0.0));
    return x / (1.0 + x);
}

fn tonemapReinhardExtended(c: vec3f, white: f32) -> vec3f {
    let x = max(c, vec3f(0.0));
    return min(x * (1.0 + x / (white * white)) / (1.0 + x), vec3f(1.0));
}
`;

/** WGSL `tonemapAcesFilmic`, ACES filmic tone mapping with the three.js 1 / 0.6 pre-exposure. */
export const tonemapAces = /* wgsl */ `
fn tonemapAcesFilmic(c: vec3f) -> vec3f {
    // sRGB to XYZ to D60 to AP1 with the RRT saturation
    let v = c / 0.6 * mat3x3f(
        0.59719, 0.35458, 0.04823,
        0.076, 0.90834, 0.01566,
        0.0284, 0.13383, 0.83777);
    // RRT and ODT fit
    let fit = (v * (v + 0.0245786) - 0.000090537) / (v * (0.983729 * v + 0.432951) + 0.238081);
    // ODT saturation to XYZ to D65 to sRGB
    return saturate(fit * mat3x3f(
        1.60475, -0.53108, -0.07367,
        -0.10208, 1.10813, -0.00605,
        -0.00327, -0.07276, 1.07602));
}
`;

/** WGSL `tonemapAgx` and its helper `tonemapAgxContrast`, AgX tone mapping matching three.js AgXToneMapping. */
export const tonemapAgx = /* wgsl */ `
// log2 encode between -12.47393 and 4.026069 EV around middle gray, then the 6th order sigmoid fit
fn tonemapAgxContrast(v: vec3f) -> vec3f {
    let x = saturate((log2(max(v, vec3f(1e-10))) + 12.47393) / (4.026069 + 12.47393));
    let x2 = x * x;
    let x4 = x2 * x2;
    return 15.5 * x4 * x2 - 40.14 * x4 * x + 31.96 * x4 - 6.868 * x2 * x + 0.4298 * x2 + 0.1191 * x - 0.00232;
}

fn tonemapAgx(c: vec3f) -> vec3f {
    // linear sRGB to linear Rec.2020
    var v = c * mat3x3f(
        0.6274, 0.3293, 0.0433,
        0.0691, 0.9195, 0.0113,
        0.0164, 0.088, 0.8956);
    // inset, then log2 encoding and the sigmoid
    v = tonemapAgxContrast(v * mat3x3f(
        0.856627153315983, 0.0951212405381588, 0.0482516061458583,
        0.137318972929847, 0.761241990602591, 0.101439036467562,
        0.11189821299995, 0.0767994186031903, 0.811302368396859));
    // outset, then linearize with the 2.2 power three.js uses
    v = pow(max(v * mat3x3f(
        1.1271005818144368, -0.11060664309660323, -0.016493938717834573,
        -0.1413297634984383, 1.157823702216272, -0.016493938717834257,
        -0.14132976349843826, -0.11060664309660294, 1.2519364065950405), vec3f(0.0)), vec3f(2.2));
    // linear Rec.2020 to linear sRGB, then clip to the sRGB gamut
    return saturate(v * mat3x3f(
        1.6605, -0.5876, -0.0728,
        -0.1246, 1.1329, -0.0083,
        -0.0182, -0.1006, 1.1187));
}
`;

/** WGSL `tonemapNeutral`, Khronos PBR Neutral tone mapping matching three.js NeutralToneMapping. */
export const tonemapNeutral = /* wgsl */ `
fn tonemapNeutral(c: vec3f) -> vec3f {
    // lift the toe so near-black stays neutral
    let m = min(c.r, min(c.g, c.b));
    let v = c - select(0.04, m - 6.25 * m * m, m < 0.08);
    let peak = max(v.r, max(v.g, v.b));
    if peak < 0.76 { return v; }
    // compress the peak above 0.76 toward 1, then desaturate toward it by 0.15 of the compression
    let newPeak = 1.0 - 0.24 * 0.24 / (peak - 0.52);
    let t = 1.0 - 1.0 / (0.15 * (peak - newPeak) + 1.0);
    return mix(v * (newPeak / peak), vec3f(newPeak), t);
}
`;
