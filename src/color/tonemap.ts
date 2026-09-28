import type { Const } from '../core/const';
import type { Color } from './color';
import { linearSrgbToXyzD65, xyzD65ToLinearSrgb } from './colorspace';

// HDR to SDR tone mapping. Inputs are linear sRGB with exposure already applied, where 1.0 is
// reference white and values above 1 are HDR. Outputs are linear sRGB in the display range [0, 1],
// ready for sRGB encoding (e.g. color.toSRGB). Alpha is never touched and `out` may alias the input.

/** Reinhard tone mapping, c / (1 + c) per channel, mapping [0, inf) to [0, 1) with negatives at 0. Returns `out`. */
export function reinhard(out: Color, c: Const<Color>): Color {
    const r = c[0] > 0 ? c[0] : 0;
    const g = c[1] > 0 ? c[1] : 0;
    const b = c[2] > 0 ? c[2] : 0;
    out[0] = r / (1 + r);
    out[1] = g / (1 + g);
    out[2] = b / (1 + b);
    return out;
}

/**
 * Extended Reinhard tone mapping, c (1 + c / white²) / (1 + c) per channel, saturating to 1 at and above `white`.
 * Returns `out`.
 */
export function reinhardExtended(out: Color, c: Const<Color>, white: number): Color {
    const k = 1 / (white * white);
    const r = c[0] > 0 ? c[0] : 0;
    const g = c[1] > 0 ? c[1] : 0;
    const b = c[2] > 0 ? c[2] : 0;
    out[0] = Math.min((r * (1 + r * k)) / (1 + r), 1);
    out[1] = Math.min((g * (1 + g * k)) / (1 + g), 1);
    out[2] = Math.min((b * (1 + b * k)) / (1 + b), 1);
    return out;
}

/**
 * ACES filmic tone mapping using Stephen Hill's RRT and ODT fit, matching three.js ACESFilmicToneMapping.
 * Includes three.js's 1 / 0.6 pre-exposure for brighter viewing environments. Returns `out`.
 */
export function acesFilmic(out: Color, c: Const<Color>): Color {
    const r = c[0] / 0.6;
    const g = c[1] / 0.6;
    const b = c[2] / 0.6;
    // sRGB to XYZ to D60 to AP1 with the RRT saturation, then the fitted curve
    const x = rrtAndOdtFit(0.59719 * r + 0.35458 * g + 0.04823 * b);
    const y = rrtAndOdtFit(0.076 * r + 0.90834 * g + 0.01566 * b);
    const z = rrtAndOdtFit(0.0284 * r + 0.13383 * g + 0.83777 * b);
    // ODT saturation to XYZ to D65 to sRGB
    out[0] = clamp01(1.60475 * x - 0.53108 * y - 0.07367 * z);
    out[1] = clamp01(-0.10208 * x + 1.10813 * y - 0.00605 * z);
    out[2] = clamp01(-0.00327 * x - 0.07276 * y + 1.07602 * z);
    return out;
}

/**
 * AgX tone mapping, matching three.js AgXToneMapping (Filament's port of Blender's AgX in Rec.2020 primaries).
 * Bright saturated colors desaturate toward white instead of skewing hue. Returns `out`.
 */
export function agx(out: Color, c: Const<Color>): Color {
    const r = c[0];
    const g = c[1];
    const b = c[2];
    // linear sRGB to linear Rec.2020
    const r2 = 0.6274 * r + 0.3293 * g + 0.0433 * b;
    const g2 = 0.0691 * r + 0.9195 * g + 0.0113 * b;
    const b2 = 0.0164 * r + 0.088 * g + 0.8956 * b;
    // inset, then log2 encoding and the sigmoid
    const x = agxContrast(0.856627153315983 * r2 + 0.0951212405381588 * g2 + 0.0482516061458583 * b2);
    const y = agxContrast(0.137318972929847 * r2 + 0.761241990602591 * g2 + 0.101439036467562 * b2);
    const z = agxContrast(0.11189821299995 * r2 + 0.0767994186031903 * g2 + 0.811302368396859 * b2);
    // outset, then linearize with the 2.2 power three.js uses
    const lr = pow22(1.1271005818144368 * x - 0.11060664309660323 * y - 0.016493938717834573 * z);
    const lg = pow22(-0.1413297634984383 * x + 1.157823702216272 * y - 0.016493938717834257 * z);
    const lb = pow22(-0.14132976349843826 * x - 0.11060664309660294 * y + 1.2519364065950405 * z);
    // linear Rec.2020 to linear sRGB, then clip to the sRGB gamut
    out[0] = clamp01(1.6605 * lr - 0.5876 * lg - 0.0728 * lb);
    out[1] = clamp01(-0.1246 * lr + 1.1329 * lg - 0.0083 * lb);
    out[2] = clamp01(-0.0182 * lr - 0.1006 * lg + 1.1187 * lb);
    return out;
}

/**
 * Khronos PBR Neutral tone mapping, which keeps colors nearly unchanged below 0.76 and then compresses highlights.
 * Matches three.js NeutralToneMapping. Expects non-negative input. Returns `out`.
 */
export function neutral(out: Color, c: Const<Color>): Color {
    // lift the toe so near-black stays neutral
    const m = Math.min(c[0], c[1], c[2]);
    const offset = m < 0.08 ? m - 6.25 * m * m : 0.04;
    const r = c[0] - offset;
    const g = c[1] - offset;
    const b = c[2] - offset;
    const peak = Math.max(r, g, b);
    if (peak < 0.76) {
        out[0] = r;
        out[1] = g;
        out[2] = b;
        return out;
    }
    // compress the peak above 0.76 toward 1, then desaturate toward it by 0.15 of the compression
    const newPeak = 1 - (0.24 * 0.24) / (peak - 0.52);
    const s = newPeak / peak;
    const t = 1 - 1 / (0.15 * (peak - newPeak) + 1);
    out[0] = r * s * (1 - t) + newPeak * t;
    out[1] = g * s * (1 - t) + newPeak * t;
    out[2] = b * s * (1 - t) + newPeak * t;
    return out;
}

/**
 * Interpolate between `a` graded for `headroomA` and `b` graded for `headroomB` at display `headroom`, into `out`.
 * This is the CSS Color HDR hdr-color() interpolation. Headrooms are in stops, log2 of peak over reference white.
 * The weight clamps to [0, 1] so `a` is used below `headroomA` and `b` above `headroomB`, and equal headrooms give `a`.
 * Channels mix geometrically in absolute XYZ (203 cd/m² white) with a 0.001 cd/m² epsilon. Returns `out`.
 */
export function mixHeadroom(
    out: Color,
    a: Const<Color>,
    headroomA: number,
    b: Const<Color>,
    headroomB: number,
    headroom: number,
): Color {
    let t = headroomA === headroomB ? 0 : (headroom - headroomA) / (headroomB - headroomA);
    t = t > 0 ? (t < 1 ? t : 1) : 0;
    if (t === 0 || t === 1) {
        const s = t === 0 ? a : b;
        out[0] = s[0];
        out[1] = s[1];
        out[2] = s[2];
        return out;
    }
    const ar = a[0];
    const ag = a[1];
    const ab = a[2];
    // absolute XYZ of b, then of a, reusing `out` as the only storage
    // negative XYZ only comes from imaginary colors, it counts as 0 so the powers stay real
    linearSrgbToXyzD65(out, b);
    const bx = Math.max(out[0], 0) * 203 + 0.001;
    const by = Math.max(out[1], 0) * 203 + 0.001;
    const bz = Math.max(out[2], 0) * 203 + 0.001;
    out[0] = ar;
    out[1] = ag;
    out[2] = ab;
    linearSrgbToXyzD65(out, out);
    out[0] = ((Math.max(out[0], 0) * 203 + 0.001) ** (1 - t) * bx ** t - 0.001) / 203;
    out[1] = ((Math.max(out[1], 0) * 203 + 0.001) ** (1 - t) * by ** t - 0.001) / 203;
    out[2] = ((Math.max(out[2], 0) * 203 + 0.001) ** (1 - t) * bz ** t - 0.001) / 203;
    return xyzD65ToLinearSrgb(out, out);
}

function clamp01(x: number): number {
    return x > 0 ? (x < 1 ? x : 1) : 0;
}

// Stephen Hill's fit of the ACES reference rendering and output device transforms
function rrtAndOdtFit(v: number): number {
    return (v * (v + 0.0245786) - 0.000090537) / (v * (0.983729 * v + 0.432951) + 0.238081);
}

// log2 encode between -12.47393 and 4.026069 EV around middle gray, then the 6th order sigmoid fit
function agxContrast(v: number): number {
    const x = clamp01((Math.log2(v > 1e-10 ? v : 1e-10) + 12.47393) / (4.026069 + 12.47393));
    const x2 = x * x;
    const x4 = x2 * x2;
    return 15.5 * x4 * x2 - 40.14 * x4 * x + 31.96 * x4 - 6.868 * x2 * x + 0.4298 * x2 + 0.1191 * x - 0.00232;
}

function pow22(x: number): number {
    return x > 0 ? x ** 2.2 : 0;
}
