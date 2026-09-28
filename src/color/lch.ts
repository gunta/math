import type { Const } from '../core/const';
import type { Color } from './color';
import { formatAlpha, formatNumber } from './format';
import { type HueInterpolation, lerpHue } from './hue';
import { type Lab, fromColor as labFromColor, toColor as labToColor } from './lab';

// CIE LCH is CIE Lab (D50) in polar form, as CSS lch() uses: lightness, chroma and hue
// in degrees. Below a chroma of 0.0015 the hue is powerless: it is stored as 0 and
// interpolation borrows the other endpoint's hue.

/** A CIE LCH (D50) color: [L, C, h]. L in [0, 100], chroma C from 0 (gray) to about 150, hue in degrees. */
export type Lch = [l: number, c: number, h: number];

/** Create a new Lch initialized to [0, 0, 0] (black). */
export function create(): Lch {
    return [0, 0, 0];
}

/** Create a new Lch with the given L, C, h (degrees) values. */
export function fromValues(l: number, c: number, h: number): Lch {
    return [l, c, h];
}

/** Create a new Lch that is a copy of `a`. */
export function clone(a: Const<Lch>): Lch {
    return [a[0], a[1], a[2]];
}

/** Copy the values from `src` into `out`. Returns `out`. */
export function copy(out: Lch, src: Const<Lch>): Lch {
    out[0] = src[0];
    out[1] = src[1];
    out[2] = src[2];
    return out;
}

/** Set the L, C, h (degrees) components of `out` directly. Returns `out`. */
export function set(out: Lch, l: number, c: number, h: number): Lch {
    out[0] = l;
    out[1] = c;
    out[2] = h;
    return out;
}

/** Write the LCH of a CIE Lab color into `out`. Gray colors get hue 0. Returns `out`. */
export function fromLab(out: Lch, a: Const<Lab>): Lch {
    const A = a[1];
    const B = a[2];
    const c = Math.sqrt(A * A + B * B);
    let h = 0;
    if (c > 0.0015) {
        h = (Math.atan2(B, A) * 180) / Math.PI;
        if (h < 0) h += 360;
    }
    out[0] = a[0];
    out[1] = c;
    out[2] = h;
    return out;
}

/** Write the CIE Lab of an LCH color into `out`. Returns `out`. */
export function toLab(out: Lab, a: Const<Lch>): Lab {
    const c = a[1];
    const h = (a[2] * Math.PI) / 180;
    out[0] = a[0];
    out[1] = c * Math.cos(h);
    out[2] = c * Math.sin(h);
    return out;
}

/** Write the CIE LCH of a linear Color into `out`. Returns `out`. */
export function fromColor(out: Lch, c: Const<Color>): Lch {
    return fromLab(out, labFromColor(out, c));
}

/** Write the linear Color of a CIE LCH into `out`. Alpha in `out` is left untouched. Returns `out`. */
export function toColor(out: Color, a: Const<Lch>): Color {
    return labToColor(out, toLab(out as Lab, a));
}

/**
 * Interpolate from `a` to `b` by `t` into `out`, going around the hue circle by `hue`
 * (CSS Color 4 methods, default 'shorter'). A gray endpoint takes the other endpoint's hue. Returns `out`.
 */
export function lerp(out: Lch, a: Const<Lch>, b: Const<Lch>, t: number, hue: HueInterpolation = 'shorter'): Lch {
    const ac = a[1];
    const bc = b[1];
    let ah = a[2];
    let bh = b[2];
    if (ac <= 0.0015) ah = bh;
    else if (bc <= 0.0015) bh = ah;
    out[0] = a[0] + (b[0] - a[0]) * t;
    out[1] = ac + (bc - ac) * t;
    out[2] = lerpHue(ah, bh, t, hue);
    return out;
}

/** Create a CSS `lch(...)` string, with an optional alpha. */
export function toCSS(a: Const<Lch>, alpha = 1): string {
    return `lch(${formatNumber(a[0], 4)} ${formatNumber(a[1], 4)} ${formatNumber(a[2], 3)}${formatAlpha(alpha)})`;
}
