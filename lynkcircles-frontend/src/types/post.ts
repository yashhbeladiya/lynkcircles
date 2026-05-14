import type { UserSummary } from "./user";

export interface PostComment {
  _id: string;
  content: string;
  user: UserSummary;
  likes?: string[];
  createdAt: string;
  repliedBy?: UserSummary | null;
}

/**
 * Post as returned by GET /feed (envelope: `{ posts: Post[] }`) and
 * GET /feed/:id. `likes` is an array of user-ID strings, not populated
 * UserSummary — the FE checks membership against the current user's
 * own _id for the "liked by me" state.
 */
export interface Post {
  _id: string;
  author: UserSummary;
  content: string;
  image?: string | null;
  video?: string | null;
  likes: string[];
  comments: PostComment[];
  createdAt: string;
  updatedAt?: string;
}

export interface FeedResponse {
  posts: Post[];
}
