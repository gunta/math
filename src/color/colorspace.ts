import type { Const } from '../core/const';
import type { Color } from './color';
import { formatAlpha, formatNumber } from './format';

/** A predefined color space of the CSS color() function (CSS Color 4 and CSS Color HDR). */
export type CSSColorSpace =
    | 'srgb'
    | 'srgb-linear'
    | 'display-p3'
    | 'display-p3-linear'
    | 'a98-rgb'
    | 'prophoto-rgb'
    | 'rec2020'
    | 'rec2100-pq'
    | 'rec2100-hlg'
    | 'rec2100-linear'
    | 'xyz'
    | 'xyz-d50'
    | 'xyz-d65';

// Color-space conversions (pure functions, no global working-space state).
//
// math's Color is stored in linear sRGB. Three kinds of conversion live here:
//   - transfer functions: encode/decode a channel's curve (sRGB, A98, ProPhoto, Rec.2020, PQ, HLG)
//   - gamut conversions:  move between primaries (linear sRGB <-> XYZ, Display P3, Rec.2020, A98, ProPhoto)
//   - encoded shortcuts:  primaries plus transfer in one call (Display P3, Rec.2100 PQ and HLG)
//
// Matrices follow the CSS Color 4 sample code, precombined against linear sRGB in
// float64 by scripts/color-matrices.mjs. Transfer functions are sign-mirrored so
// out-of-gamut (negative) channels round-trip, as CSS Color 4 specifies.

/** Convert a single sRGB gamma-encoded channel to linear light, sign-mirrored for extended range. */
export function srgbToLinear(c: number): number {
    if (c > 0.04045) return ((c + 0.055) / 1.055) ** 2.4;
    if (c < -0.04045) return -(((0.055 - c) / 1.055) ** 2.4);
    return c / 12.92;
}

/** Convert a single linear light channel to sRGB gamma-encoded, sign-mirrored for extended range. */
export function linearToSrgb(c: number): number {
    if (c > 0.0031308) return 1.055 * c ** (1 / 2.4) - 0.055;
    if (c < -0.0031308) return 0.055 - 1.055 * (-c) ** (1 / 2.4);
    return 12.92 * c;
}

/** Convert a single A98 RGB (Adobe RGB 1998) encoded channel to linear light. */
export function a98RgbToLinear(c: number): number {
    return c < 0 ? -((-c) ** (563 / 256)) : c ** (563 / 256);
}

/** Convert a single linear light channel to A98 RGB (Adobe RGB 1998) encoded. */
export function linearToA98Rgb(c: number): number {
    return c < 0 ? -((-c) ** (256 / 563)) : c ** (256 / 563);
}

/** Convert a single ProPhoto RGB encoded channel to linear light (gamma 1.8 with a linear toe). */
export function prophotoRgbToLinear(c: number): number {
    if (c > 16 / 512) return c ** 1.8;
    if (c < -16 / 512) return -((-c) ** 1.8);
    return c / 16;
}

/** Convert a single linear light channel to ProPhoto RGB encoded (gamma 1.8 with a linear toe). */
export function linearToProphotoRgb(c: number): number {
    if (c >= 1 / 512) return c ** (1 / 1.8);
    if (c <= -1 / 512) return -((-c) ** (1 / 1.8));
    return 16 * c;
}

/** Convert a single Rec.2020 encoded channel to linear light (BT.1886 gamma 2.4, as CSS Color 4 uses). */
export function rec2020ToLinear(c: number): number {
    return c < 0 ? -((-c) ** 2.4) : c ** 2.4;
}

/** Convert a single linear light channel to Rec.2020 encoded (BT.1886 gamma 2.4, as CSS Color 4 uses). */
export function linearToRec2020(c: number): number {
    return c < 0 ? -((-c) ** (1 / 2.4)) : c ** (1 / 2.4);
}

/**
 * Encode an absolute luminance in cd/m² (nits) with the SMPTE ST 2084 PQ curve, into [0, 1].
 * 10000 nits maps to 1. Negative input is treated as 0.
 */
export function nitsToPq(nits: number): number {
    const x = (nits > 0 ? nits / 10000 : 0) ** (2610 / 16384);
    return ((3424 / 4096 + (2413 / 128) * x) / (1 + (2392 / 128) * x)) ** (2523 / 32);
}

/** Decode a SMPTE ST 2084 PQ signal in [0, 1] to absolute luminance in cd/m² (nits). */
export function pqToNits(pq: number): number {
    const x = (pq > 0 ? pq : 0) ** (32 / 2523);
    const n = x - 3424 / 4096;
    return n > 0 ? 10000 * (n / (2413 / 128 - (2392 / 128) * x)) ** (16384 / 2610) : 0;
}

/**
 * Encode a scene-linear channel with the BT.2100 HLG OETF. 1 maps to 1, 1/12 maps to 0.5.
 * Sign-mirrored below the square-root segment.
 */
export function linearToHlg(e: number): number {
    if (e <= 1 / 12) return e < 0 ? -Math.sqrt(-3 * e) : Math.sqrt(3 * e);
    return 0.17883277 * Math.log(12 * e - 0.28466892) + 0.55991073;
}

/** Decode a BT.2100 HLG signal to scene-linear light (the inverse OETF). */
export function hlgToLinear(e: number): number {
    if (e <= 0.5) return (e * Math.abs(e)) / 3;
    return (Math.exp((e - 0.55991073) / 0.17883277) + 0.28466892) / 12;
}

/** Convert linear sRGB to CIE XYZ relative to D65, into `out`. Returns `out`. */
export function linearSrgbToXyzD65(out: Color, c: Const<Color>): Color {
    const r = c[0];
    const g = c[1];
    const b = c[2];
    out[0] = 0.4123907992659595 * r + 0.35758433938387796 * g + 0.1804807884018343 * b;
    out[1] = 0.21263900587151036 * r + 0.7151686787677559 * g + 0.07219231536073371 * b;
    out[2] = 0.01933081871559185 * r + 0.11919477979462599 * g + 0.9505321522496606 * b;
    return out;
}

/** Convert CIE XYZ relative to D65 to linear sRGB, into `out`. Returns `out`. */
export function xyzD65ToLinearSrgb(out: Color, c: Const<Color>): Color {
    const x = c[0];
    const y = c[1];
    const z = c[2];
    out[0] = 3.2409699419045213 * x - 1.5373831775700935 * y - 0.4986107602930033 * z;
    out[1] = -0.9692436362808798 * x + 1.8759675015077206 * y + 0.04155505740717561 * z;
    out[2] = 0.05563007969699361 * x - 0.20397695888897657 * y + 1.0569715142428786 * z;
    return out;
}

/** Convert linear sRGB to CIE XYZ relative to D50 (Bradford adapted), into `out`. Returns `out`. */
export function linearSrgbToXyzD50(out: Color, c: Const<Color>): Color {
    const r = c[0];
    const g = c[1];
    const b = c[2];
    out[0] = 0.43606574687426947 * r + 0.3851515095901597 * g + 0.1430784199651387 * b;
    out[1] = 0.22249317711056527 * r + 0.7168870130944824 * g + 0.060619809794952365 * b;
    out[2] = 0.013923921463169401 * r + 0.09708132423141017 * g + 0.7140993568158808 * b;
    return out;
}

/** Convert CIE XYZ relative to D50 to linear sRGB (Bradford adapted), into `out`. Returns `out`. */
export function xyzD50ToLinearSrgb(out: Color, c: Const<Color>): Color {
    const x = c[0];
    const y = c[1];
    const z = c[2];
    out[0] = 3.1341358529001173 * x - 1.6173859980180427 * y - 0.4906622179110973 * z;
    out[1] = -0.9787954765557777 * x + 1.9162543773959886 * y + 0.0334428733903669 * z;
    out[2] = 0.07195539255794736 * x - 0.22897675981518203 * y + 1.4053860351131182 * z;
    return out;
}

/** Adapt CIE XYZ from the D65 white point to D50 (Bradford), into `out`. Returns `out`. */
export function xyzD65ToXyzD50(out: Color, c: Const<Color>): Color {
    const x = c[0];
    const y = c[1];
    const z = c[2];
    out[0] = 1.0479297925449969 * x + 0.022946870601609652 * y - 0.05019226628920524 * z;
    out[1] = 0.02962780877005599 * x + 0.9904344267538799 * y - 0.017073799063418826 * z;
    out[2] = -0.009243040646204504 * x + 0.015055191490298152 * y + 0.7518742814281371 * z;
    return out;
}

/** Adapt CIE XYZ from the D50 white point to D65 (Bradford), into `out`. Returns `out`. */
export function xyzD50ToXyzD65(out: Color, c: Const<Color>): Color {
    const x = c[0];
    const y = c[1];
    const z = c[2];
    out[0] = 0.955473421488075 * x - 0.02309845494876471 * y + 0.06325924320057072 * z;
    out[1] = -0.0283697093338637 * x + 1.0099953980813041 * y + 0.021041441191917323 * z;
    out[2] = 0.012314014864481998 * x - 0.020507649298898964 * y + 1.330365926242124 * z;
    return out;
}

/**
 * Convert a linear-sRGB Color to linear Display P3 primaries, into `out`. Returns `out`.
 * Both spaces share the sRGB transfer curve and white point, so this changes only the primaries.
 */
export function linearSrgbToLinearDisplayP3(out: Color, c: Const<Color>): Color {
    const r = c[0];
    const g = c[1];
    const b = c[2];
    out[0] = 0.8224619687143623 * r + 0.17753803128563772 * g;
    out[1] = 0.03319419885096158 * r + 0.9668058011490382 * g;
    out[2] = 0.017082630721120033 * r + 0.07239744066396347 * g + 0.9105199286149166 * b;
    return out;
}

/**
 * Convert a linear Display P3 Color to linear-sRGB primaries, into `out`. Returns `out`.
 * Colors outside the sRGB gamut yield channels outside [0, 1].
 */
export function linearDisplayP3ToLinearSrgb(out: Color, c: Const<Color>): Color {
    const r = c[0];
    const g = c[1];
    const b = c[2];
    out[0] = 1.2249401762805596 * r - 0.22494017628055993 * g;
    out[1] = -0.04205695470968818 * r + 1.0420569547096883 * g;
    out[2] = -0.019637554590334436 * r - 0.07863604555063189 * g + 1.0982736001409663 * b;
    return out;
}

/** Convert linear sRGB to linear Rec.2020 (and Rec.2100) primaries, into `out`. Returns `out`. */
export function linearSrgbToLinearRec2020(out: Color, c: Const<Color>): Color {
    const r = c[0];
    const g = c[1];
    const b = c[2];
    out[0] = 0.627403895934699 * r + 0.3292830383778836 * g + 0.043313065687417246 * b;
    out[1] = 0.06909728935823205 * r + 0.9195403950754587 * g + 0.011362315566309173 * b;
    out[2] = 0.01639143887515028 * r + 0.08801330787722576 * g + 0.895595253247624 * b;
    return out;
}

/** Convert linear Rec.2020 (and Rec.2100) primaries to linear sRGB, into `out`. Returns `out`. */
export function linearRec2020ToLinearSrgb(out: Color, c: Const<Color>): Color {
    const r = c[0];
    const g = c[1];
    const b = c[2];
    out[0] = 1.6604910021084343 * r - 0.5876411387885496 * g - 0.0728498633198848 * b;
    out[1] = -0.12455047452159085 * r + 1.1328998971259603 * g - 0.008349422604369473 * b;
    out[2] = -0.018150763354905307 * r - 0.10057889800800737 * g + 1.1187296613629127 * b;
    return out;
}

/** Convert linear sRGB to linear A98 RGB (Adobe RGB 1998) primaries, into `out`. Returns `out`. */
export function linearSrgbToLinearA98Rgb(out: Color, c: Const<Color>): Color {
    const r = c[0];
    const g = c[1];
    const b = c[2];
    out[0] = 0.7151256068556248 * r + 0.2848743931443754 * g;
    out[1] = g;
    out[2] = 0.04116194845011846 * g + 0.9588380515498816 * b;
    return out;
}

/** Convert linear A98 RGB (Adobe RGB 1998) primaries to linear sRGB, into `out`. Returns `out`. */
export function linearA98RgbToLinearSrgb(out: Color, c: Const<Color>): Color {
    const r = c[0];
    const g = c[1];
    const b = c[2];
    out[0] = 1.3983557439607786 * r - 0.3983557439607784 * g;
    out[1] = g;
    out[2] = -0.042928989294473266 * g + 1.0429289892944733 * b;
    return out;
}

/** Convert linear sRGB to linear ProPhoto RGB primaries (D50, Bradford adapted), into `out`. Returns `out`. */
export function linearSrgbToLinearProphotoRgb(out: Color, c: Const<Color>): Color {
    const r = c[0];
    const g = c[1];
    const b = c[2];
    out[0] = 0.5292769776226117 * r + 0.330154501978493 * g + 0.14056852039889559 * b;
    out[1] = 0.09836585954044925 * r + 0.8734707129069617 * g + 0.02816342755258901 * b;
    out[2] = 0.016875340921386848 * r + 0.11765941425612084 * g + 0.8654652448224923 * b;
    return out;
}

/** Convert linear ProPhoto RGB primaries (D50) to linear sRGB, Bradford adapted, into `out`. Returns `out`. */
export function linearProphotoRgbToLinearSrgb(out: Color, c: Const<Color>): Color {
    const r = c[0];
    const g = c[1];
    const b = c[2];
    out[0] = 2.0343808495169955 * r - 0.7276357899341349 * g - 0.30674505958286163 * b;
    out[1] = -0.2288257316330504 * r + 1.231742541190105 * g - 0.002916809557054527 * b;
    out[2] = -0.008558828783917418 * r - 0.15326670213803723 * g + 1.1618255309219545 * b;
    return out;
}

/** Convert linear sRGB to gamma-encoded Display P3 (as used by CSS `color(display-p3 ...)`), into `out`. Returns `out`. */
export function linearSrgbToDisplayP3(out: Color, c: Const<Color>): Color {
    linearSrgbToLinearDisplayP3(out, c);
    out[0] = linearToSrgb(out[0]);
    out[1] = linearToSrgb(out[1]);
    out[2] = linearToSrgb(out[2]);
    return out;
}

/** Convert gamma-encoded Display P3 to linear sRGB, into `out`. Returns `out`. */
export function displayP3ToLinearSrgb(out: Color, c: Const<Color>): Color {
    const r = srgbToLinear(c[0]);
    const g = srgbToLinear(c[1]);
    const b = srgbToLinear(c[2]);
    out[0] = 1.2249401762805596 * r - 0.22494017628055993 * g;
    out[1] = -0.04205695470968818 * r + 1.0420569547096883 * g;
    out[2] = -0.019637554590334436 * r - 0.07863604555063189 * g + 1.0982736001409663 * b;
    return out;
}

/**
 * Convert linear sRGB to a Rec.2100 PQ signal (HDR10), into `out`. Returns `out`.
 * 1.0 in linear sRGB is reference white at 203 cd/m² (BT.2408), which encodes to about 0.58.
 */
export function linearSrgbToRec2100Pq(out: Color, c: Const<Color>): Color {
    linearSrgbToLinearRec2020(out, c);
    out[0] = nitsToPq(out[0] * 203);
    out[1] = nitsToPq(out[1] * 203);
    out[2] = nitsToPq(out[2] * 203);
    return out;
}

/** Convert a Rec.2100 PQ signal (HDR10) to linear sRGB with 203 cd/m² as 1.0, into `out`. Returns `out`. */
export function rec2100PqToLinearSrgb(out: Color, c: Const<Color>): Color {
    out[0] = pqToNits(c[0]) / 203;
    out[1] = pqToNits(c[1]) / 203;
    out[2] = pqToNits(c[2]) / 203;
    return linearRec2020ToLinearSrgb(out, out);
}

/**
 * Convert linear sRGB to a Rec.2100 HLG signal, into `out`. Returns `out`.
 * Reference white (1.0) encodes to 0.75 using the CSS Color HDR scale of 3.7743.
 */
export function linearSrgbToRec2100Hlg(out: Color, c: Const<Color>): Color {
    linearSrgbToLinearRec2020(out, c);
    out[0] = linearToHlg(out[0] / 3.7743);
    out[1] = linearToHlg(out[1] / 3.7743);
    out[2] = linearToHlg(out[2] / 3.7743);
    return out;
}

/** Convert a Rec.2100 HLG signal to linear sRGB with reference white as 1.0, into `out`. Returns `out`. */
export function rec2100HlgToLinearSrgb(out: Color, c: Const<Color>): Color {
    out[0] = hlgToLinear(c[0]) * 3.7743;
    out[1] = hlgToLinear(c[1]) * 3.7743;
    out[2] = hlgToLinear(c[2]) * 3.7743;
    return linearRec2020ToLinearSrgb(out, out);
}

/**
 * Create a CSS `color(<space> ...)` string from channel values already in `space`, with an optional alpha.
 * It only formats, so a bundle pays only for the conversions it calls, for example
 * `toCSS('display-p3', linearSrgbToDisplayP3(tmp, c))`.
 */
export function toCSS(space: CSSColorSpace, values: Const<Color>, alpha = 1): string {
    return `color(${space} ${formatNumber(values[0], 6)} ${formatNumber(values[1], 6)} ${formatNumber(values[2], 6)}${formatAlpha(alpha)})`;
}
