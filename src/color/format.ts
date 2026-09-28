/** Format `x` for CSS with at most `digits` decimals and no trailing zeros. */
export function formatNumber(x: number, digits: number): string {
    return String(+x.toFixed(digits));
}

/** The ` / alpha` suffix of a CSS color function, empty when opaque. */
export function formatAlpha(alpha: number): string {
    return alpha < 1 ? ` / ${formatNumber(alpha > 0 ? alpha : 0, 3)}` : '';
}
