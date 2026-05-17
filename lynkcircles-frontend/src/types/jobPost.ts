import type { UserSummary } from "./user";

export type JobStatus = "Open" | "In Progress" | "Completed" | "Canceled";

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
  createdAt: string;
}

export interface CreateJobPostInput {
  title: string;
  description: string;
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
