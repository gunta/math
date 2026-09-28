import { describe, expect, it } from 'vitest';
import { color, oklab } from '../../../src/color';

describe('oklab', () => {
    it('create / set / clone', () => {
        expect(oklab.create()).toEqual([0, 0, 0]);
        const lab = oklab.set(oklab.create(), 0.5, 0.1, -0.1);
        expect(oklab.clone(lab)).toEqual([0.5, 0.1, -0.1]);
    });

    it('converts linear sRGB to OKLab (CSS Color 4 reference values)', () => {
        const white = oklab.fromColor(oklab.create(), [1, 1, 1]);
        expect(white[0]).toBeCloseTo(1, 12);
        expect(white[1]).toBeCloseTo(0, 12);
        expect(white[2]).toBeCloseTo(0, 12);

        const red = oklab.fromColor(oklab.create(), [1, 0, 0]);
        expect(red[0]).toBeCloseTo(0.627955, 6);
        expect(red[1]).toBeCloseTo(0.224863, 6);
        expect(red[2]).toBeCloseTo(0.125846, 6);
    });

    it('round-trips, including wide-gamut and HDR values', () => {
        for (const c of [
            [0.2, 0.5, 0.8],
            [1.2, -0.05, 0.1],
            [4, 3, 2],
        ] as color.Color[]) {
            const back = oklab.toColor(color.create(), oklab.fromColor(oklab.create(), c));
            expect(back[0]).toBeCloseTo(c[0], 12);
            expect(back[1]).toBeCloseTo(c[1], 12);
            expect(back[2]).toBeCloseTo(c[2], 12);
        }
    });

    it('mixes Colors perceptually, premultiplying alpha', () => {
        // halfway from black to white in OKLab is a perceptual mid gray, darker than the linear average
        const mid = oklab.mix(color.create(), [0, 0, 0], [1, 1, 1], 0.5);
        expect(mid[0]).toBeCloseTo(0.125, 12);
        expect(mid[1]).toBeCloseTo(0.125, 12);

        const faded = oklab.mix(color.create(), [1, 0, 0, 1], [0, 0, 1, 0], 0.5);
        expect(faded[0]).toBeCloseTo(1, 9);
        expect(faded[3]).toBe(0.5);
    });

    it('measures perceptual difference with deltaEOK', () => {
        const red = oklab.fromColor(oklab.create(), [1, 0, 0]);
        expect(oklab.deltaEOK(red, red)).toBe(0);
        expect(oklab.deltaEOK([0.5, 0, 0], [0.52, 0, 0])).toBeCloseTo(0.02, 12);
    });

    it('serializes to CSS', () => {
        expect(oklab.toCSS([0.627955, 0.224863, 0.125846])).toBe('oklab(0.62796 0.22486 0.12585)');
        expect(oklab.toCSS([0.5, -0.1, 0.2], 0.25)).toBe('oklab(0.5 -0.1 0.2 / 0.25)');
    });
});
