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
