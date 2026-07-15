/**
 * Shared user shape across the frontend. Mirrors the public-facing
 * fields of the backend User model (User.findById(...).select("-password")).
 *
 * Keep this in sync with lynkcircles-backend/models/user.model.js. If
 * the backend grows more fields we should migrate to a schema-derived
 * type (zod or io-ts) so this can never drift.
 */

export type UserRole = "Worker" | "Client" | "Admin" | "Moderator";

export interface AuthUser {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: UserRole;
  profilePicture?: string | null;
  bannerImage?: string | null;
  headline?: string;
  bio?: string;
  savedWorkers?: string[];
  verified?: boolean;
  location?: {
    city?: string;
    state?: string;
    zipCode?: string;
  };
  locationCoordinates?: {
    lat?: number;
    long?: number;
  };
  /** GeoJSON Point from the backend. Coordinates are [longitude, latitude]. */
  locationPoint?: {
    type?: "Point";
    coordinates?: [number, number];
  };
  /** Digit-only phone (no formatting). India numbers come in as 10
   *  digits — link helpers prepend +91 when none is set. */
  phone?: string;
  /** Whether to expose the phone publicly on the profile (and surface
   *  the WhatsApp button). Default false. */
  phonePublic?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/** Minimal user shape for lists/avatars where we only have basic fields. */
export interface UserSummary {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  profilePicture?: string | null;
  verified?: boolean;
  headline?: string;
  role?: UserRole;
  location?: {
    city?: string;
    state?: string;
    zipCode?: string;
  };
  distanceKm?: number | null;
}

export interface UserProfile extends AuthUser {
  savedWorkers?: string[];
  socialLinks?: {
    linkedin?: string;
    github?: string;
    twitter?: string;
    facebook?: string;
    website?: string;
  };
}
