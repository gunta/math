import type { Const } from '../core/const';
import type { Color } from './color';
import { nitsToPq, pqToNits } from './colorspace';
import { formatAlpha, formatNumber } from './format';

// ICtCp (ITU-R BT.2100) is the HDR perceptual space of Dolby Vision and broadcast:
// PQ-encoded cone responses split into intensity I and two chroma axes. It stays even
// from deep shadows to 10000 cd/m², which OKLab (tuned for SDR) does not.
// Use deltaEITP (BT.2124) to compare HDR colors. Linear sRGB 1.0 is 203 cd/m², as in CSS.

/** An ICtCp color: [I, Ct, Cp]. I is PQ intensity in [0, 1] (reference white is about 0.58), Ct and Cp in about [-0.5, 0.5]. */
export type ICtCp = [i: number, ct: number, cp: number];

/** Create a new ICtCp initialized to [0, 0, 0]. */
export function create(): ICtCp {
    return [0, 0, 0];
}

/** Create a new ICtCp with the given I, Ct, Cp values. */
export function fromValues(i: number, ct: number, cp: number): ICtCp {
    return [i, ct, cp];
}

/** Create a new ICtCp that is a copy of `a`. */
export function clone(a: Const<ICtCp>): ICtCp {
    return [a[0], a[1], a[2]];
}

/** Copy the values from `src` into `out`. Returns `out`. */
export function copy(out: ICtCp, src: Const<ICtCp>): ICtCp {
    out[0] = src[0];
    out[1] = src[1];
    out[2] = src[2];
    return out;
}

/** Set the I, Ct, Cp components of `out` directly. Returns `out`. */
export function set(out: ICtCp, i: number, ct: number, cp: number): ICtCp {
    out[0] = i;
    out[1] = ct;
    out[2] = cp;
    return out;
}

/** Write the ICtCp of a linear Color (1.0 = 203 cd/m²) into `out`. Returns `out`. */
export function fromColor(out: ICtCp, c: Const<Color>): ICtCp {
    const r = c[0];
    const g = c[1];
    const b = c[2];
    // linear sRGB -> absolute XYZ -> BT.2100 crosstalk LMS in cd/m², then PQ
    const l = nitsToPq(60.049298976079854 * r + 126.48956481576175 * g + 16.46113620815845 * b);
    const m = nitsToPq(31.718542171804685 * r + 147.64712216107608 * g + 23.63433566711927 * b);
    const s = nitsToPq(7.1325395410642 * r + 31.7846696076108 * g + 164.08279085132497 * b);
    out[0] = 0.5 * l + 0.5 * m;
    out[1] = (6610 * l - 13613 * m + 7003 * s) / 4096;
    out[2] = (17933 * l - 17390 * m - 543 * s) / 4096;
    return out;
}

/** Write the linear Color (1.0 = 203 cd/m²) of an ICtCp into `out`. Alpha in `out` is left untouched. Returns `out`. */
export function toColor(out: Color, a: Const<ICtCp>): Color {
    const i = a[0];
    const t = a[1];
    const p = a[2];
    const l = pqToNits(0.9999999999999998 * i + 0.0086090370379328 * t + 0.111029625003026 * p);
    const m = pqToNits(0.9999999999999998 * i - 0.0086090370379328 * t - 0.1110296250030259 * p);
    const s = pqToNits(0.9999999999999998 * i + 0.5600313357106791 * t - 0.3206271749873188 * p);
    out[0] = 0.03041065389941134 * l - 0.026208771271132265 * m + 0.0007242257461051583 * s;
    out[1] = -0.006523701970320003 * l + 0.012611952812434856 * m - 0.0011621424677306154 * s;
    out[2] = -0.000058211343264408647 * l - 0.0013038031272262082 * m + 0.006288122844874855 * s;
    return out;
}

/** Linearly interpolate from `a` to `b` by `t` into `out`. Returns `out`. */
export function lerp(out: ICtCp, a: Const<ICtCp>, b: Const<ICtCp>, t: number): ICtCp {
    out[0] = a[0] + (b[0] - a[0]) * t;
    out[1] = a[1] + (b[1] - a[1]) * t;
    out[2] = a[2] + (b[2] - a[2]) * t;
    return out;
}

/** ΔE ITP (ITU-R BT.2124) HDR color difference. 1 is a just-noticeable difference. */
export function deltaEITP(a: Const<ICtCp>, b: Const<ICtCp>): number {
    const di = a[0] - b[0];
    const dt = a[1] - b[1];
    const dp = a[2] - b[2];
    return 720 * Math.sqrt(di * di + 0.25 * dt * dt + dp * dp);
}

/** Create a CSS `ictcp(...)` string (CSS Color HDR), with an optional alpha. */
export function toCSS(a: Const<ICtCp>, alpha = 1): string {
    return `ictcp(${formatNumber(a[0], 5)} ${formatNumber(a[1], 5)} ${formatNumber(a[2], 5)}${formatAlpha(alpha)})`;
}
