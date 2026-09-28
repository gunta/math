import { describe, expect, it } from 'vitest';
import { color, colorspace } from '../../../src/color';

const expectColor = (actual: color.Color, expected: color.Color, digits = 6) => {
    expect(actual[0]).toBeCloseTo(expected[0], digits);
    expect(actual[1]).toBeCloseTo(expected[1], digits);
    expect(actual[2]).toBeCloseTo(expected[2], digits);
};

describe('colorspace', () => {
    it('sRGB transfer functions round-trip, pin endpoints and mirror negatives', () => {
        expect(colorspace.srgbToLinear(0)).toBe(0);
        expect(colorspace.srgbToLinear(1)).toBeCloseTo(1, 12);
        expect(colorspace.linearToSrgb(0)).toBe(0);
        expect(colorspace.linearToSrgb(1)).toBeCloseTo(1, 12);
        for (const v of [-0.5, 0.02, 0.18, 0.5, 0.9, 1.5]) {
            expect(colorspace.linearToSrgb(colorspace.srgbToLinear(v))).toBeCloseTo(v, 12);
        }
        // out-of-gamut channels use the reflected curve (CSS Color 4 extended range)
        expect(colorspace.srgbToLinear(-0.5)).toBeCloseTo(-colorspace.srgbToLinear(0.5), 12);
    });

    it('every predefined gamut round-trips through linear sRGB', () => {
        const pairs = [
            [colorspace.linearSrgbToXyzD65, colorspace.xyzD65ToLinearSrgb],
            [colorspace.linearSrgbToXyzD50, colorspace.xyzD50ToLinearSrgb],
            [colorspace.linearSrgbToLinearDisplayP3, colorspace.linearDisplayP3ToLinearSrgb],
            [colorspace.linearSrgbToLinearRec2020, colorspace.linearRec2020ToLinearSrgb],
            [colorspace.linearSrgbToLinearA98Rgb, colorspace.linearA98RgbToLinearSrgb],
            [colorspace.linearSrgbToLinearProphotoRgb, colorspace.linearProphotoRgbToLinearSrgb],
            [colorspace.linearSrgbToDisplayP3, colorspace.displayP3ToLinearSrgb],
            [colorspace.linearSrgbToRec2100Pq, colorspace.rec2100PqToLinearSrgb],
            [colorspace.linearSrgbToRec2100Hlg, colorspace.rec2100HlgToLinearSrgb],
        ];
        for (const [to, from] of pairs) {
            for (const c of [
                [1, 0, 0],
                [0, 1, 0],
                [0, 0, 1],
                [0.2, 0.5, 0.8],
                [4, 2, 1],
            ] as color.Color[]) {
                expectColor(from(color.create(), to(color.create(), c)), c, 9);
            }
        }
    });

    it('white stays white in the D65 RGB spaces and lands on D50 in XYZ D50', () => {
        expectColor(colorspace.linearSrgbToLinearDisplayP3(color.create(), [1, 1, 1]), [1, 1, 1], 12);
        expectColor(colorspace.linearSrgbToLinearRec2020(color.create(), [1, 1, 1]), [1, 1, 1], 12);
        expectColor(colorspace.linearSrgbToLinearA98Rgb(color.create(), [1, 1, 1]), [1, 1, 1], 12);
        expectColor(colorspace.linearSrgbToXyzD50(color.create(), [1, 1, 1]), [0.3457 / 0.3585, 1, 0.2958 / 0.3585], 12);
    });

    it('wide-gamut primaries fall outside sRGB', () => {
        // pure Display P3 red needs a channel above 1 and two below 0 in sRGB
        const red = colorspace.displayP3ToLinearSrgb(color.create(), [1, 0, 0]);
        expectColor(red, [1.22494, -0.042057, -0.019638]);
    });

    it('PQ encodes absolute luminance (ST 2084)', () => {
        expect(colorspace.nitsToPq(10000)).toBe(1);
        expect(colorspace.nitsToPq(100)).toBeCloseTo(0.508078, 6);
        expect(colorspace.nitsToPq(1000)).toBeCloseTo(0.751827, 6);
        expect(colorspace.pqToNits(colorspace.nitsToPq(203))).toBeCloseTo(203, 9);
        // reference white (1.0 = 203 cd/m²) sits at 58% of the PQ signal
        expectColor(colorspace.linearSrgbToRec2100Pq(color.create(), [1, 1, 1]), [0.580689, 0.580689, 0.580689]);
    });

    it('HLG encodes scene light (BT.2100) with reference white at 0.75', () => {
        expect(colorspace.linearToHlg(1 / 12)).toBeCloseTo(0.5, 12);
        expect(colorspace.linearToHlg(1)).toBeCloseTo(1, 7);
        expect(colorspace.hlgToLinear(colorspace.linearToHlg(0.6))).toBeCloseTo(0.6, 12);
        expectColor(colorspace.linearSrgbToRec2100Hlg(color.create(), [1, 1, 1]), [0.75, 0.75, 0.75], 4);
    });

    it('serializes channel values to CSS color()', () => {
        const p3 = colorspace.linearSrgbToDisplayP3(color.create(), [1, 0, 0]);
        expect(colorspace.toCSS('display-p3', p3)).toBe('color(display-p3 0.917488 0.200287 0.138561)');
        expect(colorspace.toCSS('rec2100-pq', [0.580689, 0.580689, 0.580689], 0.5)).toBe(
            'color(rec2100-pq 0.580689 0.580689 0.580689 / 0.5)',
        );
    });
});
