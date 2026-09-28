import type { Const } from '../core/const';
import type { Color } from './color';
import { formatAlpha, formatNumber } from './format';
import { type HueInterpolation, lerpHue } from './hue';
import { type Oklab, fromColor as oklabFromColor, toColor as oklabToColor } from './oklab';

// OKLCH is OKLab in polar form: lightness, chroma (colorfulness) and hue angle.
// It is the space for picking and adjusting colors by hand (CSS oklch(), oklch.com)
// and for hue-preserving gradients. Hue is in degrees so values copy straight from CSS.
// Below a tiny chroma the hue is powerless (the color is gray): it is stored as 0 and
// interpolation borrows the other endpoint's hue, like CSS "missing" hues.

/** An OKLCH color: [L, C, h]. L is lightness in [0, 1], C is chroma (0 is gray, about 0.37 is the most vivid P3), h is hue in degrees. */
export type Oklch = [l: number, c: number, h: number];

/** Create a new Oklch initialized to [0, 0, 0] (black). */
export function create(): Oklch {
    return [0, 0, 0];
}

/** Create a new Oklch with the given L, C, h (degrees) values. */
export function fromValues(l: number, c: number, h: number): Oklch {
    return [l, c, h];
}

/** Create a new Oklch that is a copy of `a`. */
export function clone(a: Const<Oklch>): Oklch {
    return [a[0], a[1], a[2]];
}

/** Copy the values from `src` into `out`. Returns `out`. */
export function copy(out: Oklch, src: Const<Oklch>): Oklch {
    out[0] = src[0];
    out[1] = src[1];
    out[2] = src[2];
    return out;
}

/** Set the L, C, h (degrees) components of `out` directly. Returns `out`. */
export function set(out: Oklch, l: number, c: number, h: number): Oklch {
    out[0] = l;
    out[1] = c;
    out[2] = h;
    return out;
}

/** Write the OKLCH of an OKLab color into `out`. Gray colors get hue 0. Returns `out`. */
export function fromOklab(out: Oklch, a: Const<Oklab>): Oklch {
    const A = a[1];
    const B = a[2];
    const c = Math.sqrt(A * A + B * B);
    let h = 0;
    if (c > 0.000004) {
        h = (Math.atan2(B, A) * 180) / Math.PI;
        if (h < 0) h += 360;
    }
    out[0] = a[0];
    out[1] = c;
    out[2] = h;
    return out;
}

/** Write the OKLab of an OKLCH color into `out`. Returns `out`. */
export function toOklab(out: Oklab, a: Const<Oklch>): Oklab {
    const c = a[1];
    const h = (a[2] * Math.PI) / 180;
    out[0] = a[0];
    out[1] = c * Math.cos(h);
    out[2] = c * Math.sin(h);
    return out;
}

/** Write the OKLCH of a linear Color into `out`. Returns `out`. */
export function fromColor(out: Oklch, c: Const<Color>): Oklch {
    return fromOklab(out, oklabFromColor(out, c));
}

/** Write the linear Color of an OKLCH into `out`. Alpha in `out` is left untouched. Returns `out`. */
export function toColor(out: Color, a: Const<Oklch>): Color {
    const c = a[1];
    const h = (a[2] * Math.PI) / 180;
    const l = a[0];
    out[0] = l;
    out[1] = c * Math.cos(h);
    out[2] = c * Math.sin(h);
    return oklabToColor(out, out as Oklab);
}

/**
 * Interpolate from `a` to `b` by `t` into `out`, going around the hue circle by `hue`
 * (CSS Color 4 methods, default 'shorter'). A gray endpoint takes the other endpoint's hue,
 * so white to blue stays blue instead of passing through red. Returns `out`.
 */
export function lerp(out: Oklch, a: Const<Oklch>, b: Const<Oklch>, t: number, hue: HueInterpolation = 'shorter'): Oklch {
    const ac = a[1];
    const bc = b[1];
    let ah = a[2];
    let bh = b[2];
    if (ac <= 0.000004) ah = bh;
    else if (bc <= 0.000004) bh = ah;
    out[0] = a[0] + (b[0] - a[0]) * t;
    out[1] = ac + (bc - ac) * t;
    out[2] = lerpHue(ah, bh, t, hue);
    return out;
}

/**
 * Interpolate two linear Colors through OKLCH by `t` into `out`, the hue-preserving gradient
 * of CSS `color-mix(in oklch <hue> hue, ...)`. Alpha is interpolated premultiplied. Returns `out`.
 */
export function mix(out: Color, a: Const<Color>, b: Const<Color>, t: number, hue: HueInterpolation = 'shorter'): Color {
    const a0 = a[0];
    const a1 = a[1];
    const a2 = a[2];
    const aa = a[3] ?? 1;
    const ba = b[3] ?? 1;
    const hasAlpha = a.length > 3 || b.length > 3 || out.length > 3;
    // out doubles as the OKLCH scratch, inputs are already read so aliasing is safe
    const lch = fromColor(out as Oklch, b);
    const bl = lch[0];
    const bc = lch[1];
    let bh = lch[2];
    fromColor(lch, set(lch, a0, a1, a2));
    const al = lch[0];
    const ac = lch[1];
    let ah = lch[2];
    if (ac <= 0.000004) ah = bh;
    else if (bc <= 0.000004) bh = ah;
    const alpha = aa + (ba - aa) * t;
    const inv = alpha === 0 ? 0 : 1 / alpha;
    // premultiply every channel except hue
    lch[0] = (al * aa + (bl * ba - al * aa) * t) * inv;
    lch[1] = (ac * aa + (bc * ba - ac * aa) * t) * inv;
    lch[2] = lerpHue(ah, bh, t, hue);
    toColor(out, lch);
    if (hasAlpha) out[3] = alpha;
    return out;
}

/** Create a CSS `oklch(...)` string, with an optional alpha. */
export function toCSS(a: Const<Oklch>, alpha = 1): string {
    return `oklch(${formatNumber(a[0], 5)} ${formatNumber(a[1], 5)} ${formatNumber(a[2], 3)}${formatAlpha(alpha)})`;
}
