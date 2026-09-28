import type { MutableArrayLike } from '../core/arrays';
import type { Const } from '../core/const';
import { linearToSrgb, srgbToLinear } from './colorspace';

export * from './parse';

/**
 * A linear-sRGB color: [r, g, b] floats with an optional straight (unpremultiplied) alpha.
 * [0, 1] is the sRGB gamut, but values are unbounded: channels outside [0, 1] describe
 * wide-gamut colors, and values above 1 are HDR with 1.0 as reference white (203 cd/m², BT.2408).
 * A missing alpha means opaque. Channel math (conversions, tone mapping, gamut mapping, arithmetic)
 * reads and writes r, g, b only, so alpha passes through untouched.
 */
export type Color = [r: number, g: number, b: number, a?: number];

/** Accepted input types for creating or parsing a Color. */
export type ColorInput =
    | string // any CSS color: '#f00', 'red', 'rgb(255 0 0 / 50%)', 'oklch(70% 0.1 200)', 'color(display-p3 1 0 0)', ...
    | number // 0xff0000 integer (sRGB gamma)
    | Const<Color>; // [r, g, b] or [r, g, b, a] linear floats

/** Create a new Color initialized to black [0, 0, 0]. */
export function create(): Color {
    return [0, 0, 0];
}

/** Create a new Color with the given linear r, g, b values and an optional alpha. */
export function fromValues(r: number, g: number, b: number, a?: number): Color {
    return a === undefined ? [r, g, b] : [r, g, b, a];
}

/** Create a new Color that is a copy of `c`, keeping its alpha if it has one. */
export function clone(c: Const<Color>): Color {
    return c.length > 3 ? [c[0], c[1], c[2], c[3]] : [c[0], c[1], c[2]];
}

/** Copy the values from `src` into `out`, including alpha when either has one. Returns `out`. */
export function copy(out: Color, src: Const<Color>): Color {
    out[0] = src[0];
    out[1] = src[1];
    out[2] = src[2];
    if (src.length > 3 || out.length > 3) out[3] = src[3] ?? 1;
    return out;
}

/** Set the linear r, g, b components of `out` directly, and alpha when given. Returns `out`. */
export function set(out: Color, r: number, g: number, b: number, a?: number): Color {
    out[0] = r;
    out[1] = g;
    out[2] = b;
    if (a !== undefined) out[3] = a;
    return out;
}

/** Set all three channels of `out` to the same linear value `s` (a gray). Returns `out`. */
export function setScalar(out: Color, s: number): Color {
    out[0] = s;
    out[1] = s;
    out[2] = s;
    return out;
}

/**
 * Set `out` from an sRGB gamma-encoded [r, g, b] array with values in [0, 1].
 * Converts from sRGB gamma space to linear. Returns `out`.
 */
export function setFromSRGB(out: Color, srgb: readonly [number, number, number]): Color {
    out[0] = srgbToLinear(srgb[0]);
    out[1] = srgbToLinear(srgb[1]);
    out[2] = srgbToLinear(srgb[2]);
    return out;
}

/** Create a new Color from an sRGB gamma-encoded [r, g, b] array with values in [0, 1]. */
export function fromSRGB(srgb: readonly [number, number, number]): Color {
    return setFromSRGB(create(), srgb);
}

/** Write the sRGB gamma-encoded [r, g, b] of a linear Color into `out` (values [0, 1]). */
export function toSRGB(out: [number, number, number], c: Const<Color>): [number, number, number] {
    out[0] = linearToSrgb(c[0]);
    out[1] = linearToSrgb(c[1]);
    out[2] = linearToSrgb(c[2]);
    return out;
}

/** Read the r, g, b of a Color from `buffer` at `startIndex` into `out`. Returns `out`. */
export function fromBuffer(out: Color, buffer: ArrayLike<number>, startIndex: number): Color {
    out[0] = buffer[startIndex];
    out[1] = buffer[startIndex + 1];
    out[2] = buffer[startIndex + 2];
    return out;
}

/** Write the r, g, b of `c` into `outBuffer` at `startIndex`. Returns `outBuffer`. */
export function toBuffer(outBuffer: MutableArrayLike<number>, c: Const<Color>, startIndex: number): MutableArrayLike<number> {
    outBuffer[startIndex] = c[0];
    outBuffer[startIndex + 1] = c[1];
    outBuffer[startIndex + 2] = c[2];
    return outBuffer;
}

/**
 * Run a color function over every color packed in `buffer`, writing the results to `outBuffer`. Returns `outBuffer`.
 *
 * `buffer` is for example a Float32Array of vertex colors or pixels. *
 * `convert` is any `(out, c)` color function: a colorspace conversion, `oklab.fromColor`,
 * `tonemap.agx`, `gamut.mapToSrgb`, ... Colors are `stride` numbers apart. Only the first three
 * numbers of each color are converted. The rest (alpha) are copied across. `outBuffer` may be
 * `buffer` to convert in place.
 */
export function convertBuffer(
    outBuffer: MutableArrayLike<number>,
    buffer: ArrayLike<number>,
    convert: (out: [number, number, number], c: readonly [number, number, number]) => unknown,
    stride = 3,
): MutableArrayLike<number> {
    const tmp: [number, number, number] = [0, 0, 0];
    const end = buffer.length - 2;
    for (let i = 0; i < end; i += stride) {
        tmp[0] = buffer[i];
        tmp[1] = buffer[i + 1];
        tmp[2] = buffer[i + 2];
        convert(tmp, tmp);
        outBuffer[i] = tmp[0];
        outBuffer[i + 1] = tmp[1];
        outBuffer[i + 2] = tmp[2];
        for (let k = 3; k < stride; k++) outBuffer[i + k] = buffer[i + k];
    }
    return outBuffer;
}

/** Create a CSS `rgb(...)` string (or `rgba(...)` with alpha) in sRGB gamma space, clamped to the sRGB gamut. */
export function toCSS(c: Const<Color>): string {
    const a = c[3] ?? 1;
    const rgb = `${to255(c[0])}, ${to255(c[1])}, ${to255(c[2])}`;
    return a < 1 ? `rgba(${rgb}, ${+Math.max(0, a).toFixed(3)})` : `rgb(${rgb})`;
}

/** Convert to a 0xRRGGBB integer in sRGB gamma space. */
export function toHex(c: Const<Color>): number {
    return (to255(c[0]) << 16) | (to255(c[1]) << 8) | to255(c[2]);
}

/** Convert to a 6-digit sRGB hex string without a leading '#', e.g. 'ff8800'. */
export function toHexString(c: Const<Color>): string {
    return toHex(c).toString(16).padStart(6, '0');
}

/** Add `a + b` component-wise into `out`. Returns `out`. */
export function add(out: Color, a: Const<Color>, b: Const<Color>): Color {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    out[2] = a[2] + b[2];
    return out;
}

/** Add scalar `s` to each channel of `a` into `out`. Returns `out`. */
export function addScalar(out: Color, a: Const<Color>, s: number): Color {
    out[0] = a[0] + s;
    out[1] = a[1] + s;
    out[2] = a[2] + s;
    return out;
}

/** Subtract `a - b` component-wise into `out`. Returns `out`. */
export function sub(out: Color, a: Const<Color>, b: Const<Color>): Color {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    out[2] = a[2] - b[2];
    return out;
}

/** Multiply `a * b` component-wise into `out` (tinting). Returns `out`. */
export function multiply(out: Color, a: Const<Color>, b: Const<Color>): Color {
    out[0] = a[0] * b[0];
    out[1] = a[1] * b[1];
    out[2] = a[2] * b[2];
    return out;
}

/** Scale each channel of `a` by `s` into `out` (brightness). Returns `out`. */
export function multiplyScalar(out: Color, a: Const<Color>, s: number): Color {
    out[0] = a[0] * s;
    out[1] = a[1] * s;
    out[2] = a[2] * s;
    return out;
}

/**
 * Linearly interpolate from `a` to `b` by `t` into `out` (physically-correct blend). Returns `out`.
 * When either color has alpha, channels are interpolated premultiplied, as CSS Color 4 specifies,
 * so a transparent endpoint does not bleed its color into the blend. A fully transparent result
 * keeps its premultiplied values, also as CSS specifies.
 */
export function lerp(out: Color, a: Const<Color>, b: Const<Color>, t: number): Color {
    if (a.length > 3 || b.length > 3 || out.length > 3) {
        const aa = a[3] ?? 1;
        const ba = b[3] ?? 1;
        const alpha = aa + (ba - aa) * t;
        const inv = alpha === 0 ? 1 : 1 / alpha;
        out[0] = (a[0] * aa + (b[0] * ba - a[0] * aa) * t) * inv;
        out[1] = (a[1] * aa + (b[1] * ba - a[1] * aa) * t) * inv;
        out[2] = (a[2] * aa + (b[2] * ba - a[2] * aa) * t) * inv;
        out[3] = alpha;
        return out;
    }
    out[0] = a[0] + (b[0] - a[0]) * t;
    out[1] = a[1] + (b[1] - a[1]) * t;
    out[2] = a[2] + (b[2] - a[2]) * t;
    return out;
}

/** Multiply r, g, b by alpha into `out` (premultiplied alpha), keeping alpha. Returns `out`. */
export function premultiply(out: Color, c: Const<Color>): Color {
    const a = c[3] ?? 1;
    out[0] = c[0] * a;
    out[1] = c[1] * a;
    out[2] = c[2] * a;
    if (a !== 1 || out.length > 3) out[3] = a;
    return out;
}

/** Divide premultiplied r, g, b by alpha into `out` (straight alpha), keeping alpha. At alpha 0 the values are kept, as CSS does. Returns `out`. */
export function unpremultiply(out: Color, c: Const<Color>): Color {
    const a = c[3] ?? 1;
    const inv = a === 0 ? 1 : 1 / a;
    out[0] = c[0] * inv;
    out[1] = c[1] * inv;
    out[2] = c[2] * inv;
    if (a !== 1 || out.length > 3) out[3] = a;
    return out;
}

/**
 * Composite `src` over `dst` into `out` (Porter-Duff source-over, straight alpha, in linear light).
 * Returns `out`.
 */
export function over(out: Color, src: Const<Color>, dst: Const<Color>): Color {
    const sa = src[3] ?? 1;
    const da = (dst[3] ?? 1) * (1 - sa);
    const a = sa + da;
    const inv = a === 0 ? 1 : 1 / a;
    out[0] = (src[0] * sa + dst[0] * da) * inv;
    out[1] = (src[1] * sa + dst[1] * da) * inv;
    out[2] = (src[2] * sa + dst[2] * da) * inv;
    if (a !== 1 || out.length > 3) out[3] = a;
    return out;
}

/** Clamp each channel of `c` to [0, 1] into `out`. Returns `out`. */
export function clamp(out: Color, c: Const<Color>): Color {
    out[0] = clamp01(c[0]);
    out[1] = clamp01(c[1]);
    out[2] = clamp01(c[2]);
    return out;
}

/** Whether `a` and `b` are equal (alpha included, missing alpha is 1), within an optional per-channel `epsilon`. */
export function equals(a: Const<Color>, b: Const<Color>, epsilon = 0): boolean {
    return (
        Math.abs(a[0] - b[0]) <= epsilon &&
        Math.abs(a[1] - b[1]) <= epsilon &&
        Math.abs(a[2] - b[2]) <= epsilon &&
        Math.abs((a[3] ?? 1) - (b[3] ?? 1)) <= epsilon
    );
}

/** Relative luminance in [0, 1] (Rec. 709 weights, on linear light). */
export function luminance(c: Const<Color>): number {
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}

/** WCAG 2 contrast ratio between two colors, from 1 (none) to 21 (black on white). Order does not matter. */
export function contrastRatio(a: Const<Color>, b: Const<Color>): number {
    const la = Math.max(0, 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2]);
    const lb = Math.max(0, 0.2126 * b[0] + 0.7152 * b[1] + 0.0722 * b[2]);
    return la > lb ? (la + 0.05) / (lb + 0.05) : (lb + 0.05) / (la + 0.05);
}

/**
 * Write white or black into `out`, whichever contrasts more with `background` (CSS contrast-color()). Returns `out`.
 * Uses the WCAG 2 contrast ratio, ties pick white, and the result is always at least 4.58:1.
 */
export function contrastColor(out: Color, background: Const<Color>): Color {
    const l = Math.max(0, 0.2126 * background[0] + 0.7152 * background[1] + 0.0722 * background[2]);
    // white wins when 1.05 / (l + 0.05) >= (l + 0.05) / 0.05
    const v = (l + 0.05) * (l + 0.05) <= 0.0525 ? 1 : 0;
    out[0] = v;
    out[1] = v;
    out[2] = v;
    if (out.length > 3) out[3] = 1;
    return out;
}

function clamp01(x: number): number {
    return x < 0 ? 0 : x > 1 ? 1 : x;
}

/** linear channel -> clamped sRGB byte [0, 255], with NaN as 0. */
function to255(c: number): number {
    const v = Math.round(linearToSrgb(c) * 255);
    return v > 0 ? (v < 255 ? v : 255) : 0;
}
