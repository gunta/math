// The sRGB gamut boundary in OKLab, shared by okhsl and okhsv.
// Ported from Björn Ottosson's color picker reference (MIT, https://bottosson.github.io/posts/colorpicker/)
// using the CSS Color 4 OKLab matrices, so it agrees with math's oklab.
// (a, b) is always a unit hue direction. The cusp is the most colorful sRGB color of that hue.

/** Ottosson's toe: maps OKLab L to a lightness estimate closer to CIE L* (Lr). */
export function toe(x: number): number {
    const k3 = 1.206 / 1.03;
    const y = k3 * x - 0.206;
    return 0.5 * (y + Math.sqrt(y * y + 4 * 0.03 * k3 * x));
}

/** Inverse of `toe`. */
export function toeInv(x: number): number {
    return (x * x + 0.206 * x) / ((1.206 / 1.03) * (x + 0.03));
}

/** Largest channel of the linear sRGB of OKLab (L, a, b). */
export function maxChannel(L: number, a: number, b: number): number {
    const l = L + 0.3963377773761749 * a + 0.2158037573099136 * b;
    const m = L - 0.1055613458156586 * a - 0.0638541728258133 * b;
    const s = L - 0.0894841775298119 * a - 1.2914855480194092 * b;
    const l3 = l * l * l;
    const m3 = m * m * m;
    const s3 = s * s * s;
    return Math.max(
        4.076741636075958 * l3 - 3.3077115392580616 * m3 + 0.2309699031821043 * s3,
        -1.2684379732850317 * l3 + 2.6097573492876887 * m3 - 0.34131937600265727 * s3,
        -0.004196076138675564 * l3 - 0.7034186179359363 * m3 + 1.7076146940746117 * s3,
    );
}

/** Saturation S = C / L of the sRGB cusp in hue direction (a, b): a polynomial fit refined by one Halley step. */
export function maxSaturation(a: number, b: number): number {
    // pick the channel that clips first for this hue, its polynomial fit and its LMS -> sRGB row
    let k0: number;
    let k1: number;
    let k2: number;
    let k3: number;
    let k4: number;
    let wl: number;
    let wm: number;
    let ws: number;
    if (-1.8817031 * a - 0.80936501 * b > 1) {
        k0 = 1.19086277;
        k1 = 1.76576728;
        k2 = 0.59662641;
        k3 = 0.75515197;
        k4 = 0.56771245;
        wl = 4.076741636075958;
        wm = -3.3077115392580616;
        ws = 0.2309699031821043;
    } else if (1.8144408 * a - 1.19445267 * b > 1) {
        k0 = 0.73956515;
        k1 = -0.45954404;
        k2 = 0.08285427;
        k3 = 0.12541073;
        k4 = -0.14503204;
        wl = -1.2684379732850317;
        wm = 2.6097573492876887;
        ws = -0.34131937600265727;
    } else {
        k0 = 1.35733652;
        k1 = -0.00915799;
        k2 = -1.1513021;
        k3 = -0.50559606;
        k4 = 0.00692167;
        wl = -0.004196076138675564;
        wm = -0.7034186179359363;
        ws = 1.7076146940746117;
    }
    const sat = k0 + k1 * a + k2 * b + k3 * a * a + k4 * a * b;

    const kl = 0.3963377773761749 * a + 0.2158037573099136 * b;
    const km = -0.1055613458156586 * a - 0.0638541728258133 * b;
    const ks = -0.0894841775298119 * a - 1.2914855480194092 * b;
    const l_ = 1 + sat * kl;
    const m_ = 1 + sat * km;
    const s_ = 1 + sat * ks;
    const f = wl * l_ * l_ * l_ + wm * m_ * m_ * m_ + ws * s_ * s_ * s_;
    const f1 = 3 * (wl * kl * l_ * l_ + wm * km * m_ * m_ + ws * ks * s_ * s_);
    const f2 = 6 * (wl * kl * kl * l_ + wm * km * km * m_ + ws * ks * ks * s_);
    return sat - (f * f1) / (f1 * f1 - 0.5 * f * f2);
}

/** Lightness of the sRGB cusp in hue direction (a, b), given its saturation from `maxSaturation`. */
export function cuspLightness(a: number, b: number, sCusp: number): number {
    return Math.cbrt(1 / maxChannel(1, sCusp * a, sCusp * b));
}

/**
 * Where the line from (L0, 0) to (L1, C1) in the (L, C) plane of hue (a, b) leaves the sRGB gamut,
 * as a fraction t of the line. The upper half is refined by one Halley step.
 */
export function gamutIntersection(
    a: number,
    b: number,
    L1: number,
    C1: number,
    L0: number,
    cuspL: number,
    cuspC: number,
): number {
    if ((L1 - L0) * cuspC - (cuspL - L0) * C1 <= 0) {
        // lower half: the gamut edge is a straight line from black to the cusp
        return (cuspC * L0) / (C1 * cuspL + cuspC * (L0 - L1));
    }
    let t = (cuspC * (L0 - 1)) / (C1 * (cuspL - 1) + cuspC * (L0 - L1));

    const dl = L1 - L0;
    const kl = 0.3963377773761749 * a + 0.2158037573099136 * b;
    const km = -0.1055613458156586 * a - 0.0638541728258133 * b;
    const ks = -0.0894841775298119 * a - 1.2914855480194092 * b;
    const ldt_ = dl + C1 * kl;
    const mdt_ = dl + C1 * km;
    const sdt_ = dl + C1 * ks;

    const L = L0 * (1 - t) + t * L1;
    const C = t * C1;
    const l_ = L + C * kl;
    const m_ = L + C * km;
    const s_ = L + C * ks;
    const l = l_ * l_ * l_;
    const m = m_ * m_ * m_;
    const s = s_ * s_ * s_;
    const ldt = 3 * ldt_ * l_ * l_;
    const mdt = 3 * mdt_ * m_ * m_;
    const sdt = 3 * sdt_ * s_ * s_;
    const ldt2 = 6 * ldt_ * ldt_ * l_;
    const mdt2 = 6 * mdt_ * mdt_ * m_;
    const sdt2 = 6 * sdt_ * sdt_ * s_;

    const r = 4.076741636075958 * l - 3.3077115392580616 * m + 0.2309699031821043 * s - 1;
    const r1 = 4.076741636075958 * ldt - 3.3077115392580616 * mdt + 0.2309699031821043 * sdt;
    const r2 = 4.076741636075958 * ldt2 - 3.3077115392580616 * mdt2 + 0.2309699031821043 * sdt2;
    const ur = r1 / (r1 * r1 - 0.5 * r * r2);

    const g = -1.2684379732850317 * l + 2.6097573492876887 * m - 0.34131937600265727 * s - 1;
    const g1 = -1.2684379732850317 * ldt + 2.6097573492876887 * mdt - 0.34131937600265727 * sdt;
    const g2 = -1.2684379732850317 * ldt2 + 2.6097573492876887 * mdt2 - 0.34131937600265727 * sdt2;
    const ug = g1 / (g1 * g1 - 0.5 * g * g2);

    const bl = -0.004196076138675564 * l - 0.7034186179359363 * m + 1.7076146940746117 * s - 1;
    const b1 = -0.004196076138675564 * ldt - 0.7034186179359363 * mdt + 1.7076146940746117 * sdt;
    const b2 = -0.004196076138675564 * ldt2 - 0.7034186179359363 * mdt2 + 1.7076146940746117 * sdt2;
    const ub = b1 / (b1 * b1 - 0.5 * bl * b2);

    t += Math.min(ur >= 0 ? -r * ur : Infinity, ug >= 0 ? -g * ug : Infinity, ub >= 0 ? -bl * ub : Infinity);
    return t;
}

/**
 * Write the three reference chromas okhsl interpolates between, [C0, Cmid, Cmax], for lightness L
 * and hue direction (a, b) into `out`. Returns `out`.
 */
export function okhslChromas(out: [number, number, number], L: number, a: number, b: number): [number, number, number] {
    const sCusp = maxSaturation(a, b);
    const cuspL = cuspLightness(a, b, sCusp);
    const cuspC = cuspL * sCusp;
    const cMax = gamutIntersection(a, b, L, 1, L, cuspL, cuspC);
    const k = cMax / Math.min(L * (cuspC / cuspL), (1 - L) * (cuspC / (1 - cuspL)));

    // a smooth, gamut-independent approximation of the cusp's S and T
    const sMid =
        0.11516993 +
        1 /
            (7.4477897 +
                4.1590124 * b +
                a *
                    (-2.19557347 +
                        1.75198401 * b +
                        a * (-2.13704948 - 10.02301043 * b + a * (-4.24894561 + 5.38770819 * b + 4.69891013 * a))));
    const tMid =
        0.11239642 +
        1 /
            (1.6132032 -
                0.68124379 * b +
                a *
                    (0.40370612 +
                        0.90148123 * b +
                        a * (-0.27087943 + 0.6122399 * b + a * (0.00299215 - 0.45399568 * b - 0.14661872 * a))));
    let ca = L * sMid;
    let cb = (1 - L) * tMid;
    const cMid = 0.9 * k * Math.sqrt(Math.sqrt(1 / (1 / (ca * ca * ca * ca) + 1 / (cb * cb * cb * cb))));
    ca = L * 0.4;
    cb = (1 - L) * 0.8;
    out[0] = Math.sqrt(1 / (1 / (ca * ca) + 1 / (cb * cb)));
    out[1] = cMid;
    out[2] = cMax;
    return out;
}
