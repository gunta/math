/** A CSS Color 4 hue interpolation method, choosing which way around the hue circle to go. */
export type HueInterpolation = 'shorter' | 'longer' | 'increasing' | 'decreasing';

/** Interpolate hue angles `a` to `b` (degrees) by `t` with a CSS Color 4 hue interpolation method. Result in [0, 360). */
export function lerpHue(a: number, b: number, t: number, method: HueInterpolation): number {
    a -= 360 * Math.floor(a / 360);
    b -= 360 * Math.floor(b / 360);
    const d = b - a;
    if (method === 'shorter') {
        if (d > 180) a += 360;
        else if (d < -180) b += 360;
    } else if (method === 'longer') {
        if (d > 0 && d < 180) a += 360;
        else if (d > -180 && d <= 0) b += 360;
    } else if (method === 'increasing') {
        if (d < 0) b += 360;
    } else if (d > 0) {
        a += 360;
    }
    const h = a + (b - a) * t;
    return h - 360 * Math.floor(h / 360);
}
