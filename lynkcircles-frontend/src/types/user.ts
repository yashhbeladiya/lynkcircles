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
  connections?: string[];
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
}
