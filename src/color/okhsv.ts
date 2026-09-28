import type { Const } from '../core/const';
import type { Color } from './color';
import { type HueInterpolation, lerpHue } from './hue';
import { type Oklab, fromColor as oklabFromColor, toColor as oklabToColor } from './oklab';
import { cuspLightness, maxChannel, maxSaturation, toe, toeInv } from './oklab-srgb-gamut';

// Okhsv (Björn Ottosson, 2021) is HSV rebuilt on OKLab, for color pickers: the classic
// saturation / value square, but with perceptual hue and lightness. Every [h, s, v] with
// s and v in [0, 1] is a valid sRGB color, and s = v = 1 is the most colorful sRGB color of that hue.

/** An Okhsv color: [h, s, v]. Hue in degrees, saturation and value in [0, 1]. */
export type Okhsv = [h: number, s: number, v: number];

/** Create a new Okhsv initialized to [0, 0, 0] (black). */
export function create(): Okhsv {
    return [0, 0, 0];
}

/** Create a new Okhsv with the given h (degrees), s, v values. */
export function fromValues(h: number, s: number, v: number): Okhsv {
    return [h, s, v];
}

/** Create a new Okhsv that is a copy of `a`. */
export function clone(a: Const<Okhsv>): Okhsv {
    return [a[0], a[1], a[2]];
}

/** Copy the values from `src` into `out`. Returns `out`. */
export function copy(out: Okhsv, src: Const<Okhsv>): Okhsv {
    out[0] = src[0];
    out[1] = src[1];
    out[2] = src[2];
    return out;
}

/** Set the h (degrees), s, v components of `out` directly. Returns `out`. */
export function set(out: Okhsv, h: number, s: number, v: number): Okhsv {
    out[0] = h;
    out[1] = s;
    out[2] = v;
    return out;
}

/** Write the Okhsv of an OKLab color into `out`. Gray colors get hue 0. Returns `out`. */
export function fromOklab(out: Okhsv, lab: Const<Oklab>): Okhsv {
    const L = lab[0];
    const A = lab[1];
    const B = lab[2];
    const c = Math.sqrt(A * A + B * B);
    let s = 0;
    let v = toe(L);
    let h = 0;
    if (L !== 0 && L !== 1 && c !== 0) {
        const a = A / c;
        const b = B / c;
        const sCusp = maxSaturation(a, b);
        const cuspL = cuspLightness(a, b, sCusp);
        const cuspC = cuspL * sCusp;
        const tMax = cuspC / (1 - cuspL);
        const k = 1 - (0.5 * cuspL) / cuspC;

        // project onto the triangle (black, white, cusp) and undo the toe
        const t = tMax / (c + L * tMax);
        const lv = t * L;
        const cv = t * c;
        const lvt = toeInv(lv);
        const cvt = (cv * lvt) / lv;
        const scale = Math.cbrt(1 / Math.max(maxChannel(lvt, a * cvt, b * cvt), 0));
        const l = L / scale;
        v = toe(l) / lv;
        s = ((0.5 + tMax) * cv) / (tMax * 0.5 + tMax * k * cv);
        if (Math.abs(s) >= 0.0001 && v !== 0) {
            h = (Math.atan2(B, A) * 180) / Math.PI;
            if (h < 0) h += 360;
        }
    }
    out[0] = h;
    out[1] = s;
    out[2] = v;
    return out;
}

/** Write the OKLab of an Okhsv color into `out`. Returns `out`. */
export function toOklab(out: Oklab, a: Const<Okhsv>): Oklab {
    const h = (a[0] * Math.PI) / 180;
    const s = a[1];
    const v = a[2];
    let L = toeInv(v);
    let c = 0;
    let ca = 0;
    let cb = 0;
    if (L !== 0 && s !== 0) {
        ca = Math.cos(h);
        cb = Math.sin(h);
        const sCusp = maxSaturation(ca, cb);
        const cuspL = cuspLightness(ca, cb, sCusp);
        const cuspC = cuspL * sCusp;
        const tMax = cuspC / (1 - cuspL);
        const k = 1 - (0.5 * cuspL) / cuspC;
        const d = 0.5 + tMax - tMax * k * s;
        const lv = 1 - (0.5 * s) / d;
        const cv = (s * tMax * 0.5) / d;
        const lvt = toeInv(lv);
        const cvt = (cv * lvt) / lv;
        const l = v * lv;
        L = toeInv(l);
        c = (v * cv * L) / l;
        const scale = Math.cbrt(1 / Math.max(maxChannel(lvt, ca * cvt, cb * cvt), 0));
        L *= scale;
        c *= scale;
    }
    out[0] = L;
    out[1] = c * ca;
    out[2] = c * cb;
    return out;
}

/** Write the Okhsv of a linear Color into `out`. Returns `out`. */
export function fromColor(out: Okhsv, c: Const<Color>): Okhsv {
    return fromOklab(out, oklabFromColor(out, c));
}

/** Write the linear Color of an Okhsv into `out`. Alpha in `out` is left untouched. Returns `out`. */
export function toColor(out: Color, a: Const<Okhsv>): Color {
    return oklabToColor(out, toOklab(out as Oklab, a));
}

/**
 * Interpolate from `a` to `b` by `t` into `out`, going around the hue circle by `hue`
 * (default 'shorter'). A gray endpoint takes the other endpoint's hue. Returns `out`.
 */
export function lerp(out: Okhsv, a: Const<Okhsv>, b: Const<Okhsv>, t: number, hue: HueInterpolation = 'shorter'): Okhsv {
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
