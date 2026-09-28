import { type Color, color, gamut, oklab, oklch, packing, tonemap } from 'math/color';
import { createInfo } from './common/info';
import { palette } from './common/theme';

// The same two colors blended five ways, then an HDR exposure ramp through each tone mapper.
// Gamma sRGB blends dip into gray, linear blends are physically right for light but look
// uneven, OKLab is perceptually even, and OKLCH keeps the colors vivid by walking the hue
// circle (the short or the long way). Every pixel is computed with math/color: blended,
// gamut mapped into sRGB with gamut.mapToSrgb, and packed with packing.packRgba8unormSrgb
// straight into the ImageData. Click to cycle the endpoints.

const PRESETS: [string, string][] = [
    ['#1f3cff', '#ffd000'],
    ['#ff0f7b', '#00e4ff'],
    ['oklch(45% 0.2 300)', 'oklch(85% 0.17 150)'],
    ['black', 'white'],
];

const BLENDS: [string, (out: Color, a: Color, b: Color, t: number) => Color][] = [
    ['srgb', lerpGamma],
    ['linear', color.lerp],
    ['oklab', oklab.mix],
    ['oklch', (out, a, b, t) => oklch.mix(out, a, b, t)],
    ['oklch longer', (out, a, b, t) => oklch.mix(out, a, b, t, 'longer')],
];

const TONEMAPS: [string, (out: Color, c: Color) => Color][] = [
    ['clip', gamut.clipToSrgb],
    ['reinhard', tonemap.reinhard],
    ['aces', tonemap.acesFilmic],
    ['agx', tonemap.agx],
    ['neutral', tonemap.neutral],
];

const SAMPLES = 480;
const BAR_W = 560;
const BAR_H = 26;
const ROW_GAP = 10;
const LABEL_W = 112;
const SECTION_GAP = 44;
const MONO = '"Geist Mono", ui-monospace, monospace';

/* canvas */

const canvas = document.createElement('canvas');
canvas.style.display = 'block';
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

// one row of pixels per bar, stretched to the bar when drawn
const strip = document.createElement('canvas');
strip.width = SAMPLES;
strip.height = 1;
const stripCtx = strip.getContext('2d') as CanvasRenderingContext2D;
const pixels = stripCtx.createImageData(SAMPLES, 1);
const texels = new Uint32Array(pixels.data.buffer);

const info = createInfo();
info.textContent = 'click to cycle the endpoints';

let preset = 0;
const a = color.create();
const b = color.create();
const c = color.create();
// a warm HDR orange at reference white, scaled from 1/16 to 64 times as bright
const hdr: Color = [1, 0.32, 0.06];

function resize() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(window.innerWidth * dpr);
    canvas.height = Math.round(window.innerHeight * dpr);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
}

/* drawing */

// gamma-encoded blending, what CSS gradients did before interpolation spaces
function lerpGamma(out: Color, from: Color, to: Color, t: number): Color {
    const sa = color.toSRGB([0, 0, 0], from);
    const sb = color.toSRGB([0, 0, 0], to);
    return color.setFromSRGB(out, [sa[0] + (sb[0] - sa[0]) * t, sa[1] + (sb[1] - sa[1]) * t, sa[2] + (sb[2] - sa[2]) * t]);
}

function drawBar(x: number, y: number, label: string, shade: (out: Color, t: number) => Color) {
    for (let i = 0; i < SAMPLES; i++) {
        // fit anything outside sRGB into it, keeping lightness and hue
        gamut.mapToSrgb(c, shade(c, i / (SAMPLES - 1)));
        texels[i] = packing.packRgba8unormSrgb(c);
    }
    stripCtx.putImageData(pixels, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(strip, x + LABEL_W, y, BAR_W, BAR_H);

    ctx.fillStyle = palette.muted;
    ctx.font = `12px ${MONO}`;
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x, y + BAR_H / 2);
}

function drawHeading(x: number, y: number, text: string) {
    ctx.fillStyle = palette.light;
    ctx.font = `12px ${MONO}`;
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(text, x, y);
}

function draw() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    ctx.clearRect(0, 0, w, h);

    const [from, to] = PRESETS[preset];
    color.setFromColorInput(a, from);
    color.setFromColorInput(b, to);

    const rows = BLENDS.length + TONEMAPS.length;
    const blockW = LABEL_W + BAR_W;
    const blockH = rows * (BAR_H + ROW_GAP) + SECTION_GAP + 40;
    const x = Math.round((w - blockW) / 2);
    let y = Math.round((h - blockH) / 2);

    drawHeading(x, y, `${oklch.toCSS(oklch.fromColor([0, 0, 0], a))}  ->  ${oklch.toCSS(oklch.fromColor([0, 0, 0], b))}`);
    y += 16;
    for (const [label, blend] of BLENDS) {
        drawBar(x, y, label, (out, t) => blend(out, a, b, t));
        y += BAR_H + ROW_GAP;
    }

    y += SECTION_GAP - 16;
    drawHeading(x, y, 'hdr exposure -4 to +6 ev');
    y += 16;
    for (const [label, map] of TONEMAPS) {
        drawBar(x, y, label, (out, t) => map(out, color.multiplyScalar(out, hdr, 2 ** (-4 + 10 * t))));
        y += BAR_H + ROW_GAP;
    }
}

window.addEventListener('resize', resize);
window.addEventListener('pointerdown', () => {
    preset = (preset + 1) % PRESETS.length;
    draw();
});
resize();
