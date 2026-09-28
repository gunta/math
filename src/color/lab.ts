import type { Const } from '../core/const';
import type { Color } from './color';
import { formatAlpha, formatNumber } from './format';

// CIE Lab (CIELAB 1976) relative to the D50 white point, as CSS lab() uses. The long-standing
// print and design industry space: L in [0, 100], a and b roughly in [-125, 125].
// For new perceptual work prefer oklab, which has more even hue. Use lab for CSS interop
// and industry color difference (deltaE2000).

/** A CIE Lab (D50) color: [L, a, b]. L is lightness in [0, 100], a and b are opponent axes. */
export type Lab = [l: number, a: number, b: number];

/** Create a new Lab initialized to [0, 0, 0] (black). */
export function create(): Lab {
    return [0, 0, 0];
}

/** Create a new Lab with the given L, a, b values. */
export function fromValues(l: number, a: number, b: number): Lab {
    return [l, a, b];
}

/** Create a new Lab that is a copy of `a`. */
export function clone(a: Const<Lab>): Lab {
    return [a[0], a[1], a[2]];
}

/** Copy the values from `src` into `out`. Returns `out`. */
export function copy(out: Lab, src: Const<Lab>): Lab {
    out[0] = src[0];
    out[1] = src[1];
    out[2] = src[2];
    return out;
}

/** Set the L, a, b components of `out` directly. Returns `out`. */
export function set(out: Lab, l: number, a: number, b: number): Lab {
    out[0] = l;
    out[1] = a;
    out[2] = b;
    return out;
}

/** Write the CIE Lab (D50) of a linear Color into `out`. Returns `out`. */
export function fromColor(out: Lab, c: Const<Color>): Lab {
    const r = c[0];
    const g = c[1];
    const b = c[2];
    // linear sRGB -> XYZ D50 (Bradford) relative to the D50 white
    const x = f(0.4522116582424807 * r + 0.3994122539429339 * g + 0.14837608781458553 * b);
    const y = f(0.22249317711056527 * r + 0.7168870130944824 * g + 0.060619809794952365 * b);
    const z = f(0.016875340921386848 * r + 0.11765941425612084 * g + 0.8654652448224923 * b);
    out[0] = 116 * y - 16;
    out[1] = 500 * (x - y);
    out[2] = 200 * (y - z);
    return out;
}

/** Write the linear Color of a CIE Lab (D50) into `out`. Alpha in `out` is left untouched. Returns `out`. */
export function toColor(out: Color, a: Const<Lab>): Color {
    const L = a[0];
    const fy = (L + 16) / 116;
    const fx = a[1] / 500 + fy;
    const fz = fy - a[2] / 200;
    const fx3 = fx * fx * fx;
    const fz3 = fz * fz * fz;
    // CIE epsilon = 216 / 24389 and kappa = 24389 / 27
    const x = fx3 > 216 / 24389 ? fx3 : (116 * fx - 16) / (24389 / 27);
    const y = L > 8 ? fy * fy * fy : L / (24389 / 27);
    const z = fz3 > 216 / 24389 ? fz3 : (116 * fz - 16) / (24389 / 27);
    out[0] = 3.022233652294479 * x - 1.6173859980180427 * y - 0.40484765427643676 * z;
    out[1] = -0.9438482461515547 * x + 1.9162543773959886 * y + 0.027593868755566332 * z;
    out[2] = 0.06938627393942093 * x - 0.22897675981518203 * y + 1.159590485875761 * z;
    return out;
}

/** Linearly interpolate from `a` to `b` by `t` into `out`. Returns `out`. */
export function lerp(out: Lab, a: Const<Lab>, b: Const<Lab>, t: number): Lab {
    out[0] = a[0] + (b[0] - a[0]) * t;
    out[1] = a[1] + (b[1] - a[1]) * t;
    out[2] = a[2] + (b[2] - a[2]) * t;
    return out;
}

/** CIE76 color difference: Euclidean distance in Lab. About 2.3 is a just-noticeable difference. */
export function deltaE76(a: Const<Lab>, b: Const<Lab>): number {
    const dl = a[0] - b[0];
    const da = a[1] - b[1];
    const db = a[2] - b[2];
    return Math.sqrt(dl * dl + da * da + db * db);
}

/**
 * CIEDE2000 color difference (Sharma, Wu and Dalal 2005 formulation, kL = kC = kH = 1).
 * The industry standard for small differences. About 1 is a just-noticeable difference.
 */
export function deltaE2000(a: Const<Lab>, b: Const<Lab>): number {
    const L1 = a[0];
    const a1 = a[1];
    const b1 = a[2];
    const L2 = b[0];
    const a2 = b[1];
    const b2 = b[2];
    const d2r = Math.PI / 180;

    const cBar = (Math.sqrt(a1 * a1 + b1 * b1) + Math.sqrt(a2 * a2 + b2 * b2)) / 2;
    const cBar7 = cBar ** 7;
    const G = 0.5 * (1 - Math.sqrt(cBar7 / (cBar7 + 6103515625)));
    const ap1 = (1 + G) * a1;
    const ap2 = (1 + G) * a2;
    const cp1 = Math.sqrt(ap1 * ap1 + b1 * b1);
    const cp2 = Math.sqrt(ap2 * ap2 + b2 * b2);
    let h1 = ap1 === 0 && b1 === 0 ? 0 : Math.atan2(b1, ap1) / d2r;
    let h2 = ap2 === 0 && b2 === 0 ? 0 : Math.atan2(b2, ap2) / d2r;
    if (h1 < 0) h1 += 360;
    if (h2 < 0) h2 += 360;

    const dL = L2 - L1;
    const dC = cp2 - cp1;
    const hDiff = h2 - h1;
    const hSum = h1 + h2;
    const chromatic = cp1 * cp2 !== 0;
    let dh = 0;
    let hBar = hSum;
    if (chromatic) {
        if (Math.abs(hDiff) <= 180) {
            dh = hDiff;
            hBar = hSum / 2;
        } else {
            dh = hDiff > 180 ? hDiff - 360 : hDiff + 360;
            hBar = hSum < 360 ? (hSum + 360) / 2 : (hSum - 360) / 2;
        }
    }
    const dH = 2 * Math.sqrt(cp1 * cp2) * Math.sin((dh * d2r) / 2);

    const lBar = (L1 + L2) / 2;
    const cpBar = (cp1 + cp2) / 2;
    const cpBar7 = cpBar ** 7;
    const lsq = (lBar - 50) * (lBar - 50);
    const sL = 1 + (0.015 * lsq) / Math.sqrt(20 + lsq);
    const sC = 1 + 0.045 * cpBar;
    const T =
        1 -
        0.17 * Math.cos((hBar - 30) * d2r) +
        0.24 * Math.cos(2 * hBar * d2r) +
        0.32 * Math.cos((3 * hBar + 6) * d2r) -
        0.2 * Math.cos((4 * hBar - 63) * d2r);
    const sH = 1 + 0.015 * cpBar * T;
    const dTheta = 30 * Math.exp(-(((hBar - 275) / 25) ** 2));
    const rT = -2 * Math.sqrt(cpBar7 / (cpBar7 + 6103515625)) * Math.sin(2 * dTheta * d2r);

    const l = dL / sL;
    const c = dC / sC;
    const h = dH / sH;
    return Math.sqrt(l * l + c * c + h * h + rT * c * h);
}

/** Create a CSS `lab(...)` string, with an optional alpha. */
export function toCSS(a: Const<Lab>, alpha = 1): string {
    return `lab(${formatNumber(a[0], 4)} ${formatNumber(a[1], 4)} ${formatNumber(a[2], 4)}${formatAlpha(alpha)})`;
}

// CIE Lab companding: cube root above epsilon = 216 / 24389, linear below
function f(t: number): number {
    return t > 216 / 24389 ? Math.cbrt(t) : ((24389 / 27) * t + 16) / 116;
}
