/**
 * Geo helpers. Kept dependency-free so any controller can import
 * without dragging in a geospatial library — the math is small and
 * Mongo handles the heavy lifting for actual queries.
 */

const EARTH_RADIUS_KM = 6371;

/**
 * Haversine great-circle distance in kilometers between two
 * {lat, lng} points. Accurate to ~0.5% for short distances which is
 * plenty for "show 'X km away' on a tile."
 *
 * If either point is missing or has non-numeric coords, returns null
 * — callers should treat that as "no distance available" rather than
 * inventing a zero.
 */
export const haversineKm = (a, b) => {
  if (!a || !b) return null;
  if (
    typeof a.lat !== "number" ||
    typeof a.lng !== "number" ||
    typeof b.lat !== "number" ||
    typeof b.lng !== "number"
  ) {
    return null;
  }

  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const h =
    sinDLat * sinDLat +
    Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
};

/**
 * Pull {lat, lng} out of a User or JobPost document, accepting either
 * the new GeoJSON Point shape OR the legacy `{lat, long}` field on
 * User. Returns null if neither is present, so callers can branch
 * cleanly instead of writing the same null-checks everywhere.
 */
export const extractLatLng = (doc) => {
  if (!doc) return null;
  const point = doc.locationPoint;
  if (point?.coordinates?.length === 2) {
    const [lng, lat] = point.coordinates;
    if (typeof lat === "number" && typeof lng === "number") return { lat, lng };
  }
  const legacy = doc.locationCoordinates;
  if (
    legacy &&
    typeof legacy.lat === "number" &&
    typeof legacy.long === "number"
  ) {
    return { lat: legacy.lat, lng: legacy.long };
  }
  return null;
};

/**
 * Build a GeoJSON Point from a {lat, lng}. Returns undefined for
 * invalid input so a `$set` payload doesn't accidentally clear an
 * existing field with a partial value.
 */
export const toGeoPoint = ({ lat, lng } = {}) => {
  if (typeof lat !== "number" || typeof lng !== "number") return undefined;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return undefined;
  return { type: "Point", coordinates: [lng, lat] };
};
