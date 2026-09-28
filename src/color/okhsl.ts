import type { Const } from '../core/const';
import type { Color } from './color';
import { type HueInterpolation, lerpHue } from './hue';
import { type Oklab, fromColor as oklabFromColor, toColor as oklabToColor } from './oklab';
import { okhslChromas, toe, toeInv } from './oklab-srgb-gamut';

// Okhsl (Björn Ottosson, 2021) is HSL rebuilt on OKLab, for color pickers: hue and
// lightness are perceptual, and saturation 1 always reaches the edge of the sRGB gamut,
// so every [h, s, l] is a valid sRGB color. Unlike HSL, lightness is even across hues
// (yellow and blue at l = 0.5 look equally light).

/** An Okhsl color: [h, s, l]. Hue in degrees, saturation and lightness in [0, 1]. */
export type Okhsl = [h: number, s: number, l: number];

/** Create a new Okhsl initialized to [0, 0, 0] (black). */
export function create(): Okhsl {
    return [0, 0, 0];
}

/** Create a new Okhsl with the given h (degrees), s, l values. */
export function fromValues(h: number, s: number, l: number): Okhsl {
    return [h, s, l];
}

/** Create a new Okhsl that is a copy of `a`. */
export function clone(a: Const<Okhsl>): Okhsl {
    return [a[0], a[1], a[2]];
}

/** Copy the values from `src` into `out`. Returns `out`. */
export function copy(out: Okhsl, src: Const<Okhsl>): Okhsl {
    out[0] = src[0];
    out[1] = src[1];
    out[2] = src[2];
    return out;
}

/** Set the h (degrees), s, l components of `out` directly. Returns `out`. */
export function set(out: Okhsl, h: number, s: number, l: number): Okhsl {
    out[0] = h;
    out[1] = s;
    out[2] = l;
    return out;
}

/** Write the Okhsl of an OKLab color into `out`. Gray colors get hue 0. Returns `out`. */
export function fromOklab(out: Okhsl, lab: Const<Oklab>): Okhsl {
    const L = lab[0];
    const A = lab[1];
    const B = lab[2];
    const c = Math.sqrt(A * A + B * B);
    const l = toe(L);
    let s = 0;
    let h = 0;
    if (l !== 0 && l !== 1 && c !== 0) {
        const cs = okhslChromas(out, L, A / c, B / c);
        const c0 = cs[0];
        const cMid = cs[1];
        const cMax = cs[2];
        if (c < cMid) {
            const k1 = 0.8 * c0;
            s = (0.8 * c) / (k1 + (1 - k1 / cMid) * c);
        } else {
            const k1 = (0.2 * cMid * cMid * 1.5625) / c0;
            const d = c - cMid;
            s = 0.8 + (0.2 * d) / (k1 + (1 - k1 / (cMax - cMid)) * d);
        }
        // near white the hue is powerless, and so is it when saturation is negligible
        if (Math.abs(1 - l) < 0.0000001) s = 0;
        else if (Math.abs(s) >= 0.0001) {
            h = (Math.atan2(B, A) * 180) / Math.PI;
            if (h < 0) h += 360;
        }
    }
    out[0] = h;
    out[1] = s;
    out[2] = l;
    return out;
}

/** Write the OKLab of an Okhsl color into `out`. Returns `out`. */
export function toOklab(out: Oklab, a: Const<Okhsl>): Oklab {
    const h = (a[0] * Math.PI) / 180;
    const s = a[1];
    const L = toeInv(a[2]);
    let c = 0;
    if (L !== 0 && L !== 1 && s !== 0) {
        const ca = Math.cos(h);
        const cb = Math.sin(h);
        const cs = okhslChromas(out, L, ca, cb);
        const c0 = cs[0];
        const cMid = cs[1];
        const cMax = cs[2];
        if (s < 0.8) {
            const t = 1.25 * s;
            const k1 = 0.8 * c0;
            c = (t * k1) / (1 - (1 - k1 / cMid) * t);
        } else {
            const t = 5 * (s - 0.8);
            const k1 = (0.2 * cMid * cMid * 1.5625) / c0;
            c = cMid + (t * k1) / (1 - (1 - k1 / (cMax - cMid)) * t);
        }
        out[1] = c * ca;
        out[2] = c * cb;
    } else {
        out[1] = 0;
        out[2] = 0;
    }
    out[0] = L;
    return out;
}

/** Write the Okhsl of a linear Color into `out`. Returns `out`. */
export function fromColor(out: Okhsl, c: Const<Color>): Okhsl {
    return fromOklab(out, oklabFromColor(out, c));
}

/** Write the linear Color of an Okhsl into `out`. Alpha in `out` is left untouched. Returns `out`. */
export function toColor(out: Color, a: Const<Okhsl>): Color {
    return oklabToColor(out, toOklab(out as Oklab, a));
}

/**
 * Interpolate from `a` to `b` by `t` into `out`, around the hue circle by a CSS `hue` method (default 'shorter'). Returns `out`.
 * A gray endpoint takes the other endpoint's hue.
 */
export function lerp(out: Okhsl, a: Const<Okhsl>, b: Const<Okhsl>, t: number, hue: HueInterpolation = 'shorter'): Okhsl {
    const as = a[1];
    const bs = b[1];
    let ah = a[0];
    let bh = b[0];
    if (as < 0.0001) ah = bh;
    else if (bs < 0.0001) bh = ah;
    out[0] = lerpHue(ah, bh, t, hue);
    out[1] = as + (bs - as) * t;
    out[2] = a[2] + (b[2] - a[2]) * t;
    return out;
}
