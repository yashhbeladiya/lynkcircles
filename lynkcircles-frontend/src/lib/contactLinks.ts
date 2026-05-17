/**
 * Build a wa.me link for a phone number. The backend stores
 * digit-only strings, so we just need to handle the country-code
 * prepend for bare 10-digit Indian numbers (the most common case
 * for the primary market).
 *
 * Returns null if the input doesn't look phone-shaped — caller
 * branches on null rather than rendering a broken link.
 */
export const buildWhatsappLink = (
  phone: string | undefined | null,
  message?: string
): string | null => {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 7) return null;
  // 10-digit number with no prefix → assume +91 (India). This is
  // wrong for some markets but right for the primary market, and
  // users entering full international numbers (12+ digits) get
  // passed through untouched.
  const withCountry = digits.length === 10 ? `91${digits}` : digits;
  const params = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${withCountry}${params}`;
};

/**
 * tel: link for a click-to-call action. Same digit-only contract.
 */
export const buildTelLink = (phone: string | undefined | null): string | null => {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 7) return null;
  const withCountry = digits.length === 10 ? `+91${digits}` : `+${digits}`;
  return `tel:${withCountry}`;
};
