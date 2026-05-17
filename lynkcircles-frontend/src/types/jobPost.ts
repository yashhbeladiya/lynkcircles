import type { UserSummary } from "./user";

export type JobStatus = "Open" | "In Progress" | "Completed" | "Canceled";

/**
 * Three genuinely different job shapes:
 *   gig         — one-time work, fixed or hourly budget
 *   recurring   — repeating service (weekly cleaning, daily cook)
 *   employment  — full/part-time role with monthly salary + experience
 *
 * The discriminator drives form fields, tile chip, and label copy
 * (the same `requiredOn` date is labeled "Needed by" on a gig,
 * "Start date" on a recurring or employment row).
 */
export type JobType = "gig" | "recurring" | "employment";

export type JobFrequency = "daily" | "weekly" | "bi-weekly" | "monthly";

export type JobSchedule = "full-time" | "part-time";

/** Per-job match info attached server-side for Worker viewers. */
export interface JobMatch {
  score: number;
  matchedKeys: string[];
  totalKeys: number;
  hasMatch: boolean;
}

export interface JobPost {
  _id: string;
  author: UserSummary;
  jobTitle: string;
  description: string;
  jobType?: JobType;
  /** recurring-only */
  frequency?: JobFrequency;
  /** employment-only */
  experienceMinYears?: number;
  schedule?: JobSchedule;
  /** Canonical service slugs from the catalog this job needs. Drives
   *  skill-matching, search, and the service-chip row on the card. */
  serviceKeys?: string[];
  /** Free-text additional must-haves not in the catalog. */
  skillsRequired: string[];
  location: string;
  budget: string;
  status: JobStatus;
  requiredOn?: string | null;
  deadline?: string | null;
  /** Either populated UserSummary[] or raw id strings depending on endpoint. */
  applicants: Array<string | UserSummary>;
  /** Present only when the requesting user is a Worker — server attaches
   *  the match block so the UI can sort/tag without re-computing. */
  match?: JobMatch;
  /** Distance in km from the requesting user (null if either side
   *  has no coordinates). Server-computed; FE just formats. */
  distanceKm?: number | null;
  createdAt: string;
}

export interface CreateJobPostInput {
  title: string;
  description: string;
  jobType: JobType;
  /** Required only for recurring. */
  frequency?: JobFrequency;
  /** Required only for employment. */
  experienceMinYears?: number;
  /** Required only for employment. */
  schedule?: JobSchedule;
  /** Required services from the catalog. At least one. */
  serviceKeys: string[];
  /** Optional free-text must-haves. */
  skills: string[];
  location: string;
  pay: string;
  requiredOn?: string;
  deadline?: string;
}

export interface UpdateJobPostInput extends Partial<CreateJobPostInput> {
  status?: JobStatus;
}
