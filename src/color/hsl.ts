import type { Const } from '../core/const';
import type { Color } from './color';
import { linearToSrgb, srgbToLinear } from './colorspace';

/** A hue-saturation-lightness color: [h, s, l], all in [0, 1] (hue wraps). */
export type HSL = [hue: number, saturation: number, lightness: number];

/** Create a new HSL initialized to [0, 0, 0] (black). */
export function create(): HSL {
    return [0, 0, 0];
}

/** Create a new HSL with the given h, s, l values (all in [0, 1]). */
export function fromValues(h: number, s: number, l: number): HSL {
    return [h, s, l];
}

/** Create a new HSL that is a copy of `a`. */
export function clone(a: Const<HSL>): HSL {
    return [a[0], a[1], a[2]];
}

/** Copy the values from `src` into `out`. Returns `out`. */
export function copy(out: HSL, src: Const<HSL>): HSL {
    out[0] = src[0];
    out[1] = src[1];
    out[2] = src[2];
    return out;
}

/** Set the h, s, l components of `out` directly. Returns `out`. */
export function set(out: HSL, h: number, s: number, l: number): HSL {
    out[0] = h;
    out[1] = s;
    out[2] = l;
    return out;
}

/** Write the HSL of a linear Color into `out`. Returns `out`. */
export function fromColor(out: HSL, c: Const<Color>): HSL {
    // linear -> sRGB gamma; HSL is defined on gamma-encoded sRGB
    const r = linearToSrgb(c[0]);
    const g = linearToSrgb(c[1]);
    const b = linearToSrgb(c[2]);

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;

    let h = 0;
    let s = 0;
    if (max !== min) {
        const d = max - min;
        s = l === 0 || l === 1 ? 0 : (max - l) / Math.min(l, 1 - l);
        if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
        else if (max === g) h = (b - r) / d + 2;
        else h = (r - g) / d + 4;
        h /= 6;
    }
    // colors far outside sRGB give a negative saturation, point the hue the other way instead (CSS Color 4)
    if (s < 0) {
        h += 0.5;
        s = -s;
    }
    if (h >= 1) h -= 1;

    out[0] = h;
    out[1] = s;
    out[2] = l;
    return out;
}

/**
 * Write the linear Color of an HSL into `out`. Returns `out`.
 * Uses the CSS Color 4 formula, which also holds for saturation and lightness outside [0, 1].
 */
export function toColor(out: Color, a: Const<HSL>): Color {
    // hue in twelfths of a turn, wrapped into [0, 12)
    let h = a[0] * 12;
    h -= 12 * Math.floor(h / 12);
    const l = a[2];
    const k = a[1] * Math.min(l, 1 - l);
    out[0] = srgbToLinear(l - k * channel(h));
    out[1] = srgbToLinear(l - k * channel(h + 8));
    out[2] = srgbToLinear(l - k * channel(h + 4));
    return out;
}

/**
 * Interpolate from `a` to `b` by `t` into `out`, taking the shortest path around
 * the hue wheel (so e.g. 350°→10° passes through 0°, not all the way back).
 * Returns `out`.
 */
export function lerp(out: HSL, a: Const<HSL>, b: Const<HSL>, t: number): HSL {
    let dh = b[0] - a[0];
    if (dh > 0.5) dh -= 1;
    else if (dh < -0.5) dh += 1;

    let h = a[0] + dh * t;
    h -= Math.floor(h); // wrap into [0, 1)

    out[0] = h;
    out[1] = a[1] + (b[1] - a[1]) * t;
    out[2] = a[2] + (b[2] - a[2]) * t;
    return out;
}

/**
 * Offset `a` by (dh, ds, dl) into `out`: hue wraps into [0, 1), saturation and
 * lightness are clamped to [0, 1]. Returns `out`.
 */
export function offset(out: HSL, a: Const<HSL>, dh: number, ds: number, dl: number): HSL {
    let h = a[0] + dh;
    h -= Math.floor(h);
    out[0] = h;
    out[1] = clamp01(a[1] + ds);
    out[2] = clamp01(a[2] + dl);
    return out;
}

function clamp01(x: number): number {
    return x < 0 ? 0 : x > 1 ? 1 : x;
}

// the CSS Color 4 hsl channel ramp for a hue offset in twelfths of a turn
function channel(n: number): number {
    const k = n < 12 ? n : n - 12;
    return Math.max(-1, Math.min(k - 3, 9 - k, 1));
}
