import { describe, expect, it } from 'vitest';
import { color, colorspace, ictcp } from '../../../src/color';

describe('ictcp', () => {
    it('converts linear sRGB (1.0 = 203 cd/m²) to BT.2100 ICtCp', () => {
        const white = ictcp.fromColor(ictcp.create(), [1, 1, 1]);
        expect(white[0]).toBeCloseTo(0.580689, 6); // PQ of 203 cd/m²
        expect(white[1]).toBeCloseTo(0, 12);
        expect(white[2]).toBeCloseTo(0, 12);
        const red = ictcp.fromColor(ictcp.create(), [1, 0, 0]);
        expect(red[0]).toBeCloseTo(0.42788, 5);
        expect(red[1]).toBeCloseTo(-0.1157, 4);
        expect(red[2]).toBeCloseTo(0.27873, 5);
    });

    it('round-trips HDR colors', () => {
        const c: [number, number, number] = [8, 2, 0.5];
        const back = ictcp.toColor(color.create(), ictcp.fromColor(ictcp.create(), c));
        expect(back[0]).toBeCloseTo(c[0], 9);
        expect(back[1]).toBeCloseTo(c[1], 9);
        expect(back[2]).toBeCloseTo(c[2], 9);
    });

    it('measures HDR color difference with deltaEITP (BT.2124)', () => {
        // the CSS Color HDR example: color(rec2100-pq 0.58 0 0) against color(rec2020 1 0 0)
        const a = ictcp.fromColor(ictcp.create(), colorspace.rec2100PqToLinearSrgb(color.create(), [0.58, 0, 0]));
        const b = ictcp.fromColor(ictcp.create(), colorspace.linearRec2020ToLinearSrgb(color.create(), [1, 0, 0]));
        expect(ictcp.deltaEITP(a, b)).toBeCloseTo(0.4866, 4);
    });
});
