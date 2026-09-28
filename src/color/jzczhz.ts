import type { Const } from '../core/const';
import type { Color } from './color';
import { formatAlpha, formatNumber } from './format';
import { type HueInterpolation, lerpHue } from './hue';
import { type Jzazbz, fromColor as jzazbzFromColor, toColor as jzazbzToColor } from './jzazbz';

// JzCzhz is Jzazbz in polar form: lightness, chroma and hue in degrees, the HDR counterpart
// of oklch (CSS jzczhz()). Below a chroma of 0.0000026 the hue is powerless: it is stored
// as 0 and interpolation borrows the other endpoint's hue.

/** A JzCzhz color: [Jz, Cz, hz]. Jz is lightness, Cz is chroma (0 is gray), hz is hue in degrees. */
export type Jzczhz = [jz: number, cz: number, hz: number];

/** Create a new Jzczhz initialized to [0, 0, 0]. */
export function create(): Jzczhz {
    return [0, 0, 0];
}

/** Create a new Jzczhz with the given Jz, Cz, hz (degrees) values. */
export function fromValues(jz: number, cz: number, hz: number): Jzczhz {
    return [jz, cz, hz];
}

/** Create a new Jzczhz that is a copy of `a`. */
export function clone(a: Const<Jzczhz>): Jzczhz {
    return [a[0], a[1], a[2]];
}

/** Copy the values from `src` into `out`. Returns `out`. */
export function copy(out: Jzczhz, src: Const<Jzczhz>): Jzczhz {
    out[0] = src[0];
    out[1] = src[1];
    out[2] = src[2];
    return out;
}

/** Set the Jz, Cz, hz (degrees) components of `out` directly. Returns `out`. */
export function set(out: Jzczhz, jz: number, cz: number, hz: number): Jzczhz {
    out[0] = jz;
    out[1] = cz;
    out[2] = hz;
    return out;
}

/** Write the JzCzhz of a Jzazbz color into `out`. Gray colors get hue 0. Returns `out`. */
export function fromJzazbz(out: Jzczhz, a: Const<Jzazbz>): Jzczhz {
    const az = a[1];
    const bz = a[2];
    const c = Math.sqrt(az * az + bz * bz);
    let h = 0;
    if (c > 0.0000026) {
        h = (Math.atan2(bz, az) * 180) / Math.PI;
        if (h < 0) h += 360;
    }
    out[0] = a[0];
    out[1] = c;
    out[2] = h;
    return out;
}

/** Write the Jzazbz of a JzCzhz color into `out`. Returns `out`. */
export function toJzazbz(out: Jzazbz, a: Const<Jzczhz>): Jzazbz {
    const c = a[1];
    const h = (a[2] * Math.PI) / 180;
    out[0] = a[0];
    out[1] = c * Math.cos(h);
    out[2] = c * Math.sin(h);
    return out;
}

/** Write the JzCzhz of a linear Color (1.0 = 203 cd/m²) into `out`. Returns `out`. */
export function fromColor(out: Jzczhz, c: Const<Color>): Jzczhz {
    return fromJzazbz(out, jzazbzFromColor(out, c));
}

/** Write the linear Color (1.0 = 203 cd/m²) of a JzCzhz into `out`. Alpha in `out` is left untouched. Returns `out`. */
export function toColor(out: Color, a: Const<Jzczhz>): Color {
    return jzazbzToColor(out, toJzazbz(out as Jzazbz, a));
}

/**
 * Interpolate from `a` to `b` by `t` into `out`, around the hue circle by a CSS `hue` method (default 'shorter'). Returns `out`.
 * A gray endpoint takes the other endpoint's hue.
 */
export function lerp(out: Jzczhz, a: Const<Jzczhz>, b: Const<Jzczhz>, t: number, hue: HueInterpolation = 'shorter'): Jzczhz {
    const ac = a[1];
    const bc = b[1];
    let ah = a[2];
    let bh = b[2];
    if (ac <= 0.0000026) ah = bh;
    else if (bc <= 0.0000026) bh = ah;
    out[0] = a[0] + (b[0] - a[0]) * t;
    out[1] = ac + (bc - ac) * t;
    out[2] = lerpHue(ah, bh, t, hue);
    return out;
}

/** ΔEz color difference in JzCzhz (Safdar et al. 2017), for HDR and wide gamut colors. */
export function deltaEJz(a: Const<Jzczhz>, b: Const<Jzczhz>): number {
    const dj = a[0] - b[0];
    const dc = a[1] - b[1];
    let ah = a[2];
    let bh = b[2];
    if (a[1] <= 0.0000026) ah = bh;
    else if (b[1] <= 0.0000026) bh = ah;
    const dh = 2 * Math.sqrt(a[1] * b[1]) * Math.sin(((ah - bh) * Math.PI) / 360);
    return Math.sqrt(dj * dj + dc * dc + dh * dh);
}

/** Create a CSS `jzczhz(...)` string (CSS Color HDR), with an optional alpha. */
export function toCSS(a: Const<Jzczhz>, alpha = 1): string {
    return `jzczhz(${formatNumber(a[0], 5)} ${formatNumber(a[1], 5)} ${formatNumber(a[2], 3)}${formatAlpha(alpha)})`;
}
