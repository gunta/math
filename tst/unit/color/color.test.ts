import { describe, expect, it } from 'vitest';
import { color, colorspace } from '../../../src/color';

describe('color', () => {
    it('create / set / fromValues', () => {
        expect(color.create()).toEqual([0, 0, 0]);
        expect(color.fromValues(0.1, 0.2, 0.3)).toEqual([0.1, 0.2, 0.3]);
        const c = color.create();
        expect(color.set(c, 1, 0.5, 0)).toBe(c);
        expect(c).toEqual([1, 0.5, 0]);
        expect(color.setScalar(color.create(), 0.5)).toEqual([0.5, 0.5, 0.5]);
    });

    it('parses hex / integer / named to linear', () => {
        // pure red: sRGB 1 -> linear 1, others 0
        expect(color.fromColorInput('#ff0000')).toEqual([1, 0, 0]);
        expect(color.fromColorInput('#f00')).toEqual([1, 0, 0]);
        expect(color.fromColorInput(0xff0000)).toEqual([1, 0, 0]);
        expect(color.fromColorInput('red')).toEqual([1, 0, 0]);
        expect(color.toHexString(color.fromColorInput('slategray') as color.Color)).toBe('708090');
        // an array input is treated as already-linear
        expect(color.fromColorInput([0.25, 0.5, 0.75])).toEqual([0.25, 0.5, 0.75]);
    });

    it('returns null for unrecognised input', () => {
        expect(color.fromColorInput('not-a-color')).toBeNull();
    });

    it('sRGB round-trips (fromSRGB <-> toSRGB)', () => {
        const srgb: [number, number, number] = [0.2, 0.5, 0.8];
        const back = color.toSRGB([0, 0, 0], color.fromSRGB(srgb));
        expect(back[0]).toBeCloseTo(srgb[0], 6);
        expect(back[1]).toBeCloseTo(srgb[1], 6);
        expect(back[2]).toBeCloseTo(srgb[2], 6);
    });

    it('hex output round-trips', () => {
        const c = color.fromColorInput(0xff8800) as color.Color;
        expect(color.toHex(c)).toBe(0xff8800);
        expect(color.toHexString(c)).toBe('ff8800');
    });

    it('toCSS clamps and gamma-encodes', () => {
        expect(color.toCSS([1, 0, 0])).toBe('rgb(255, 0, 0)');
        // out-of-range channels are clamped, not wrapped, and NaN is 0
        expect(color.toCSS([2, -1, 0])).toBe('rgb(255, 0, 0)');
        expect(color.toCSS([Number.NaN, 0, 0])).toBe('rgb(0, 0, 0)');
    });

    it('arithmetic + blending', () => {
        expect(color.add(color.create(), [0.1, 0.2, 0.3], [0.4, 0, 0.1])).toEqual([0.5, 0.2, expect.closeTo(0.4, 6)]);
        expect(color.multiplyScalar(color.create(), [0.2, 0.4, 0.6], 0.5)).toEqual([0.1, 0.2, 0.3]);
        expect(color.lerp(color.create(), [0, 0, 0], [1, 1, 1], 0.5)).toEqual([0.5, 0.5, 0.5]);
        expect(color.clamp(color.create(), [2, -1, 0.5])).toEqual([1, 0, 0.5]);
    });

    it('equals with optional epsilon', () => {
        expect(color.equals([0.1, 0.2, 0.3], [0.1, 0.2, 0.3])).toBe(true);
        expect(color.equals([0.1, 0.2, 0.3], [0.1, 0.2, 0.31])).toBe(false);
        expect(color.equals([0.1, 0.2, 0.3], [0.1, 0.2, 0.31], 0.02)).toBe(true);
    });

    it('carries an optional straight alpha', () => {
        expect(color.fromValues(1, 0, 0, 0.5)).toEqual([1, 0, 0, 0.5]);
        expect(color.clone([1, 0, 0, 0.5])).toEqual([1, 0, 0, 0.5]);
        expect(color.toCSS([1, 0, 0, 0.5])).toBe('rgba(255, 0, 0, 0.5)');
        // a missing alpha is opaque
        expect(color.equals([1, 0, 0], [1, 0, 0, 1])).toBe(true);
    });

    it('interpolates premultiplied when alpha is present', () => {
        // fading red out towards transparent blue stays red instead of turning purple
        expect(color.lerp(color.create(), [1, 0, 0, 1], [0, 0, 1, 0], 0.5)).toEqual([1, 0, 0, 0.5]);
        const p = color.premultiply(color.create(), [0.8, 0.4, 0.2, 0.5]);
        expect(p).toEqual([0.4, 0.2, 0.1, 0.5]);
        expect(color.unpremultiply(p, p)).toEqual([0.8, 0.4, 0.2, 0.5]);
        // a fully transparent result keeps its premultiplied values, as CSS does
        expect(color.lerp(color.create(), [1, 0, 0, 0], [0, 0, 1, 1], 0)).toEqual([0, 0, 0, 0]);
    });

    it('composites source-over in linear light', () => {
        // an opaque result stays a plain [r, g, b]
        expect(color.over(color.create(), [1, 0, 0, 0.5], [0, 0, 1])).toEqual([0.5, 0, 0.5]);
        expect(color.over(color.create(), [1, 0, 0, 0.5], [0, 0, 1, 0.5])).toEqual([
            expect.closeTo(2 / 3, 12),
            0,
            expect.closeTo(1 / 3, 12),
            0.75,
        ]);
    });

    it('converts whole buffers with any color function', () => {
        // rgba pixels: rgb is converted, alpha is carried across
        const pixels = new Float32Array([1, 1, 1, 0.5, 0, 0, 0, 1]);
        const xyz = color.convertBuffer(new Float32Array(8), pixels, colorspace.linearSrgbToXyzD65, 4);
        expect(Array.from(xyz)).toEqual([
            expect.closeTo(0.9505, 4),
            expect.closeTo(1, 6),
            expect.closeTo(1.089, 3),
            0.5,
            0,
            0,
            0,
            1,
        ]);
        // colors can be read from and written to buffers one at a time too
        expect(color.fromBuffer(color.create(), pixels, 4)).toEqual([0, 0, 0]);
    });

    it('luminance uses Rec.709 weights on linear light', () => {
        expect(color.luminance([0, 0, 0])).toBe(0);
        expect(color.luminance([1, 1, 1])).toBeCloseTo(1, 6);
        expect(color.luminance([0, 1, 0])).toBeCloseTo(0.7152, 6);
        // green reads brighter than red, red brighter than blue
        expect(color.luminance([0, 1, 0])).toBeGreaterThan(color.luminance([1, 0, 0]));
        expect(color.luminance([1, 0, 0])).toBeGreaterThan(color.luminance([0, 0, 1]));
    });

    it('measures WCAG 2 contrast and picks a readable text color', () => {
        expect(color.contrastRatio([1, 1, 1], [0, 0, 0])).toBeCloseTo(21, 12);
        expect(color.contrastRatio(color.fromColorInput('#767676') as color.Color, [1, 1, 1])).toBeCloseTo(4.54, 2);
        // CSS contrast-color(): black on light backgrounds, white on dark ones
        expect(color.contrastColor(color.create(), color.fromColorInput('gold') as color.Color)).toEqual([0, 0, 0]);
        expect(color.contrastColor(color.create(), color.fromColorInput('navy') as color.Color)).toEqual([1, 1, 1]);
    });
});
