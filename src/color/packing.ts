import type { Const } from '../core/const';
import type { Color } from './color';
import { linearToSrgb, srgbToLinear } from './colorspace';

// GPU and HDR texel packing. Every packed texel is a uint32 in little-endian channel order
// (R in the lowest bits), matching WebGPU texel layouts and Uint32Array views of texture data.
// Channel values are stored as given, with no transfer function, except for the Srgb variant.
// NaN channels pack as 0.

/** Pack a Color into an 'rgba8unorm' texel, clamping to [0, 1] and using alpha 1 when absent. */
export function packRgba8unorm(c: Const<Color>): number {
    return rgba8(c[0], c[1], c[2], c[3] ?? 1);
}

/** Unpack an 'rgba8unorm' texel into `out`, including alpha. Returns `out`. */
export function unpackRgba8unorm(out: Color, v: number): Color {
    out[0] = (v & 255) / 255;
    out[1] = ((v >>> 8) & 255) / 255;
    out[2] = ((v >>> 16) & 255) / 255;
    out[3] = (v >>> 24) / 255;
    return out;
}

/**
 * Pack a linear Color into an 'rgba8unorm-srgb' texel, sRGB encoding rgb and keeping alpha linear.
 * This is the 8 bit sRGB format of PNG, canvas ImageData and sRGB render targets.
 */
export function packRgba8unormSrgb(c: Const<Color>): number {
    return rgba8(linearToSrgb(c[0]), linearToSrgb(c[1]), linearToSrgb(c[2]), c[3] ?? 1);
}

/** Unpack an 'rgba8unorm-srgb' texel into a linear Color `out`, including alpha. Returns `out`. */
export function unpackRgba8unormSrgb(out: Color, v: number): Color {
    out[0] = srgbToLinear((v & 255) / 255);
    out[1] = srgbToLinear(((v >>> 8) & 255) / 255);
    out[2] = srgbToLinear(((v >>> 16) & 255) / 255);
    out[3] = (v >>> 24) / 255;
    return out;
}

/**
 * Pack a Color into an 'rgb10a2unorm' texel: 10 bits for r, g, b and 2 bits of alpha, clamped to [0, 1].
 * This is the HDR10 swap chain format. Encode with `colorspace.linearSrgbToRec2100Pq` first.
 */
export function packRgb10a2unorm(c: Const<Color>): number {
    const a = unorm(c[3] ?? 1, 3);
    return (unorm(c[0], 1023) | (unorm(c[1], 1023) << 10) | (unorm(c[2], 1023) << 20) | (a << 30)) >>> 0;
}

/** Unpack an 'rgb10a2unorm' texel into `out`, including alpha. Returns `out`. */
export function unpackRgb10a2unorm(out: Color, v: number): Color {
    out[0] = (v & 1023) / 1023;
    out[1] = ((v >>> 10) & 1023) / 1023;
    out[2] = ((v >>> 20) & 1023) / 1023;
    out[3] = (v >>> 30) / 3;
    return out;
}

/**
 * Pack a Color into an 'rgb9e5ufloat' texel: three 9 bit mantissas sharing one 5 bit exponent.
 * Channels are clamped to [0, 65408]. Small channels lose precision next to a bright one. Alpha is dropped.
 */
export function packRgb9e5ufloat(c: Const<Color>): number {
    const r = clamp(c[0], 65408);
    const g = clamp(c[1], 65408);
    const b = clamp(c[2], 65408);
    const max = Math.max(r, g, b);
    // shared exponent with bias 15, raised when the largest mantissa rounds up to 2^9
    let e = max < 2 ** -16 ? 0 : floorLog2(max) + 16;
    if (Math.floor(max * pow2(24 - e) + 0.5) === 512) e++;
    const s = pow2(24 - e);
    return (Math.floor(r * s + 0.5) | (Math.floor(g * s + 0.5) << 9) | (Math.floor(b * s + 0.5) << 18) | (e << 27)) >>> 0;
}

/** Unpack an 'rgb9e5ufloat' texel into `out`, leaving alpha untouched. Returns `out`. */
export function unpackRgb9e5ufloat(out: Color, v: number): Color {
    const s = pow2((v >>> 27) - 24);
    out[0] = (v & 511) * s;
    out[1] = ((v >>> 9) & 511) * s;
    out[2] = ((v >>> 18) & 511) * s;
    return out;
}

/**
 * Pack a Color into an 'rg11b10ufloat' texel: unsigned 11 bit floats for r and g, 10 bit for b.
 * Rounds to nearest even. Negative channels become 0, and values above the largest finite
 * (65024 for r and g, 64512 for b) saturate to it instead of becoming infinity. Alpha is dropped.
 */
export function packRg11b10ufloat(c: Const<Color>): number {
    return (ufloat(c[0], 6) | (ufloat(c[1], 6) << 11) | (ufloat(c[2], 5) << 22)) >>> 0;
}

/** Unpack an 'rg11b10ufloat' texel into `out`, leaving alpha untouched. Returns `out`. */
export function unpackRg11b10ufloat(out: Color, v: number): Color {
    out[0] = unpackFloat(v & 2047, 6);
    out[1] = unpackFloat((v >>> 11) & 2047, 6);
    out[2] = unpackFloat(v >>> 22, 5);
    return out;
}

/**
 * Pack a Color into a Radiance .hdr RGBE texel: 8 bit mantissas with a shared exponent byte.
 * Bytes are R, G, B, E from low to high, as stored in the file. Follows Greg Ward's rgbe.c.
 * Channels are clamped to [0, 1e38]. Alpha is dropped.
 */
export function packRgbe(c: Const<Color>): number {
    const r = clamp(c[0], 1e38);
    const g = clamp(c[1], 1e38);
    const b = clamp(c[2], 1e38);
    const max = Math.max(r, g, b);
    if (max < 1e-32) return 0;
    // frexp(max) = m * 2^e with m in [0.5, 1), so bytes are floor(channel * 256 / 2^e)
    const e = floorLog2(max) + 1;
    const s = pow2(8 - e);
    return (Math.floor(r * s) | (Math.floor(g * s) << 8) | (Math.floor(b * s) << 16) | ((e + 128) << 24)) >>> 0;
}

/**
 * Unpack a Radiance .hdr RGBE texel into `out` as rgbe.c does, leaving alpha untouched. Returns `out`.
 * three.js HDRLoader scales by 2^(E - 128) / 255 instead of 2^(E - 136), about 0.4% brighter.
 */
export function unpackRgbe(out: Color, v: number): Color {
    const e = v >>> 24;
    const s = e === 0 ? 0 : pow2(e - 136);
    out[0] = (v & 255) * s;
    out[1] = ((v >>> 8) & 255) * s;
    out[2] = ((v >>> 16) & 255) * s;
    return out;
}

/**
 * Pack a number into IEEE 754 binary16 (half float) bits, rounding to nearest even.
 * Subnormals are kept, values from 65520 up overflow to infinity, NaN becomes 0x7e00 and -0 keeps its sign.
 */
export function packHalf(x: number): number {
    if (Number.isNaN(x)) return 0x7e00;
    const a = Math.abs(x);
    return (x < 0 || 1 / x < 0 ? 0x8000 : 0) | (a < 65520 ? smallFloat(a, 10) : 0x7c00);
}

/** Unpack IEEE 754 binary16 (half float) bits into a number. */
export function unpackHalf(h: number): number {
    const v = unpackFloat(h & 0x7fff, 10);
    return h & 0x8000 ? -v : v;
}

// four [0, 1] channels as bytes, r lowest
function rgba8(r: number, g: number, b: number, a: number): number {
    return (unorm(r, 255) | (unorm(g, 255) << 8) | (unorm(b, 255) << 16) | (unorm(a, 255) << 24)) >>> 0;
}

// round x in [0, 1] to an integer in [0, max], NaN becomes 0
function unorm(x: number, max: number): number {
    return Math.round(clamp(x, 1) * max);
}

// clamp to [0, max], NaN becomes 0
function clamp(x: number, max: number): number {
    return x > 0 ? (x < max ? x : max) : 0;
}

// float64 bit access for exponents, several times faster than Math.log2 and 2 ** e.
// Index 1 is the high word on little-endian platforms, which is every JavaScript runtime in use
const _packing_f64 = /* @__PURE__ */ new Float64Array(1);
const _packing_u32 = /* @__PURE__ */ new Uint32Array(_packing_f64.buffer);

// exact floor(log2(x)) for positive normal x, read from the exponent bits
function floorLog2(x: number): number {
    _packing_f64[0] = x;
    return ((_packing_u32[1] >>> 20) & 2047) - 1023;
}

// exactly 2^e for integer e in [-1022, 1023], written as exponent bits
function pow2(e: number): number {
    _packing_u32[0] = 0;
    _packing_u32[1] = (e + 1023) << 20;
    return _packing_f64[0];
}

// Math.round with ties to even
function roundEven(x: number): number {
    const r = Math.round(x);
    return r - x === 0.5 && (r & 1) === 1 ? r - 1 : r;
}

// bits of a float with a 5 bit exponent (bias 15) and m mantissa bits, for x in [0, overflow)
// a mantissa that rounds up to 2^m carries into the exponent
function smallFloat(x: number, m: number): number {
    if (x < 2 ** -14) return roundEven(x * 2 ** (14 + m));
    const e = floorLog2(x);
    return ((e + 15) << m) + roundEven((x * pow2(-e) - 1) * (1 << m));
}

// unsigned float with m mantissa bits, saturating at the largest finite (2 - 2^-m) * 2^15
function ufloat(x: number, m: number): number {
    return x > 0 ? (x < 65536 - 2 ** (15 - m) ? smallFloat(x, m) : (31 << m) - 1) : 0;
}

// decode unsigned bits with a 5 bit exponent (bias 15) and m mantissa bits
function unpackFloat(bits: number, m: number): number {
    const e = bits >>> m;
    const f = bits & ((1 << m) - 1);
    if (e === 0) return f * pow2(-14 - m);
    return e < 31 ? (f + (1 << m)) * pow2(e - 15 - m) : f ? Number.NaN : Number.POSITIVE_INFINITY;
}
