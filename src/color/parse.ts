import type { Color, ColorInput } from './color';
import * as colorspace from './colorspace';
import * as hsl from './hsl';
import { type HueInterpolation, lerpHue } from './hue';
import * as ictcp from './ictcp';
import * as jzazbz from './jzazbz';
import * as jzczhz from './jzczhz';
import * as lab from './lab';
import * as lch from './lch';
import * as oklab from './oklab';
import * as oklch from './oklch';

// A CSS color parser covering CSS Color 4 and 5 and the CSS Color HDR draft:
//   - hex (#rgb, #rgba, #rrggbb, #rrggbbaa), named colors and transparent
//   - rgb(), rgba(), hsl(), hsla() in legacy comma and modern space syntax, hwb()
//   - lab(), lch(), oklab(), oklch(), ictcp(), jzazbz(), jzczhz(), device-cmyk()
//   - color() with every predefined space, including display-p3-linear and rec2100-pq/hlg/linear
//   - alpha, `none`, angle units, and calc() with the CSS math functions and constants
//   - relative colors, e.g. oklch(from #f80 calc(l * 0.8) c calc(h + 30))
//   - color-mix() with any number of colors, hue methods and missing components
//   - contrast-color()
// var(), currentcolor, system colors and light-dark() need a document to resolve, so they fail.
// Parsing allocates. Parse once and keep the Color.

const CSS_COLORS: Record<string, number> = {
    aliceblue: 0xf0f8ff,
    antiquewhite: 0xfaebd7,
    aqua: 0x00ffff,
    aquamarine: 0x7fffd4,
    azure: 0xf0ffff,
    beige: 0xf5f5dc,
    bisque: 0xffe4c4,
    black: 0x000000,
    blanchedalmond: 0xffebcd,
    blue: 0x0000ff,
    blueviolet: 0x8a2be2,
    brown: 0xa52a2a,
    burlywood: 0xdeb887,
    cadetblue: 0x5f9ea0,
    chartreuse: 0x7fff00,
    chocolate: 0xd2691e,
    coral: 0xff7f50,
    cornflowerblue: 0x6495ed,
    cornsilk: 0xfff8dc,
    crimson: 0xdc143c,
    cyan: 0x00ffff,
    darkblue: 0x00008b,
    darkcyan: 0x008b8b,
    darkgoldenrod: 0xb8860b,
    darkgray: 0xa9a9a9,
    darkgreen: 0x006400,
    darkgrey: 0xa9a9a9,
    darkkhaki: 0xbdb76b,
    darkmagenta: 0x8b008b,
    darkolivegreen: 0x556b2f,
    darkorange: 0xff8c00,
    darkorchid: 0x9932cc,
    darkred: 0x8b0000,
    darksalmon: 0xe9967a,
    darkseagreen: 0x8fbc8f,
    darkslateblue: 0x483d8b,
    darkslategray: 0x2f4f4f,
    darkslategrey: 0x2f4f4f,
    darkturquoise: 0x00ced1,
    darkviolet: 0x9400d3,
    deeppink: 0xff1493,
    deepskyblue: 0x00bfff,
    dimgray: 0x696969,
    dimgrey: 0x696969,
    dodgerblue: 0x1e90ff,
    firebrick: 0xb22222,
    floralwhite: 0xfffaf0,
    forestgreen: 0x228b22,
    fuchsia: 0xff00ff,
    gainsboro: 0xdcdcdc,
    ghostwhite: 0xf8f8ff,
    gold: 0xffd700,
    goldenrod: 0xdaa520,
    gray: 0x808080,
    green: 0x008000,
    greenyellow: 0xadff2f,
    grey: 0x808080,
    honeydew: 0xf0fff0,
    hotpink: 0xff69b4,
    indianred: 0xcd5c5c,
    indigo: 0x4b0082,
    ivory: 0xfffff0,
    khaki: 0xf0e68c,
    lavender: 0xe6e6fa,
    lavenderblush: 0xfff0f5,
    lawngreen: 0x7cfc00,
    lemonchiffon: 0xfffacd,
    lightblue: 0xadd8e6,
    lightcoral: 0xf08080,
    lightcyan: 0xe0ffff,
    lightgoldenrodyellow: 0xfafad2,
    lightgray: 0xd3d3d3,
    lightgreen: 0x90ee90,
    lightgrey: 0xd3d3d3,
    lightpink: 0xffb6c1,
    lightsalmon: 0xffa07a,
    lightseagreen: 0x20b2aa,
    lightskyblue: 0x87cefa,
    lightslategray: 0x778899,
    lightslategrey: 0x778899,
    lightsteelblue: 0xb0c4de,
    lightyellow: 0xffffe0,
    lime: 0x00ff00,
    limegreen: 0x32cd32,
    linen: 0xfaf0e6,
    magenta: 0xff00ff,
    maroon: 0x800000,
    mediumaquamarine: 0x66cdaa,
    mediumblue: 0x0000cd,
    mediumorchid: 0xba55d3,
    mediumpurple: 0x9370db,
    mediumseagreen: 0x3cb371,
    mediumslateblue: 0x7b68ee,
    mediumspringgreen: 0x00fa9a,
    mediumturquoise: 0x48d1cc,
    mediumvioletred: 0xc71585,
    midnightblue: 0x191970,
    mintcream: 0xf5fffa,
    mistyrose: 0xffe4e1,
    moccasin: 0xffe4b5,
    navajowhite: 0xffdead,
    navy: 0x000080,
    oldlace: 0xfdf5e6,
    olive: 0x808000,
    olivedrab: 0x6b8e23,
    orange: 0xffa500,
    orangered: 0xff4500,
    orchid: 0xda70d6,
    palegoldenrod: 0xeee8aa,
    palegreen: 0x98fb98,
    paleturquoise: 0xafeeee,
    palevioletred: 0xdb7093,
    papayawhip: 0xffefd5,
    peachpuff: 0xffdab9,
    peru: 0xcd853f,
    pink: 0xffc0cb,
    plum: 0xdda0dd,
    powderblue: 0xb0e0e6,
    purple: 0x800080,
    rebeccapurple: 0x663399,
    red: 0xff0000,
    rosybrown: 0xbc8f8f,
    royalblue: 0x4169e1,
    saddlebrown: 0x8b4513,
    salmon: 0xfa8072,
    sandybrown: 0xf4a460,
    seagreen: 0x2e8b57,
    seashell: 0xfff5ee,
    sienna: 0xa0522d,
    silver: 0xc0c0c0,
    skyblue: 0x87ceeb,
    slateblue: 0x6a5acd,
    slategray: 0x708090,
    slategrey: 0x708090,
    snow: 0xfffafa,
    springgreen: 0x00ff7f,
    steelblue: 0x4682b4,
    tan: 0xd2b48c,
    teal: 0x008080,
    thistle: 0xd8bfd8,
    tomato: 0xff6347,
    turquoise: 0x40e0d0,
    violet: 0xee82ee,
    wheat: 0xf5deb3,
    white: 0xffffff,
    whitesmoke: 0xf5f5f5,
    yellow: 0xffff00,
    yellowgreen: 0x9acd32,
};

/**
 * Parse any supported color input into linear `out`, or leave `out` unchanged if unrecognised. Returns `out`.
 * Alpha is written when it is not 1 or `out` has an alpha slot.
 *
 * Supported inputs:
 *   - any CSS color string: '#f00', 'red', 'rgb(255 0 0 / 50%)', 'hsl(120deg 100% 50%)',
 *     'oklch(70% 0.1 200)', 'color(display-p3 1 0 0)', 'color-mix(in oklch, red, blue)',
 *     'lab(from teal calc(l + 10) a b)', 'color(rec2100-pq 0.58 0.58 0.58)', ...
 *   - 0xRRGGBB integers (sRGB gamma)
 *   - [r, g, b] or [r, g, b, a] arrays, treated as already-linear
 */
export function setFromColorInput(out: Color, input: ColorInput): Color {
    const parsed = parse(input);
    if (parsed === null) return out;
    out[0] = parsed[0];
    out[1] = parsed[1];
    out[2] = parsed[2];
    if (parsed.length > 3 || out.length > 3) out[3] = parsed[3] ?? 1;
    return out;
}

/** Parse any supported color input into a new linear Color (with alpha only when it is not 1), or null if unrecognised. */
export function fromColorInput(input: ColorInput): Color | null {
    return parse(input);
}

function parse(input: ColorInput): Color | null {
    if (typeof input === 'object') {
        return input.length > 3 ? [input[0], input[1], input[2], input[3] ?? 1] : [input[0], input[1], input[2]];
    }
    if (typeof input === 'number') {
        return [
            colorspace.srgbToLinear(((input >> 16) & 255) / 255),
            colorspace.srgbToLinear(((input >> 8) & 255) / 255),
            colorspace.srgbToLinear((input & 255) / 255),
        ];
    }
    const toks = tokenize(input.trim().toLowerCase());
    const p: Parser = { toks: toks ?? [], i: 0, angle: false, kw: null };
    const c = toks === null ? null : parseColor(p);
    if (c === null || p.i !== p.toks.length) {
        console.warn(`[math] color: unrecognised color input: "${input}"`);
        return null;
    }
    const out = toLinear(c.space, c.ch);
    const alpha = !Number.isNaN(c.alpha) ? c.alpha : 0;
    if (alpha !== 1) out[3] = alpha;
    return out;
}

/* tokens */

// t is the kind: 'num', 'pct', 'dim' (with unit s), 'id', 'fn' (name s, '(' consumed), 'hash', or a delimiter
type Token = { t: string; v: number; s: string };

function tokenize(s: string): Token[] | null {
    const toks: Token[] = [];
    const num = /[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?/y;
    const ident = /-{0,2}[a-z_][a-z0-9_-]*/y;
    const hex = /#[0-9a-f]+/y;
    let i = 0;
    while (i < s.length) {
        const c = s[i];
        if (c === ' ' || c === '\t' || c === '\n' || c === '\r' || c === '\f') {
            i++;
            continue;
        }
        num.lastIndex = i;
        const n = num.exec(s);
        if (n !== null) {
            i += n[0].length;
            const v = Number(n[0]);
            if (s[i] === '%') {
                toks.push({ t: 'pct', v, s: '' });
                i++;
                continue;
            }
            ident.lastIndex = i;
            const u = ident.exec(s);
            if (u !== null) {
                toks.push({ t: 'dim', v, s: u[0] });
                i += u[0].length;
            } else toks.push({ t: 'num', v, s: '' });
            continue;
        }
        ident.lastIndex = i;
        const id = ident.exec(s);
        if (id !== null) {
            i += id[0].length;
            if (s[i] === '(') {
                toks.push({ t: 'fn', v: 0, s: id[0] });
                i++;
            } else toks.push({ t: 'id', v: 0, s: id[0] });
            continue;
        }
        if (c === '#') {
            hex.lastIndex = i;
            const h = hex.exec(s);
            if (h === null) return null;
            toks.push({ t: 'hash', v: 0, s: h[0].slice(1) });
            i += h[0].length;
            continue;
        }
        if ('(),/*+-'.includes(c)) {
            toks.push({ t: c, v: 0, s: '' });
            i++;
            continue;
        }
        return null;
    }
    return toks;
}

/* parser */

// a parsed color in the channels of its own space, NaN marks a missing (`none`) component
type Parsed = { space: string; ch: [number, number, number]; alpha: number };

// angle is the type of the value parsed last, kw holds the channel keywords of a relative color
type Parser = { toks: Token[]; i: number; angle: boolean; kw: Map<string, number> | null };

// Per space: channel keywords, percent reference of each channel (NaN when % is invalid), the hue
// channel (-1 for none), analogous component categories for missing components (r, g, b, L lightness,
// C colorfulness, H hue, a and o opponent axes, - none) and the chroma below which hue is powerless.
type Space = { kw: string[]; pct: number[]; hue: number; cat: string; eps: number };

const rgbSpace: Space = { kw: ['r', 'g', 'b'], pct: [1, 1, 1], hue: -1, cat: 'rgb', eps: 0 };
const xyzSpace: Space = { kw: ['x', 'y', 'z'], pct: [1, 1, 1], hue: -1, cat: 'rgb', eps: 0 };

const SPACES: Record<string, Space> = {
    srgb: rgbSpace,
    'srgb-linear': rgbSpace,
    'display-p3': rgbSpace,
    'display-p3-linear': rgbSpace,
    'a98-rgb': rgbSpace,
    'prophoto-rgb': rgbSpace,
    rec2020: rgbSpace,
    'rec2100-pq': rgbSpace,
    'rec2100-hlg': rgbSpace,
    'rec2100-linear': rgbSpace,
    'xyz-d65': xyzSpace,
    'xyz-d50': xyzSpace,
    hsl: { kw: ['h', 's', 'l'], pct: [Number.NaN, 100, 100], hue: 0, cat: 'HCL', eps: 0.000001 },
    hwb: { kw: ['h', 'w', 'b'], pct: [Number.NaN, 100, 100], hue: 0, cat: 'H--', eps: 0 },
    lab: { kw: ['l', 'a', 'b'], pct: [100, 125, 125], hue: -1, cat: 'Lao', eps: 0 },
    lch: { kw: ['l', 'c', 'h'], pct: [100, 150, Number.NaN], hue: 2, cat: 'LCH', eps: 0.0015 },
    oklab: { kw: ['l', 'a', 'b'], pct: [1, 0.4, 0.4], hue: -1, cat: 'Lao', eps: 0 },
    oklch: { kw: ['l', 'c', 'h'], pct: [1, 0.4, Number.NaN], hue: 2, cat: 'LCH', eps: 0.000004 },
    ictcp: { kw: ['i', 'ct', 'cp'], pct: [1, 0.5, 0.5], hue: -1, cat: 'Lao', eps: 0 },
    jzazbz: { kw: ['jz', 'az', 'bz'], pct: [1, 0.21, 0.21], hue: -1, cat: 'Lao', eps: 0 },
    jzczhz: { kw: ['jz', 'cz', 'hz'], pct: [1, 0.26, Number.NaN], hue: 2, cat: 'LCH', eps: 0.0000026 },
};

function peek(p: Parser, t: string, s?: string): boolean {
    const tok = p.toks[p.i];
    return tok !== undefined && tok.t === t && (s === undefined || tok.s === s);
}

function eat(p: Parser, t: string, s?: string): boolean {
    if (!peek(p, t, s)) return false;
    p.i++;
    return true;
}

function parseColor(p: Parser): Parsed | null {
    const t = p.toks[p.i++];
    if (t === undefined) return null;
    if (t.t === 'hash') return parseHex(t.s);
    if (t.t === 'id') {
        if (t.s === 'transparent') return { space: 'srgb', ch: [0, 0, 0], alpha: 0 };
        const hex = CSS_COLORS[t.s];
        return typeof hex === 'number'
            ? { space: 'srgb', ch: [((hex >> 16) & 255) / 255, ((hex >> 8) & 255) / 255, (hex & 255) / 255], alpha: 1 }
            : null;
    }
    if (t.t !== 'fn') return null;
    let c: Parsed | null = null;
    switch (t.s) {
        case 'rgb':
        case 'rgba':
            c = parseFunction(p, 'srgb', 255, true);
            break;
        case 'hsl':
        case 'hsla':
            c = parseFunction(p, 'hsl', 1, true);
            break;
        case 'hwb':
        case 'lab':
        case 'lch':
        case 'oklab':
        case 'oklch':
        case 'ictcp':
        case 'jzazbz':
        case 'jzczhz':
            c = parseFunction(p, t.s, 1, false);
            break;
        case 'color':
            c = parseFunction(p, '', 1, false);
            break;
        case 'device-cmyk':
            c = parseCmyk(p);
            break;
        case 'color-mix':
            c = parseMix(p);
            break;
        case 'contrast-color':
            c = parseContrast(p);
            break;
    }
    return c !== null && eat(p, ')') ? c : null;
}

function parseHex(h: string): Parsed | null {
    const n = h.length;
    if (n !== 3 && n !== 4 && n !== 6 && n !== 8) return null;
    const short = n < 5;
    const byte = (k: number) => (short ? Number.parseInt(h[k] + h[k], 16) : Number.parseInt(h.slice(2 * k, 2 * k + 2), 16)) / 255;
    return { space: 'srgb', ch: [byte(0), byte(1), byte(2)], alpha: n === 4 || n === 8 ? byte(3) : 1 };
}

// rgb(), hsl(), hwb(), lab(), ..., and color() when `space` is '': the optional `from <color>`,
// three channels in space units times `scale` (255 for rgb()) and an optional alpha
function parseFunction(p: Parser, space: string, scale: number, legacy: boolean): Parsed | null {
    const outer = p.kw;
    p.kw = null;
    let origin: Parsed | null = null;
    if (eat(p, 'id', 'from')) {
        origin = parseColor(p);
        if (origin === null) return null;
    }
    if (space === '') {
        const t = p.toks[p.i++];
        space = t === undefined || t.t !== 'id' ? '' : t.s === 'xyz' ? 'xyz-d65' : t.s;
        // only the predefined rgb and xyz spaces
        if (!Object.hasOwn(SPACES, space) || SPACES[space].cat !== 'rgb') return null;
    }
    const info = SPACES[space];
    let alpha = 1;
    if (origin !== null) {
        const ch = convert(origin, space);
        const kw = new Map<string, number>();
        for (let k = 0; k < 3; k++) kw.set(info.kw[k], ch[k] * scale);
        alpha = !Number.isNaN(origin.alpha) ? origin.alpha : 0;
        kw.set('alpha', alpha);
        p.kw = kw;
    }

    const ch: [number, number, number] = [0, 0, 0];
    let commas = false;
    for (let k = 0; k < 3; k++) {
        if (k === 1 && legacy && origin === null) commas = eat(p, ',');
        else if (k > 0 && commas && !eat(p, ',')) return null;
        const v = parseChannel(p, info.pct[k] * scale, k === info.hue);
        if (v === null) return null;
        ch[k] = v / scale;
    }
    if (commas ? eat(p, ',') : eat(p, '/')) {
        const a = parseChannel(p, 1, false);
        if (a === null) return null;
        alpha = a;
    }
    p.kw = outer;

    // parsed-value clamping from CSS Color 4: rgb() channels, negative hsl() saturation, lab and
    // oklab lightness and negative chroma. Relative colors keep their gamut
    if (space === 'srgb' && origin === null) for (let k = 0; k < 3; k++) ch[k] = clamp(ch[k], 0, 1);
    else if (space === 'hsl' && origin === null) ch[1] = clamp(ch[1], 0, Number.POSITIVE_INFINITY);
    else if (space === 'lab' || space === 'lch') ch[0] = clamp(ch[0], 0, 100);
    else if (space === 'oklab' || space === 'oklch') ch[0] = clamp(ch[0], 0, 1);
    if (info.cat === 'LCH') ch[1] = clamp(ch[1], 0, Number.POSITIVE_INFINITY);
    return { space, ch, alpha: clamp(alpha, 0, 1) };
}

// device-cmyk(c m y k [/ alpha]), converted naively to sRGB (CSS Color 5)
function parseCmyk(p: Parser): Parsed | null {
    const v = [0, 0, 0, 0];
    let commas = false;
    for (let k = 0; k < 4; k++) {
        if (k === 1) commas = eat(p, ',');
        else if (k > 1 && commas && !eat(p, ',')) return null;
        const x = parseChannel(p, 1, false);
        if (x === null) return null;
        v[k] = !Number.isNaN(x) ? x : 0;
    }
    let alpha = 1;
    if (commas ? eat(p, ',') : eat(p, '/')) {
        const a = parseChannel(p, 1, false);
        if (a === null) return null;
        alpha = a;
    }
    const k = v[3];
    const ch: [number, number, number] = [0, 0, 0];
    for (let i = 0; i < 3; i++) ch[i] = 1 - Math.min(1, v[i] * (1 - k) + k);
    return { space: 'srgb', ch, alpha: clamp(alpha, 0, 1) };
}

// contrast-color(<color>): white or black, whichever has the higher WCAG 2 contrast (ties pick white)
function parseContrast(p: Parser): Parsed | null {
    const c = parseColor(p);
    if (c === null) return null;
    const lin = toLinear(c.space, c.ch);
    const l = Math.max(0, 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2]);
    const v = (l + 0.05) * (l + 0.05) <= 0.0525 ? 1 : 0;
    return { space: 'srgb', ch: [v, v, v], alpha: 1 };
}

// color-mix([in <space> [<hue> hue]] ,] <color> [<percentage>]#) per CSS Color 5
function parseMix(p: Parser): Parsed | null {
    let space = 'oklab';
    let hue: HueInterpolation = 'shorter';
    if (eat(p, 'id', 'in')) {
        const t = p.toks[p.i++];
        space = t === undefined || t.t !== 'id' ? '' : t.s === 'xyz' ? 'xyz-d65' : t.s;
        if (!Object.hasOwn(SPACES, space)) return null;
        const h = p.toks[p.i];
        if (h !== undefined && h.t === 'id' && /^(shorter|longer|increasing|decreasing)$/.test(h.s)) {
            if (SPACES[space].hue < 0) return null;
            p.i++;
            if (!eat(p, 'id', 'hue')) return null;
            hue = h.s as HueInterpolation;
        }
        if (!eat(p, ',')) return null;
    }
    const colors: Parsed[] = [];
    const weights: number[] = [];
    do {
        let w = Number.NaN;
        if (peek(p, 'pct')) w = p.toks[p.i++].v / 100;
        const c = parseColor(p);
        if (c === null) return null;
        if (Number.isNaN(w) && peek(p, 'pct')) w = p.toks[p.i++].v / 100;
        if (w < 0 || w > 1) return null;
        colors.push(toSpace(c, space));
        weights.push(w);
    } while (eat(p, ','));

    // normalize mix percentages (css-values-5), forcing them to sum to 1
    let specified = 0;
    let omitted = 0;
    for (const w of weights) {
        if (!Number.isNaN(w)) specified += w;
        else omitted++;
    }
    let total = 0;
    for (let k = 0; k < weights.length; k++) {
        if (Number.isNaN(weights[k])) weights[k] = (1 - Math.min(specified, 1)) / omitted;
        total += weights[k];
    }
    const alphaMult = total < 1 ? total : 1;

    // fold the colors in order, each step interpolating by the next color's share
    let acc = colors[0];
    let accWeight = weights[0];
    for (let k = 1; k < colors.length; k++) {
        const combined = accWeight + weights[k];
        acc = interpolate(acc, colors[k], combined > 0 ? weights[k] / combined : 0.5, space, hue);
        accWeight = combined;
    }
    acc.alpha *= alphaMult;
    return acc;
}

// CSS Color 4 interpolation of two colors already in `space`: missing components take the other
// color's value, channels other than hue are premultiplied by alpha
function interpolate(a: Parsed, b: Parsed, t: number, space: string, hue: HueInterpolation): Parsed {
    const h = SPACES[space].hue;
    let aa = a.alpha;
    let ba = b.alpha;
    if (Number.isNaN(aa)) aa = ba;
    if (Number.isNaN(ba)) ba = aa;
    const missingAlpha = Number.isNaN(aa);
    if (missingAlpha) {
        aa = 1;
        ba = 1;
    }
    const alpha = aa + (ba - aa) * t;
    const ch: [number, number, number] = [0, 0, 0];
    for (let k = 0; k < 3; k++) {
        let x = a.ch[k];
        let y = b.ch[k];
        if (Number.isNaN(x)) x = y;
        if (Number.isNaN(y)) y = x;
        if (Number.isNaN(x) || k === h) ch[k] = Number.isNaN(x) ? Number.NaN : lerpHue(x, y, t, hue);
        else {
            const v = x * aa + (y * ba - x * aa) * t;
            ch[k] = alpha === 0 ? v : v / alpha;
        }
    }
    return { space, ch, alpha: missingAlpha ? Number.NaN : alpha };
}

// `c` in the channels of `space`, keeping missing components that have an analogous component there
// and marking a powerless hue as missing
function toSpace(c: Parsed, space: string): Parsed {
    if (c.space === space) return { space, ch: [c.ch[0], c.ch[1], c.ch[2]], alpha: c.alpha };
    const ch = fromLinear(space, toLinear(c.space, c.ch));
    const from = SPACES[c.space].cat;
    const to = SPACES[space];
    for (let k = 0; k < 3; k++) {
        const j = from[k] === '-' ? -1 : to.cat.indexOf(from[k]);
        if (Number.isNaN(c.ch[k]) && j >= 0) ch[j] = Number.NaN;
    }
    if (to.hue >= 0 && (space === 'hwb' ? ch[1] + ch[2] >= 100 : ch[1] <= to.eps)) ch[to.hue] = Number.NaN;
    return { space, ch, alpha: c.alpha };
}

// the channels of `c` in `space` with missing components as 0 (relative color origins)
function convert(c: Parsed, space: string): [number, number, number] {
    if (c.space === space)
        return [!Number.isNaN(c.ch[0]) ? c.ch[0] : 0, !Number.isNaN(c.ch[1]) ? c.ch[1] : 0, !Number.isNaN(c.ch[2]) ? c.ch[2] : 0];
    return fromLinear(space, toLinear(c.space, c.ch));
}

/* channel values and calc() */

// a channel: `none` (NaN), a number, percentage, angle, relative keyword, constant or math function
function parseChannel(p: Parser, pct: number, isHue: boolean): number | null {
    if (eat(p, 'id', 'none')) return Number.NaN;
    const v = parseValue(p, pct);
    // hues take angles and plain numbers (degrees), other channels only numbers and percentages
    return v === null || (p.angle && !isHue) ? null : v;
}

function parseSum(p: Parser, pct: number): number | null {
    let v = parseProduct(p, pct);
    let angle = p.angle;
    while (v !== null && (peek(p, '+') || peek(p, '-'))) {
        const add = p.toks[p.i++].t === '+';
        const r = parseProduct(p, pct);
        if (r === null) return null;
        v = add ? v + r : v - r;
        angle = angle || p.angle;
    }
    p.angle = angle;
    return v;
}

function parseProduct(p: Parser, pct: number): number | null {
    let v = parseValue(p, pct);
    let angle = p.angle;
    while (v !== null && (peek(p, '*') || peek(p, '/'))) {
        const mul = p.toks[p.i++].t === '*';
        const r = parseValue(p, pct);
        if (r === null) return null;
        v = mul ? v * r : v / r;
        angle = mul ? angle || p.angle : angle && !p.angle;
    }
    p.angle = angle;
    return v;
}

function parseValue(p: Parser, pct: number): number | null {
    const t = p.toks[p.i++];
    p.angle = false;
    if (t === undefined) return null;
    switch (t.t) {
        case 'num':
            return t.v;
        case 'pct':
            // percentages are invalid where the channel has no percent reference (hue)
            return Number.isNaN(pct) ? null : (t.v / 100) * pct;
        case 'dim': {
            // angles as degrees
            const unit = t.s === 'deg' ? 1 : t.s === 'rad' ? 180 / Math.PI : t.s === 'grad' ? 0.9 : t.s === 'turn' ? 360 : 0;
            p.angle = true;
            return unit === 0 ? null : t.v * unit;
        }
        case '(': {
            const v = parseSum(p, pct);
            return v !== null && eat(p, ')') ? v : null;
        }
        case 'id':
            return parseKeyword(p, t.s);
        case 'fn':
            return parseMath(p, t.s, pct);
    }
    return null;
}

// relative color channel keywords (numbers) and the calc() constants
function parseKeyword(p: Parser, s: string): number | null {
    const negative = s[0] === '-';
    if (negative) s = s.slice(1);
    const v =
        p.kw?.get(s) ??
        (s === 'e'
            ? Math.E
            : s === 'pi'
              ? Math.PI
              : s === 'infinity'
                ? Number.POSITIVE_INFINITY
                : s === 'nan'
                  ? Number.NaN
                  : null);
    return v === null ? null : negative ? -v : v;
}

// calc() and the CSS math functions, trig takes angles or radians and inverse trig returns angles
function parseMath(p: Parser, name: string, pct: number): number | null {
    let strategy = 'nearest';
    if (name === 'round' && peek(p, 'id') && /^(nearest|up|down|to-zero)$/.test(p.toks[p.i].s)) {
        strategy = p.toks[p.i++].s;
        if (!eat(p, ',')) return null;
    }
    const args: number[] = [];
    let angle = false;
    do {
        const v = parseSum(p, pct);
        if (v === null) return null;
        if (args.length === 0) angle = p.angle;
        args.push(v);
    } while (eat(p, ','));
    if (!eat(p, ')')) return null;
    const a = args[0];
    const b = args.length > 1 ? args[1] : 1;
    const n = args.length;
    const rad = angle ? Math.PI / 180 : 1;
    p.angle = angle;
    switch (name) {
        case 'calc':
            return n === 1 ? a : null;
        case 'min':
            return Math.min(...args);
        case 'max':
            return Math.max(...args);
        case 'clamp':
            return n === 3 ? Math.max(a, Math.min(b, args[2])) : null;
        case 'round': {
            const q = a / b;
            const r =
                strategy === 'up'
                    ? Math.ceil(q)
                    : strategy === 'down'
                      ? Math.floor(q)
                      : strategy === 'to-zero'
                        ? Math.trunc(q)
                        : Math.round(q);
            return r * b;
        }
        case 'mod':
            return n === 2 ? a - b * Math.floor(a / b) : null;
        case 'rem':
            return n === 2 ? a - b * Math.trunc(a / b) : null;
        case 'abs':
            return Math.abs(a);
        case 'hypot':
            return Math.hypot(...args);
    }
    p.angle = false;
    switch (name) {
        case 'sign':
            return Math.sign(a);
        case 'sin':
            return Math.sin(a * rad);
        case 'cos':
            return Math.cos(a * rad);
        case 'tan':
            return Math.tan(a * rad);
        case 'pow':
            return n === 2 ? a ** b : null;
        case 'sqrt':
            return Math.sqrt(a);
        case 'log':
            return n === 2 ? Math.log(a) / Math.log(b) : Math.log(a);
        case 'exp':
            return Math.exp(a);
    }
    p.angle = true;
    switch (name) {
        case 'asin':
            return (Math.asin(a) * 180) / Math.PI;
        case 'acos':
            return (Math.acos(a) * 180) / Math.PI;
        case 'atan':
            return (Math.atan(a) * 180) / Math.PI;
        case 'atan2':
            return n === 2 ? (Math.atan2(a, b) * 180) / Math.PI : null;
    }
    return null;
}

/* space conversions */

// channels of `space` (missing components as 0) to a linear sRGB Color
function toLinear(space: string, ch: readonly number[]): Color {
    const x = !Number.isNaN(ch[0]) ? ch[0] : 0;
    const y = !Number.isNaN(ch[1]) ? ch[1] : 0;
    const z = !Number.isNaN(ch[2]) ? ch[2] : 0;
    const out: Color = [x, y, z];
    switch (space) {
        case 'srgb':
            return set(out, colorspace.srgbToLinear(x), colorspace.srgbToLinear(y), colorspace.srgbToLinear(z));
        case 'display-p3':
            return colorspace.displayP3ToLinearSrgb(out, out);
        case 'display-p3-linear':
            return colorspace.linearDisplayP3ToLinearSrgb(out, out);
        case 'a98-rgb':
            set(out, colorspace.a98RgbToLinear(x), colorspace.a98RgbToLinear(y), colorspace.a98RgbToLinear(z));
            return colorspace.linearA98RgbToLinearSrgb(out, out);
        case 'prophoto-rgb':
            set(out, colorspace.prophotoRgbToLinear(x), colorspace.prophotoRgbToLinear(y), colorspace.prophotoRgbToLinear(z));
            return colorspace.linearProphotoRgbToLinearSrgb(out, out);
        case 'rec2020':
            set(out, colorspace.rec2020ToLinear(x), colorspace.rec2020ToLinear(y), colorspace.rec2020ToLinear(z));
            return colorspace.linearRec2020ToLinearSrgb(out, out);
        case 'rec2100-pq':
            return colorspace.rec2100PqToLinearSrgb(out, out);
        case 'rec2100-hlg':
            return colorspace.rec2100HlgToLinearSrgb(out, out);
        case 'rec2100-linear':
            return colorspace.linearRec2020ToLinearSrgb(out, out);
        case 'xyz-d65':
            return colorspace.xyzD65ToLinearSrgb(out, out);
        case 'xyz-d50':
            return colorspace.xyzD50ToLinearSrgb(out, out);
        case 'hsl':
            return hsl.toColor(out, [x / 360 - Math.floor(x / 360), y / 100, z / 100]);
        case 'hwb': {
            const w = y / 100;
            const b = z / 100;
            if (w + b >= 1) return setScalar(out, colorspace.srgbToLinear(w / (w + b)));
            // hwb is the pure hue scaled by 1 - w - b plus w, in gamma-encoded sRGB
            hsl.toColor(out, [x / 360 - Math.floor(x / 360), 1, 0.5]);
            for (let k = 0; k < 3; k++)
                out[k] = colorspace.srgbToLinear(colorspace.linearToSrgb(out[k] as number) * (1 - w - b) + w);
            return out;
        }
        case 'lab':
            return lab.toColor(out, [x, y, z]);
        case 'lch':
            return lch.toColor(out, [x, y, z]);
        case 'oklab':
            return oklab.toColor(out, [x, y, z]);
        case 'oklch':
            return oklch.toColor(out, [x, y, z]);
        case 'ictcp':
            return ictcp.toColor(out, [x, y, z]);
        case 'jzazbz':
            return jzazbz.toColor(out, [x, y, z]);
        case 'jzczhz':
            return jzczhz.toColor(out, [x, y, z]);
    }
    return out;
}

// a linear sRGB Color to the channels of `space`
function fromLinear(space: string, c: Color): [number, number, number] {
    const out: [number, number, number] = [c[0], c[1], c[2]];
    switch (space) {
        case 'srgb':
            return [colorspace.linearToSrgb(c[0]), colorspace.linearToSrgb(c[1]), colorspace.linearToSrgb(c[2])];
        case 'display-p3':
            return colorspace.linearSrgbToDisplayP3(out, out) as [number, number, number];
        case 'display-p3-linear':
            return colorspace.linearSrgbToLinearDisplayP3(out, out) as [number, number, number];
        case 'a98-rgb':
            colorspace.linearSrgbToLinearA98Rgb(out, out);
            return [colorspace.linearToA98Rgb(out[0]), colorspace.linearToA98Rgb(out[1]), colorspace.linearToA98Rgb(out[2])];
        case 'prophoto-rgb':
            colorspace.linearSrgbToLinearProphotoRgb(out, out);
            return [
                colorspace.linearToProphotoRgb(out[0]),
                colorspace.linearToProphotoRgb(out[1]),
                colorspace.linearToProphotoRgb(out[2]),
            ];
        case 'rec2020':
            colorspace.linearSrgbToLinearRec2020(out, out);
            return [colorspace.linearToRec2020(out[0]), colorspace.linearToRec2020(out[1]), colorspace.linearToRec2020(out[2])];
        case 'rec2100-pq':
            return colorspace.linearSrgbToRec2100Pq(out, out) as [number, number, number];
        case 'rec2100-hlg':
            return colorspace.linearSrgbToRec2100Hlg(out, out) as [number, number, number];
        case 'rec2100-linear':
            return colorspace.linearSrgbToLinearRec2020(out, out) as [number, number, number];
        case 'xyz-d65':
            return colorspace.linearSrgbToXyzD65(out, out) as [number, number, number];
        case 'xyz-d50':
            return colorspace.linearSrgbToXyzD50(out, out) as [number, number, number];
        case 'hsl': {
            const h = hsl.fromColor(out, c);
            return [h[0] * 360, h[1] * 100, h[2] * 100];
        }
        case 'hwb': {
            const r = colorspace.linearToSrgb(c[0]);
            const g = colorspace.linearToSrgb(c[1]);
            const b = colorspace.linearToSrgb(c[2]);
            const h = hsl.fromColor(out, c)[0] * 360;
            return [h, Math.min(r, g, b) * 100, (1 - Math.max(r, g, b)) * 100];
        }
        case 'lab':
            return lab.fromColor(out, c);
        case 'lch':
            return lch.fromColor(out, c);
        case 'oklab':
            return oklab.fromColor(out, c);
        case 'oklch':
            return oklch.fromColor(out, c);
        case 'ictcp':
            return ictcp.fromColor(out, c);
        case 'jzazbz':
            return jzazbz.fromColor(out, c);
        case 'jzczhz':
            return jzczhz.fromColor(out, c);
    }
    return out;
}

function set(out: Color, r: number, g: number, b: number): Color {
    out[0] = r;
    out[1] = g;
    out[2] = b;
    return out;
}

function setScalar(out: Color, v: number): Color {
    return set(out, v, v, v);
}

function clamp(x: number, lo: number, hi: number): number {
    return x < lo ? lo : x > hi ? hi : x;
}
