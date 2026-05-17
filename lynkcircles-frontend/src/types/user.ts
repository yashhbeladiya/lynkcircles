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
  /** Worker ids the user has bookmarked. Replaces the old connection
   *  graph as the primary "people-I-want-to-find-again" primitive. */
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
  connections?: string[];
  /** Set by endpoints that compare to the requesting user's location.
   *  Null if either side doesn't have coordinates. */
  distanceKm?: number | null;
}

/** A pending connection request as returned by GET /connections/requests. */
export interface ConnectionRequest {
  _id: string;
  sender: UserSummary;
  recipient: string;
  status: "pending" | "accepted" | "rejected";
  createdAt?: string;
}

/**
 * Full public profile as returned by GET /users/profile/:username.
 * Mirrors the User model with `password` stripped. Used by the Profile
 * page; not all fields are guaranteed to be present on every user.
 */
export interface UserProfile extends AuthUser {
  followers?: string[];
  followingClients?: string[];
  savedWorkers?: string[];
  socialLinks?: {
    linkedin?: string;
    github?: string;
    twitter?: string;
    facebook?: string;
    website?: string;
  };
}

export type ConnectionStatus =
  | { status: "connected" }
  | { status: "pending" }
  | { status: "received"; requestId: string }
  | { status: "not_connected" };
