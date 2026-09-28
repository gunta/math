import { describe, expect, it } from 'vitest';
import { color, lab, lch } from '../../../src/color';

describe('lab / lch', () => {
    it('converts linear sRGB to CIE Lab and LCH relative to D50 (CSS lab() and lch())', () => {
        expect(lab.fromColor(lab.create(), [1, 1, 1])).toEqual([
            expect.closeTo(100, 9),
            expect.closeTo(0, 9),
            expect.closeTo(0, 9),
        ]);
        const red = lab.fromColor(lab.create(), [1, 0, 0]);
        expect(red[0]).toBeCloseTo(54.2905, 4);
        expect(red[1]).toBeCloseTo(80.8049, 4);
        expect(red[2]).toBeCloseTo(69.891, 4);
        const redLch = lch.fromColor(lch.create(), [1, 0, 0]);
        expect(redLch[1]).toBeCloseTo(106.8372, 4);
        expect(redLch[2]).toBeCloseTo(40.8577, 4);
    });

    it('round-trips through linear sRGB', () => {
        for (const c of [
            [0.2, 0.5, 0.8],
            [0.001, 0.002, 0.0005],
            [1.2, -0.05, 0.1],
        ] as [number, number, number][]) {
            const back = lab.toColor(color.create(), lab.fromColor(lab.create(), c));
            const backLch = lch.toColor(color.create(), lch.fromColor(lch.create(), c));
            for (let i = 0; i < 3; i++) {
                expect(back[i]).toBeCloseTo(c[i], 12);
                expect(backLch[i]).toBeCloseTo(c[i], 12);
            }
        }
    });

    it('measures color difference with CIE76 and CIEDE2000', () => {
        expect(lab.deltaE76([50, 0, 0], [50, 3, 4])).toBe(5);
        // test pairs from Sharma, Wu and Dalal (2005)
        expect(lab.deltaE2000([50, 2.6772, -79.7751], [50, 0, -82.7485])).toBeCloseTo(2.0425, 4);
        expect(lab.deltaE2000([50, 0, 0], [50, -1, 2])).toBeCloseTo(2.3669, 4);
        expect(lab.deltaE2000([50, 2.5, 0], [73, 25, -18])).toBeCloseTo(27.1492, 4);
    });

    it('interpolates LCH hue with the CSS hue methods', () => {
        expect(lch.lerp(lch.create(), [50, 40, 350], [50, 40, 10], 0.5)[2]).toBeCloseTo(0, 9);
        expect(lch.lerp(lch.create(), [50, 40, 350], [50, 40, 10], 0.5, 'longer')[2]).toBeCloseTo(180, 9);
    });

    it('serializes to CSS', () => {
        expect(lab.toCSS([54.29054, 80.80493, 69.89096])).toBe('lab(54.2905 80.8049 69.891)');
        expect(lch.toCSS([54.29054, 106.83718, 40.85766], 0.5)).toBe('lch(54.2905 106.8372 40.858 / 0.5)');
    });
});
