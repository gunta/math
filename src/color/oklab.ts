import type { Const } from '../core/const';
import type { Color } from './color';
import { formatAlpha, formatNumber } from './format';

// OKLab (Björn Ottosson, 2020) is a perceptual color space: equal distances look
// equally different, and lightness, chroma and hue stay independent. Use it for
// gradients, palettes and color difference. It is not cheaper than linear sRGB
// (two matrices and three cube roots per conversion), so convert at the edges and
// keep lighting and blending in linear Color.
//
// Matrices are the CSS Color 4 ones, with linear sRGB -> XYZ folded into the LMS step.

/** An OKLab color: [L, a, b]. L is lightness (0 black, 1 reference white), a and b are opponent axes in about [-0.4, 0.4]. */
export type Oklab = [l: number, a: number, b: number];

/** Create a new Oklab initialized to [0, 0, 0] (black). */
export function create(): Oklab {
    return [0, 0, 0];
}

/** Create a new Oklab with the given L, a, b values. */
export function fromValues(l: number, a: number, b: number): Oklab {
    return [l, a, b];
}

/** Create a new Oklab that is a copy of `a`. */
export function clone(a: Const<Oklab>): Oklab {
    return [a[0], a[1], a[2]];
}

/** Copy the values from `src` into `out`. Returns `out`. */
export function copy(out: Oklab, src: Const<Oklab>): Oklab {
    out[0] = src[0];
    out[1] = src[1];
    out[2] = src[2];
    return out;
}

/** Set the L, a, b components of `out` directly. Returns `out`. */
export function set(out: Oklab, l: number, a: number, b: number): Oklab {
    out[0] = l;
    out[1] = a;
    out[2] = b;
    return out;
}

/** Write the OKLab of a linear Color into `out`. Returns `out`. */
export function fromColor(out: Oklab, c: Const<Color>): Oklab {
    const r = c[0];
    const g = c[1];
    const b = c[2];
    const l = Math.cbrt(0.41222146947076305 * r + 0.5363325372617348 * g + 0.05144599326750221 * b);
    const m = Math.cbrt(0.21190349581782522 * r + 0.6806995506452344 * g + 0.10739695353694056 * b);
    const s = Math.cbrt(0.08830245919005643 * r + 0.2817188391361215 * g + 0.6299787016738222 * b);
    out[0] = 0.210454268309314 * l + 0.7936177747023054 * m - 0.0040720430116193 * s;
    out[1] = 1.9779985324311684 * l - 2.4285922420485799 * m + 0.450593709617411 * s;
    out[2] = 0.0259040424655478 * l + 0.7827717124575296 * m - 0.8086757549230774 * s;
    return out;
}

/** Write the linear Color of an OKLab into `out`. Alpha in `out` is left untouched. Returns `out`. */
export function toColor(out: Color, a: Const<Oklab>): Color {
    const L = a[0];
    const A = a[1];
    const B = a[2];
    const l = L + 0.3963377773761749 * A + 0.2158037573099136 * B;
    const m = L - 0.1055613458156586 * A - 0.0638541728258133 * B;
    const s = L - 0.0894841775298119 * A - 1.2914855480194092 * B;
    const l3 = l * l * l;
    const m3 = m * m * m;
    const s3 = s * s * s;
    out[0] = 4.076741636075958 * l3 - 3.3077115392580616 * m3 + 0.2309699031821043 * s3;
    out[1] = -1.2684379732850317 * l3 + 2.6097573492876887 * m3 - 0.34131937600265727 * s3;
    out[2] = -0.004196076138675564 * l3 - 0.7034186179359363 * m3 + 1.7076146940746117 * s3;
    return out;
}

/** Linearly interpolate from `a` to `b` by `t` into `out`. Returns `out`. */
export function lerp(out: Oklab, a: Const<Oklab>, b: Const<Oklab>, t: number): Oklab {
    out[0] = a[0] + (b[0] - a[0]) * t;
    out[1] = a[1] + (b[1] - a[1]) * t;
    out[2] = a[2] + (b[2] - a[2]) * t;
    return out;
}

/**
 * Interpolate two linear Colors through OKLab by `t` into `out`, like CSS `color-mix(in oklab, ...)`. Returns `out`.
 * The perceptually even gradient. Alpha is interpolated premultiplied.
 */
export function mix(out: Color, a: Const<Color>, b: Const<Color>, t: number): Color {
    const a0 = a[0];
    const a1 = a[1];
    const a2 = a[2];
    const aa = a[3] ?? 1;
    const ba = b[3] ?? 1;
    const hasAlpha = a.length > 3 || b.length > 3 || out.length > 3;
    // out doubles as the OKLab scratch, inputs are already read so aliasing is safe
    const lab = fromColor(out as Oklab, b);
    const bl = lab[0] * ba;
    const bA = lab[1] * ba;
    const bB = lab[2] * ba;
    fromColor(lab, set(lab, a0, a1, a2));
    const alpha = aa + (ba - aa) * t;
    const inv = alpha === 0 ? 0 : 1 / alpha;
    lab[0] = (lab[0] * aa + (bl - lab[0] * aa) * t) * inv;
    lab[1] = (lab[1] * aa + (bA - lab[1] * aa) * t) * inv;
    lab[2] = (lab[2] * aa + (bB - lab[2] * aa) * t) * inv;
    toColor(out, lab);
    if (hasAlpha) out[3] = alpha;
    return out;
}

/** Euclidean distance between two OKLab colors (ΔEOK). About 0.02 is a just-noticeable difference. */
export function deltaEOK(a: Const<Oklab>, b: Const<Oklab>): number {
    const dl = a[0] - b[0];
    const da = a[1] - b[1];
    const db = a[2] - b[2];
    return Math.sqrt(dl * dl + da * da + db * db);
}

/** Create a CSS `oklab(...)` string, with an optional alpha. */
export function toCSS(a: Const<Oklab>, alpha = 1): string {
    return `oklab(${formatNumber(a[0], 5)} ${formatNumber(a[1], 5)} ${formatNumber(a[2], 5)}${formatAlpha(alpha)})`;
}
