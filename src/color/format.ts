/** Format `x` for CSS with at most `digits` decimals and no trailing zeros. NaN is `none` and infinities use calc(). */
export function formatNumber(x: number, digits: number): string {
    if (Number.isNaN(x)) return 'none';
    if (x === Number.POSITIVE_INFINITY) return 'calc(infinity)';
    if (x === Number.NEGATIVE_INFINITY) return 'calc(-infinity)';
    return String(+x.toFixed(digits));
}

/** The ` / alpha` suffix of a CSS color function, empty when opaque. A NaN alpha is `none`. */
export function formatAlpha(alpha: number): string {
    if (Number.isNaN(alpha)) return ' / none';
    return alpha < 1 ? ` / ${formatNumber(alpha > 0 ? alpha : 0, 3)}` : '';
}
