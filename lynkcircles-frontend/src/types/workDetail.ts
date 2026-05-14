import type { UserSummary } from "./user";

export type DayOfWeek =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

export interface AvailabilitySlot {
  start?: string;
  end?: string;
}

export interface Availability {
  days?: DayOfWeek[];
  timeSlots?: AvailabilitySlot[];
}

export interface ServiceReview {
  _id?: string;
  reviewer: UserSummary;
  review: string;
  rating: number;
  createdAt?: string;
}

/**
 * A service a Worker offers (e.g. "Plumbing", "Carpentry"). One Worker
 * can have many. Backend response includes a computed `ratings` field
 * which is the average across the reviews array.
 */
export interface WorkDetail {
  _id: string;
  user: UserSummary;
  serviceOffered: string;
  description?: string;
  hourlyRate?: number;
  availability?: Availability;
  ratings?: number;
  reviews: ServiceReview[];
}

export interface CreateWorkDetailInput {
  serviceOffered: string;
  description?: string;
  hourlyRate?: number;
}

/**
 * A review left on a single completed job. Distinct from ServiceReview
 * (which lives on the service as a whole) — this one is per-job and
 * may include proof images uploaded by the client.
 */
export interface PortfolioReview {
  _id?: string;
  reviewer: UserSummary;
  review: string;
  rating: number;
  images?: string[];
  createdAt?: string;
}

export interface JobPortfolio {
  _id: string;
  user: string;
  /** Populated to `{ _id, serviceOffered }` on read; an ObjectId string on write. */
  service: string | { _id: string; serviceOffered: string };
  jobTitle?: string;
  description?: string;
  images?: string[];
  videos?: string[];
  dateCompleted?: string;
  clientUsername?: string;
  clientName?: string;
  reviews: PortfolioReview[];
  createdAt?: string;
}

export interface CreatePortfolioInput {
  service: string;
  jobTitle: string;
  description?: string;
  /** Base64 data URIs — the server uploads them to Cloudinary. */
  images?: string[];
  videos?: string[];
  dateCompleted?: string;
  clientUsername?: string;
  clientName?: string;
}

export interface AddPortfolioReviewInput {
  portfolioId: string;
  review: string;
  rating: number;
  images?: string[];
}
