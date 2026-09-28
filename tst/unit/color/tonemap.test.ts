import { describe, expect, it } from 'vitest';
import { type Color, tonemap } from '../../../src/color';

function expectColor(c: Color, r: number, g: number, b: number, digits = 5) {
    expect(c[0]).toBeCloseTo(r, digits);
    expect(c[1]).toBeCloseTo(g, digits);
    expect(c[2]).toBeCloseTo(b, digits);
}

describe('tonemap', () => {
    it('reinhard maps reference white to 0.5 and HDR toward 1', () => {
        expectColor(tonemap.reinhard([0, 0, 0], [1, 1, 1]), 0.5, 0.5, 0.5);
        expectColor(tonemap.reinhard([0, 0, 0], [3, 0, 0]), 0.75, 0, 0);
    });

    it('reinhardExtended maps `white` to 1', () => {
        expectColor(tonemap.reinhardExtended([0, 0, 0], [4, 1, 8], 4), 1, 0.53125, 1);
    });

    it('acesFilmic matches three.js ACESFilmicToneMapping', () => {
        expectColor(tonemap.acesFilmic([0, 0, 0], [1, 1, 1]), 0.7634, 0.7634, 0.76339, 4);
        expectColor(tonemap.acesFilmic([0, 0, 0], [0.18, 0.18, 0.18]), 0.21311, 0.21311, 0.2131, 4);
    });

    it('agx matches three.js AgXToneMapping', () => {
        expectColor(tonemap.agx([0, 0, 0], [1, 1, 1]), 0.59023, 0.59014, 0.5901, 4);
        expectColor(tonemap.agx([0, 0, 0], [0.18, 0.18, 0.18]), 0.21455, 0.2145, 0.2145, 4);
    });

    it('neutral keeps mid tones and compresses highlights like Khronos PBR Neutral', () => {
        expectColor(tonemap.neutral([0, 0, 0], [0.18, 0.18, 0.18]), 0.14, 0.14, 0.14);
        expectColor(tonemap.neutral([0, 0, 0], [1, 1, 1]), 0.869091, 0.869091, 0.869091);
        expectColor(tonemap.neutral([0, 0, 0], [2, 0, 0]), 0.961081, 0.129579, 0.129579);
    });

    it('every operator maps brighter grays to brighter outputs within [0, 1]', () => {
        const ops = [tonemap.reinhard, tonemap.acesFilmic, tonemap.agx, tonemap.neutral];
        for (const op of ops) {
            let prev = 0;
            for (const v of [0.01, 0.18, 1, 4, 16, 1000, 1e9]) {
                const c: [number, number, number] = [v, v, v];
                op(c, c); // out may alias the input
                expect(c[1]).toBeGreaterThanOrEqual(prev);
                expect(c[1]).toBeLessThanOrEqual(1);
                prev = c[1];
            }
        }
    });

    it('mixHeadroom interpolates in stops between an SDR and an HDR grade', () => {
        // 1x white graded for SDR (0 stops) and 4x white for 2 stops of headroom
        const sdr: [number, number, number] = [1, 1, 1];
        const hdr: [number, number, number] = [4, 4, 4];
        expectColor(tonemap.mixHeadroom([0, 0, 0], sdr, 0, hdr, 2, 1), 2, 2, 2);
        expect(tonemap.mixHeadroom([0, 0, 0], sdr, 0, hdr, 2, -1)).toEqual(sdr);
        expect(tonemap.mixHeadroom([0, 0, 0], sdr, 0, hdr, 2, 3)).toEqual(hdr);
        expect(tonemap.mixHeadroom([0, 0, 0], sdr, 1, hdr, 1, 3)).toEqual(sdr);
        // imaginary colors with negative XYZ still mix to finite values
        const mixed = tonemap.mixHeadroom([0, 0, 0], [-0.5, 1, -0.3], 0, hdr, 2, 1);
        expect(mixed.every(Number.isFinite)).toBe(true);
    });
});
