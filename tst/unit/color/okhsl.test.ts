import { describe, expect, it } from 'vitest';
import { color, okhsl, oklab } from '../../../src/color';

describe('okhsl', () => {
    it('converts linear sRGB (hue in degrees)', () => {
        const red = okhsl.fromColor(okhsl.create(), [1, 0, 0]);
        expect(red[0]).toBeCloseTo(29.23388, 5);
        expect(red[1]).toBeCloseTo(1, 6);
        expect(red[2]).toBeCloseTo(0.568085, 6);
        expect(okhsl.fromColor(okhsl.create(), [1, 1, 1])).toEqual([0, 0, expect.closeTo(1, 12)]);
    });

    it('round-trips through linear sRGB', () => {
        const c: color.Color = [0.2, 0.5, 0.8];
        const back = okhsl.toColor(color.create(), okhsl.fromColor(okhsl.create(), c));
        expect(back[0]).toBeCloseTo(c[0], 12);
        expect(back[1]).toBeCloseTo(c[1], 12);
        expect(back[2]).toBeCloseTo(c[2], 12);
    });

    it('full saturation lands on the sRGB gamut edge for every hue', () => {
        // the gamut boundary is an approximation, accurate to about 1e-4
        for (let h = 0; h < 360; h += 15) {
            const c = okhsl.toColor(color.create(), [h, 1, 0.6]);
            expect(Math.min(c[0], c[1], c[2])).toBeGreaterThan(-1e-4);
            expect(Math.max(c[0], c[1], c[2])).toBeLessThan(1 + 1e-4);
            expect(Math.min(c[0], c[1], c[2]) < 1e-4 || Math.max(c[0], c[1], c[2]) > 1 - 1e-4).toBe(true);
        }
    });

    it('keeps lightness perceptually even across hues', () => {
        // yellow and blue at the same okhsl lightness have the same OKLab lightness
        const yellow = oklab.fromColor(oklab.create(), okhsl.toColor(color.create(), [110, 1, 0.5]));
        const blue = oklab.fromColor(oklab.create(), okhsl.toColor(color.create(), [265, 1, 0.5]));
        expect(yellow[0]).toBeCloseTo(blue[0], 12);
    });

    it('interpolates hue the short way round', () => {
        expect(okhsl.lerp(okhsl.create(), [350, 1, 0.5], [10, 1, 0.5], 0.5)[0]).toBeCloseTo(0, 9);
    });
});
