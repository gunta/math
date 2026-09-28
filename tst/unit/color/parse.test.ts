import { describe, expect, it, vi } from 'vitest';
import { color, colorspace, oklch } from '../../../src/color';

const parse = (s: string) => color.fromColorInput(s) as color.Color;
const expectColor = (actual: color.Color, expected: number[], digits = 6) => {
    expect(actual.length).toBe(expected.length);
    for (let i = 0; i < expected.length; i++) expect(actual[i]).toBeCloseTo(expected[i], digits);
};

describe('parse', () => {
    it('parses legacy and modern CSS Color 4 syntax, with alpha', () => {
        expect(parse('#ff000080')).toEqual([1, 0, 0, 128 / 255]);
        expect(parse('rgba(255, 0, 0, 0.5)')).toEqual([1, 0, 0, 0.5]);
        expect(parse('rgb(255 0 0 / 50%)')).toEqual([1, 0, 0, 0.5]);
        expect(parse('hsl(120deg 100% 50%)')).toEqual([0, 1, 0]);
        expect(parse('transparent')).toEqual([0, 0, 0, 0]);
        // rgb() clamps at parse time, as CSS does, while color(srgb ...) keeps out-of-gamut values
        expect(parse('rgb(300 -20 0)')).toEqual([1, 0, 0]);
        expectColor(parse('color(srgb 1.5 -0.5 0)'), [2.537155, -0.214041, 0]);
    });

    it('parses perceptual and wide-gamut color functions to linear sRGB', () => {
        expectColor(parse('oklch(62.7955% 0.257683 29.2339)'), [1, 0, 0], 4);
        expectColor(parse('lab(54.2905 80.8049 69.891)'), [1, 0, 0], 5);
        // Display P3 red is outside sRGB
        expectColor(parse('color(display-p3 1 0 0)'), [1.22494, -0.042057, -0.019638]);
        // HDR: reference white encoded with PQ
        expectColor(parse('color(rec2100-pq 0.580689 0.580689 0.580689)'), [1, 1, 1], 5);
    });

    it('resolves relative colors with calc()', () => {
        const complement = oklch.fromColor(oklch.create(), parse('oklch(from red l c calc(h + 180))'));
        expect(complement[2]).toBeCloseTo(209.2339, 4);
        expect(parse('rgb(from #ff0000 r g b / calc(alpha / 2))')).toEqual([1, 0, 0, 0.5]);
        expectColor(parse('hsl(from white h s calc(l / 2))'), [
            colorspace.srgbToLinear(0.5),
            colorspace.srgbToLinear(0.5),
            colorspace.srgbToLinear(0.5),
        ]);
    });

    it('mixes colors with color-mix()', () => {
        // oklab is the default space, the result is halfway in OKLab
        const mid = parse('color-mix(white, black)');
        expect(mid[0]).toBeCloseTo(0.125, 9);
        // percentages under 100% leave the rest transparent
        const half = colorspace.srgbToLinear(0.5);
        expectColor(parse('color-mix(in srgb, red 20%, blue 20%)'), [half, 0, half, 0.4]);
        // hue methods pick the way around the hue circle
        const shorter = oklch.fromColor(oklch.create(), parse('color-mix(in oklch, red, blue)'));
        const longer = oklch.fromColor(oklch.create(), parse('color-mix(in oklch longer hue, red, blue)'));
        expect(shorter[2]).toBeCloseTo(326.64, 1);
        expect(longer[2]).toBeCloseTo(146.64, 1);
        // percentages that add up to 100% leave the mix opaque
        expect(parse('color-mix(in srgb, red 70%, blue 20%, lime 10%)')).toHaveLength(3);
        // a gray has no hue, so mixing it with blue stays blue instead of passing through red
        const bluish = parse('color-mix(in hwb, #050505, blue)');
        expect(bluish[0]).toBeCloseTo(bluish[1], 9);
    });

    it('follows CSS for NaN and infinity in calc()', () => {
        // NaN becomes 0, infinity clamps to the channel range, and colors left infinite are rejected
        expect(parse('rgb(calc(nan) 0 0)')).toEqual([0, 0, 0]);
        expect(parse('rgb(calc(infinity) 0 0)')).toEqual([1, 0, 0]);
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        expect(color.fromColorInput('oklch(0.5 calc(infinity) 30)')).toBeNull();
        warn.mockRestore();
    });

    it('picks a readable text color with contrast-color()', () => {
        expect(parse('contrast-color(navy)')).toEqual([1, 1, 1]);
        expect(parse('contrast-color(gold)')).toEqual([0, 0, 0]);
    });

    it('writes alpha into an rgba out, and rejects what needs a document to resolve', () => {
        const out: color.Color = [0, 0, 0, 1];
        expect(color.setFromColorInput(out, 'rgb(0 0 255 / 25%)')).toEqual([0, 0, 1, 0.25]);
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        expect(color.fromColorInput('var(--brand)')).toBeNull();
        expect(color.fromColorInput('light-dark(white, black)')).toBeNull();
        expect(color.fromColorInput('oklch(0.5 0.1 20%)')).toBeNull();
        // invalid CSS: mixed legacy types, hsl() legacy numbers, bare parentheses, angle plus number
        for (const invalid of ['rgb(255, 50%, 0)', 'hsl(120, 100, 50)', 'rgb((255) 0 0)', 'oklch(0.5 0.1 calc(10deg + 5))']) {
            expect(color.fromColorInput(invalid)).toBeNull();
        }
        // deep nesting is rejected instead of overflowing the stack
        expect(color.fromColorInput(`rgb(${'calc('.repeat(10000)}1${')'.repeat(10000)} 0 0)`)).toBeNull();
        warn.mockRestore();
    });
});
