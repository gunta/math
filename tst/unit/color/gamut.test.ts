import { describe, expect, it } from 'vitest';
import { color, colorspace, gamut, oklch } from '../../../src/color';

// pure Display P3 red, outside sRGB
const p3Red = colorspace.displayP3ToLinearSrgb(color.create(), [1, 0, 0]);

describe('gamut', () => {
    it('tests gamut membership', () => {
        expect(gamut.isInSrgb([1, 0, 0])).toBe(true);
        expect(gamut.isInSrgb(p3Red)).toBe(false);
        expect(gamut.isInDisplayP3(p3Red)).toBe(true);
        expect(gamut.isInRec2020([1, 0, 0])).toBe(true);
        // HDR headroom: 3x reference white fits a display with 4x headroom
        expect(gamut.isInRec2020([3, 3, 3])).toBe(false);
        expect(gamut.isInRec2020([3, 3, 3], 4)).toBe(true);
    });

    it('clips per channel', () => {
        expect(gamut.clipToSrgb(color.create(), p3Red)).toEqual([1, 0, 0]);
        expect(gamut.clipToSrgb(color.create(), [3, 0.5, -1], 2)).toEqual([2, 0.5, 0]);
    });

    it('leaves in-gamut colors untouched', () => {
        expect(gamut.mapToSrgb(color.create(), [0.2, 0.4, 0.6])).toEqual([0.2, 0.4, 0.6]);
    });

    it('maps into gamut keeping OKLCH lightness and hue (CSS ray trace)', () => {
        const vivid = oklch.toColor(color.create(), [0.7, 0.35, 150]);
        for (const [map, isIn] of [
            [gamut.mapToSrgb, gamut.isInSrgb],
            [gamut.mapToDisplayP3, gamut.isInDisplayP3],
        ] as const) {
            const mapped = map(color.create(), vivid);
            expect(isIn(mapped, 1, 1e-9)).toBe(true);
            const lch = oklch.fromColor(oklch.create(), mapped);
            expect(lch[0]).toBeCloseTo(0.7, 2);
            expect(lch[1]).toBeLessThan(0.35);
            expect(lch[2]).toBeCloseTo(150, 0);
        }
    });

    it('maps HDR colors into a display with headroom, and clamps beyond peak white', () => {
        // brighter than reference white and outside Rec.2020: only chroma is reduced
        const hdr = oklch.toColor(color.create(), [1.3, 0.5, 30]);
        const mapped = gamut.mapToRec2020(color.create(), hdr, 4);
        expect(gamut.isInRec2020(mapped, 4, 1e-9)).toBe(true);
        const lch = oklch.fromColor(oklch.create(), mapped);
        expect(lch[0]).toBeCloseTo(1.3, 6);
        expect(lch[2]).toBeCloseTo(30, 4);
        // without headroom it is brighter than white, so it becomes white
        expect(gamut.mapToRec2020(color.create(), hdr)).toEqual([1, 1, 1]);
    });
});
