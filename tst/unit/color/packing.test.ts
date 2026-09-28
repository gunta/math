import { describe, expect, it } from 'vitest';
import { packing } from '../../../src/color';

describe('packing', () => {
    it('rgba8unorm stores bytes with R lowest and alpha defaulting to opaque', () => {
        expect(packing.packRgba8unorm([1, 0.5, 0])).toBe(0xff0080ff);
        expect(packing.packRgba8unorm([2, -1, Number.NaN])).toBe(0xff0000ff); // clamped, NaN is 0
        expect(packing.unpackRgba8unorm([0, 0, 0], 0x80ff0000)).toEqual([0, 0, 1, 128 / 255]);
        const c = packing.unpackRgba8unorm([0, 0, 0], 0x12345678);
        expect(packing.packRgba8unorm(c)).toBe(0x12345678);
    });

    it('rgba8unorm-srgb encodes rgb with the sRGB curve and keeps alpha linear', () => {
        expect(packing.packRgba8unormSrgb([0.5, 0.5, 0.5])).toBe(0xffbcbcbc); // linear 0.5 is sRGB 188
        const c = packing.unpackRgba8unormSrgb([0, 0, 0], 0x80bcbcbc);
        expect(c[0]).toBeCloseTo(0.5, 2);
        expect(packing.packRgba8unormSrgb(c)).toBe(0x80bcbcbc);
    });

    it('rgb10a2unorm packs 10 bit rgb and 2 bit alpha for HDR10 output', () => {
        expect(packing.packRgb10a2unorm([1, 1, 1])).toBe(0xffffffff);
        expect(packing.packRgb10a2unorm([0, 0, 0])).toBe(0xc0000000);
        const c = packing.unpackRgb10a2unorm([0, 0, 0], 0x7ff003ff);
        expect(c).toEqual([1, 0, 1, 1 / 3]);
        expect(packing.packRgb10a2unorm(c)).toBe(0x7ff003ff);
    });

    it('rgb9e5ufloat shares one exponent between three 9 bit mantissas', () => {
        expect(packing.packRgb9e5ufloat([1, 1, 1])).toBe(0x84020100);
        expect(packing.packRgb9e5ufloat([0.5, 0.25, 0])).toBe(0x78010100);
        expect(packing.packRgb9e5ufloat([65408, 0, 0])).toBe(0xf80001ff); // largest value
        expect(packing.packRgb9e5ufloat([1e6, -1, 0])).toBe(0xf80001ff); // clamped
        // dim channels round to the step of the brightest one (1 / 32 at 12.5)
        const v = packing.packRgb9e5ufloat([0.18, 1, 12.5]);
        expect(packing.unpackRgb9e5ufloat([0, 0, 0], v)).toEqual([0.1875, 1, 12.5]);
    });

    it('rg11b10ufloat packs unsigned small floats per channel', () => {
        expect(packing.packRg11b10ufloat([1, 1, 1])).toBe(0x781e03c0);
        const v = packing.packRg11b10ufloat([0.18, 1, 12.5]);
        expect(packing.unpackRg11b10ufloat([0, 0, 0], v)).toEqual([0.1796875, 1, 12.5]);
        // negatives become 0 and values past the largest finite saturate
        const max = packing.packRg11b10ufloat([-1, 1e9, Number.POSITIVE_INFINITY]);
        expect(packing.unpackRg11b10ufloat([0, 0, 0], max)).toEqual([0, 65024, 64512]);
    });

    it('rgbe packs Radiance .hdr texels as in rgbe.c', () => {
        expect(packing.packRgbe([1, 1, 1])).toBe(0x81808080);
        expect(packing.packRgbe([1, 0.5, 0.25])).toBe(0x81204080);
        expect(packing.packRgbe([0, 0, 0])).toBe(0);
        // mantissas truncate at the step of the brightest channel
        const v = packing.packRgbe([0.18, 1, 12.5]);
        expect(packing.unpackRgbe([0, 0, 0], v)).toEqual([0.125, 1, 12.5]);
    });

    it('half floats follow IEEE 754 binary16', () => {
        expect(packing.packHalf(1)).toBe(0x3c00);
        expect(packing.packHalf(-2)).toBe(0xc000);
        expect(packing.packHalf(65504)).toBe(0x7bff); // largest finite
        expect(packing.packHalf(65520)).toBe(0x7c00); // rounds to infinity
        expect(packing.packHalf(2 ** -24)).toBe(0x0001); // smallest subnormal
        expect(packing.packHalf(-0)).toBe(0x8000);
        expect(packing.packHalf(Number.NaN)).toBe(0x7e00);
        expect(packing.unpackHalf(0x3555)).toBe(0.333251953125);
        expect(packing.unpackHalf(packing.packHalf(1 / 3))).toBe(0.333251953125);
        expect(packing.unpackHalf(0xfc00)).toBe(Number.NEGATIVE_INFINITY);
    });
});
