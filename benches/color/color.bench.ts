import { bench, group } from "@pmndrs/labs";
import type { Color } from "../../src/color/color";
import * as color from "../../src/color/color";
import * as colorspace from "../../src/color/colorspace";
import * as gamut from "../../src/color/gamut";
import * as ictcp from "../../src/color/ictcp";
import * as jzazbz from "../../src/color/jzazbz";
import * as lab from "../../src/color/lab";
import * as okhsl from "../../src/color/okhsl";
import * as oklab from "../../src/color/oklab";
import * as oklch from "../../src/color/oklch";
import * as packing from "../../src/color/packing";
import * as tonemap from "../../src/color/tonemap";
import * as mulberry32 from "../../src/random/mulberry32";

const N = 10_000;

// linear sRGB colors with channels in [0, max)
function makeColors(seed: number, max = 1): Color[] {
  const rand = mulberry32.create(seed);
  const colors: Color[] = [];
  for (let i = 0; i < N; i++) {
    colors.push([
      mulberry32.sample(rand) * max,
      mulberry32.sample(rand) * max,
      mulberry32.sample(rand) * max,
    ]);
  }
  return colors;
}

// vivid OKLCH colors, most of them outside sRGB
function makeVivid(seed: number): Color[] {
  const rand = mulberry32.create(seed);
  const colors: Color[] = [];
  for (let i = 0; i < N; i++) {
    colors.push(
      oklch.toColor(
        [0, 0, 0],
        [
          0.2 + mulberry32.sample(rand) * 0.7,
          mulberry32.sample(rand) * 0.4,
          mulberry32.sample(rand) * 360,
        ],
      ),
    );
  }
  return colors;
}

// a color conversion over 10k colors, summing a channel so the work is observable
function convert(
  name: string,
  fn: (out: [number, number, number], c: Color) => unknown,
  max = 1,
) {
  bench(name, function* () {
    const colors = makeColors(1, max);
    const out: [number, number, number] = [0, 0, 0];
    const acc = yield () => {
      let acc = 0;
      for (let i = 0; i < N; i++) {
        fn(out, colors[i]);
        acc += out[0];
      }
      return acc;
    };
    return acc;
  });
}

group("color convert 10k @color", () => {
  // the baseline: linear sRGB to gamma sRGB, what every renderer does anyway
  convert("color.toSRGB", color.toSRGB);
  convert("linearSrgbToLinearDisplayP3", colorspace.linearSrgbToLinearDisplayP3);
  convert("oklab.fromColor", oklab.fromColor);
  convert("oklab.toColor", (out, c) =>
    oklab.toColor(out, [c[0], c[1] - 0.5, c[2] - 0.5]),
  );
  convert("oklch.fromColor", oklch.fromColor);
  convert("lab.fromColor", lab.fromColor);
  convert("okhsl.fromColor", okhsl.fromColor);
  convert("ictcp.fromColor (HDR)", ictcp.fromColor, 16);
  convert("jzazbz.fromColor (HDR)", jzazbz.fromColor, 16);
  convert("linearSrgbToRec2100Pq (HDR)", colorspace.linearSrgbToRec2100Pq, 16);
});

group("color interpolate 10k @color", () => {
  const interpolate = (
    name: string,
    fn: (out: Color, a: Color, b: Color, t: number) => Color,
  ) =>
    bench(name, function* () {
      const a = makeColors(1);
      const b = makeColors(2);
      const out = color.create();
      const acc = yield () => {
        let acc = 0;
        for (let i = 0; i < N; i++) {
          fn(out, a[i], b[i], 0.3);
          acc += out[1];
        }
        return acc;
      };
      return acc;
    });

  // linear blending stays the cheapest, perceptual mixing pays for two conversions per endpoint
  interpolate("color.lerp (linear)", color.lerp);
  interpolate("oklab.mix", oklab.mix);
  interpolate("oklch.mix", (out, a, b, t) => oklch.mix(out, a, b, t));
});

group("color difference 10k @color", () => {
  const difference = <T>(
    name: string,
    from: (out: [number, number, number], c: Color) => T,
    fn: (a: T, b: T) => number,
  ) =>
    bench(name, function* () {
      const a = makeColors(1).map((c) => from([0, 0, 0], c));
      const b = makeColors(2).map((c) => from([0, 0, 0], c));
      const acc = yield () => {
        let acc = 0;
        for (let i = 0; i < N; i++) acc += fn(a[i], b[i]);
        return acc;
      };
      return acc;
    });

  difference("oklab.deltaEOK", oklab.fromColor, oklab.deltaEOK);
  difference("lab.deltaE2000", lab.fromColor, lab.deltaE2000);
  difference("ictcp.deltaEITP", ictcp.fromColor, ictcp.deltaEITP);
});

group("gamut 10k @color", () => {
  const map = (name: string, fn: (out: Color, c: Color) => Color, colors: () => Color[]) =>
    bench(name, function* () {
      const input = colors();
      const out = color.create();
      const acc = yield () => {
        let acc = 0;
        for (let i = 0; i < N; i++) {
          fn(out, input[i]);
          acc += out[0];
        }
        return acc;
      };
      return acc;
    });

  map("isInSrgb", (out, c) => { out[0] = gamut.isInSrgb(c) ? 1 : 0; return out; }, () => makeVivid(3));
  map("clipToSrgb", gamut.clipToSrgb, () => makeVivid(3));
  map("mapToSrgb (in gamut)", gamut.mapToSrgb, () => makeColors(3));
  map("mapToSrgb", gamut.mapToSrgb, () => makeVivid(3));
  map("mapToDisplayP3", gamut.mapToDisplayP3, () => makeVivid(3));
});

group("tonemap 10k @color", () => {
  convert("reinhard", tonemap.reinhard, 16);
  convert("acesFilmic", tonemap.acesFilmic, 16);
  convert("agx", tonemap.agx, 16);
  convert("neutral", tonemap.neutral, 16);
});

group("packing 10k @color", () => {
  const pack = (name: string, fn: (c: Color) => number, max: number) =>
    bench(name, function* () {
      const colors = makeColors(4, max);
      const acc = yield () => {
        let acc = 0;
        for (let i = 0; i < N; i++) acc ^= fn(colors[i]);
        return acc;
      };
      return acc;
    });

  pack("packRgba8unormSrgb", packing.packRgba8unormSrgb, 1);
  pack("packRgb10a2unorm", packing.packRgb10a2unorm, 1);
  pack("packRgb9e5ufloat", packing.packRgb9e5ufloat, 16);
  pack("packRg11b10ufloat", packing.packRg11b10ufloat, 16);
  pack("packRgbe", packing.packRgbe, 16);
  pack("packHalf", (c) => packing.packHalf(c[0]), 16);

  bench("unpackRgb9e5ufloat", function* () {
    const texels = makeColors(4, 16).map(packing.packRgb9e5ufloat);
    const out = color.create();
    const acc = yield () => {
      let acc = 0;
      for (let i = 0; i < N; i++) {
        packing.unpackRgb9e5ufloat(out, texels[i]);
        acc += out[0];
      }
      return acc;
    };
    return acc;
  });
});

group("convertBuffer 10k @color", () => {
  const flat = (seed: number) => {
    const buffer = new Float32Array(N * 3);
    const colors = makeColors(seed);
    for (let i = 0; i < N; i++) color.toBuffer(buffer, colors[i], i * 3);
    return buffer;
  };

  bench("manual loop, oklab.fromColor", function* () {
    const src = flat(5);
    const dst = new Float32Array(N * 3);
    const tmp: [number, number, number] = [0, 0, 0];
    const acc = yield () => {
      for (let i = 0; i < N * 3; i += 3) {
        tmp[0] = src[i];
        tmp[1] = src[i + 1];
        tmp[2] = src[i + 2];
        oklab.fromColor(tmp, tmp);
        dst[i] = tmp[0];
        dst[i + 1] = tmp[1];
        dst[i + 2] = tmp[2];
      }
      return dst[3 * (N - 1)];
    };
    return acc;
  });

  bench("color.convertBuffer, oklab.fromColor", function* () {
    const src = flat(5);
    const dst = new Float32Array(N * 3);
    const acc = yield () => {
      color.convertBuffer(dst, src, oklab.fromColor);
      return dst[3 * (N - 1)];
    };
    return acc;
  });
});

group("parse 1k @color", () => {
  bench("fromColorInput", function* () {
    const inputs = [
      "#ff8800",
      "rebeccapurple",
      "rgb(255 128 0 / 50%)",
      "hsl(210deg 60% 40%)",
      "oklch(70% 0.15 200)",
      "color(display-p3 1 0.5 0)",
      "lab(from teal calc(l + 10) a b)",
      "color-mix(in oklch, red 30%, blue)",
    ];
    const acc = yield () => {
      let acc = 0;
      for (let i = 0; i < 1000; i++) {
        const c = color.fromColorInput(inputs[i % inputs.length]);
        acc += c === null ? 0 : c[0];
      }
      return acc;
    };
    return acc;
  });
});
