import type { UserSummary } from "./user";

export type NotificationType =
  | "Job Application"
  | "Message"
  | "Review"
  | "Job Posted by Followed Client"
  | "like"
  | "comment"
  | "follow"
  | "connectionAccepted";

export interface NotificationPost {
  _id: string;
  content?: string;
  image?: string | null;
}

export interface AppNotification {
  _id: string;
  recipient: string;
  type: NotificationType;
  relatedUser?: UserSummary | null;
  relatedJob?: string | null;
  relatedPost?: NotificationPost | null;
  /** Either `content` or `message` depending on which emit path created it. */
  content?: string;
  message?: string;
  read: boolean;
  createdAt: string;
  updatedAt?: string;
}
