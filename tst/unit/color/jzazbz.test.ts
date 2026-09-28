import { describe, expect, it } from 'vitest';
import { color, jzazbz, jzczhz } from '../../../src/color';

describe('jzazbz / jzczhz', () => {
    it('converts linear sRGB (1.0 = 203 cd/m²) to Jzazbz and JzCzhz', () => {
        const white = jzazbz.fromColor(jzazbz.create(), [1, 1, 1]);
        expect(white[0]).toBeCloseTo(0.222065, 6);
        const lime = jzczhz.fromColor(jzczhz.create(), [0, 1, 0]);
        expect(lime[1]).toBeCloseTo(0.1614, 4);
        expect(lime[2]).toBeCloseTo(132.5, 1);
    });

    it('round-trips HDR colors', () => {
        const c: [number, number, number] = [8, 2, 0.5];
        const back = jzazbz.toColor(color.create(), jzazbz.fromColor(jzazbz.create(), c));
        const backCz = jzczhz.toColor(color.create(), jzczhz.fromColor(jzczhz.create(), c));
        for (let i = 0; i < 3; i++) {
            expect(back[i]).toBeCloseTo(c[i], 9);
            expect(backCz[i]).toBeCloseTo(c[i], 9);
        }
    });

    it('interpolates hue with the CSS hue methods and measures deltaEJz', () => {
        expect(jzczhz.lerp(jzczhz.create(), [0.2, 0.1, 350], [0.2, 0.1, 10], 0.5)[2]).toBeCloseTo(0, 9);
        expect(jzczhz.deltaEJz([0.2, 0.1, 30], [0.2, 0.1, 30])).toBe(0);
        expect(jzczhz.deltaEJz([0.2, 0, 0], [0.25, 0, 0])).toBeCloseTo(0.05, 12);
    });
});
