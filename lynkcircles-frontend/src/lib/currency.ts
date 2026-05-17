/**
 * Centralized money formatting. All price/rate/salary rendering goes
 * through here so we stop hardcoding "$" or "₹" anywhere — when the
 * locale switches, currency follows automatically.
 *
 * Built on Intl.NumberFormat so we get correct grouping (1,000 vs
 * 1.000 vs 1,000.00 vs 1.000,00) and currency symbol placement
 * (before/after the number) for free.
 */

const FALLBACK_SYMBOL: Record<string, string> = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
  AUD: "A$",
  CAD: "C$",
};

export type SupportedCurrency = keyof typeof FALLBACK_SYMBOL;

/**
 * Symbol-only renderer for the rare case where we don't have a
 * concrete amount yet (e.g., the rate-input adornment, where the
 * amount is in another field). For everything else use formatCurrency.
 */
export const currencySymbol = (code?: string | null): string => {
  if (!code) return FALLBACK_SYMBOL.INR;
  return FALLBACK_SYMBOL[code] ?? `${code} `;
};

interface FormatOptions {
  /** "0" suffix is dropped on whole numbers ("₹500" not "₹500.00")
   *  unless this is true. Default behavior. */
  forceDecimals?: boolean;
  /** Override the user's browser locale. Used in tests / SSR. */
  locale?: string;
}

/**
 * Render a number with the right currency, locale-aware. Returns
 * the raw amount with the fallback symbol if Intl chokes (some
 * obscure currencies, or amounts that aren't real numbers).
 */
export const formatCurrency = (
  amount: number | null | undefined,
  currency: string = "INR",
  { forceDecimals, locale }: FormatOptions = {}
): string => {
  if (amount == null || Number.isNaN(amount)) return "";
  const code = currency.toUpperCase();
  const isInteger = Number.isInteger(amount);

  try {
    return new Intl.NumberFormat(locale ?? undefined, {
      style: "currency",
      currency: code,
      // Indian rupees and similar typically don't show paise on
      // marketplace listings — looks cluttered. Honor forceDecimals
      // if a caller wants them anyway (e.g. accounting views).
      maximumFractionDigits: forceDecimals || !isInteger ? 2 : 0,
      minimumFractionDigits: forceDecimals ? 2 : 0,
    }).format(amount);
  } catch {
    return `${currencySymbol(code)}${amount}`;
  }
};
