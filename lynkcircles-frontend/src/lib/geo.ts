/**
 * Format a distance in kilometers for tile display.
 *   < 1 km    -> "350 m"
 *   < 10 km   -> "2.4 km"
 *   ≥ 10 km   -> "23 km" (no decimal — clutters the chip)
 * Returns null for null/undefined input so callers can render
 * conditionally without a coalesce dance.
 */
export const formatDistance = (km: number | null | undefined): string | null => {
  if (km == null || Number.isNaN(km)) return null;
  if (km < 1) {
    const meters = Math.round(km * 1000);
    return `${meters} m`;
  }
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
};

/**
 * Browser geolocation as a Promise. Wraps the imperative API so a
 * caller can `await getCurrentPosition()` instead of dealing with
 * the success/error callback pair. Resolves null on permission denial
 * or when the platform doesn't expose geolocation (e.g. insecure
 * context).
 */
export const getCurrentPosition = (): Promise<
  { lat: number; lng: number } | null
> => {
  return new Promise((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => resolve(null),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60_000 }
    );
  });
};
