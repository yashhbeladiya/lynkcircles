import type { UserSummary } from "./user";

export type NotificationType = "Job Application" | "Message" | "Review";

export interface AppNotification {
  _id: string;
  recipient: string;
  type: NotificationType;
  relatedUser?: UserSummary | null;
  relatedJob?: string | null;
  content?: string;
  message?: string;
  read: boolean;
  createdAt: string;
  updatedAt?: string;
}
