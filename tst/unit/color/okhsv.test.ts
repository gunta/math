import { describe, expect, it } from 'vitest';
import { color, okhsv } from '../../../src/color';

describe('okhsv', () => {
    it('converts linear sRGB (hue in degrees)', () => {
        const red = okhsv.fromColor(okhsv.create(), [1, 0, 0]);
        expect(red[0]).toBeCloseTo(29.23388, 5);
        expect(red[1]).toBeCloseTo(1, 6);
        expect(red[2]).toBeCloseTo(1, 6);
    });

    it('round-trips through linear sRGB', () => {
        const c: color.Color = [0.2, 0.5, 0.8];
        const back = okhsv.toColor(color.create(), okhsv.fromColor(okhsv.create(), c));
        expect(back[0]).toBeCloseTo(c[0], 12);
        expect(back[1]).toBeCloseTo(c[1], 12);
        expect(back[2]).toBeCloseTo(c[2], 12);
    });

    it('s = v = 1 is the most colorful sRGB color of the hue', () => {
        // the gamut boundary is an approximation, accurate to about 1e-4
        for (let h = 0; h < 360; h += 15) {
            const c = okhsv.toColor(color.create(), [h, 1, 1]);
            expect(Math.max(c[0], c[1], c[2])).toBeCloseTo(1, 4);
            expect(Math.min(c[0], c[1], c[2])).toBeCloseTo(0, 4);
        }
    });

    it('value 0 is black and saturation 0 is gray', () => {
        expect(okhsv.toColor(color.create(), [120, 1, 0])).toEqual([0, 0, 0]);
        const gray = okhsv.toColor(color.create(), [120, 0, 0.5]);
        expect(gray[0]).toBeCloseTo(gray[1], 12);
        expect(gray[1]).toBeCloseTo(gray[2], 12);
    });
});
