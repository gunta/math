import type { Const } from '../core/const';
import type { Color } from './color';
import {
    linearDisplayP3ToLinearSrgb,
    linearRec2020ToLinearSrgb,
    linearSrgbToLinearDisplayP3,
    linearSrgbToLinearRec2020,
} from './colorspace';
import { type Oklab, fromColor as oklabFromColor, toColor as oklabToColor } from './oklab';

// Gamut queries, clipping and mapping for sRGB, Display P3 and Rec.2020 (Rec.2100).
//
// A color is in gamut when its linear channels in the target primaries lie in [0, peak].
// peak = 1 is the SDR gamut. A larger peak is HDR headroom (peak = 4 allows up to 4x
// reference white, 812 cd/m²), so mapping fits wide-gamut HDR colors into a display's
// primaries without dimming them.
//
// Mapping uses the CSS Color 4 ray trace method: chroma is reduced towards the gray of
// the same OKLCH lightness until the color meets the gamut surface, keeping lightness
// and hue. Colors brighter than peak white become peak white (tone map HDR first to keep
// their detail). Clipping is cheaper but shifts hue and lightness.

/** Whether linear Color `c` is inside the sRGB gamut, with channels in [0, peak] within `epsilon`. */
export function isInSrgb(c: Const<Color>, peak = 1, epsilon = 0.000075): boolean {
    return inBox(c[0], c[1], c[2], peak, epsilon);
}

/** Whether linear Color `c` is inside the Display P3 gamut, with channels in [0, peak] within `epsilon`. */
export function isInDisplayP3(c: Const<Color>, peak = 1, epsilon = 0.000075): boolean {
    const r = c[0];
    const g = c[1];
    const b = c[2];
    return inBox(
        0.8224619687143623 * r + 0.17753803128563772 * g,
        0.03319419885096158 * r + 0.9668058011490382 * g,
        0.017082630721120033 * r + 0.07239744066396347 * g + 0.9105199286149166 * b,
        peak,
        epsilon,
    );
}

/** Whether linear Color `c` is inside the Rec.2020 (Rec.2100) gamut, with channels in [0, peak] within `epsilon`. */
export function isInRec2020(c: Const<Color>, peak = 1, epsilon = 0.000075): boolean {
    const r = c[0];
    const g = c[1];
    const b = c[2];
    return inBox(
        0.627403895934699 * r + 0.3292830383778836 * g + 0.043313065687417246 * b,
        0.06909728935823205 * r + 0.9195403950754587 * g + 0.011362315566309173 * b,
        0.01639143887515028 * r + 0.08801330787722576 * g + 0.895595253247624 * b,
        peak,
        epsilon,
    );
}

/** Clamp linear Color `c` into the sRGB gamut [0, peak] into `out`, per channel. Returns `out`. */
export function clipToSrgb(out: Color, c: Const<Color>, peak = 1): Color {
    return clip(finite(out, c, peak), 0, peak);
}

/** Clamp linear Color `c` into the Display P3 gamut [0, peak] into `out`, per P3 channel. Returns `out`. */
export function clipToDisplayP3(out: Color, c: Const<Color>, peak = 1): Color {
    return clip(linearSrgbToLinearDisplayP3(out, finite(out, c, peak)), 1, peak);
}

/** Clamp linear Color `c` into the Rec.2020 gamut [0, peak] into `out`, per Rec.2020 channel. Returns `out`. */
export function clipToRec2020(out: Color, c: Const<Color>, peak = 1): Color {
    return clip(linearSrgbToLinearRec2020(out, finite(out, c, peak)), 2, peak);
}

/**
 * Map linear Color `c` into the sRGB gamut [0, peak] into `out`, keeping its OKLCH lightness and hue. Returns `out`.
 * CSS Color 4 ray trace gamut mapping. Colors already in gamut are returned unchanged.
 */
export function mapToSrgb(out: Color, c: Const<Color>, peak = 1): Color {
    return map(out, c, 0, peak);
}

/**
 * Map linear Color `c` into the Display P3 gamut [0, peak] into `out`, keeping its OKLCH lightness and hue. Returns `out`.
 * CSS Color 4 ray trace gamut mapping. Colors already in gamut are returned unchanged.
 */
export function mapToDisplayP3(out: Color, c: Const<Color>, peak = 1): Color {
    return map(out, c, 1, peak);
}

/**
 * Map linear Color `c` into the Rec.2020 (Rec.2100) gamut [0, peak] into `out`, keeping its OKLCH lightness and hue. Returns `out`.
 * CSS Color 4 ray trace gamut mapping. Colors already in gamut are returned unchanged.
 */
export function mapToRec2020(out: Color, c: Const<Color>, peak = 1): Color {
    return map(out, c, 2, peak);
}

function inBox(x: number, y: number, z: number, peak: number, epsilon: number): boolean {
    const hi = peak + epsilon;
    return x >= -epsilon && y >= -epsilon && z >= -epsilon && x <= hi && y <= hi && z <= hi;
}

// target 0 is sRGB, 1 is Display P3, 2 is Rec.2020. `out` holds target-linear channels
function clip(out: Color, target: number, peak: number): Color {
    out[0] = out[0] < 0 ? 0 : out[0] > peak ? peak : out[0];
    out[1] = out[1] < 0 ? 0 : out[1] > peak ? peak : out[1];
    out[2] = out[2] < 0 ? 0 : out[2] > peak ? peak : out[2];
    return fromTarget(out, target);
}

function toTarget(out: Color, target: number): Color {
    if (target === 1) return linearSrgbToLinearDisplayP3(out, out);
    if (target === 2) return linearSrgbToLinearRec2020(out, out);
    return out;
}

function fromTarget(out: Color, target: number): Color {
    if (target === 1) return linearDisplayP3ToLinearSrgb(out, out);
    if (target === 2) return linearRec2020ToLinearSrgb(out, out);
    return out;
}

// copy `c` into `out` with NaN channels as 0 and infinite ones at the ends of [0, peak], so
// non-finite input lands on the same color in every gamut
function finite(out: Color, c: Const<Color>, peak: number): Color {
    const r = c[0];
    const g = c[1];
    const b = c[2];
    out[0] = r - r === 0 ? r : r > 0 ? peak : 0;
    out[1] = g - g === 0 ? g : g > 0 ? peak : 0;
    out[2] = b - b === 0 ? b : b > 0 ? peak : 0;
    return out;
}

function map(out: Color, c: Const<Color>, target: number, peak: number): Color {
    finite(out, c, peak);
    const r = out[0];
    const g = out[1];
    const b = out[2];
    toTarget(out, target);
    let x = out[0];
    let y = out[1];
    let z = out[2];
    if (x >= 0 && y >= 0 && z >= 0 && x <= peak && y <= peak && z <= peak) {
        out[0] = r;
        out[1] = g;
        out[2] = b;
        return out;
    }

    // OKLab of the origin: out doubles as scratch from here on
    const lab = out as Oklab;
    lab[0] = r;
    lab[1] = g;
    lab[2] = b;
    oklabFromColor(lab, lab);
    const L = lab[0];
    const A = lab[1];
    const B = lab[2];
    const C = Math.sqrt(A * A + B * B);
    // at or beyond peak white (OKLab L of peak gray is its cube root), or black
    if (L >= Math.cbrt(peak) || L <= 0 || C === 0) {
        const v = L <= 0 ? 0 : L >= Math.cbrt(peak) ? peak : L * L * L;
        out[0] = v;
        out[1] = v;
        out[2] = v;
        return out;
    }
    const ha = A / C;
    const hb = B / C;

    // the anchor is the gray of the same lightness, the same in every D65 RGB space
    let ax = L * L * L;
    let ay = ax;
    let az = ax;
    let lx = x;
    let ly = y;
    let lz = z;
    const low = 1e-12;
    const high = peak - 1e-12;
    for (let i = 0; i < 4; i++) {
        if (i > 0) {
            // restore the origin's lightness and hue, keeping the reduced chroma
            out[0] = x;
            out[1] = y;
            out[2] = z;
            oklabFromColor(lab, fromTarget(out, target));
            const c2 = Math.sqrt(lab[1] * lab[1] + lab[2] * lab[2]);
            lab[0] = L;
            lab[1] = c2 * ha;
            lab[2] = c2 * hb;
            toTarget(oklabToColor(out, lab), target);
            x = out[0];
            y = out[1];
            z = out[2];
        }

        // cast a ray from the anchor through the color and find where it meets the [0, peak] box (slab method)
        const dx = x - ax;
        const dy = y - ay;
        const dz = z - az;
        let tnear = -Infinity;
        let tfar = Infinity;
        let hit = true;
        if (Math.abs(dx) > 1e-12) {
            const t1 = -ax / dx;
            const t2 = (peak - ax) / dx;
            tnear = Math.max(Math.min(t1, t2), tnear);
            tfar = Math.min(Math.max(t1, t2), tfar);
        } else if (ax < 0 || ax > peak) hit = false;
        if (Math.abs(dy) > 1e-12) {
            const t1 = -ay / dy;
            const t2 = (peak - ay) / dy;
            tnear = Math.max(Math.min(t1, t2), tnear);
            tfar = Math.min(Math.max(t1, t2), tfar);
        } else if (ay < 0 || ay > peak) hit = false;
        if (Math.abs(dz) > 1e-12) {
            const t1 = -az / dz;
            const t2 = (peak - az) / dz;
            tnear = Math.max(Math.min(t1, t2), tnear);
            tfar = Math.min(Math.max(t1, t2), tfar);
        } else if (az < 0 || az > peak) hit = false;
        // favor the hit ahead of the anchor
        if (tnear < 0) tnear = tfar;
        if (!hit || tnear > tfar || tfar < 0 || !Number.isFinite(tnear)) {
            // the ray got too short to trace, keep the last surface point
            x = lx;
            y = ly;
            z = lz;
            break;
        }
        const hx = ax + dx * tnear;
        const hy = ay + dy * tnear;
        const hz = az + dz * tnear;
        // move the anchor closer to the surface when the corrected color is safely inside
        if (i > 0 && x > low && y > low && z > low && x < high && y < high && z < high) {
            ax = x;
            ay = y;
            az = z;
        }
        x = lx = hx;
        y = ly = hy;
        z = lz = hz;
    }
    out[0] = x;
    out[1] = y;
    out[2] = z;
    return clip(out, target, peak);
}
