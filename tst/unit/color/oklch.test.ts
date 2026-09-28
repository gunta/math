import { describe, expect, it } from 'vitest';
import { color, oklch } from '../../../src/color';

const expectLch = (actual: oklch.Oklch, expected: oklch.Oklch) => {
    expect(actual[0]).toBeCloseTo(expected[0], 5);
    expect(actual[1]).toBeCloseTo(expected[1], 5);
    expect(actual[2]).toBeCloseTo(expected[2], 3);
};

describe('oklch', () => {
    it('converts linear sRGB primaries (hue in degrees, as CSS)', () => {
        expectLch(oklch.fromColor(oklch.create(), [1, 0, 0]), [0.627955, 0.257683, 29.2339]);
        expectLch(oklch.fromColor(oklch.create(), [0, 1, 0]), [0.86644, 0.294827, 142.4953]);
        expectLch(oklch.fromColor(oklch.create(), [0, 0, 1]), [0.452014, 0.313214, 264.052]);
    });

    it('gives grays a powerless hue of 0', () => {
        const white = oklch.fromColor(oklch.create(), [1, 1, 1]);
        expect(white[1]).toBeCloseTo(0, 12);
        expect(white[2]).toBe(0);
    });

    it('round-trips through linear sRGB', () => {
        const c: color.Color = [0.2, 0.5, 0.8];
        const back = oklch.toColor(color.create(), oklch.fromColor(oklch.create(), c));
        expect(back[0]).toBeCloseTo(c[0], 12);
        expect(back[1]).toBeCloseTo(c[1], 12);
        expect(back[2]).toBeCloseTo(c[2], 12);
    });

    it('interpolates hue with the CSS hue methods', () => {
        const a: oklch.Oklch = [0.6, 0.24, 30];
        const b: oklch.Oklch = [0.8, 0.15, 90];
        expectLch(oklch.lerp(oklch.create(), a, b, 0.5), [0.7, 0.195, 60]);
        expectLch(oklch.lerp(oklch.create(), a, b, 0.5, 'longer'), [0.7, 0.195, 240]);
        // 350 -> 10 wraps through 0 with 'shorter', sweeps through 180 with 'decreasing'
        expect(oklch.lerp(oklch.create(), [0.5, 0.1, 350], [0.5, 0.1, 10], 0.5)[2]).toBeCloseTo(0, 9);
        expect(oklch.lerp(oklch.create(), [0.5, 0.1, 350], [0.5, 0.1, 10], 0.5, 'decreasing')[2]).toBeCloseTo(180, 9);
    });

    it('keeps the hue of the colorful endpoint when mixing with gray', () => {
        // white -> blue stays blue instead of drifting through the hue of 0
        const mid = oklch.lerp(oklch.create(), [1, 0, 0], [0.452, 0.313, 264.05], 0.5);
        expect(mid[2]).toBeCloseTo(264.05, 9);
        const mixed = oklch.fromColor(oklch.create(), oklch.mix(color.create(), [1, 1, 1], [0, 0, 1], 0.5));
        expect(mixed[2]).toBeCloseTo(264.052, 3);
    });

    it('serializes to CSS', () => {
        expect(oklch.toCSS([0.627955, 0.257683, 29.2339])).toBe('oklch(0.62796 0.25768 29.234)');
        expect(oklch.toCSS([0.7, 0.1, 200], 0.5)).toBe('oklch(0.7 0.1 200 / 0.5)');
    });
});
