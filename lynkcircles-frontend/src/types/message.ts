import type { UserSummary } from "./user";

export type MessageStatus = "sending" | "sent" | "delivered" | "read" | "failed";
export type FileType = "image" | "video" | "audio" | "document";

/**
 * Message as returned by the API and emitted over sockets — `sender` is
 * the populated user summary, `recipient` is just the ObjectId string.
 *
 * `tempId` and `status` are client-managed: the server doesn't echo
 * tempId on stored messages, but it does echo it on the `messageSent` /
 * `newMessage` socket events so the FE can swap an optimistic bubble
 * for the canonical record without flicker.
 */
export interface Message {
  _id: string;
  sender: UserSummary;
  recipient: string;
  content: string;
  fileUrl?: string | null;
  fileType?: FileType | null;
  status?: MessageStatus;
  createdAt: string;
  /** Client-only — present on optimistic outbound messages until echoed. */
  tempId?: string;
}

export interface Conversation {
  _id: string;
  participants: UserSummary[];
  lastMessage?: Message | null;
  isGroup?: boolean;
}

/**
 * Result shape from POST /messages/upload after multer + cloudinary.
 */
export interface UploadedAttachment {
  _id: string;
  fileUrl: string;
  fileType: FileType;
  fileName: string;
  fileSize: number;
}
