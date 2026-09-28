// Prints the precombined color matrices inlined in src/color.
//
//   node scripts/color-matrices.mjs
//
// Sources are the CSS Color 4 sample code (conversions.js), the CSS Color HDR
// draft and color.js. Every space in math/color converts straight to and from
// linear sRGB, so each matrix below is a product of the published ones computed
// in float64. Values within 1e-15 of zero are snapped to zero.

const mul = (a, b) => a.map((row) => b[0].map((_, j) => row.reduce((s, v, k) => s + v * b[k][j], 0)));
const scale = (m, s) => m.map((row) => row.map((v) => v * s));
const diag = (v) => v.map((x, i) => v.map((_, j) => (i === j ? x : 0)));

// white points from 4-figure CIE x,y chromaticities
const D50 = [0.3457 / 0.3585, 1, (1 - 0.3457 - 0.3585) / 0.3585];

const srgbToXyz = [
    [506752 / 1228815, 87881 / 245763, 12673 / 70218],
    [87098 / 409605, 175762 / 245763, 12673 / 175545],
    [7918 / 409605, 87881 / 737289, 1001167 / 1053270],
];
const xyzToSrgb = [
    [12831 / 3959, -329 / 214, -1974 / 3959],
    [-851781 / 878810, 1648619 / 878810, 36519 / 878810],
    [705 / 12673, -2585 / 12673, 705 / 667],
];
const p3ToXyz = [
    [608311 / 1250200, 189793 / 714400, 198249 / 1000160],
    [35783 / 156275, 247089 / 357200, 198249 / 2500400],
    [0, 32229 / 714400, 5220557 / 5000800],
];
const xyzToP3 = [
    [446124 / 178915, -333277 / 357830, -72051 / 178915],
    [-14852 / 17905, 63121 / 35810, 423 / 17905],
    [11844 / 330415, -50337 / 660830, 316169 / 330415],
];
const rec2020ToXyz = [
    [63426534 / 99577255, 20160776 / 139408157, 47086771 / 278816314],
    [26158966 / 99577255, 472592308 / 697040785, 8267143 / 139408157],
    [0, 19567812 / 697040785, 295819943 / 278816314],
];
const xyzToRec2020 = [
    [30757411 / 17917100, -6372589 / 17917100, -4539589 / 17917100],
    [-19765991 / 29648200, 47925759 / 29648200, 467509 / 29648200],
    [792561 / 44930125, -1921689 / 44930125, 42328811 / 44930125],
];
const a98ToXyz = [
    [573536 / 994567, 263643 / 1420810, 187206 / 994567],
    [591459 / 1989134, 6239551 / 9945670, 374412 / 4972835],
    [53769 / 1989134, 351524 / 4972835, 4929758 / 4972835],
];
const xyzToA98 = [
    [1829569 / 896150, -506331 / 896150, -308931 / 896150],
    [-851781 / 878810, 1648619 / 878810, 36519 / 878810],
    [16779 / 1248040, -147721 / 1248040, 1266979 / 1248040],
];
const prophotoToXyzD50 = [
    [0.7977666449006423, 0.13518129740053308, 0.0313477341283922],
    [0.2880748288194013, 0.711835234241873, 0.00008993693872564],
    [0, 0, 0.8251046025104602],
];
const xyzD50ToProphoto = [
    [1.3457868816471583, -0.25557208737979464, -0.05110186497554526],
    [-0.5446307051249019, 1.5082477428451468, 0.02052744743642139],
    [0, 0, 1.2119675456389452],
];
const d65ToD50 = [
    [1.0479297925449969, 0.022946870601609652, -0.05019226628920524],
    [0.02962780877005599, 0.9904344267538799, -0.017073799063418826],
    [-0.009243040646204504, 0.015055191490298152, 0.7518742814281371],
];
const d50ToD65 = [
    [0.955473421488075, -0.02309845494876471, 0.06325924320057072],
    [-0.0283697093338637, 1.0099953980813041, 0.021041441191917323],
    [0.012314014864481998, -0.020507649298898964, 1.330365926242124],
];

// OKLab
const xyzToOklabLms = [
    [0.819022437996703, 0.3619062600528904, -0.1288737815209879],
    [0.0329836539323885, 0.9292868615863434, 0.0361446663506424],
    [0.0481771893596242, 0.2642395317527308, 0.6335478284694309],
];
const oklabLmsToXyz = [
    [1.2268798758459243, -0.5578149944602171, 0.2813910456659647],
    [-0.0405757452148008, 1.112286803280317, -0.0717110580655164],
    [-0.0763729366746601, -0.4214933324022432, 1.5869240198367816],
];

// ICtCp (BT.2100 crosstalk LMS from absolute XYZ, CSS Color HDR)
const xyzToIctcpLms = [
    [0.3592832590121217, 0.6976051147779502, -0.035891593232029],
    [-0.1920808463704993, 1.1004767970374321, 0.0753748658519118],
    [0.0070797844607479, 0.0748396662186362, 0.8433265453898765],
];
const ictcpLmsToXyz = [
    [2.0701522183894223, -1.3263473389671563, 0.2066510476294053],
    [0.3647385209748072, 0.6805660249472273, -0.0453045459220347],
    [-0.0497472075358123, -0.0492609666966131, 1.1880659249923042],
];

// Jzazbz (Safdar et al. 2017), applied to absolute XYZ after the X/Y modification
const jzB = 1.15;
const jzG = 0.66;
const jzModify = [
    [jzB, 0, -(jzB - 1)],
    [-(jzG - 1), jzG, 0],
    [0, 0, 1],
];
const jzUnmodify = [
    [1 / jzB, 0, (jzB - 1) / jzB],
    [(jzG - 1) / (jzG * jzB), 1 / jzG, ((jzG - 1) * (jzB - 1)) / (jzG * jzB)],
    [0, 0, 1],
];
const xyzToJzCone = [
    [0.41478972, 0.579999, 0.014648],
    [-0.20151, 1.120649, 0.0531008],
    [-0.0166008, 0.2648, 0.6684799],
];
const jzConeToXyz = [
    [1.9242264357876067, -1.0047923125953657, 0.037651404030618],
    [0.35031676209499907, 0.7264811939316552, -0.06538442294808501],
    [-0.09098281098284752, -0.3127282905230739, 1.5227665613052603],
];

// 1.0 in linear sRGB is media white, 203 cd/m², and the PQ curve takes luminance / 10000
const absolute = 203 / 10000;

const out = {
    'colorspace linearSrgbToXyzD65': srgbToXyz,
    'colorspace xyzD65ToLinearSrgb': xyzToSrgb,
    'colorspace linearSrgbToXyzD50': mul(d65ToD50, srgbToXyz),
    'colorspace xyzD50ToLinearSrgb': mul(xyzToSrgb, d50ToD65),
    'colorspace xyzD65ToXyzD50': d65ToD50,
    'colorspace xyzD50ToXyzD65': d50ToD65,
    'colorspace linearSrgbToLinearDisplayP3': mul(xyzToP3, srgbToXyz),
    'colorspace linearDisplayP3ToLinearSrgb': mul(xyzToSrgb, p3ToXyz),
    'colorspace linearSrgbToLinearRec2020': mul(xyzToRec2020, srgbToXyz),
    'colorspace linearRec2020ToLinearSrgb': mul(xyzToSrgb, rec2020ToXyz),
    'colorspace linearSrgbToLinearA98Rgb': mul(xyzToA98, srgbToXyz),
    'colorspace linearA98RgbToLinearSrgb': mul(xyzToSrgb, a98ToXyz),
    'colorspace linearSrgbToLinearProphotoRgb': mul(xyzD50ToProphoto, mul(d65ToD50, srgbToXyz)),
    'colorspace linearProphotoRgbToLinearSrgb': mul(xyzToSrgb, mul(d50ToD65, prophotoToXyzD50)),
    'oklab linear sRGB to LMS': mul(xyzToOklabLms, srgbToXyz),
    'oklab LMS to linear sRGB': mul(xyzToSrgb, oklabLmsToXyz),
    'lab linear sRGB to D50-relative XYZ': mul(diag(D50.map((v) => 1 / v)), mul(d65ToD50, srgbToXyz)),
    'lab D50-relative XYZ to linear sRGB': mul(mul(xyzToSrgb, d50ToD65), diag(D50)),
    'ictcp linear sRGB to LMS / 10000': scale(mul(xyzToIctcpLms, srgbToXyz), absolute),
    'ictcp LMS / 10000 to linear sRGB': scale(mul(xyzToSrgb, ictcpLmsToXyz), 1 / absolute),
    'jzazbz linear sRGB to cone / 10000': scale(mul(xyzToJzCone, mul(jzModify, srgbToXyz)), absolute),
    'jzazbz cone / 10000 to linear sRGB': scale(mul(xyzToSrgb, mul(jzUnmodify, jzConeToXyz)), 1 / absolute),
};

for (const [name, m] of Object.entries(out)) {
    console.log(`// ${name}`);
    for (const row of m) console.log(`    ${row.map((v) => (Math.abs(v) < 1e-15 ? 0 : v)).join(', ')}`);
}
