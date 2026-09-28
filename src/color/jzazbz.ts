import type { Const } from '../core/const';
import type { Color } from './color';
import { formatAlpha, formatNumber } from './format';

// Jzazbz (Safdar et al. 2017) is a perceptually uniform space for HDR and wide gamut, from
// darkness to 10000 cd/m², with better hue linearity than CIE Lab. Its polar form is jzczhz.
// Linear sRGB 1.0 is 203 cd/m², as in CSS jzazbz().

/** A Jzazbz color: [Jz, az, bz]. Jz is lightness (reference white is about 0.22), az and bz in about [-0.21, 0.21]. */
export type Jzazbz = [jz: number, az: number, bz: number];

/** Create a new Jzazbz initialized to [0, 0, 0]. */
export function create(): Jzazbz {
    return [0, 0, 0];
}

/** Create a new Jzazbz with the given Jz, az, bz values. */
export function fromValues(jz: number, az: number, bz: number): Jzazbz {
    return [jz, az, bz];
}

/** Create a new Jzazbz that is a copy of `a`. */
export function clone(a: Const<Jzazbz>): Jzazbz {
    return [a[0], a[1], a[2]];
}

/** Copy the values from `src` into `out`. Returns `out`. */
export function copy(out: Jzazbz, src: Const<Jzazbz>): Jzazbz {
    out[0] = src[0];
    out[1] = src[1];
    out[2] = src[2];
    return out;
}

/** Set the Jz, az, bz components of `out` directly. Returns `out`. */
export function set(out: Jzazbz, jz: number, az: number, bz: number): Jzazbz {
    out[0] = jz;
    out[1] = az;
    out[2] = bz;
    return out;
}

/** Write the Jzazbz of a linear Color (1.0 = 203 cd/m²) into `out`. Returns `out`. */
export function fromColor(out: Jzazbz, c: Const<Color>): Jzazbz {
    const r = c[0];
    const g = c[1];
    const b = c[2];
    // linear sRGB -> absolute XYZ with the X and Y adjustment -> cone responses / 10000, then PQ
    const l = pq(0.007277866769122058 * r + 0.010336396879965919 * g + 0.002113219504815853 * b);
    const m = pq(0.004475095088626802 * r + 0.012023139455990562 * g + 0.003238736766399656 * b);
    const s = pq(0.0016115833482912983 * r + 0.004675742496009323 * g + 0.013462939412248314 * b);
    const iz = 0.5 * l + 0.5 * m;
    out[0] = (0.44 * iz) / (1 - 0.56 * iz) - 1.6295499532821565e-11;
    out[1] = 3.524 * l - 4.066708 * m + 0.542708 * s;
    out[2] = 0.199076 * l + 1.096799 * m - 1.295875 * s;
    return out;
}

/** Write the linear Color (1.0 = 203 cd/m²) of a Jzazbz into `out`. Alpha in `out` is left untouched. Returns `out`. */
export function toColor(out: Color, a: Const<Jzazbz>): Color {
    const jz = a[0] + 1.6295499532821565e-11;
    const az = a[1];
    const bz = a[2];
    const iz = jz / (0.44 + 0.56 * jz);
    const l = pqInv(iz + 0.13860504327153927 * az + 0.05804731615611883 * bz);
    const m = pqInv(iz - 0.1386050432715393 * az - 0.058047316156118904 * bz);
    const s = pqInv(iz - 0.09601924202631895 * az - 0.811891896056039 * bz);
    out[0] = 292.09809481767104 * l - 257.3666678423141 * m + 16.064508030219184 * s;
    out[1] = -109.5511247763214 * l + 188.28247323743744 * m - 28.098751937243946 * s;
    out[2] = 3.081973605908475 * l - 34.583274187993936 * m + 82.1138089555723 * s;
    return out;
}

/** Linearly interpolate from `a` to `b` by `t` into `out`. Returns `out`. */
export function lerp(out: Jzazbz, a: Const<Jzazbz>, b: Const<Jzazbz>, t: number): Jzazbz {
    out[0] = a[0] + (b[0] - a[0]) * t;
    out[1] = a[1] + (b[1] - a[1]) * t;
    out[2] = a[2] + (b[2] - a[2]) * t;
    return out;
}

/** Create a CSS `jzazbz(...)` string (CSS Color HDR), with an optional alpha. */
export function toCSS(a: Const<Jzazbz>, alpha = 1): string {
    return `jzazbz(${formatNumber(a[0], 5)} ${formatNumber(a[1], 5)} ${formatNumber(a[2], 5)}${formatAlpha(alpha)})`;
}

// the Jzazbz PQ curve, with exponent 1.7 * 2523 / 32, on luminance / 10000 (sign-mirrored)
function pq(x: number): number {
    const xn = x < 0 ? -((-x) ** (2610 / 16384)) : x ** (2610 / 16384);
    const v = (3424 / 4096 + (2413 / 128) * xn) / (1 + (2392 / 128) * xn);
    return v < 0 ? -((-v) ** ((1.7 * 2523) / 32)) : v ** ((1.7 * 2523) / 32);
}

function pqInv(v: number): number {
    const vp = v < 0 ? -((-v) ** (32 / (1.7 * 2523))) : v ** (32 / (1.7 * 2523));
    const x = (3424 / 4096 - vp) / ((2392 / 128) * vp - 2413 / 128);
    return x < 0 ? -((-x) ** (16384 / 2610)) : x ** (16384 / 2610);
}
