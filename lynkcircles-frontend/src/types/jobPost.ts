import type { UserSummary } from "./user";

export type JobStatus = "Open" | "In Progress" | "Completed" | "Canceled";

export interface JobPost {
  _id: string;
  author: UserSummary;
  jobTitle: string;
  description: string;
  skillsRequired: string[];
  location: string;
  budget: string;
  status: JobStatus;
  requiredOn?: string | null;
  deadline?: string | null;
  /** Either populated UserSummary[] or raw id strings depending on endpoint. */
  applicants: Array<string | UserSummary>;
  createdAt: string;
}

export interface CreateJobPostInput {
  title: string;
  description: string;
  skills: string[];
  location: string;
  pay: string;
  requiredOn?: string;
  deadline?: string;
}

export interface UpdateJobPostInput extends Partial<CreateJobPostInput> {
  status?: JobStatus;
}
